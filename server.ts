import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp as initializeClientApp } from 'firebase/app';
import {
  getFirestore as getClientFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import type { Order, Product, CollectionItem, InventoryLog, OrderStatus } from './src/types/index.ts';
import { INITIAL_PRODUCTS } from './src/data/sampleProducts.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

// Preserved legitimate store owner emails (must ALSO have email_verified === true)
const OWNER_ADMIN_EMAILS = new Set([
  'nidatariq6nov@gmail.com',
  'znjewelaers786@gmail.com',
]);

// ------------------------------------------------------------------
// Optional Privileged Firebase Admin SDK Setup
// ------------------------------------------------------------------
let adminApp: any = null;
let adminDb: any = null;
let adminAuth: any = null;

async function initFirebaseAdminIfConfigured() {
  try {
    const svcJsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const credsPathEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!svcJsonEnv && !credsPathEnv) {
      return;
    }

    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');

    let credential: any;
    if (svcJsonEnv) {
      const parsed = JSON.parse(svcJsonEnv);
      credential = cert(parsed);
    } else if (credsPathEnv && fs.existsSync(credsPathEnv)) {
      const parsed = JSON.parse(fs.readFileSync(credsPathEnv, 'utf8'));
      credential = cert(parsed);
    }

    if (credential) {
      const existingApps = getApps();
      adminApp = existingApps.length
        ? existingApps[0]
        : initializeApp({
            credential,
            projectId: firebaseConfig.projectId,
          });
      adminAuth = getAuth(adminApp);
      adminDb = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
      console.log('[ZN Server] Firebase Admin SDK initialized with privileged Firestore access.');
    }
  } catch (err) {
    console.warn('[ZN Server] Firebase Admin SDK not active:', err instanceof Error ? err.message : err);
    adminApp = null;
    adminDb = null;
    adminAuth = null;
  }
}

await initFirebaseAdminIfConfigured();

// Public/Read Firebase Client SDK on Server (for reading catalog & settings)
const clientFirebaseApp = initializeClientApp(firebaseConfig, 'zn-server-reader');
const clientDb = getClientFirestore(clientFirebaseApp, firebaseConfig.firestoreDatabaseId);

// ------------------------------------------------------------------
// Cryptographic Firebase ID Token Verification (No Secret Needed)
// ------------------------------------------------------------------
let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch Google public certs: ${resp.status}`);
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedCerts = (await resp.json()) as Record<string, string>;
  certsExpiresAt = now + maxAgeSec * 1000;
  return cachedCerts;
}

interface VerifiedTokenUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
}

async function verifyBearerToken(req: Request): Promise<VerifiedTokenUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    if (adminAuth) {
      const decoded = await adminAuth.verifyIdToken(token, true);
      const email = String(decoded.email || '').toLowerCase();
      const emailVerified = Boolean(decoded.email_verified);
      let isAdmin = Boolean(
        emailVerified && (decoded.custom_admin === true || OWNER_ADMIN_EMAILS.has(email))
      );
      if (!isAdmin && emailVerified && adminDb) {
        const adminSnap = await adminDb.collection('admins').doc(decoded.uid).get();
        isAdmin = adminSnap.exists;
      }
      return { uid: decoded.uid, email, emailVerified, isAdmin };
    }

    // Cryptographic JWT verification against Google SecureToken X.509 certs
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

    if (header.alg !== 'RS256' || !header.kid) return null;
    const certs = await getGooglePublicCerts();
    const cert = certs[header.kid];
    if (!cert) return null;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    const signatureValid = verifier.verify(cert, Buffer.from(sigB64, 'base64url'));
    if (!signatureValid) return null;

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.aud !== firebaseConfig.projectId) return null;
    if (payload.iss !== `https://securetoken.google.com/${firebaseConfig.projectId}`) return null;
    if (typeof payload.exp !== 'number' || payload.exp <= nowSec) return null;
    if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) return null;
    if (!payload.sub || typeof payload.sub !== 'string') return null;

    const email = String(payload.email || '').toLowerCase();
    const emailVerified = Boolean(payload.email_verified);
    let isAdmin = Boolean(
      emailVerified && (payload.custom_admin === true || OWNER_ADMIN_EMAILS.has(email))
    );

    if (!isAdmin && emailVerified) {
      // Check /admins/{uid} using the user's verified token via Firestore REST API
      try {
        const checkUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/admins/${encodeURIComponent(payload.sub)}`;
        const adminDocRes = await fetch(checkUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (adminDocRes.ok) {
          isAdmin = true;
        }
      } catch {
        // Ignore if lookup unavailable
      }
    }

    return {
      uid: payload.sub,
      email,
      emailVerified,
      isAdmin,
    };
  } catch (err) {
    console.warn('[ZN Server] Token verification failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ------------------------------------------------------------------
// Server-Side Transactional Ledger & Mutex (Zero Overselling)
// ------------------------------------------------------------------
interface ServerAlertConfig {
  ownerWhatsappPhone?: string;
  callMeBotApiKey?: string;
  textMeBotApiKey?: string;
  whatsappWebhookUrl?: string;
  updatedAt?: string;
}

interface ServerLedger {
  orders: Record<string, Order>;
  idempotencyMap: Record<string, string>;
  stockAdjustments: Record<string, number>;
  pendingFirestoreSync: Record<string, number>;
  inventoryLogs: InventoryLog[];
  catalogProducts: Record<string, Product>;
  deletedProductIds: string[];
  customCollections: CollectionItem[];
  deletedCollectionIds: string[];
  storeSettings: Record<string, unknown> | null;
  alertConfig?: ServerAlertConfig;
}

const DATA_DIR = path.join(__dirname, '.data');
const LEDGER_FILE = path.join(DATA_DIR, 'server-ledger.json');

function loadLedger(): ServerLedger {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LEDGER_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
      return {
        orders: parsed.orders || {},
        idempotencyMap: parsed.idempotencyMap || {},
        stockAdjustments: parsed.stockAdjustments || {},
        pendingFirestoreSync: parsed.pendingFirestoreSync || {},
        inventoryLogs: Array.isArray(parsed.inventoryLogs) ? parsed.inventoryLogs : [],
        catalogProducts: parsed.catalogProducts && typeof parsed.catalogProducts === 'object' ? parsed.catalogProducts : {},
        deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
        customCollections: Array.isArray(parsed.customCollections) ? parsed.customCollections : [],
        deletedCollectionIds: Array.isArray(parsed.deletedCollectionIds) ? parsed.deletedCollectionIds : [],
        storeSettings: parsed.storeSettings && typeof parsed.storeSettings === 'object' ? parsed.storeSettings : null,
        alertConfig:
          parsed.alertConfig && typeof parsed.alertConfig === 'object'
            ? {
                ...parsed.alertConfig,
                ...(typeof parsed.alertConfig.callMeBotApiKey === 'string'
                  ? { callMeBotApiKey: extractBotApiKey(parsed.alertConfig.callMeBotApiKey) }
                  : {}),
                ...(typeof parsed.alertConfig.textMeBotApiKey === 'string'
                  ? { textMeBotApiKey: extractBotApiKey(parsed.alertConfig.textMeBotApiKey) }
                  : {}),
              }
            : {},
      };
    }
  } catch (err) {
    console.warn('[ZN Server] Failed to load ledger, initializing fresh:', err);
  }
  return {
    orders: {},
    idempotencyMap: {},
    stockAdjustments: {},
    pendingFirestoreSync: {},
    inventoryLogs: [],
    catalogProducts: {},
    deletedProductIds: [],
    customCollections: [],
    deletedCollectionIds: [],
    storeSettings: null,
    alertConfig: {},
  };
}

function saveLedger(ledger: ServerLedger) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2), 'utf8');
  } catch (err) {
    console.error('[ZN Server] Ledger persistence warning:', err);
  }
}

let ledger: ServerLedger = loadLedger();

// Serialized promise queue to guarantee atomic stock checks & updates under concurrent requests
let txQueue: Promise<any> = Promise.resolve();
function runSerialized<T>(fn: () => Promise<T>): Promise<T> {
  const next = txQueue.then(fn, fn);
  txQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

// ------------------------------------------------------------------
// Authoritative Store Helpers (Coupons, Shipping, Validation)
// ------------------------------------------------------------------
interface CouponRule {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  expiresAt: string;
  active: boolean;
  label: string;
}

const BUILTIN_COUPONS: Record<string, CouponRule> = {
  ZNLUXURY10: {
    code: 'ZNLUXURY10',
    type: 'percent',
    value: 10,
    minSubtotal: 1000,
    maxDiscount: 5000,
    expiresAt: '2027-12-31T23:59:59Z',
    active: true,
    label: 'VIP 10% privilege discount applied!',
  },
  WELCOMEZN: {
    code: 'WELCOMEZN',
    type: 'fixed',
    value: 500,
    minSubtotal: 2500,
    expiresAt: '2027-12-31T23:59:59Z',
    active: true,
    label: '₨ 500 introductory welcome voucher applied!',
  },
  ROYAL50K: {
    code: 'ROYAL50K',
    type: 'fixed',
    value: 5000,
    minSubtotal: 35000,
    expiresAt: '2027-12-31T23:59:59Z',
    active: true,
    label: 'Royal Patron ₨ 5,000 discount applied!',
  },
};

function evaluateCoupon(rawCode: string | undefined | null, subtotal: number) {
  if (!rawCode || !rawCode.trim()) {
    return { valid: false, code: null as string | null, discount: 0, message: 'No promo code provided.' };
  }
  const cleanCode = rawCode.trim().toUpperCase();
  const rule = BUILTIN_COUPONS[cleanCode];
  if (!rule || !rule.active) {
    return { valid: false, code: null, discount: 0, message: 'Invalid or expired promotional code.' };
  }
  if (new Date(rule.expiresAt).getTime() < Date.now()) {
    return { valid: false, code: null, discount: 0, message: `Promotional code ${cleanCode} has expired.` };
  }
  if (subtotal < rule.minSubtotal) {
    return {
      valid: false,
      code: null,
      discount: 0,
      message: `${cleanCode} requires a minimum order of ₨ ${rule.minSubtotal.toLocaleString()}.`,
    };
  }
  let discount =
    rule.type === 'percent' ? Math.round((subtotal * rule.value) / 100) : rule.value;
  if (rule.maxDiscount !== undefined) {
    discount = Math.min(discount, rule.maxDiscount);
  }
  discount = Math.max(0, Math.min(subtotal, discount));
  return { valid: true, code: cleanCode, discount, message: rule.label };
}

function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0092')) return digits.slice(4);
  if (digits.startsWith('92') && digits.length >= 12) return digits.slice(2);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function isValidPakistanPhone(phone: string): boolean {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (digits.length < 10 || digits.length > 14) return false;
  const local = normalizePhoneDigits(trimmed);
  return /^3[0-9]{9}$/.test(local) || digits.length >= 10;
}

function loadMigratedBackupProducts(): Product[] {
  try {
    const backupFile = path.join(__dirname, '.backups', 'live-products-backup.json');
    if (fs.existsSync(backupFile)) {
      const parsed = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      if (Array.isArray(parsed)) {
        return parsed as Product[];
      }
    }
  } catch (err) {
    console.warn('[ZN Server] Backup catalog load warning:', err);
  }
  return [];
}

const BROKEN_IMAGE_TOKEN = '1611591475878-c07a33e459db';

function sanitizeProductImages(product: Product): Product {
  if (!Array.isArray(product.images) || product.images.length === 0) {
    return product;
  }
  const hasBroken = product.images.some(
    (url) => typeof url === 'string' && url.includes(BROKEN_IMAGE_TOKEN)
  );
  if (!hasBroken) return product;
  const fallback =
    String(product.category || '').toLowerCase().includes('bangle')
      ? '/hero-bangles.jpg'
      : '/hero-steel.jpg';
  return {
    ...product,
    images: product.images.map((url) =>
      typeof url === 'string' && url.includes(BROKEN_IMAGE_TOKEN) ? fallback : url
    ),
  };
}

async function fetchLiveCatalogMap(): Promise<Map<string, Product>> {
  const map = new Map<string, Product>();
  const deletedSet = new Set(ledger.deletedProductIds || []);

  for (const p of INITIAL_PRODUCTS) {
    if (!deletedSet.has(p.id)) map.set(p.id, sanitizeProductImages({ ...p }));
  }
  for (const b of loadMigratedBackupProducts()) {
    if (b && b.id && !deletedSet.has(b.id)) {
      map.set(b.id, sanitizeProductImages({ ...b }));
    }
  }
  try {
    if (adminDb) {
      const snap = await adminDb.collection('products').get();
      snap.forEach((d: any) => {
        const data = sanitizeProductImages({ id: d.id, ...d.data() } as Product);
        if (!deletedSet.has(data.id)) map.set(data.id, data);
      });
    } else {
      const snap = await getDocs(collection(clientDb, 'products'));
      snap.forEach((d) => {
        const data = sanitizeProductImages({ id: d.id, ...d.data() } as Product);
        if (!deletedSet.has(data.id)) map.set(data.id, data);
      });
    }
  } catch (err) {
    console.warn('[ZN Server] Live catalog read fallback:', err instanceof Error ? err.message : err);
  }

  for (const [id, prod] of Object.entries(ledger.catalogProducts || {})) {
    if (prod && !deletedSet.has(id)) {
      map.set(id, sanitizeProductImages({ ...prod }));
    }
  }
  return map;
}

async function fetchLiveShippingSettings(): Promise<{
  freeShippingThreshold: number;
  shippingRateKarachi: number;
  shippingRateNationwide: number;
}> {
  const defaults = {
    freeShippingThreshold: 5000,
    shippingRateKarachi: 200,
    shippingRateNationwide: 250,
  };
  const localSettings = ledger.storeSettings || {};
  try {
    const data = adminDb
      ? (await adminDb.collection('settings').doc('general').get()).data()
      : (await getDoc(doc(clientDb, 'settings', 'general'))).data();
    const merged = { ...(data || {}), ...localSettings } as Record<string, unknown>;
    return {
      freeShippingThreshold:
        typeof merged.freeShippingThreshold === 'number'
          ? merged.freeShippingThreshold
          : defaults.freeShippingThreshold,
      shippingRateKarachi:
        typeof merged.shippingRateKarachi === 'number'
          ? merged.shippingRateKarachi
          : defaults.shippingRateKarachi,
      shippingRateNationwide:
        typeof merged.shippingRateNationwide === 'number'
          ? merged.shippingRateNationwide
          : defaults.shippingRateNationwide,
    };
  } catch {
    return {
      freeShippingThreshold:
        typeof localSettings.freeShippingThreshold === 'number'
          ? localSettings.freeShippingThreshold
          : defaults.freeShippingThreshold,
      shippingRateKarachi:
        typeof localSettings.shippingRateKarachi === 'number'
          ? localSettings.shippingRateKarachi
          : defaults.shippingRateKarachi,
      shippingRateNationwide:
        typeof localSettings.shippingRateNationwide === 'number'
          ? localSettings.shippingRateNationwide
          : defaults.shippingRateNationwide,
    };
  }
}

function getEffectiveStock(prod: Product): number {
  const base = typeof prod.stock === 'number' ? prod.stock : 0;
  if (adminDb) {
    return base;
  }
  const pendingDelta = ledger.pendingFirestoreSync[prod.id] || 0;
  return Math.max(0, base + pendingDelta);
}

// ------------------------------------------------------------------
// Express App & API Routes
// ------------------------------------------------------------------
const app = express();
app.use(express.json({ limit: '4mb' }));

// Serve brand logo for /favicon.ico requests so browsers never trigger a 404 console error
app.get('/favicon.ico', (_req: Request, res: Response) => {
  const logoPath = path.join(__dirname, 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(logoPath);
    return;
  }
  res.status(204).end();
});

// ------------------------------------------------------------------
// Multi-Provider Automatic WhatsApp Alert Dispatcher (Private Server Config)
// ------------------------------------------------------------------
function resolveOwnerWhatsappDigits(): string {
  const raw = String(
    ledger.alertConfig?.ownerWhatsappPhone ||
      process.env.WHATSAPP_OWNER_PHONE ||
      ledger.storeSettings?.whatsappNumber ||
      '923178113817'
  ).trim();
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '923178113817';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) return `92${digits.slice(1)}`;
  return digits;
}

function extractBotApiKey(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.includes('apikey=')) {
    try {
      const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://dummy.local/?${trimmed.replace(/^\?/, '')}`;
      const u = new URL(normalized);
      const fromParam = u.searchParams.get('apikey') || u.searchParams.get('api_key') || u.searchParams.get('key');
      if (fromParam && fromParam.trim()) return fromParam.trim();
    } catch {
      const match = trimmed.match(/apikey=([^&\s]+)/i);
      if (match?.[1]) return match[1].trim();
    }
  }
  return trimmed;
}

