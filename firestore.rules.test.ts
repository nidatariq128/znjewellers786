import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve('firestore.rules');
const blueprintPath = path.resolve('firebase-blueprint.json');
const rules = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

console.log('Running ZN JEWELLERS Firestore Zero-Trust Security Audit & Dirty Dozen Verification...\n');

// 1. Structural & Blueprint Synchronicity Checks
assert.ok(rules.includes("rules_version = '2';"), 'Rules must specify rules_version = 2');
assert.ok(
  rules.includes('match /{document=**}') && /match \/\{document=\*\*\}\s*\{[\s\S]*?allow read, write:\s*if false;/.test(rules),
  'Default-deny catch-all rule must be present'
);

// Check all blueprint collections exist in firestore.rules
for (const colPath of Object.keys(blueprint.firestore)) {
  const colName = colPath.split('/')[1];
  assert.ok(
    rules.includes(`match /${colName}/`),
    `Collection /${colName} declared in firebase-blueprint.json must be explicitly covered in firestore.rules`
  );
}

// 2. Ensure vulnerable patterns are REMOVED
assert.ok(!/match \/products\/\{productId\}[\s\S]*?allow read, write:\s*if true/.test(rules), 'Products must NOT allow public writes');
assert.ok(!/match \/orders\/\{orderId\}[\s\S]*?allow read, create, update:\s*if true/.test(rules), 'Orders must NOT allow public read/update');
assert.ok(!/match \/test\/\{docId\}[\s\S]*?allow read, write:\s*if true/.test(rules), 'Test collection must NOT allow public read/write');
assert.ok(!rules.includes(".includes('admin')"), 'Must NEVER check admin privileges via email.includes("admin")');

// 3. Dirty Dozen Attack Vector Assertions
function extractBlock(sectionMarker: string): string {
  const idx = rules.indexOf(sectionMarker);
  assert.ok(idx !== -1, `Missing rules block: ${sectionMarker}`);
  const rest = rules.slice(idx);
  const endIdx = rest.indexOf('\n    match /', 10);
  return endIdx === -1 ? rest : rest.slice(0, endIdx);
}

const usersBlock = extractBlock('match /users/{userId}');
const adminsBlock = extractBlock('match /admins/{userId}');
const productsBlock = extractBlock('match /products/{productId}');
const ordersBlock = extractBlock('match /orders/{orderId}');
const wishlistsBlock = extractBlock('match /wishlists/{userId}');
const reviewsBlock = extractBlock('match /reviews/{reviewId}');
const testBlock = extractBlock('match /test/{docId}');

// Payload 1: Privilege escalation in /users/{userId}
assert.ok(
  usersBlock.includes("incoming().role == 'customer'") &&
    usersBlock.includes('incoming().role == existing().role'),
  'Payload 1 failed: Users cannot self-assign role=admin or mutate role on update'
);

// Payload 2 & 3: Unauthenticated product deletion & price tampering
assert.ok(
  productsBlock.includes('allow read: if true;') &&
    productsBlock.includes('allow create, update: if isAdmin()') &&
    productsBlock.includes('allow delete: if isAdmin()'),
  'Payloads 2 & 3 failed: Only verified admins can create/update/delete products'
);

// Payload 4 & 6 & 9 & 12: Order tampering, foreign order reading, UID spoofing, payment bypass
assert.ok(
  ordersBlock.includes('allow get: if isAdmin() || (isSignedIn() && existing().userId == request.auth.uid)') &&
    ordersBlock.includes('allow list: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid)') &&
    ordersBlock.includes("incoming().orderStatus == 'Order Placed'") &&
    ordersBlock.includes("incoming().paymentStatus == 'pending'") &&
    ordersBlock.includes('incoming().userId == request.auth.uid') &&
    ordersBlock.includes('allow update: if isAdmin()') &&
    ordersBlock.includes('allow delete: if isAdmin()'),
  'Payloads 4, 6, 9, 12 failed: Orders must restrict read/update and lock initial create states'
);

// Payload 5: Foreign wishlist peeking
assert.ok(
  wishlistsBlock.includes('allow get, list: if isSignedIn() && request.auth.uid == userId'),
  'Payload 5 failed: Wishlists must strictly restrict read access to owner'
);

// Payload 7: Shadow field & Denial of Wallet protection (hasOnly + size caps)
assert.ok(
  ordersBlock.includes('isValidOrderShape(incoming())') &&
    rules.includes('data.keys().hasOnly(') &&
    rules.includes('data.customerName.size() <= 128'),
  'Payload 7 failed: Orders must enforce strict keys().hasOnly() whitelist and string size caps'
);

// Payload 8: Negative price / total injection
assert.ok(
  rules.includes('data.price is number && data.price >= 0') &&
    rules.includes('data.total is number && data.total >= 0'),
  'Payload 8 failed: Negative prices and totals must be rejected'
);

// Payload 10: Admin document self-creation
assert.ok(
  adminsBlock.includes('allow create, update, delete: if isAdmin()'),
  'Payload 10 failed: Admin docs cannot be self-created by regular users'
);

// Payload 11: Unauthenticated review & rating out of bounds
assert.ok(
  reviewsBlock.includes('allow create: if isVerifiedUser()') &&
    reviewsBlock.includes('incoming().userId == request.auth.uid') &&
    rules.includes('data.rating >= 1 && data.rating <= 5'),
  'Payload 11 failed: Reviews must require verified auth, matching userId, and rating in [1..5]'
);

// Payload 12b: Public test path locked & email_verified required on admin check
assert.ok(
  testBlock.includes('allow read, write: if false;') &&
    rules.includes('request.auth.token.email_verified == true') &&
    rules.includes('nidatariq6nov@gmail.com') &&
    rules.includes('znjewelaers786@gmail.com'),
  'Payload 12b failed: /test must be disabled and admin check must verify email_verified == true'
);

console.log('✓ Blueprint synchronicity passed for', Object.keys(blueprint.firestore).length, 'collections');
console.log('✓ All 12 Dirty Dozen Zero-Trust security assertions passed.');