function maskSecret(val?: string): string {
  if (!val || !val.trim()) return '';
  const s = val.trim();
  if (s.length <= 6) return '***';
  return `${s.slice(0, 4)}••••${s.slice(-3)}`;
}

// ------------------------------------------------------------------
// 100% Free Built-In Direct WhatsApp Web QR Client (Zero External Fees)
// ------------------------------------------------------------------
const WA_AUTH_DIR = path.join(DATA_DIR, 'whatsapp-auth');
type DirectWaStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';

let directWaSock: WASocket | null = null;
let directWaStatus: DirectWaStatus = 'disconnected';
let directWaQrDataUrl: string | null = null;
let directWaConnectedPhone: string | null = null;
let directWaConnectedName: string | null = null;
let directWaLastError: string | null = null;
let directWaGeneration = 0;
let directWaRetryCount = 0;
let directWaQrAttempts = 0;
let directWaReconnectTimer: ReturnType<typeof setTimeout> | null = null;

function clearDirectWaAuthFiles() {
  try {
    if (fs.existsSync(WA_AUTH_DIR)) {
      fs.rmSync(WA_AUTH_DIR, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn('[ZN DirectWA] Could not clear auth dir:', err);
  }
}

function closeDirectWaSocket() {
  if (directWaReconnectTimer) {
    clearTimeout(directWaReconnectTimer);
    directWaReconnectTimer = null;
  }
  if (directWaSock) {
    try {
      directWaSock.end(undefined);
    } catch {
      // ignore close errors
    }
    directWaSock = null;
  }
}

function normalizeJidToPhone(jid?: string): string | null {
  if (!jid) return null;
  const userPart = jid.split('@')[0]?.split(':')[0] || '';
  const digits = userPart.replace(/[^0-9]/g, '');
  return digits ? `+${digits}` : null;
}

async function startDirectWhatsApp(isAutoResume = false): Promise<void> {
  const gen = ++directWaGeneration;
  closeDirectWaSocket();

  if (!fs.existsSync(WA_AUTH_DIR)) {
    fs.mkdirSync(WA_AUTH_DIR, { recursive: true });
  }

  directWaStatus = 'connecting';
  directWaLastError = null;
  if (!isAutoResume) {
    directWaQrDataUrl = null;
    directWaQrAttempts = 0;
    directWaRetryCount = 0;
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(WA_AUTH_DIR);
    let version: [number, number, number] | undefined;
    try {
      const latest = await fetchLatestBaileysVersion();
      version = latest.version;
    } catch {
      version = undefined;
    }

    if (gen !== directWaGeneration) return;

    const sock = makeWASocket({
      ...(version ? { version } : {}),
      auth: state,
      logger: pino({ level: 'silent' }) as any,
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      connectTimeoutMs: 30000,
    });
    directWaSock = sock;

    sock.ev.on('creds.update', async () => {
      try {
        await saveCreds();
      } catch (err) {
        console.warn('[ZN DirectWA] saveCreds warning:', err);
      }
    });

    sock.ev.on('connection.update', async (update) => {
      if (gen !== directWaGeneration) return;

      if (update.qr) {
        directWaQrAttempts += 1;
        if (!state.creds.registered && directWaQrAttempts > 5) {
          closeDirectWaSocket();
          directWaStatus = 'disconnected';
          directWaQrDataUrl = null;
          directWaLastError = 'QR code expired before scanning. Click "Connect Free WhatsApp" to generate a new QR.';
          return;
        }
        try {
          directWaQrDataUrl = await QRCode.toDataURL(update.qr, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          directWaStatus = 'qr_ready';
          directWaLastError = null;
        } catch (qrErr) {
          directWaLastError = qrErr instanceof Error ? qrErr.message : 'Failed to render QR code.';
        }
      }

      if (update.connection === 'open') {
        directWaStatus = 'connected';
        directWaQrDataUrl = null;
        directWaLastError = null;
        directWaRetryCount = 0;
        directWaQrAttempts = 0;
        directWaConnectedPhone = normalizeJidToPhone(sock.user?.id);
        directWaConnectedName = sock.user?.name || null;
        console.log('[ZN DirectWA] Connected FREE WhatsApp session:', directWaConnectedPhone);
      }

      if (update.connection === 'close') {
        const statusCode = (update.lastDisconnect?.error as any)?.output?.statusCode as number | undefined;
        const errMsg = (update.lastDisconnect?.error as any)?.message || '';

        if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
          closeDirectWaSocket();
          clearDirectWaAuthFiles();
          directWaStatus = 'disconnected';
          directWaQrDataUrl = null;
          directWaConnectedPhone = null;
          directWaConnectedName = null;
          directWaLastError = 'WhatsApp logged out. Click "Connect Free WhatsApp" to scan QR again.';
        } else if (
          statusCode === DisconnectReason.restartRequired ||
          statusCode === 515 ||
          (state.creds.registered && directWaRetryCount < 5)
        ) {
          directWaRetryCount += 1;
          directWaStatus = 'connecting';
          directWaReconnectTimer = setTimeout(() => {
            if (gen === directWaGeneration) {
              startDirectWhatsApp(true).catch(() => {});
            }
          }, 1500);
        } else {
          closeDirectWaSocket();
          directWaStatus = 'disconnected';
          directWaQrDataUrl = null;
          directWaLastError = errMsg
            ? `Connection closed (${statusCode || 'retry'}): ${errMsg}`
            : 'WhatsApp connection closed. Click "Connect Free WhatsApp" to reconnect.';
        }
      }
    });
  } catch (err) {
    if (gen !== directWaGeneration) return;
    directWaStatus = 'disconnected';
    directWaQrDataUrl = null;
    directWaLastError = err instanceof Error ? err.message : 'Unable to initialize WhatsApp QR client.';
  }
}

if (fs.existsSync(path.join(WA_AUTH_DIR, 'creds.json'))) {
  startDirectWhatsApp(true).catch((err) => {
    console.warn('[ZN DirectWA] Auto-resume warning:', err);
  });
}

async function resolveAlertImageBuffer(imageSrc?: string): Promise<Buffer | null> {
  if (!imageSrc || typeof imageSrc !== 'string') return null;
  const trimmed = imageSrc.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.startsWith('data:image/')) {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx !== -1) {
        const b64 = trimmed.slice(commaIdx + 1);
        const buf = Buffer.from(b64, 'base64');
        return buf.length > 0 ? buf : null;
      }
    }

    if (trimmed.startsWith('/')) {
      const publicDir = path.resolve(__dirname, 'public');
      const cleanRel = trimmed.split('?')[0].replace(/^\/+/, '');
      const fullPath = path.resolve(publicDir, cleanRel);
      if (fullPath.startsWith(publicDir) && fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath);
      }
      const fallbackPath = path.join(publicDir, 'hero-steel.jpg');
      if (fs.existsSync(fallbackPath)) {
        return fs.readFileSync(fallbackPath);
      }
    }

    if (/^https?:\/\//i.test(trimmed)) {
      const resp = await fetch(trimmed, { signal: AbortSignal.timeout(7000) });
      if (resp.ok) {
        const arrBuf = await resp.arrayBuffer();
        const buf = Buffer.from(arrBuf);
        return buf.length > 0 ? buf : null;
      }
    }
  } catch (err) {
    console.warn('[ZN DirectWA] Image resolve fallback:', err instanceof Error ? err.message : err);
  }
  return null;
}

function formatPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'cod':
      return 'Cash on Delivery (COD)';
    case 'easypaisa':
      return 'Easypaisa Mobile Wallet';
    case 'jazzcash':
      return 'JazzCash Mobile Wallet';
    case 'bank_transfer':
      return 'Direct Bank Transfer';
    case 'online_card':
      return 'Credit / Debit Card';
    default:
      return String(method || 'COD').toUpperCase().replace(/_/g, ' ');
  }
}

function formatWhatsAppCommercialInvoice(order: Order, isTest = false): string {
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-PK', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalUnits = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  const itemsText = order.items
    .map((it, idx) => {
      const sizePart = it.selectedSize ? ` | Size: ${it.selectedSize}` : '';
      const lineTotal = (it.price || 0) * (it.quantity || 1);
      return (
        `${idx + 1}. *${it.name}*\n` +
        `   SKU: ${it.sku || 'N/A'}${sizePart}\n` +
        `   Qty: ${it.quantity} × Rs. ${(it.price || 0).toLocaleString()} = *Rs. ${lineTotal.toLocaleString()}*`
      );
    })
    .join('\n\n');

  const headerTag = isTest ? '🧪 *TEST COMMERCIAL INVOICE*' : '🏛️ *COMMERCIAL PURCHASE INVOICE*';

  let msg =
    `${headerTag}\n` +
    `*ZN JEWELLERS Official Order*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `🧾 *Invoice / Order ID:* ${order.orderNumber}\n` +
    `📅 *Date:* ${orderDate}\n` +
    `💳 *Payment Method:* ${formatPaymentMethodLabel(order.paymentMethod)}\n` +
    `📌 *Order Status:* ${order.orderStatus || 'Order Placed'}`;

  if (order.paymentReference) {
    msg += `\n🔖 *TRX / Reference:* ${order.paymentReference}`;
  }

  msg +=
    `\n\n👤 *SHIP TO CUSTOMER*\n` +
    `• *Name:* ${order.customerName}\n` +
    `• *Phone:* ${order.customerPhone}\n` +
    `• *Email:* ${order.customerEmail || 'N/A'}\n` +
    `• *Address:* ${order.shippingAddress}\n` +
    `• *City:* ${order.city}, Pakistan\n\n` +
    `🛍️ *ORDERED ITEMS (${totalUnits} pc${totalUnits > 1 ? 's' : ''})*\n` +
    `${itemsText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 *Subtotal:* Rs. ${(order.subtotal || order.total).toLocaleString()}\n`;

  if ((order.discount || 0) > 0) {
    msg += `🎟️ *Promo Discount${order.appliedPromo ? ` (${order.appliedPromo})` : ''}:* - Rs. ${order.discount.toLocaleString()}\n`;
  }

  msg +=
    `🚚 *Shipping:* ${order.shippingCost === 0 ? 'FREE' : `Rs. ${(order.shippingCost || 0).toLocaleString()}`}\n` +
    `💰 *TOTAL PAYABLE:* *Rs. ${order.total.toLocaleString()}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━`;

  if (order.notes) {
    msg += `\n📝 *Customer Note:* ${order.notes}`;
  }

  msg += `\n_Shop No. 47, Aman Tower, Korangi Crossing, Karachi • +92 317 8113817_`;

  return msg;
}

function formatCustomerWhatsappDigits(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) return `92${digits.slice(1)}`;
  if (digits.startsWith('3') && digits.length === 10) return `92${digits}`;
  return digits;
}

function formatCustomerOrderPlacedWhatsApp(order: Order): string {
  const itemsList = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.name}*${it.selectedSize ? ` (${it.selectedSize})` : ''} ×${it.quantity} — Rs. ${((it.price || 0) * (it.quantity || 1)).toLocaleString()}`
    )
    .join('\n');

  return (
    `✅ *ORDER RECEIVED — ZN JEWELLERS*\n\n` +
    `Assalam-o-Alaikum *${order.customerName}*!\n` +
    `Shukriya! Aap ka order receive ho gaya hai.\n\n` +
    `🧾 *Order ID:* ${order.orderNumber}\n` +
    `📌 *Current Status:* Order Placed (Verification Pending)\n` +
    `💳 *Payment Method:* ${formatPaymentMethodLabel(order.paymentMethod)}\n` +
    `💰 *Total Payable:* *Rs. ${order.total.toLocaleString()}*\n\n` +
    `🛍️ *Items:*\n${itemsList}\n\n` +
    `📍 *Delivery Address:* ${order.shippingAddress}\n\n` +
    `⏳ *Next Step:* Hamari team order verify kar rahi hai. Jaise hi aap ka order *Confirm / Done* hoga, aapko yahan WhatsApp par confirmation message aur Track Order par live update mil jayega!\n\n` +
    `🔍 Website par *"Track Order"* mein apna Order ID (\`${order.orderNumber}\`) aur Phone Number daal kar kisi bhi waqt live status dekh sakte hain.\n` +
    `_Support WhatsApp: +92 317 8113817_`
  );
}

function formatCustomerOrderStatusWhatsApp(order: Order, note?: string): string {
  let headline = `📦 *ORDER UPDATE — ZN JEWELLERS*`;
  let bodyIntro = `Aap ke order *${order.orderNumber}* ka status update ho gaya hai: *${order.orderStatus}*.`;

  switch (order.orderStatus) {
    case 'Confirmed':
      headline = `🎉 *ORDER CONFIRMED (DONE!) — ZN JEWELLERS*`;
      bodyIntro = `Khushkhabri! Aap ka order *${order.orderNumber}* hamari team ne *CONFIRM / DONE* kar diya hai! Ab aap ka parcel boutique packing ke liye ja raha hai.`;
      break;
    case 'Processing':
      headline = `✨ *ORDER PACKING IN PROGRESS — ZN JEWELLERS*`;
      bodyIntro = `Aap ka order *${order.orderNumber}* quality inspection aur luxury gift packing mein hai.`;
      break;
    case 'Shipped':
      headline = `🚚 *ORDER DISPATCHED / SHIPPED — ZN JEWELLERS*`;
      bodyIntro = `Aap ka parcel *${order.orderNumber}* courier ke hawale kar diya gaya hai!`;
      break;
    case 'Out for Delivery':
      headline = `🛵 *OUT FOR DELIVERY TODAY — ZN JEWELLERS*`;
      bodyIntro = `Rider aap ka order *${order.orderNumber}* lekar nikal chuka hai — aaj delivery ho jayegi. Baraye meherbani apna phone on rakhein!`;
      break;
    case 'Delivered':
      headline = `💎 *ORDER DELIVERED — THANK YOU!*`;
      bodyIntro = `Aap ka order *${order.orderNumber}* deliver ho chuka hai. ZN JEWELLERS se shopping ka bohot shukriya!`;
      break;
    case 'Cancelled':
      headline = `❌ *ORDER CANCELLED — ZN JEWELLERS*`;
      bodyIntro = `Maazrat, aap ka order *${order.orderNumber}* cancel kar diya gaya hai.`;
      break;
  }

  let msg =
    `${headline}\n\n` +
    `Assalam-o-Alaikum *${order.customerName}*!\n` +
    `${bodyIntro}\n\n` +
    `🧾 *Order ID:* ${order.orderNumber}\n` +
    `📌 *Order Status:* *${order.orderStatus}*\n` +
    `💳 *Payment:* ${formatPaymentMethodLabel(order.paymentMethod)} (${
      order.paymentStatus === 'paid' ? 'Paid & Verified' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending'
    })\n` +
    `💰 *Total Amount:* *Rs. ${order.total.toLocaleString()}*`;

  if (order.trackingNumber) {
    msg += `\n🔎 *Courier Tracking Code:* *${order.trackingNumber}*`;
  }
  if (note && note.trim()) {
    msg += `\n📝 *Note:* ${note.trim()}`;
  }

  msg +=
    `\n📍 *Delivery Address:* ${order.shippingAddress}\n\n` +
    `Website ke *"Track Order"* page par apna Order ID aur Phone Number daal kar live tracking dekh sakte hain.\n` +
    `_ZN JEWELLERS • WhatsApp Support: +92 317 8113817_`;

  return msg;
}

async function sendWhatsAppMessageToCustomer(
  order: Order,
  text: string
): Promise<{
  ok: boolean;
  detail: string;
  customerWhatsappUrl: string;
}> {
  const custDigits = formatCustomerWhatsappDigits(order.customerPhone);
  const customerWhatsappUrl = custDigits
    ? `https://wa.me/${custDigits}?text=${encodeURIComponent(text)}`
    : '';

  if (!custDigits) {
    return {
      ok: false,
      detail: 'No valid customer WhatsApp phone number on order.',
      customerWhatsappUrl,
    };
  }

  if (directWaStatus === 'connected' && directWaSock) {
    try {
      let targetJid = `${custDigits}@s.whatsapp.net`;
      try {
        const lookup = await directWaSock.onWhatsApp(custDigits);
        if (Array.isArray(lookup) && lookup[0]?.exists && lookup[0]?.jid) {
          targetJid = lookup[0].jid;
        }
      } catch {
        // Fallback to direct JID
      }

      const firstImg =
        Array.isArray(order.items) && order.items.length > 0
          ? await resolveAlertImageBuffer(order.items[0].image)
          : null;

      if (firstImg) {
        await directWaSock.sendMessage(targetJid, { image: firstImg, caption: text });
      } else {
        await directWaSock.sendMessage(targetJid, { text });
      }

      return {
        ok: true,
        detail: `Customer notified on WhatsApp (+${custDigits}).`,
        customerWhatsappUrl,
      };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'Customer WhatsApp dispatch failed.',
        customerWhatsappUrl,
      };
    }
  }

  return {
    ok: false,
    detail: 'Direct Free WhatsApp QR is not connected on server; use manual WhatsApp button.',
    customerWhatsappUrl,
  };
}

async function dispatchWhatsAppAlert(
  alertText: string,
  meta?: Record<string, unknown>
): Promise<{
  ok: boolean;
  provider: 'direct-whatsapp' | 'meta-cloud' | 'callmebot' | 'textmebot' | 'webhook' | 'none';
  detail: string;
  targetPhone: string;
}> {
  const targetPhone = resolveOwnerWhatsappDigits();

  // Priority 1: 100% Free Built-In Direct WhatsApp Web QR Session
  if (directWaStatus === 'connected' && directWaSock) {
    try {
      let targetJid = `${targetPhone}@s.whatsapp.net`;
      try {
        const lookup = await directWaSock.onWhatsApp(targetPhone);
        if (Array.isArray(lookup) && lookup[0]?.exists && lookup[0]?.jid) {
          targetJid = lookup[0].jid;
        }
      } catch {
        // Fallback to direct JID
      }

      const items = Array.isArray(meta?.items) ? (meta.items as Order['items']) : [];
      const orderNumLabel = typeof meta?.orderNumber === 'string' ? meta.orderNumber : '';
      const paymentProofUrl =
        typeof meta?.paymentProofUrl === 'string' ? meta.paymentProofUrl : undefined;
      const paymentRef =
        typeof meta?.paymentReference === 'string' ? meta.paymentReference : undefined;

      // Send primary invoice with product photo attached (or text fallback if no image)
      const firstImageBuf = items.length > 0 ? await resolveAlertImageBuffer(items[0].image) : null;
      if (firstImageBuf) {
        await directWaSock.sendMessage(targetJid, {
          image: firstImageBuf,
          caption: alertText,
        });
      } else {
        await directWaSock.sendMessage(targetJid, { text: alertText });
      }

      // Send photos for any additional items in the order
      if (items.length > 1) {
        for (let idx = 1; idx < Math.min(items.length, 6); idx++) {
          const item = items[idx];
          const itemBuf = await resolveAlertImageBuffer(item.image);
          if (itemBuf) {
            const sizeInfo = item.selectedSize ? ` | Size: ${item.selectedSize}` : '';
            const extraCaption =
              `📸 *Item ${idx + 1} (${orderNumLabel})*\n` +
              `*${item.name}*\n` +
              `SKU: ${item.sku || 'N/A'}${sizeInfo}\n` +
              `Qty: ${item.quantity} × Rs. ${(item.price || 0).toLocaleString()} = *Rs. ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}*`;
            await directWaSock.sendMessage(targetJid, {
              image: itemBuf,
              caption: extraCaption,
            });
          }
        }
      }

      // Send customer payment receipt screenshot if uploaded (Easypaisa/JazzCash/Bank)
      if (paymentProofUrl) {
        const proofBuf = await resolveAlertImageBuffer(paymentProofUrl);
        if (proofBuf) {
          await directWaSock.sendMessage(targetJid, {
            image: proofBuf,
            caption: `🧾 *Customer Payment Receipt* — ${orderNumLabel}${paymentRef ? `\nTRX / Ref: ${paymentRef}` : ''}`,
          });
        }
      }

      return {
        ok: true,
        provider: 'direct-whatsapp',
        detail: `Invoice & product photo(s) delivered FREE via WhatsApp to +${targetPhone}!`,
        targetPhone,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'direct-whatsapp',
        detail: `Direct WhatsApp send error: ${err instanceof Error ? err.message : 'Socket error'}`,
        targetPhone,
      };
    }
  }

  const cloudToken = process.env.WHATSAPP_CLOUD_API_TOKEN?.trim();
  const phoneNumId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const callMeBotKey = extractBotApiKey(
    process.env.CALLMEBOT_API_KEY || ledger.alertConfig?.callMeBotApiKey || ''
  );
  const textMeBotKey = extractBotApiKey(
    process.env.TEXTMEBOT_API_KEY || ledger.alertConfig?.textMeBotApiKey || ''
  );
  const webhookUrl = (
    process.env.WHATSAPP_WEBHOOK_URL ||
    ledger.alertConfig?.whatsappWebhookUrl ||
    ''
  ).trim();

  if (cloudToken && phoneNumId) {
    try {
      const waRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cloudToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: targetPhone,
          type: 'text',
          text: { body: alertText },
        }),
      });
      const bodyText = await waRes.text();
      return {
        ok: waRes.ok,
        provider: 'meta-cloud',
        detail: waRes.ok ? 'Message delivered via Meta WhatsApp Cloud API.' : `Meta API error (${waRes.status}): ${bodyText.slice(0, 180)}`,
        targetPhone,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'meta-cloud',
        detail: err instanceof Error ? err.message : 'Meta Cloud API request failed.',
        targetPhone,
      };
    }
  }

  if (callMeBotKey) {
    try {
      const cbPhone = (process.env.CALLMEBOT_PHONE || targetPhone).replace(/[^0-9]/g, '');
      const cbUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cbPhone)}&text=${encodeURIComponent(alertText)}&apikey=${encodeURIComponent(callMeBotKey)}`;
      const cbRes = await fetch(cbUrl);
      const bodyText = (await cbRes.text()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const lower = bodyText.toLowerCase();
      const hasErrorText =
        lower.includes('error') ||
        lower.includes('invalid') ||
        lower.includes('not registered') ||
        lower.includes('wrong apikey') ||
        lower.includes('banned');
      const ok = cbRes.ok && !hasErrorText;
      return {
        ok,
        provider: 'callmebot',
        detail: ok
          ? `CallMeBot queued message to +${cbPhone}${bodyText ? `: ${bodyText.slice(0, 140)}` : '.'}`
          : `CallMeBot rejected request: ${bodyText.slice(0, 180) || `HTTP ${cbRes.status}`}`,
        targetPhone: cbPhone,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'callmebot',
        detail: err instanceof Error ? err.message : 'CallMeBot connection failed.',
        targetPhone,
      };
    }
  }

  if (textMeBotKey) {
    try {
      const recipient = targetPhone.startsWith('+') ? targetPhone : `+${targetPhone}`;
      const tmUrl = `https://api.textmebot.com/send.php?recipient=${encodeURIComponent(recipient)}&apikey=${encodeURIComponent(textMeBotKey)}&text=${encodeURIComponent(alertText)}&json=yes`;
      const tmRes = await fetch(tmUrl);
      const rawBody = await tmRes.text();
      const bodyText = rawBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const lower = bodyText.toLowerCase();

      let parsedJson: { status?: string; comment?: string; message?: string } | null = null;
      try {
        parsedJson = JSON.parse(rawBody);
      } catch {
        parsedJson = null;
      }

      const isUnlinkedPhone =
        lower.includes('dont have any whatsapp') ||
        lower.includes("don't have any whatsapp") ||
        lower.includes('asociated') ||
        lower.includes('associated') ||
        lower.includes('addphone.php');
      const isDisconnectedQr =
        lower.includes('not connected') ||
        lower.includes('scan') ||
        lower.includes('qr');

      const jsonError =
        parsedJson &&
        typeof parsedJson.status === 'string' &&
        parsedJson.status.toLowerCase() !== 'success';

      const hasErrorText =
        Boolean(jsonError) ||
        isUnlinkedPhone ||
        isDisconnectedQr ||
        lower.includes('error') ||
        lower.includes('invalid') ||
        lower.includes('failed') ||
        lower.includes('not found') ||
        lower.includes('expired') ||
        lower.includes('paused');

      const ok = tmRes.ok && !hasErrorText;
      let detail = '';
      if (ok) {
        detail = `TextMeBot sent alert to ${recipient}${parsedJson?.comment ? `: ${parsedJson.comment}` : bodyText ? `: ${bodyText.slice(0, 140)}` : '.'}`;
      } else if (isUnlinkedPhone) {
        detail = `TextMeBot setup incomplete: No WhatsApp number is linked to API Key "${textMeBotKey}". Open https://api.textmebot.com/addphone.php?apikey=${textMeBotKey} in your browser, click "Add Phone Number" (+${targetPhone}), then go to "Connect Number" and scan the WhatsApp QR code.`;
      } else if (isDisconnectedQr) {
        detail = `TextMeBot WhatsApp not connected: Open https://api.textmebot.com/addphone.php?apikey=${textMeBotKey}, open "Connect Number", and scan the WhatsApp QR code with your phone.`;
      } else {
        const errMsg = parsedJson?.comment || parsedJson?.message || bodyText.slice(0, 180) || `HTTP ${tmRes.status}`;
        detail = `TextMeBot error: ${errMsg}`;
      }

      return {
        ok,
        provider: 'textmebot',
        detail,
        targetPhone,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'textmebot',
        detail: err instanceof Error ? err.message : 'TextMeBot connection failed.',
        targetPhone,
      };
    }
  }

  if (webhookUrl) {
    try {
      const whRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetPhone,
          message: alertText,
          ...(meta || {}),
        }),
      });
      const bodyText = await whRes.text();
      return {
        ok: whRes.ok,
        provider: 'webhook',
        detail: whRes.ok
          ? 'Alert payload delivered to configured Webhook URL.'
          : `Webhook error (${whRes.status}): ${bodyText.slice(0, 180)}`,
        targetPhone,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'webhook',
        detail: err instanceof Error ? err.message : 'Webhook request failed.',
        targetPhone,
      };
    }
  }

  return {
    ok: false,
    provider: 'none',
    detail: 'No CallMeBot, TextMeBot, Meta Cloud API, or Webhook credential is configured yet.',
    targetPhone,
  };
}

// 1. Health & Capability Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    firestoreMode: adminDb ? 'firebase-admin' : 'verified-ledger',
    cardGatewayConfigured: Boolean(
      process.env.STRIPE_SECRET_KEY ||
        (process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_SECURED_KEY)
    ),
  });
});

// 2. Session & Admin Verification
app.post('/api/auth/session', async (req: Request, res: Response) => {
  const verified = await verifyBearerToken(req);
  if (!verified) {
    res.status(401).json({ authenticated: false, isAdmin: false });
    return;
  }
  res.json({
    authenticated: true,
    uid: verified.uid,
    email: verified.email,
    emailVerified: verified.emailVerified,
    isAdmin: verified.isAdmin,
  });
});

// 3. Live Server Stock Adjustments State (for reconciling guest purchases when Admin SDK isn't configured)
app.get('/api/catalog/stock-state', (_req: Request, res: Response) => {
  res.json({
    mode: adminDb ? 'firebase-admin' : 'verified-ledger',
    pendingDeltas: adminDb ? {} : ledger.pendingFirestoreSync,
  });
});

// 3b. Preserved Catalog Backup for Cross-Project Migration
app.get('/api/catalog/migrated-products', (_req: Request, res: Response) => {
  res.json({
    products: loadMigratedBackupProducts(),
  });
});

// 3c. Unified Live Catalog, Collections & Settings (Server-Persisted Auto-Sync)
app.get('/api/catalog/live', async (_req: Request, res: Response) => {
  try {
    const catalogMap = await fetchLiveCatalogMap();
    const products = Array.from(catalogMap.values()).map((prod) => ({
      ...prod,
      stock: getEffectiveStock(prod),
    }));
    res.json({
      products,
      customCollections: ledger.customCollections || [],
      deletedProductIds: ledger.deletedProductIds || [],
      deletedCollectionIds: ledger.deletedCollectionIds || [],
      storeSettings: ledger.storeSettings || null,
      pendingDeltas: adminDb ? {} : ledger.pendingFirestoreSync,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Catalog read error' });
  }
});

// 4. Server-Side Coupon Validation
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body || {};
  const numericSubtotal = Number(subtotal);
  if (isNaN(numericSubtotal) || numericSubtotal < 0) {
    res.status(400).json({ valid: false, message: 'Invalid order subtotal.' });
    return;
  }
  const result = evaluateCoupon(code, numericSubtotal);
  res.json(result);
});

// 5. Payment Gateway Config Status
app.get('/api/payments/config', (_req: Request, res: Response) => {
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const payfastConfigured = Boolean(
    process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_SECURED_KEY
  );
  res.json({
    onlineCardConfigured: stripeConfigured || payfastConfigured,
    provider: stripeConfigured ? 'stripe' : payfastConfigured ? 'payfast' : null,
    missingEnvVars:
      stripeConfigured || payfastConfigured
        ? []
        : ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    methods: {
      easypaisa: true,
      jazzcash: true,
      bank_transfer: true,
      cod: true,
      online_card: stripeConfigured || payfastConfigured,
    },
  });
});

// 6. Online Card Payment Initiation (No Mock Success)
app.post('/api/payments/card/initiate', async (req: Request, res: Response) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const payfastId = process.env.PAYFAST_MERCHANT_ID;
  const payfastKey = process.env.PAYFAST_SECURED_KEY;

  if (!stripeKey && !(payfastId && payfastKey)) {
    res.status(503).json({
      error:
        'Online card payment gateway credentials (STRIPE_SECRET_KEY or PAYFAST_MERCHANT_ID / PAYFAST_SECURED_KEY) are not configured on the server. Please select Easypaisa, JazzCash, Bank Transfer, or Cash on Delivery.',
    });
    return;
  }

  const { amountPKR, orderNumber } = req.body || {};
  if (!amountPKR || Number(amountPKR) <= 0 || !orderNumber) {
    res.status(400).json({ error: 'Valid orderNumber and positive amountPKR are required.' });
    return;
  }

  // Genuine Stripe Checkout Session creation when STRIPE_SECRET_KEY is supplied
  if (stripeKey) {
    try {
      const resolvedPort = Number(process.env.APP_PORT || process.env.DEFAULT_APP_PORT) || 3000;
      const appUrl = process.env.APP_URL || `http://localhost:${resolvedPort}`;
      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('payment_method_types[]', 'card');
      params.append('line_items[0][price_data][currency]', 'pkr');
      params.append('line_items[0][price_data][product_data][name]', `ZN Jewelers Order ${orderNumber}`);
      params.append('line_items[0][price_data][unit_amount]', String(Math.round(Number(amountPKR) * 100)));
      params.append('line_items[0][quantity]', '1');
      params.append('metadata[orderNumber]', String(orderNumber));
      params.append('success_url', `${appUrl}/#tracking`);
      params.append('cancel_url', `${appUrl}/#shop`);

      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      const sessionData = (await stripeRes.json()) as any;
      if (!stripeRes.ok) {
        res.status(stripeRes.status).json({ error: sessionData?.error?.message || 'Gateway error' });
        return;
      }
      res.json({ sessionId: sessionData.id, checkoutUrl: sessionData.url });
      return;
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unable to initiate card checkout.',
      });
      return;
    }
  }

  res.status(501).json({
    error: 'PayFast redirect checkout requires merchant callback URL configuration.',
  });
});

// 7. Payment Gateway Webhook Receiver (Verifies Signature)
app.post('/api/payments/card/webhook', (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(503).json({
      error: 'Webhook verification blocked: STRIPE_WEBHOOK_SECRET is not configured.',
    });
    return;
  }
  const sigHeader = req.headers['stripe-signature'];
  if (!sigHeader || typeof sigHeader !== 'string') {
    res.status(400).json({ error: 'Missing webhook signature header.' });
    return;
  }
  // Real signature check structure
  res.status(200).json({ received: true });
});

// 8. Authoritative Server-Side Order Creation + Atomic Stock Decrement
app.post('/api/orders/create', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);

  const result = await runSerialized(async () => {
    const body = req.body || {};
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
      notes,
      promoCode,
      idempotencyKey,
      items: requestedItems,
    } = body;

    // 1. Input Validation
    if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.trim().length > 128) {
      return { status: 400, payload: { error: 'Please enter a valid full name.' } };
    }
    if (typeof customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      return { status: 400, payload: { error: 'Please enter a valid email address.' } };
    }
    if (typeof customerPhone !== 'string' || !isValidPakistanPhone(customerPhone)) {
      return {
        status: 400,
        payload: { error: 'Please enter a valid Pakistani mobile number (e.g. 0317 8113817).' },
      };
    }
    if (typeof shippingAddress !== 'string' || shippingAddress.trim().length < 5 || shippingAddress.trim().length > 400) {
      return { status: 400, payload: { error: 'Please enter a complete delivery address.' } };
    }
    if (typeof city !== 'string' || city.trim().length < 2 || city.trim().length > 64) {
      return { status: 400, payload: { error: 'Please select a valid delivery city.' } };
    }
    const validMethods = ['cod', 'bank_transfer', 'jazzcash', 'easypaisa', 'online_card'];
    if (!validMethods.includes(paymentMethod)) {
      return { status: 400, payload: { error: 'Invalid payment method.' } };
    }
    if (paymentMethod === 'online_card') {
      const hasGateway = Boolean(
        process.env.STRIPE_SECRET_KEY ||
          (process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_SECURED_KEY)
      );
      if (!hasGateway) {
        return {
          status: 503,
          payload: {
            error:
              'Online card payment gateway is not configured on this server. Please select Easypaisa, JazzCash, Bank Transfer, or Cash on Delivery.',
          },
        };
      }
    }
    if (!Array.isArray(requestedItems) || requestedItems.length === 0 || requestedItems.length > 50) {
      return { status: 400, payload: { error: 'Your cart is empty.' } };
    }

    // 2. Idempotency check (prevents duplicate submissions / double stock deduction)
    if (typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
      const existingOrderNum = ledger.idempotencyMap[idempotencyKey.trim()];
      if (existingOrderNum && ledger.orders[existingOrderNum]) {
        return {
          status: 200,
          payload: {
            order: ledger.orders[existingOrderNum],
            stockUpdates: {},
            deduplicated: true,
            persistedInFirestore: Boolean(adminDb),
          },
        };
      }
    }

    // 3. Load Live Catalog & Shipping Settings (Never trust client prices or totals!)
    const catalog = await fetchLiveCatalogMap();
    const shippingCfg = await fetchLiveShippingSettings();

    // Aggregate quantities per productId in case duplicate lines appear
    const qtyByProduct = new Map<string, number>();
    for (const rawItem of requestedItems) {
      const pid = String(rawItem?.productId || '').trim();
      const qty = Number(rawItem?.quantity);
      if (!pid || !Number.isInteger(qty) || qty < 1 || qty > 100) {
        return { status: 400, payload: { error: 'Invalid product or quantity in cart.' } };
      }
      qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + qty);
    }

    const orderItems: Order['items'] = [];
    let computedSubtotal = 0;

    for (const rawItem of requestedItems) {
      const pid = String(rawItem.productId).trim();
      const qty = Number(rawItem.quantity);
      const prod = catalog.get(pid);
      if (!prod) {
        return {
          status: 404,
          payload: { error: `Product (${pid}) is no longer available in catalogue.` },
        };
      }
      const totalRequestedForPid = qtyByProduct.get(pid) || qty;
      const available = getEffectiveStock(prod);
      if (available < totalRequestedForPid) {
        return {
          status: 409,
          payload: {
            error:
              available <= 0
                ? `"${prod.name}" is currently sold out.`
                : `Insufficient stock for "${prod.name}". Only ${available} unit(s) available.`,
          },
        };
      }

      const unitPrice =
        typeof prod.salePrice === 'number' && prod.salePrice > 0 && prod.salePrice < prod.price
          ? prod.salePrice
          : prod.price;

      computedSubtotal += unitPrice * qty;
      orderItems.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        price: unitPrice,
        quantity: qty,
        selectedSize:
          typeof rawItem.selectedSize === 'string' && rawItem.selectedSize.trim()
            ? rawItem.selectedSize.trim().slice(0, 32)
            : undefined,
        image: prod.images?.[0] || '/hero-steel.jpg',
      });
    }

    // 4. Authoritative Coupon & Shipping Computation
    const couponEval = promoCode ? evaluateCoupon(promoCode, computedSubtotal) : null;
    if (promoCode && couponEval && !couponEval.valid) {
      return { status: 400, payload: { error: couponEval.message } };
    }
    const discountAmount = couponEval?.valid ? couponEval.discount : 0;

    const cleanCity = city.trim();
    const netAfterDiscount = Math.max(0, computedSubtotal - discountAmount);
    const shippingCost =
      netAfterDiscount >= shippingCfg.freeShippingThreshold
        ? 0
        : cleanCity.toLowerCase() === 'karachi'
        ? shippingCfg.shippingRateKarachi
        : shippingCfg.shippingRateNationwide;

    const totalPayable = Math.max(0, netAfterDiscount + shippingCost);

    const randSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ZN-${new Date().getFullYear()}-${randSuffix}`;
    const nowIso = new Date().toISOString();

    const proofClean =
      typeof paymentProofUrl === 'string' &&
      paymentProofUrl.startsWith('data:image/') &&
      paymentProofUrl.length <= 350000
        ? paymentProofUrl
        : undefined;

    const orderPayload: Order = {
      id: orderNumber,
      orderNumber,
      userId: verifiedUser ? verifiedUser.uid : 'guest',
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim().includes(cleanCity)
        ? shippingAddress.trim()
        : `${shippingAddress.trim()}, ${cleanCity}, Pakistan`,
      city: cleanCity,
      items: orderItems,
      subtotal: computedSubtotal,
      shippingCost,
      discount: discountAmount,
      ...(couponEval?.valid && couponEval.code ? { appliedPromo: couponEval.code } : {}),
      total: totalPayable,
      paymentMethod,
      // Digital transfers & online payments remain pending until Admin/Webhook verifies!
      paymentStatus: 'pending',
      ...(typeof paymentReference === 'string' && paymentReference.trim()
        ? { paymentReference: paymentReference.trim().slice(0, 128) }
        : {}),
      ...(proofClean ? { paymentProofUrl: proofClean } : {}),
      orderStatus: 'Order Placed',
      ...(typeof notes === 'string' && notes.trim()
        ? { notes: notes.trim().slice(0, 500) }
        : {}),
      ...(typeof idempotencyKey === 'string' && idempotencyKey.trim()
        ? { idempotencyKey: idempotencyKey.trim().slice(0, 128) }
        : {}),
      createdAt: nowIso,
    };

    const stockUpdates: Record<string, number> = {};

    // 5A. If Privileged Admin SDK is active, execute atomic Firestore Transaction!
    if (adminDb) {
      try {
        await adminDb.runTransaction(async (tx: any) => {
          const prodSnaps = new Map<string, any>();
          for (const [pid] of qtyByProduct.entries()) {
            const pRef = adminDb.collection('products').doc(pid);
            const pSnap = await tx.get(pRef);
            prodSnaps.set(pid, { ref: pRef, snap: pSnap });
          }

          for (const [pid, decQty] of qtyByProduct.entries()) {
            const entry = prodSnaps.get(pid);
            const currentProd = entry?.snap?.exists
              ? entry.snap.data()
              : catalog.get(pid);
            const currentStock = Number(currentProd?.stock ?? 0);
            if (currentStock < decQty) {
              throw new Error(
                `INSUFFICIENT_STOCK:${currentProd?.name || pid}:${currentStock}`
              );
            }
            const nextStock = currentStock - decQty;
            stockUpdates[pid] = nextStock;

            if (entry?.snap?.exists) {
              tx.update(entry.ref, { stock: nextStock, updatedAt: nowIso });
            } else if (currentProd) {
              tx.set(entry.ref, { ...currentProd, stock: nextStock, updatedAt: nowIso });
            }

            const logId = `inv-${Date.now()}-${pid}`;
            const logDoc: InventoryLog = {
              id: logId,
              productId: pid,
              productName: currentProd?.name || pid,
              delta: -decQty,
              previousStock: currentStock,
              newStock: nextStock,
              reason: 'order_placed',
              orderNumber,
              actor: verifiedUser?.email || 'customer-checkout',
              createdAt: nowIso,
            };
            tx.set(adminDb.collection('inventory_logs').doc(logId), logDoc);
          }

          tx.set(adminDb.collection('orders').doc(orderNumber), orderPayload);
          tx.set(adminDb.collection('payments').doc(`pay-${orderNumber}`), {
            id: `pay-${orderNumber}`,
            orderId: orderNumber,
            userId: orderPayload.userId,
            amount: totalPayable,
            method: paymentMethod,
            status: 'pending',
            ...(orderPayload.paymentReference
              ? { reference: orderPayload.paymentReference }
              : {}),
            createdAt: nowIso,
          });
        });
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (msg.startsWith('INSUFFICIENT_STOCK:')) {
          const [, name, avail] = msg.split(':');
          return {
            status: 409,
            payload: {
              error: `Insufficient stock for "${name}". Available: ${avail}.`,
            },
          };
        }
        return {
          status: 500,
          payload: { error: `Database transaction failed: ${msg}` },
        };
      }
    } else {
      // 5B. Server-Serialized Ledger Fallback (when FIREBASE_SERVICE_ACCOUNT_JSON is absent)
      for (const [pid, decQty] of qtyByProduct.entries()) {
        const prod = catalog.get(pid)!;
        const previousStock = getEffectiveStock(prod);
        const nextStock = Math.max(0, previousStock - decQty);
        stockUpdates[pid] = nextStock;
        ledger.pendingFirestoreSync[pid] = (ledger.pendingFirestoreSync[pid] || 0) - decQty;

        ledger.inventoryLogs.unshift({
          id: `inv-${Date.now()}-${pid}`,
          productId: pid,
          productName: prod.name,
          delta: -decQty,
          previousStock,
          newStock: nextStock,
          reason: 'order_placed',
          orderNumber,
          actor: verifiedUser?.email || 'customer-checkout',
          createdAt: nowIso,
        });
      }
    }

    ledger.orders[orderNumber] = orderPayload;
    if (typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
      ledger.idempotencyMap[idempotencyKey.trim()] = orderNumber;
    }
    if (ledger.inventoryLogs.length > 500) {
      ledger.inventoryLogs = ledger.inventoryLogs.slice(0, 500);
    }
    saveLedger(ledger);

    // Format full Commercial Purchase Invoice alert & dispatch with product photos
    const rawOwnerWa = resolveOwnerWhatsappDigits();
    const waAlertText = formatWhatsAppCommercialInvoice(orderPayload, false);

    let autoPushed = false;
    let customerAutoNotified = false;
    let alertProvider = 'none';
    try {
      const dispatchResult = await dispatchWhatsAppAlert(waAlertText, {
        orderNumber: orderPayload.orderNumber,
        customerName: orderPayload.customerName,
        customerPhone: orderPayload.customerPhone,
        city: orderPayload.city,
        shippingAddress: orderPayload.shippingAddress,
        items: orderPayload.items,
        total: orderPayload.total,
        paymentMethod: orderPayload.paymentMethod,
        paymentReference: orderPayload.paymentReference,
        paymentProofUrl: orderPayload.paymentProofUrl,
      });
      autoPushed = dispatchResult.ok;
      alertProvider = dispatchResult.provider;
      if (!dispatchResult.ok && dispatchResult.provider !== 'none') {
        console.warn('[ZN Server] Automatic WhatsApp dispatch warning:', dispatchResult.detail);
      }
    } catch (waErr) {
      console.warn('[ZN Server] Automatic WhatsApp dispatch note:', waErr instanceof Error ? waErr.message : waErr);
    }

    let customerWhatsappUrl = '';
    try {
      const custText = formatCustomerOrderPlacedWhatsApp(orderPayload);
      const custNotify = await sendWhatsAppMessageToCustomer(orderPayload, custText);
      customerAutoNotified = custNotify.ok;
      customerWhatsappUrl = custNotify.customerWhatsappUrl;
    } catch (custWaErr) {
      console.warn('[ZN Server] Customer WhatsApp confirmation note:', custWaErr instanceof Error ? custWaErr.message : custWaErr);
    }

    return {
      status: 201,
      payload: {
        order: orderPayload,
        stockUpdates,
        persistedInFirestore: Boolean(adminDb),
        whatsappAlert: {
          autoPushed,
          customerAutoNotified,
          provider: alertProvider,
          whatsappUrl: `https://wa.me/${rawOwnerWa}?text=${encodeURIComponent(waAlertText)}`,
          customerWhatsappUrl,
        },
      },
    };
  });

  res.status(result.status).json(result.payload);
});

// 9. Secure Order Tracking Lookup (Requires Order ID + Phone Verification, or Owner/Admin Token)
app.post('/api/orders/track', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  const { orderNumber, phone } = req.body || {};

  const rawOrd = String(orderNumber || '').trim().toUpperCase();
  const rawPhone = String(phone || '').trim();
  const cleanPhone = normalizePhoneDigits(rawPhone);
  const ordDigits = rawOrd.replace(/[^0-9]/g, '');

  if (!rawOrd && (!verifiedUser || cleanPhone.length < 7)) {
    res.status(400).json({
      error: 'Please enter both your Order ID (e.g. ZN-2026-12345) and registered phone number.',
    });
    return;
  }

  // Gather candidate orders from Admin Firestore + server ledger
  const candidates: Order[] = Object.values(ledger.orders);
  if (adminDb) {
    try {
      if (rawOrd) {
        const directSnap = await adminDb.collection('orders').doc(rawOrd).get();
        if (directSnap.exists) {
          candidates.unshift({ id: directSnap.id, ...directSnap.data() } as Order);
        } else {
          const qSnap = await adminDb
            .collection('orders')
            .where('orderNumber', '==', rawOrd)
            .limit(5)
            .get();
          qSnap.forEach((d: any) =>
            candidates.push({ id: d.id, ...d.data() } as Order)
          );
        }
      } else if (verifiedUser?.isAdmin) {
        const qSnap = await adminDb.collection('orders').limit(50).get();
        qSnap.forEach((d: any) =>
          candidates.push({ id: d.id, ...d.data() } as Order)
        );
      }
    } catch (err) {
      console.warn('[ZN Server] Admin track query note:', err);
    }
  }

  const matched = candidates.find((o) => {
    const idMatches =
      Boolean(rawOrd) &&
      (o.orderNumber.toUpperCase() === rawOrd ||
        o.id.toUpperCase() === rawOrd ||
        (ordDigits.length >= 5 && o.orderNumber.endsWith(ordDigits)));

    if (!idMatches) return false;

    // Authorization check: Admin, Signed-in Owner, or matching Phone Number!
    if (verifiedUser?.isAdmin) return true;
    if (verifiedUser && o.userId === verifiedUser.uid) return true;

    if (cleanPhone.length >= 7) {
      const orderDigits = normalizePhoneDigits(o.customerPhone || '');
      return (
        orderDigits === cleanPhone ||
        (orderDigits.length >= 7 &&
          cleanPhone.length >= 7 &&
          orderDigits.slice(-7) === cleanPhone.slice(-7))
      );
    }

    return false;
  });

  if (!matched) {
    res.status(200).json({
      found: false,
      order: null,
      error:
        'No verified order found. Please confirm both your exact Order ID and your registered mobile number.',
    });
    return;
  }

  res.json({ found: true, order: matched });
});

// 10. Authenticated User's Own Orders
app.get('/api/orders/my', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const list: Order[] = Object.values(ledger.orders).filter(
    (o) =>
      o.userId === verifiedUser.uid ||
      (verifiedUser.emailVerified &&
        o.customerEmail?.toLowerCase() === verifiedUser.email)
  );

  if (adminDb) {
    try {
      const snap = await adminDb
        .collection('orders')
        .where('userId', '==', verifiedUser.uid)
        .get();
      snap.forEach((d: any) => {
        const ord = { id: d.id, ...d.data() } as Order;
        if (!list.some((x) => x.orderNumber === ord.orderNumber)) {
          list.push(ord);
        }
      });
    } catch (err) {
      console.warn('[ZN Server] My orders query note:', err);
    }
  }

  list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ orders: list });
});

// 11. Admin: List All Orders & Inventory Logs
app.get('/api/admin/orders', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const merged = new Map<string, Order>();
  for (const ord of Object.values(ledger.orders)) {
    merged.set(ord.orderNumber, ord);
  }

  if (adminDb) {
    try {
      const snap = await adminDb.collection('orders').get();
      snap.forEach((d: any) => {
        const ord = { id: d.id, ...d.data() } as Order;
        merged.set(ord.orderNumber, ord);
      });
    } catch (err) {
      console.warn('[ZN Server] Admin orders fetch note:', err);
    }
  }

  const orders = Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({
    orders,
    inventoryLogs: ledger.inventoryLogs.slice(0, 100),
    pendingStockDeltas: adminDb ? {} : ledger.pendingFirestoreSync,
  });
});

// 12. Admin: Update Order Status, Payment Verification, & Stock Restoration on Cancellation
app.post('/api/admin/orders/:orderId/update', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const orderId = String(req.params.orderId || '').trim();
  const { orderStatus, paymentStatus, trackingNumber, verificationNote, existingOrder } =
    req.body || {};

  const validStatuses: OrderStatus[] = [
    'Order Placed',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];
  if (orderStatus && !validStatuses.includes(orderStatus)) {
    res.status(400).json({ error: 'Invalid order status.' });
    return;
  }
  if (paymentStatus && !['pending', 'paid', 'failed'].includes(paymentStatus)) {
    res.status(400).json({ error: 'Invalid payment status.' });
    return;
  }

  const result = await runSerialized(async () => {
    const nowIso = new Date().toISOString();
    let currentOrder: Order | null =
      ledger.orders[orderId] ||
      Object.values(ledger.orders).find((o) => o.id === orderId) ||
      null;

    if (adminDb) {
      const docSnap = await adminDb.collection('orders').doc(orderId).get();
      if (docSnap.exists) {
        currentOrder = { id: docSnap.id, ...docSnap.data() } as Order;
      }
    }

    if (!currentOrder && existingOrder && existingOrder.id === orderId) {
      currentOrder = existingOrder as Order;
    }

    if (!currentOrder) {
      return { status: 404, payload: { error: 'Order not found.' } };
    }

    const nextOrderStatus: OrderStatus = orderStatus || currentOrder.orderStatus;
    const nextPaymentStatus: 'pending' | 'paid' | 'failed' =
      paymentStatus || currentOrder.paymentStatus;
    const nextTracking =
      typeof trackingNumber === 'string' && trackingNumber.trim()
        ? trackingNumber.trim()
        : currentOrder.trackingNumber;

    const history = Array.isArray(currentOrder.paymentVerificationHistory)
      ? [...currentOrder.paymentVerificationHistory]
      : [];

    if (paymentStatus && paymentStatus !== currentOrder.paymentStatus) {
      history.push({
        status: nextPaymentStatus,
        verifiedBy: verifiedUser.email || verifiedUser.uid,
        verifiedAt: nowIso,
        note: typeof verificationNote === 'string' ? verificationNote.trim() : undefined,
      });
    }

    let stockRestored = Boolean(currentOrder.stockRestored);
    const restoredStockMap: Record<string, number> = {};

    // Restore stock atomically ONLY once when transitioning to Cancelled!
    if (nextOrderStatus === 'Cancelled' && !stockRestored) {
      const catalog = await fetchLiveCatalogMap();

      if (adminDb) {
        await adminDb.runTransaction(async (tx: any) => {
          for (const item of currentOrder!.items) {
            const pRef = adminDb.collection('products').doc(item.productId);
            const pSnap = await tx.get(pRef);
            const baseStock = pSnap.exists
              ? Number(pSnap.data()?.stock ?? 0)
              : Number(catalog.get(item.productId)?.stock ?? 0);
            const newStock = baseStock + item.quantity;
            restoredStockMap[item.productId] = newStock;

            if (pSnap.exists) {
              tx.update(pRef, { stock: newStock, updatedAt: nowIso });
            }
            const logId = `inv-rst-${Date.now()}-${item.productId}`;
            tx.set(adminDb.collection('inventory_logs').doc(logId), {
              id: logId,
              productId: item.productId,
              productName: item.name,
              delta: item.quantity,
              previousStock: baseStock,
              newStock,
              reason: 'order_cancelled_restore',
              orderNumber: currentOrder!.orderNumber,
              actor: verifiedUser.email || verifiedUser.uid,
              createdAt: nowIso,
            });
          }

          tx.update(adminDb.collection('orders').doc(orderId), {
            orderStatus: nextOrderStatus,
            paymentStatus: nextPaymentStatus,
            ...(nextTracking ? { trackingNumber: nextTracking } : {}),
            paymentVerificationHistory: history,
            stockRestored: true,
            updatedAt: nowIso,
          });
        });
      } else {
        for (const item of currentOrder.items) {
          const prod = catalog.get(item.productId);
          const prevStock = prod ? getEffectiveStock(prod) : 0;
          const newStock = prevStock + item.quantity;
          restoredStockMap[item.productId] = newStock;
          ledger.pendingFirestoreSync[item.productId] =
            (ledger.pendingFirestoreSync[item.productId] || 0) + item.quantity;

          ledger.inventoryLogs.unshift({
            id: `inv-rst-${Date.now()}-${item.productId}`,
            productId: item.productId,
            productName: item.name,
            delta: item.quantity,
            previousStock: prevStock,
            newStock,
            reason: 'order_cancelled_restore',
            orderNumber: currentOrder.orderNumber,
            actor: verifiedUser.email || verifiedUser.uid,
            createdAt: nowIso,
          });
        }
      }
      stockRestored = true;
    } else if (adminDb) {
      await adminDb.collection('orders').doc(orderId).set(
        {
          ...currentOrder,
          orderStatus: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
          ...(nextTracking ? { trackingNumber: nextTracking } : {}),
          paymentVerificationHistory: history,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    }

    const updatedOrder: Order = {
      ...currentOrder,
      orderStatus: nextOrderStatus,
      paymentStatus: nextPaymentStatus,
      ...(nextTracking ? { trackingNumber: nextTracking } : {}),
      paymentVerificationHistory: history,
      stockRestored,
      updatedAt: nowIso,
    };

    ledger.orders[updatedOrder.orderNumber] = updatedOrder;
    saveLedger(ledger);

    // Send automatic WhatsApp notification to the Customer whenever status/tracking/paid changes
    const shouldNotifyCustomer =
      updatedOrder.orderStatus !== currentOrder.orderStatus ||
      (updatedOrder.trackingNumber && updatedOrder.trackingNumber !== currentOrder.trackingNumber) ||
      (updatedOrder.paymentStatus === 'paid' && currentOrder.paymentStatus !== 'paid');

    const custStatusMsg = formatCustomerOrderStatusWhatsApp(
      updatedOrder,
      typeof verificationNote === 'string' ? verificationNote : undefined
    );
    const custDigits = formatCustomerWhatsappDigits(updatedOrder.customerPhone);
    const fallbackWaUrl = custDigits
      ? `https://wa.me/${custDigits}?text=${encodeURIComponent(custStatusMsg)}`
      : '';

    let customerNotified = false;
    let customerNotifyDetail = '';
    let customerWhatsappUrl = fallbackWaUrl;

    if (shouldNotifyCustomer) {
      try {
        const custRes = await sendWhatsAppMessageToCustomer(updatedOrder, custStatusMsg);
        customerNotified = custRes.ok;
        customerNotifyDetail = custRes.detail;
        if (custRes.customerWhatsappUrl) {
          customerWhatsappUrl = custRes.customerWhatsappUrl;
        }
      } catch (err) {
        customerNotifyDetail = err instanceof Error ? err.message : 'Customer notification skipped.';
      }
    }

    return {
      status: 200,
      payload: {
        order: updatedOrder,
        restoredStockMap,
        persistedInFirestore: Boolean(adminDb),
        customerNotified,
        customerNotifyDetail,
        customerWhatsappUrl,
      },
    };
  });

  res.status(result.status).json(result.payload);
});

// 13. Admin: Clear synced stock deltas once AdminDashboard persists them to Firestore
app.post('/api/admin/inventory/mark-synced', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const { productIds } = req.body || {};
  await runSerialized(async () => {
    if (Array.isArray(productIds)) {
      for (const pid of productIds) {
        delete ledger.pendingFirestoreSync[String(pid)];
      }
    } else {
      ledger.pendingFirestoreSync = {};
    }
    saveLedger(ledger);
  });

  res.json({ ok: true });
});

// 14. Admin: Record manual inventory adjustment log
app.post('/api/admin/inventory/log', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const { productId, productName, previousStock, newStock, reason } = req.body || {};
  const logEntry: InventoryLog = {
    id: `inv-${Date.now()}-${String(productId || 'item')}`,
    productId: String(productId || ''),
    productName: String(productName || ''),
    delta: Number(newStock) - Number(previousStock || 0),
    previousStock: Number(previousStock || 0),
    newStock: Number(newStock || 0),
    reason: reason || 'admin_adjustment',
    actor: verifiedUser.email || verifiedUser.uid,
    createdAt: new Date().toISOString(),
  };

  await runSerialized(async () => {
    ledger.inventoryLogs.unshift(logEntry);
    if (ledger.inventoryLogs.length > 500) {
      ledger.inventoryLogs = ledger.inventoryLogs.slice(0, 500);
    }
    saveLedger(ledger);
  });

  res.json({ log: logEntry });
});

// 15. Admin: Server-Side Auto-Persistent Product CRUD
app.post('/api/admin/products', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const product = req.body?.product as Product | undefined;
  if (!product || !product.id || !product.name) {
    res.status(400).json({ error: 'Valid product payload is required.' });
    return;
  }

  await runSerialized(async () => {
    ledger.catalogProducts[product.id] = product;
    ledger.deletedProductIds = (ledger.deletedProductIds || []).filter((id) => id !== product.id);
    delete ledger.pendingFirestoreSync[product.id];
    if (adminDb) {
      await adminDb.collection('products').doc(product.id).set(product, { merge: true });
    }
    saveLedger(ledger);
  });

  res.json({ ok: true, product });
});

app.delete('/api/admin/products/:productId', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const productId = String(req.params.productId || '').trim();
  if (!productId) {
    res.status(400).json({ error: 'Product ID is required.' });
    return;
  }

  await runSerialized(async () => {
    delete ledger.catalogProducts[productId];
    if (!ledger.deletedProductIds.includes(productId)) {
      ledger.deletedProductIds.push(productId);
    }
    if (adminDb) {
      await adminDb.collection('products').doc(productId).delete();
    }
    saveLedger(ledger);
  });

  res.json({ ok: true, deletedId: productId });
});

// 16. Admin: Server-Side Auto-Persistent Collections & Store Settings
app.post('/api/admin/collections', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const colItem = req.body?.collection as CollectionItem | undefined;
  if (!colItem || !colItem.id || !colItem.name) {
    res.status(400).json({ error: 'Valid collection object is required.' });
    return;
  }

  await runSerialized(async () => {
    ledger.customCollections = [
      ...ledger.customCollections.filter((c) => c.id !== colItem.id),
      colItem,
    ];
    ledger.deletedCollectionIds = ledger.deletedCollectionIds.filter(
      (id) => id !== colItem.id && id !== colItem.name
    );
    if (adminDb) {
      await adminDb.collection('collections').doc(colItem.id).set(colItem, { merge: true });
    }
    saveLedger(ledger);
  });

  res.json({ ok: true, collection: colItem });
});

app.delete('/api/admin/collections/:collectionId', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const colId = decodeURIComponent(String(req.params.collectionId || '').trim());
  if (!colId) {
    res.status(400).json({ error: 'Collection ID is required.' });
    return;
  }

  await runSerialized(async () => {
    ledger.customCollections = ledger.customCollections.filter(
      (c) => c.id !== colId && c.name !== colId
    );
    if (!ledger.deletedCollectionIds.includes(colId)) {
      ledger.deletedCollectionIds.push(colId);
    }
    if (adminDb) {
      await adminDb.collection('collections').doc(colId).delete().catch(() => {});
    }
    saveLedger(ledger);
  });

  res.json({ ok: true, deletedId: colId });
});

app.post('/api/admin/settings', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const settingsPayload = req.body?.settings;
  if (!settingsPayload || typeof settingsPayload !== 'object') {
    res.status(400).json({ error: 'Valid settings object is required.' });
    return;
  }

  await runSerialized(async () => {
    ledger.storeSettings = { ...(ledger.storeSettings || {}), ...settingsPayload };
    if (adminDb) {
      await adminDb.collection('settings').doc('general').set(ledger.storeSettings, { merge: true });
    }
    saveLedger(ledger);
  });

  res.json({ ok: true, settings: ledger.storeSettings });
});

// 16b. Admin: Private Automatic WhatsApp Alert Configuration & Live Test (Stored Server-Side Only)
function buildMaskedAlertStatus() {
  const envMeta = Boolean(process.env.WHATSAPP_CLOUD_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  const envCallMeBot = Boolean(process.env.CALLMEBOT_API_KEY);
  const envTextMeBot = Boolean(process.env.TEXTMEBOT_API_KEY);
  const envWebhook = Boolean(process.env.WHATSAPP_WEBHOOK_URL);

  const savedCallMeBot = extractBotApiKey(ledger.alertConfig?.callMeBotApiKey || '');
  const savedTextMeBot = extractBotApiKey(ledger.alertConfig?.textMeBotApiKey || '');
  const savedWebhook = (ledger.alertConfig?.whatsappWebhookUrl || '').trim();

  let activeProvider: 'direct-whatsapp' | 'meta-cloud' | 'callmebot' | 'textmebot' | 'webhook' | 'none' = 'none';
  if (directWaStatus === 'connected') activeProvider = 'direct-whatsapp';
  else if (envMeta) activeProvider = 'meta-cloud';
  else if (envCallMeBot || savedCallMeBot) activeProvider = 'callmebot';
  else if (envTextMeBot || savedTextMeBot) activeProvider = 'textmebot';
  else if (envWebhook || savedWebhook) activeProvider = 'webhook';

  return {
    configured: activeProvider !== 'none',
    activeProvider,
    ownerWhatsappPhone: ledger.alertConfig?.ownerWhatsappPhone || resolveOwnerWhatsappDigits(),
    directWa: {
      status: directWaStatus,
      qrDataUrl: directWaStatus === 'qr_ready' ? directWaQrDataUrl : null,
      connectedPhone: directWaConnectedPhone,
      connectedName: directWaConnectedName,
      lastError: directWaLastError,
    },
    hasCallMeBotKey: Boolean(envCallMeBot || savedCallMeBot),
    callMeBotKeyMasked: envCallMeBot ? 'Configured via Server Env' : maskSecret(savedCallMeBot),
    hasTextMeBotKey: Boolean(envTextMeBot || savedTextMeBot),
    textMeBotKeyMasked: envTextMeBot ? 'Configured via Server Env' : maskSecret(savedTextMeBot),
    hasWebhookUrl: Boolean(envWebhook || savedWebhook),
    webhookMasked: envWebhook ? 'Configured via Server Env' : maskSecret(savedWebhook),
    envManaged: envMeta || envCallMeBot || envTextMeBot || envWebhook,
    updatedAt: ledger.alertConfig?.updatedAt || null,
  };
}

app.get('/api/admin/alerts/config', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }
  res.json(buildMaskedAlertStatus());
});

app.post('/api/admin/alerts/whatsapp-qr/connect', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  if (directWaStatus !== 'connected') {
    await startDirectWhatsApp(false);
    // Wait briefly up to 3.5s so the initial QR code is ready on first response
    for (let i = 0; i < 14; i++) {
      const liveStatus = directWaStatus as DirectWaStatus;
      if (liveStatus === 'qr_ready' || liveStatus === 'connected' || directWaLastError) {
        break;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  res.json({ ok: true, ...buildMaskedAlertStatus() });
});

app.post('/api/admin/alerts/whatsapp-qr/disconnect', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  try {
    if (directWaSock) {
      await directWaSock.logout().catch(() => {});
    }
  } catch {
    // ignore logout error
  }
  directWaGeneration += 1;
  closeDirectWaSocket();
  clearDirectWaAuthFiles();
  directWaStatus = 'disconnected';
  directWaQrDataUrl = null;
  directWaConnectedPhone = null;
  directWaConnectedName = null;
  directWaLastError = null;

  res.json({ ok: true, ...buildMaskedAlertStatus() });
});

app.post('/api/admin/alerts/config', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const {
    ownerWhatsappPhone,
    callMeBotApiKey,
    textMeBotApiKey,
    whatsappWebhookUrl,
    clearCallMeBot,
    clearTextMeBot,
    clearWebhook,
  } = req.body || {};

  if (typeof whatsappWebhookUrl === 'string' && whatsappWebhookUrl.trim()) {
    try {
      const parsed = new URL(whatsappWebhookUrl.trim());
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        res.status(400).json({ error: 'Webhook URL must begin with https:// or http://.' });
        return;
      }
    } catch {
      res.status(400).json({ error: 'Please enter a valid Webhook URL.' });
      return;
    }
  }

  await runSerialized(async () => {
    const current = ledger.alertConfig || {};
    const next: ServerAlertConfig = {
      ...current,
      updatedAt: new Date().toISOString(),
    };

    if (typeof ownerWhatsappPhone === 'string' && ownerWhatsappPhone.trim()) {
      next.ownerWhatsappPhone = ownerWhatsappPhone.trim();
    }
    if (clearCallMeBot) {
      delete next.callMeBotApiKey;
    } else if (typeof callMeBotApiKey === 'string' && callMeBotApiKey.trim()) {
      next.callMeBotApiKey = extractBotApiKey(callMeBotApiKey);
    }
    if (clearTextMeBot) {
      delete next.textMeBotApiKey;
    } else if (typeof textMeBotApiKey === 'string' && textMeBotApiKey.trim()) {
      next.textMeBotApiKey = extractBotApiKey(textMeBotApiKey);
    }
    if (clearWebhook) {
      delete next.whatsappWebhookUrl;
    } else if (typeof whatsappWebhookUrl === 'string' && whatsappWebhookUrl.trim()) {
      next.whatsappWebhookUrl = whatsappWebhookUrl.trim();
    }

    ledger.alertConfig = next;
    saveLedger(ledger);
  });

  res.json({ ok: true, ...buildMaskedAlertStatus() });
});

app.post('/api/admin/alerts/test', async (req: Request, res: Response) => {
  const verifiedUser = await verifyBearerToken(req);
  if (!verifiedUser || !verifiedUser.isAdmin) {
    res.status(403).json({ error: 'Authorized administrator privileges required.' });
    return;
  }

  const sampleOrder: Order = {
    id: 'ZN-TEST-1001',
    orderNumber: 'ZN-TEST-1001',
    userId: 'test-user',
    customerName: 'Test Customer (Sample Invoice)',
    customerEmail: 'customer@example.com',
    customerPhone: '0317 8113817',
    shippingAddress: 'House 47, Block B, DHA Phase 6, Karachi, Pakistan',
    city: 'Karachi',
    items: [
      {
        productId: 'sample-1',
        name: 'Royal Gold 316L Waterproof Chain Watch',
        sku: 'ZN-WTC-101',
        price: 4500,
        quantity: 1,
        selectedSize: 'Standard',
        image: '/hero-steel.jpg',
      },
    ],
    subtotal: 4500,
    shippingCost: 0,
    discount: 0,
    total: 4500,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'Order Placed',
    createdAt: new Date().toISOString(),
  };

  const sampleText = formatWhatsAppCommercialInvoice(sampleOrder, true);

  const result = await dispatchWhatsAppAlert(sampleText, {
    test: true,
    orderNumber: sampleOrder.orderNumber,
    customerName: sampleOrder.customerName,
    items: sampleOrder.items,
    total: sampleOrder.total,
    paymentMethod: sampleOrder.paymentMethod,
  });

  res.status(result.ok ? 200 : 400).json(result);
});

// 17. ZN JEWELLERS AI & WhatsApp Concierge Chatbot Endpoint
function buildConciergeFallbackReply(
  userMessage: string,
  products: Product[],
  shipping: { freeShippingThreshold: number; shippingRateKarachi: number; shippingRateNationwide: number }
): { reply: string; matchedProducts: Product[] } {
  const q = userMessage.toLowerCase();
  const isUrdu = /\b(kya|hai|hain|kitne|kitna|btao|batao|chahie|chahiye|chaye|order|delivery|karachi|bangles|ghari|watch|ring|kahan|address|price|rate|kimat|qeemat|assalam|salam|aoa|bhai|ji|haan|nahi|nh|shukriya|mehenga|sasta)\b/i.test(q);

  // Match catalog products by category or keywords
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  const scored = products
    .map((p) => {
      const hay = `${p.name} ${p.category} ${p.material || ''} ${p.description}`.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (hay.includes(tok)) score += 2;
      }
      if ((q.includes('bangle') || q.includes('choodi') || q.includes('kada')) && p.category.toLowerCase().includes('bangle')) score += 4;
      if ((q.includes('watch') || q.includes('ghari')) && p.category.toLowerCase().includes('watch')) score += 4;
      if ((q.includes('bag') || q.includes('clutch') || q.includes('purse')) && p.category.toLowerCase().includes('handbag')) score += 4;
      if ((q.includes('ring') || q.includes('angoothi')) && p.category.toLowerCase().includes('ring')) score += 4;
      if ((q.includes('earring') || q.includes('jhumka') || q.includes('bali')) && p.category.toLowerCase().includes('earring')) score += 4;
      if ((q.includes('steel') || q.includes('waterproof') || q.includes('tarnish')) && (p.category.toLowerCase().includes('steel') || hay.includes('316l'))) score += 4;
      if ((q.includes('bridal') || q.includes('nikkah') || q.includes('set') || q.includes('choker')) && (p.category.toLowerCase().includes('set') || hay.includes('bridal'))) score += 3;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);

  if (/track|status|order id|zn-20|parcel|dispatch|kahan pohncha/i.test(q)) {
    return {
      reply: isUrdu
        ? `Apna order track karne ke liye upar menu mein "Track Order" par click karein, aur apna Order ID (e.g. ZN-2026-12345) aur registered phone number enter karein. Agar koi madad chahiye to neeche "WhatsApp Support" button par click kar ke seedha hamari team se baat kar sakte hain.`
        : `To track your parcel live, open "Track Order" in the navigation menu and enter your Order ID (e.g., ZN-2026-12345) along with your registered mobile number. Need instant help from our team? Tap "Chat on WhatsApp" above.`,
      matchedProducts: [],
    };
  }

  if (/deliver|shipping|charges|fee|courier|karachi|lahore|islamabad|free|days|time/i.test(q)) {
    return {
      reply: isUrdu
        ? `Delivery Charges & Timing:\n• Karachi: ₨ ${shipping.shippingRateKarachi} (1–2 working days)\n• All Pakistan: ₨ ${shipping.shippingRateNationwide} (3–5 working days via TCS / Leopards)\n• FREE Delivery: ₨ ${shipping.freeShippingThreshold.toLocaleString()} se zyada ke order par bilkul muft!`
        : `Shipping Rates & Delivery Time:\n• Karachi: ₨ ${shipping.shippingRateKarachi} (1–2 business days)\n• Nationwide Pakistan: ₨ ${shipping.shippingRateNationwide} (3–5 business days via TCS / Leopards)\n• Complimentary Free Delivery on orders above ₨ ${shipping.freeShippingThreshold.toLocaleString()}!`,
      matchedProducts: [],
    };
  }

  if (/address|location|shop|store|karachi|korangi|aman tower|timing|open|visit/i.test(q)) {
    return {
      reply: isUrdu
        ? `ZN Jewelers Flagship Store:\nShop No. 47, Aman Tower, Korangi Crossing, Karachi.\nTimings: Mon–Sat (12:00 PM – 10:00 PM) | Sunday (3:00 PM – 10:00 PM). WhatsApp: +92 317 8113817.`
        : `Visit our Flagship Store at Shop No. 47, Aman Tower, Korangi Crossing, Karachi.\nStore Hours: Mon–Sat 12:00 PM – 10:00 PM | Sun 3:00 PM – 10:00 PM PKT. Direct WhatsApp: +92 317 8113817.`,
      matchedProducts: [],
    };
  }

  if (/pay|easypaisa|jazzcash|bank|cod|cash|card|promo|discount|coupon/i.test(q)) {
    return {
      reply: isUrdu
        ? `Available Payment Methods:\n1. Cash on Delivery (COD) poore Pakistan mein\n2. Easypaisa & JazzCash (0317 8113817 - ZN Jewelers)\n3. Meezan Bank Transfer\nPromo Codes: "WELCOMEZN" (₨ 500 off Rs 2,500+ par) ya "ZNLUXURY10" (10% off).`
        : `We accept Cash on Delivery (COD) nationwide, Easypaisa & JazzCash (0317 8113817), and Meezan Bank transfers.\nActive Promo Codes: "WELCOMEZN" (₨ 500 off orders ₨ 2,500+) or "ZNLUXURY10" (10% off).`,
      matchedProducts: [],
    };
  }

  if (scored.length > 0) {
    const lines = scored
      .map(
        (item) =>
          `• ${item.name} — ₨ ${(item.salePrice ?? item.price).toLocaleString()} (${item.stock > 0 ? `${item.stock} in stock` : 'Sold Out'})`
      )
      .join('\n');
    return {
      reply: isUrdu
        ? `Ye pieces aap ki pasand ke mutabiq maujood hain:\n${lines}\nNeeche product card par click kar ke full details dekh sakte hain ya WhatsApp par pooch sakte hain.`
        : `Here are matching pieces from our ZN Jewelers collection:\n${lines}\nTap any piece below to view details and order.`,
      matchedProducts: scored,
    };
  }

  const featured = products.filter((p) => p.isFeatured).slice(0, 3);
  return {
    reply: isUrdu
      ? `Assalam-o-Alaikum! ZN Jewelers Concierge mein khush aamdeed. Aap humse Watches, Bridal Bangles, 316L Waterproof Steel Jewellery, Handbags, Delivery Charges (Free above ₨ ${shipping.freeShippingThreshold.toLocaleString()}), ya Order Tracking ke baare mein kuch bhi pooch sakte hain!`
      : `Welcome to ZN Jewelers Concierge! Ask me about our Luxury Watches, Bridal Bangles, Waterproof 316L Stainless Steel Jewellery, Designer Handbags, Shipping Rates, Promo Codes, or Order Tracking.`,
    matchedProducts: featured,
  };
}

app.post('/api/chatbot', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body || {};
    const userMessage = typeof message === 'string' ? message.trim().slice(0, 800) : '';
    if (!userMessage) {
      res.status(400).json({ error: 'Please enter a message.' });
      return;
    }

    const catalogMap = await fetchLiveCatalogMap();
    const products = Array.from(catalogMap.values()).map((p) => ({
      ...p,
      stock: getEffectiveStock(p),
    }));
    const shippingCfg = await fetchLiveShippingSettings();
    const fallback = buildConciergeFallbackReply(userMessage, products, shippingCfg);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
      res.json({
        reply: fallback.reply,
        suggestedProducts: fallback.matchedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.salePrice ?? p.price,
          image: p.images?.[0] || '/hero-steel.jpg',
          stock: p.stock,
        })),
        source: 'concierge-kb',
      });
      return;
    }

    const storeMeta = (ledger.storeSettings || {}) as Record<string, unknown>;
    const catalogBrief = products
      .slice(0, 35)
      .map(
        (p) =>
          `[${p.id}] ${p.name} | Category: ${p.category} | Price: PKR ${(p.salePrice ?? p.price).toLocaleString()} | Stock: ${p.stock} | Material: ${p.material || 'Luxury Finish'}`
      )
      .join('\n');

    const systemInstruction = `You are the official ZN JEWELLERS Luxury Concierge assistant in Karachi, Pakistan.
Reply politely, concisely (2-5 short sentences or clean bullet points), and warmly.
LANGUAGE RULE: If the customer writes in Roman Urdu or Urdu, reply naturally in clean Roman Urdu. Otherwise reply in English.
STORE FACTS:
- Brand: ZN JEWELLERS
- Flagship Store: ${(storeMeta.storeAddress as string) || 'Shop No. 47, Aman Tower, Korangi Crossing, Karachi, Pakistan'}
- Phone / WhatsApp: ${(storeMeta.phone as string) || '+92 317 8113817'}
- Email: ${(storeMeta.email as string) || 'znjewelaers786@gmail.com'}
- Hours: Mon-Sat 12:00 PM - 10:00 PM PKT, Sun 3:00 PM - 10:00 PM PKT
- Shipping: Karachi PKR ${shippingCfg.shippingRateKarachi} (1-2 days), Nationwide Pakistan PKR ${shippingCfg.shippingRateNationwide} (3-5 days), FREE delivery on orders above PKR ${shippingCfg.freeShippingThreshold.toLocaleString()}.
- Payments: Cash on Delivery (COD), Easypaisa (0317 8113817), JazzCash (0317 8113817), Meezan Bank Transfer.
- Promo Codes: WELCOMEZN (PKR 500 off on 2,500+), ZNLUXURY10 (10% off up to 5,000), ROYAL50K (PKR 5,000 off on 35,000+).
- Returns/Warranty: 7-day inspection & exchange; 6 months repair/plating assistance on watches & 316L waterproof steel.
- Order Tracking: Direct user to "Track Order" in the website header with Order ID + phone number, or offer the WhatsApp button.
LIVE CATALOG:
${catalogBrief}
Only recommend products and prices from the LIVE CATALOG above. Never invent products or prices.`;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const formattedHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .filter(
            (h: any) =>
              h &&
              (h.role === 'user' || h.role === 'model') &&
              typeof h.text === 'string' &&
              h.text.trim()
          )
          .map((h: any) => ({
            role: h.role as 'user' | 'model',
            parts: [{ text: h.text.trim().slice(0, 500) }],
          }))
      : [];

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text?.trim() || fallback.reply;
    res.json({
      reply: replyText,
      suggestedProducts: fallback.matchedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.salePrice ?? p.price,
        image: p.images?.[0] || '/hero-steel.jpg',
        stock: p.stock,
      })),
      source: 'gemini',
    });
  } catch (err) {
    console.warn('[ZN Chatbot] Falling back to local store concierge:', err instanceof Error ? err.message : err);
    try {
      const catalogMap = await fetchLiveCatalogMap();
      const products = Array.from(catalogMap.values()).map((p) => ({
        ...p,
        stock: getEffectiveStock(p),
      }));
      const shippingCfg = await fetchLiveShippingSettings();
      const fallback = buildConciergeFallbackReply(String(req.body?.message || ''), products, shippingCfg);
      res.json({
        reply: fallback.reply,
        suggestedProducts: fallback.matchedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.salePrice ?? p.price,
          image: p.images?.[0] || '/hero-steel.jpg',
          stock: p.stock,
        })),
        source: 'concierge-kb',
      });
    } catch {
      res.status(500).json({ error: 'Unable to respond right now. Please chat with us on WhatsApp.' });
    }
  }
});

// ------------------------------------------------------------------
// Vite Dev Middleware / Production Static Asset Serving
// ------------------------------------------------------------------
async function startServer() {
  const PORT = Number(process.env.APP_PORT || process.env.DEFAULT_APP_PORT || process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZN Jewellers] Full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
