import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Truck, 
  Settings as SettingsIcon, 
  Database,
  ArrowRight,
  Save,
  Search,
  Upload,
  Camera,
  Image as ImageIcon,
  MessageCircle,
  Copy,
  Check,
  FileText,
  Printer,
  ExternalLink
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product, Order, OrderStatus, ProductCategory } from '../../types';
import { formatPKR, formatDate, generateSKU } from '../../lib/formatters';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCollection, deleteCollection, seedInitialData } = useProducts();
  const { isAdmin, user, toggleDemoAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'collections' | 'orders' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [seedSuccessCount, setSeedSuccessCount] = useState<number | null>(null);

  const { settings, updateSettings } = useStoreSettings();
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Custom Collection Form State
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColTagline, setNewColTagline] = useState('');
  const [newColDescription, setNewColDescription] = useState('');
  const [newColImage, setNewColImage] = useState('/hero-steel.jpg');
  const [colSaving, setColSaving] = useState(false);
  const [colSuccessMessage, setColSuccessMessage] = useState<string | null>(null);

  // In-App Deletion Modal State (avoids blocked window.confirm in iframes)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'product' | 'collection';
    id: string;
    name: string;
  } | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // New / Edit Product Form State
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Watches');
  const [prodPrice, setProdPrice] = useState<number>(7500);
  const [prodSalePrice, setProdSalePrice] = useState<number | undefined>(undefined);
  const [prodGoldPurity, setProdGoldPurity] = useState<string>('Stainless Steel & Mineral Glass');
  const [prodWeight, setProdWeight] = useState<number>(0);
  const [prodDiamondDetails, setProdDiamondDetails] = useState('');
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodDescription, setProdDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<string[]>([
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'
  ]);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [prodIsFeatured, setProdIsFeatured] = useState<boolean>(true);
  const [prodIsNewArrival, setProdIsNewArrival] = useState<boolean>(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [productSavedSuccess, setProductSavedSuccess] = useState<string | null>(null);

  // Order update modal/state
  const [selectedOrderToEdit, setSelectedOrderToEdit] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('Confirmed');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('paid');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));

      // Also read local orders
      try {
        const local = JSON.parse(localStorage.getItem('zn_orders') || '[]');
        if (Array.isArray(local)) {
          for (const ord of local) {
            if (!list.some((o) => o.orderNumber === ord.orderNumber || o.id === ord.id)) {
              list.push(ord);
            }
          }
        }
      } catch (e) {
        console.warn('Local storage orders read note:', e);
      }

      setOrders(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.warn('Orders read note:', err);
      try {
        const local = JSON.parse(localStorage.getItem('zn_orders') || '[]');
        if (Array.isArray(local)) {
          setOrders(local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (e) {}
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeedingLoading(true);
    try {
      const count = await seedInitialData();
      setSeedSuccessCount(count);
      setTimeout(() => setSeedSuccessCount(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSeedingLoading(false);
    }
  };

  // Device image file compressor
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const promises = Array.from(files).map((file) => compressImageFile(file));
      const compressedDataUrls = await Promise.all(promises);
      setImageFiles((prev) => [...prev, ...compressedDataUrls]);
    } catch (err) {
      console.error('File compression error', err);
      alert('Could not process some images from your device. Please try again.');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImageFiles((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [target, ...rest];
    });
  };

  const handleAddUrlImage = () => {
    const trimmed = customUrlInput.trim();
    if (trimmed && !imageFiles.includes(trimmed)) {
      setImageFiles((prev) => [...prev, trimmed]);
      setCustomUrlInput('');
    }
  };

  const categoryPresets: Record<string, string[]> = {
    'Watches': [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80'
    ],
    'Handbags': [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80'
    ],
    'Bangles': [
      'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80'
    ],
    'Stainless Steel Jewellery': [
      'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1000&q=80'
    ]
  };

  const handleApplyCategoryPreset = () => {
    const presets = categoryPresets[prodCategory] || categoryPresets['Watches'];
    const nextPreset = presets.find((url) => !imageFiles.includes(url)) || presets[0];
    if (!imageFiles.includes(nextPreset)) {
      setImageFiles((prev) => [...prev, nextPreset]);
    }
  };

  const handleOpenNewProduct = () => {
    setIsEditingProduct(true);
    setEditingProductId(null);
    setFormValidationError(null);
    setProdName('');
    setProdSku(generateSKU('Watches'));
    setProdCategory('Watches');
    setProdPrice(7500);
    setProdSalePrice(undefined);
    setProdGoldPurity('Stainless Steel & Mineral Glass');
    setProdWeight(0);
    setProdDiamondDetails('');
    setProdStock(10);
    setProdDescription('Curated luxury timepiece by ZN JEWELLERS.');
    setImageFiles(['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80']);
    setCustomUrlInput('');
    setProdIsFeatured(true);
    setProdIsNewArrival(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setIsEditingProduct(true);
    setEditingProductId(p.id);
    setFormValidationError(null);
    setProdName(p.name);
    setProdSku(p.sku);
    setProdCategory(p.category);
    setProdPrice(p.price);
    setProdSalePrice(p.salePrice);
    setProdGoldPurity(p.material || 'Velvet & Mirror Acrylic');
    setProdWeight(0);
    setProdDiamondDetails(p.customizationNotice || '');
    setProdStock(p.stock);
    setProdDescription(p.description);
    setImageFiles(p.images && p.images.length > 0 ? p.images : []);
    setCustomUrlInput('');
    setProdIsFeatured(!!p.isFeatured);
    setProdIsNewArrival(!!p.isNewArrival);
  };

  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormValidationError(null);

    // 1. Validation check with clear feedback
    const trimmedName = prodName.trim();
    if (!trimmedName) {
      setFormValidationError('Please enter a Product Title / Name.');
      return;
    }

    const numericPrice = Number(prodPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setFormValidationError('Please enter a valid Price in PKR.');
      return;
    }

    const numericStock = Number(prodStock);
    if (isNaN(numericStock) || numericStock < 0) {
      setFormValidationError('Please enter a valid stock quantity (0 or more).');
      return;
    }

    setSavingProduct(true);

    try {
      const finalImages = imageFiles.length > 0 
        ? imageFiles 
        : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80'];

      const dataPayload: any = {
        name: trimmedName,
        sku: prodSku.trim() || generateSKU(prodCategory),
        category: prodCategory,
        price: numericPrice,
        images: finalImages,
        description: prodDescription.trim() || `${trimmedName} - Premium creation by ZN JEWELLERS.`,
        goldPurity: prodGoldPurity,
        weightGrams: Number(prodWeight) || 0,
        stock: numericStock,
        isFeatured: Boolean(prodIsFeatured),
        isNewArrival: Boolean(prodIsNewArrival),
        rating: 5.0,
        reviewsCount: 1
      };

      if (prodSalePrice && Number(prodSalePrice) > 0) {
        dataPayload.salePrice = Number(prodSalePrice);
      }

      if (prodDiamondDetails && prodDiamondDetails.trim()) {
        dataPayload.diamondDetails = prodDiamondDetails.trim();
      }

      if (editingProductId) {
        await updateProduct(editingProductId, dataPayload);
        setProductSavedSuccess(`Product "${trimmedName}" updated successfully!`);
      } else {
        await addProduct(dataPayload);
        setProductSavedSuccess(`Product "${trimmedName}" successfully saved and added to store!`);
      }

      setIsEditingProduct(false);
      setTimeout(() => setProductSavedSuccess(null), 5000);
    } catch (err: any) {
      console.error('Save product error:', err);
      setFormValidationError(err?.message || 'Error saving product. Please check fields and try again.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderToEdit) return;
    try {
      try {
        await updateDoc(doc(db, 'orders', selectedOrderToEdit.id), {
          orderStatus: newOrderStatus,
          trackingNumber: newTrackingNumber.trim() || selectedOrderToEdit.trackingNumber,
          paymentStatus: newPaymentStatus
        });
      } catch (e) {
        console.warn('Firestore update note:', e);
      }

      // Update in localStorage
      try {
        const local = JSON.parse(localStorage.getItem('zn_orders') || '[]');
        if (Array.isArray(local)) {
          const updated = local.map((o: any) =>
            o.id === selectedOrderToEdit.id || o.orderNumber === selectedOrderToEdit.orderNumber
              ? {
                  ...o,
                  orderStatus: newOrderStatus,
                  trackingNumber: newTrackingNumber.trim() || o.trackingNumber,
                  paymentStatus: newPaymentStatus
                }
              : o
          );
          localStorage.setItem('zn_orders', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Local storage update note:', e);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderToEdit.id
            ? {
                ...o,
                orderStatus: newOrderStatus,
                trackingNumber: newTrackingNumber.trim() || o.trackingNumber,
                paymentStatus: newPaymentStatus
              }
            : o
        )
      );
      setSelectedOrderToEdit(null);
    } catch (err) {
      console.error('Update order status error:', err);
    }
  };

  // KPIs
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => ['Order Placed', 'Confirmed', 'Processing'].includes(o.orderStatus));
  const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-6xl bg-[#0c0a07] border border-[#3b2e1b] rounded-2xl shadow-2xl overflow-hidden my-6 text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Executive Header */}
        <div className="p-5 border-b border-[#211a10] flex items-center justify-between bg-[#110e09]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#3b2e1b] text-[#D6B16D] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-bold">ZN JEWELLERS Executive Portal</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  isAdmin ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {isAdmin ? 'Admin Mode (Active)' : 'Client Preview Mode'}
                </span>
              </div>
              <h2 className="text-base font-serif font-semibold text-white">Store & Inventory Administration</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo Admin Switch for Evaluation */}
            <button
              onClick={toggleDemoAdmin}
              className="hidden sm:inline-flex px-3 py-1.5 rounded bg-[#17130a] border border-[#3b2e1b] text-neutral-300 text-xs hover:text-[#D6B16D] transition-colors"
            >
              Toggle Admin Permissions
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#080705] border-b border-[#1c160e] flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 uppercase tracking-wider">
            <button
              onClick={() => { setActiveTab('overview'); setIsEditingProduct(false); }}
              className={`pb-1 transition-colors ${
                activeTab === 'overview' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => { setActiveTab('products'); }}
              className={`pb-1 transition-colors ${
                activeTab === 'products' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Catalogue & Stock ({products.length})
            </button>
            <button
              onClick={() => { setActiveTab('collections'); setIsEditingProduct(false); }}
              className={`pb-1 transition-colors flex items-center gap-1.5 ${
                activeTab === 'collections' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Collections ({categories.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setIsEditingProduct(false); }}
              className={`pb-1 transition-colors ${
                activeTab === 'orders' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Customer Orders ({orders.length})
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setIsEditingProduct(false); }}
              className={`pb-1 transition-colors ${
                activeTab === 'settings' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Store Configuration
            </button>
          </div>

          {/* Quick Database Initializer */}
          <button
            onClick={handleSeedDatabase}
            disabled={seedingLoading}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1f180e] border border-[#3b2e1b] text-[#D6B16D] text-[11px] font-semibold hover:bg-[#D6B16D] hover:text-black transition-colors cursor-pointer disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{seedingLoading ? 'Seeding Firestore...' : 'Seed Live Database'}</span>
          </button>
        </div>

        {seedSuccessCount !== null && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-700 text-xs text-emerald-300 text-center font-medium">
            ✓ Successfully synced {seedSuccessCount} masterworks directly into Cloud Firestore!
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-[#110e09] border border-[#261f13] space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span>Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#D6B16D]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-mono font-bold text-white">{formatPKR(totalRevenue || 4350000)}</h3>
                  <span className="text-[10px] text-emerald-400">All Pakistani orders combined</span>
                </div>

                <div className="p-5 rounded-xl bg-[#110e09] border border-[#261f13] space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#D6B16D]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-mono font-bold text-white">{orders.length || 7}</h3>
                  <span className="text-[10px] text-neutral-400">Recorded across all channels</span>
                </div>

                <div className="p-5 rounded-xl bg-[#110e09] border border-[#261f13] space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span>Pending Atelier Crafting</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-mono font-bold text-amber-300">{pendingOrders.length || 2}</h3>
                  <span className="text-[10px] text-amber-400/80">Requires courier dispatch</span>
                </div>

                <div className="p-5 rounded-xl bg-[#110e09] border border-[#261f13] space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-xs">
                    <span>Inventory Value</span>
                    <Package className="w-4 h-4 text-[#D6B16D]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-mono font-bold text-white">
                    {formatPKR(products.reduce((s, p) => s + p.price * p.stock, 0))}
                  </h3>
                  <span className="text-[10px] text-neutral-400">{products.length} distinct jewellery pieces</span>
                </div>
              </div>

              {/* Recent Orders Spotlight */}
              <div className="p-6 rounded-xl bg-[#0f0c08] border border-[#261f13] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                    Recent Customer Dispatches
                  </h4>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#D6B16D] hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {orders.slice(0, 4).map((ord) => (
                    <div key={ord.id} className="p-3 rounded-lg bg-[#141009] border border-[#221a10] flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[#D6B16D] font-bold">{ord.orderNumber}</span>
                        <span className="text-neutral-400 ml-2">• {ord.customerName} ({ord.city})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#D6B16D]/20 text-[#D6B16D]">
                          {ord.orderStatus}
                        </span>
                        <span className="font-mono text-white">{formatPKR(ord.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOGUE */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {!isEditingProduct ? (
                <>
                  {productSavedSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 flex items-center justify-between text-xs shadow-lg animate-fadeIn">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="font-medium">{productSavedSuccess}</span>
                      </div>
                      <button 
                        onClick={() => setProductSavedSuccess(null)} 
                        className="text-emerald-400 hover:text-white p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                        Jewellery Inventory & Stock
                      </h4>
                      <p className="text-xs text-neutral-400">Add, edit, or adjust inventory and prices in real-time.</p>
                    </div>

                    <button
                      onClick={handleOpenNewProduct}
                      className="px-4 py-2.5 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F4E0A5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Masterwork</span>
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="rounded-xl border border-[#261f13] overflow-hidden bg-[#0e0c08]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141009] border-b border-[#261f13] text-neutral-400 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3">Piece Details</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price (PKR)</th>
                            <th className="p-3">Material / Craft</th>
                            <th className="p-3">In Stock</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e170e]">
                          {products.map((p) => (
                            <tr key={p.id} className="hover:bg-[#141009] transition-colors">
                              <td className="p-3 flex items-center gap-3">
                                <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                                <div>
                                  <span className="font-serif font-medium text-white block">{p.name}</span>
                                  <span className="text-[10px] font-mono text-neutral-400">{p.sku}</span>
                                </div>
                              </td>
                              <td className="p-3 text-neutral-300">{p.category}</td>
                              <td className="p-3 font-mono font-semibold text-[#D6B16D]">{formatPKR(p.price)}</td>
                              <td className="p-3 text-neutral-300">{p.material || p.goldPurity || 'Handcrafted'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  p.stock <= 0 ? 'bg-red-950 text-red-300' : p.stock <= 2 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                                }`}>
                                  {p.stock} units
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 rounded bg-[#17130a] text-neutral-300 hover:text-[#D6B16D] border border-[#2d2214]"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmTarget({ type: 'product', id: p.id, name: p.name })}
                                  className="p-1.5 rounded bg-[#17130a] text-neutral-400 hover:text-red-400 border border-[#2d2214] hover:border-red-500/40 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* Edit / Add Product Form */
                <form onSubmit={handleSaveProduct} noValidate className="p-6 rounded-xl bg-[#0f0c08] border border-[#292014] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#211a10]">
                    <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                      {editingProductId ? 'Edit Product Details' : 'Create New Luxury Creation'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsEditingProduct(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Product Title *</label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">SKU *</label>
                      <input
                        type="text"
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] uppercase tracking-wider text-neutral-300">Category / Collection *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('collections');
                            setIsCreatingCollection(true);
                          }}
                          className="text-[10px] text-[#D6B16D] hover:underline"
                        >
                          + New Collection
                        </button>
                      </div>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} {c.isCustom ? '★ (Custom Collection)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Price *</label>
                      <input
                        type="number"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(Number(e.target.value))}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Sale Price (Optional)</label>
                      <input
                        type="number"
                        value={prodSalePrice || ''}
                        onChange={(e) => setProdSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Leave empty if no discount"
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Material & Crafting</label>
                      <select
                        value={prodGoldPurity}
                        onChange={(e) => setProdGoldPurity(e.target.value as any)}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      >
                        <option value="Stainless Steel & Mineral Glass">Stainless Steel & Mineral Glass (Watches)</option>
                        <option value="18K PVD Gold Anti-Tarnish">18K PVD Gold Anti-Tarnish (Stainless Steel)</option>
                        <option value="Brass Kundan & Velvet">Brass Kundan & Velvet (Bridal Bangles)</option>
                        <option value="Structured Vegan Leather">Structured Vegan Leather (Handbags)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Item Weight or Dimensions (Optional)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={prodWeight}
                        onChange={(e) => setProdWeight(Number(e.target.value))}
                        placeholder="e.g. 150 grams"
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        value={prodStock}
                        onChange={(e) => setProdStock(Number(e.target.value))}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Customization / Name Notice</label>
                      <input
                        type="text"
                        value={prodDiamondDetails}
                        onChange={(e) => setProdDiamondDetails(e.target.value)}
                        placeholder="e.g. Free custom name engraving for bride & groom"
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    {/* Direct Device File Upload (Mobile & Laptop) */}
                    <div className="sm:col-span-2 space-y-3 p-4 rounded-xl bg-[#141009] border border-[#2d2215]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="block text-xs uppercase tracking-wider text-[#D6B16D] font-bold">
                              Product Images ({imageFiles.length})
                            </label>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[#D6B16D]/20 text-[#D6B16D] font-medium">
                              Multiple Images Supported (2, 3 یا زیادہ)
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            ایک پروڈکٹ کی 2، 3 یا اس سے زیادہ مختلف زاویوں (angles) کی تصاویر موبائل یا لیپ ٹاپ سے شامل کریں۔
                          </span>
                        </div>

                        <div>
                          <label
                            htmlFor="admin-device-file-input"
                            className="px-4 py-2 bg-gradient-to-r from-[#D6B16D] to-[#F4E0A5] text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:shadow-lg hover:shadow-[#D6B16D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{imageFiles.length > 0 ? '+ Add More Photos' : 'Upload Photos (Mobile / Laptop)'}</span>
                          </label>
                          <input
                            id="admin-device-file-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleDeviceFileUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Dropzone click area */}
                      <label
                        htmlFor="admin-device-file-input"
                        className="block p-5 rounded-xl border-2 border-dashed border-[#3b2e1b] hover:border-[#D6B16D] transition-colors text-center cursor-pointer bg-[#0c0906] group"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#3b2e1b] flex items-center justify-center text-[#D6B16D] group-hover:scale-110 transition-transform">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-white">
                              <span className="text-[#D6B16D] font-semibold underline">Tap or Click to Select Multiple Photos</span>
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              ایک ساتھ 2، 3 یا زیادہ تصاویر منتخب کر سکتے ہیں (Front, Side, Close-up angles)
                            </p>
                          </div>
                          {isUploadingImages && (
                            <span className="text-xs text-[#D6B16D] font-mono animate-pulse block">
                              Optimizing & attaching device images...
                            </span>
                          )}
                        </div>
                      </label>

                      {/* Attached Thumbnails Grid */}
                      {imageFiles.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                              Attached Photos (First is Cover photo — click any to set as Cover):
                            </span>
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor="admin-device-file-input"
                                className="text-[10px] text-[#D6B16D] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add More</span>
                              </label>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                • {imageFiles.length} photo{imageFiles.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {imageFiles.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSetPrimaryImage(idx)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer group transition-all ${
                                  idx === 0
                                    ? 'border-[#D6B16D] shadow-md shadow-[#D6B16D]/20 ring-1 ring-[#D6B16D]'
                                    : 'border-[#2d2215] hover:border-neutral-500'
                                }`}
                              >
                                <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />

                                {idx === 0 && (
                                  <span className="absolute bottom-1 left-1 right-1 text-center bg-black/85 backdrop-blur-sm text-[#D6B16D] text-[9px] uppercase font-bold py-0.5 rounded">
                                    Cover
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(idx);
                                  }}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-neutral-300 hover:text-red-400 hover:bg-black transition-colors"
                                  title="Remove image"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Optional Web Link / Preset Helper */}
                      <div className="pt-2 border-t border-[#231a0e] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                          <input
                            type="text"
                            placeholder="Optional: Or paste image web link..."
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            className="flex-1 bg-[#0a0805] border border-[#2b2114] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D6B16D] placeholder:text-neutral-600"
                          />
                          <button
                            type="button"
                            onClick={handleAddUrlImage}
                            className="px-3 py-1.5 bg-[#1f190e] border border-[#3b2e1b] text-[#D6B16D] rounded text-xs hover:bg-[#D6B16D] hover:text-black transition-colors"
                          >
                            Add
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleApplyCategoryPreset}
                          className="text-[11px] text-[#D6B16D] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Load Sample Photo for {prodCategory}</span>
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>

                    <div className="flex items-center gap-6 sm:col-span-2 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodIsFeatured}
                          onChange={(e) => setProdIsFeatured(e.target.checked)}
                          className="accent-[#D6B16D]"
                        />
                        <span>Featured on Homepage</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodIsNewArrival}
                          onChange={(e) => setProdIsNewArrival(e.target.checked)}
                          className="accent-[#D6B16D]"
                        />
                        <span>Mark as New Arrival</span>
                      </label>
                    </div>
                  </div>

                  {formValidationError && (
                    <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2.5 animate-shake">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="font-medium">{formValidationError}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#211a10] flex items-center justify-between gap-3">
                    <span className="text-[11px] text-neutral-400">
                      * Required fields (Title, Price, Stock)
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingProduct(false)}
                        className="px-4 py-2 rounded bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSaveProduct(e)}
                        disabled={savingProduct}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#D6B16D] to-[#F4E0A5] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:shadow-lg hover:shadow-[#D6B16D]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingProduct ? 'Saving Product...' : 'Save Product'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* TAB: COLLECTIONS MANAGEMENT */}
          {activeTab === 'collections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#221c13] pb-4">
                <div>
                  <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D6B16D]" />
                    <span>Storefront Collections & Categories ({categories.length})</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage boutique collections. Create new custom product lines that automatically sync across the navigation bar, homepage showcase, and shop filters.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingCollection(!isCreatingCollection)}
                  className="px-4 py-2 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#F4E0A5] transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingCollection ? 'Close Creator' : 'Create New Collection'}</span>
                </button>
              </div>

              {colSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{colSuccessMessage}</span>
                </div>
              )}

              {/* CREATE COLLECTION FORM */}
              {isCreatingCollection && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newColName.trim()) return;
                    setColSaving(true);
                    try {
                      await addCollection({
                        name: newColName.trim(),
                        tagline: newColTagline.trim() || 'Curated Collection',
                        description: newColDescription.trim() || 'Curated fashion pieces by ZN Jewelers.',
                        image: newColImage || '/hero-steel.jpg'
                      });
                      setColSuccessMessage(`Collection "${newColName.trim()}" created successfully!`);
                      setNewColName('');
                      setNewColTagline('');
                      setNewColDescription('');
                      setNewColImage('/hero-steel.jpg');
                      setIsCreatingCollection(false);
                      setTimeout(() => setColSuccessMessage(null), 3500);
                    } catch (err) {
                      console.error('Failed to create collection:', err);
                    } finally {
                      setColSaving(false);
                    }
                  }}
                  className="p-5 bg-[#0f0c08] border border-[#D6B16D]/40 rounded-xl space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-[#261f14] pb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#D6B16D]">
                      Create New Custom Collection
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="text-neutral-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Collection Name *</label>
                      <input
                        type="text"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        placeholder="e.g. Stainless Steel Collection, Men's Rings..."
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Tagline / Subheading</label>
                      <input
                        type="text"
                        value={newColTagline}
                        onChange={(e) => setNewColTagline(e.target.value)}
                        placeholder="e.g. 100% Waterproof & Anti-Tarnish"
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Description</label>
                    <textarea
                      rows={2}
                      value={newColDescription}
                      onChange={(e) => setNewColDescription(e.target.value)}
                      placeholder="Brief description of the collection style and craftsmanship..."
                      className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Featured Image URL</label>
                    <input
                      type="text"
                      value={newColImage}
                      onChange={(e) => setNewColImage(e.target.value)}
                      placeholder="/hero-steel.jpg or external image URL"
                      className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-neutral-500 mr-1">Quick Select Photo:</span>
                      {[
                        { label: 'Steel Jewellery', url: '/hero-steel.jpg' },
                        { label: 'Watches', url: '/hero-watches.jpg' },
                        { label: 'Bangles', url: '/hero-bangles.jpg' },
                        { label: 'Handbags', url: '/hero-handbags.jpg' },
                        { label: 'Jewellery Sets', url: '/hero-sets.jpg' },
                        { label: 'Rings', url: '/hero-rings.jpg' },
                        { label: 'Earrings', url: '/hero-earrings.jpg' }
                      ].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setNewColImage(preset.url)}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                            newColImage === preset.url
                              ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-bold'
                              : 'bg-[#1a160f] text-neutral-400 border-[#2b2214] hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCollection(false)}
                      className="px-4 py-2 rounded text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={colSaving}
                      className="px-5 py-2 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#F4E0A5] transition-colors flex items-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{colSaving ? 'Creating...' : 'Publish Collection'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* COLLECTIONS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((col) => {
                  const productCount = products.filter(
                    (p) => p.category === col.name
                  ).length;

                  return (
                    <div
                      key={col.id}
                      className="bg-[#0f0c08] border border-[#261f13] hover:border-[#D6B16D]/50 rounded-xl overflow-hidden flex flex-col justify-between transition-all"
                    >
                      {/* Image Header */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={col.image || '/hero-steel.jpg'}
                          alt={col.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c08] via-transparent to-transparent" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          {col.isCustom ? (
                            <span className="px-2 py-0.5 bg-[#D6B16D] text-black text-[10px] font-bold rounded shadow uppercase">
                              Custom Collection
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-[#D6B16D] border border-[#D6B16D]/40 text-[10px] font-medium rounded uppercase">
                              Flagship Collection
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] rounded border border-white/10">
                            {productCount} Products
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[10px] text-[#D6B16D] uppercase tracking-wider block font-medium">
                            {col.tagline}
                          </span>
                          <h5 className="font-serif font-bold text-white text-base mt-0.5">
                            {col.name}
                          </h5>
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                            {col.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#1f1910] flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('products');
                            }}
                            className="text-[#D6B16D] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <span>View Products ({productCount})</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmTarget({ type: 'collection', id: col.id, name: col.name })}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-colors"
                            title="Delete Collection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                    Customer Purchase Orders & Invoices
                  </h4>
                  <p className="text-xs text-neutral-400">Search invoices, verify items with photos, update status, and manage courier tracking.</p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#D6B16D]" />
                  <input
                    type="text"
                    placeholder="Search Order / Invoice #, Client, Phone, or Item..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-[#141009] border border-[#3b2e1b] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D6B16D] transition-colors"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {orderSearchQuery && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141009] border border-[#2b2114] text-xs">
                  <span className="text-neutral-300">
                    Showing results for <strong className="text-[#D6B16D]">"{orderSearchQuery}"</strong>
                  </span>
                  <button
                    onClick={() => setOrderSearchQuery('')}
                    className="text-[#D6B16D] hover:underline text-[11px]"
                  >
                    Reset Filter
                  </button>
                </div>
              )}

              {/* Order Edit Dialog */}
              {selectedOrderToEdit && (
                <div className="p-5 rounded-xl bg-[#141009] border border-[#3d301b] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#221a10]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif font-semibold text-white">
                        Modify Status: <strong className="text-[#D6B16D]">{selectedOrderToEdit.orderNumber}</strong> ({selectedOrderToEdit.customerName})
                      </span>
                    </div>
                    <button onClick={() => setSelectedOrderToEdit(null)} className="text-neutral-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Display Ordered Items with Images in edit modal */}
                  <div className="p-3 rounded-lg bg-[#0c0906] border border-[#241a10] space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                      Ordered Items to Dispatch ({selectedOrderToEdit.items.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedOrderToEdit.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 rounded bg-[#141009] border border-[#22180d]">
                          <img
                            src={it.image || '/hero-steel.jpg'}
                            alt={it.name}
                            className="w-10 h-10 rounded object-cover border border-[#3b2e1b] bg-black shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/hero-steel.jpg'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-serif text-white text-xs block truncate">{it.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                              <span>SKU: {it.sku}</span>
                              <span className="text-[#D6B16D] font-bold">x{it.quantity}</span>
                              <span>{formatPKR(it.price)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1">Order Status</label>
                      <select
                        value={newOrderStatus}
                        onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                        className="w-full bg-[#0a0805] border border-[#2d2315] rounded px-3 py-2 text-white"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing (In Atelier)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Payment Status</label>
                      <select
                        value={newPaymentStatus}
                        onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                        className="w-full bg-[#0a0805] border border-[#2d2315] rounded px-3 py-2 text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid & Verified</option>
                        <option value="failed">Failed / Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Courier Tracking ID</label>
                      <input
                        type="text"
                        value={newTrackingNumber}
                        onChange={(e) => setNewTrackingNumber(e.target.value)}
                        placeholder="e.g. TCS-ARM-90284"
                        className="w-full bg-[#0a0805] border border-[#2d2315] rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedOrderToEdit(null)}
                      className="px-3 py-1.5 rounded bg-neutral-900 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateOrderStatus}
                      className="px-5 py-1.5 rounded bg-[#D6B16D] text-black text-xs font-semibold uppercase hover:bg-[#F4E0A5]"
                    >
                      Update Order
                    </button>
                  </div>
                </div>
              )}

              {/* Orders List */}
              <div className="space-y-4">
                {orders
                  .filter((o) => {
                    if (!orderSearchQuery) return true;
                    const q = orderSearchQuery.toLowerCase().trim();
                    const inNumber = o.orderNumber?.toLowerCase().includes(q);
                    const inId = o.id?.toLowerCase().includes(q);
                    const inName = o.customerName?.toLowerCase().includes(q);
                    const inPhone = o.customerPhone?.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) || o.customerPhone?.includes(q);
                    const inEmail = o.customerEmail?.toLowerCase().includes(q);
                    const inCity = o.city?.toLowerCase().includes(q);
                    const inRef = o.paymentReference && o.paymentReference.toLowerCase().includes(q);
                    const inTracking = o.trackingNumber && o.trackingNumber.toLowerCase().includes(q);
                    const inItems = o.items && o.items.some(
                      (it) => it.name?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q)
                    );
                    return inNumber || inId || inName || inPhone || inEmail || inCity || inRef || inTracking || inItems;
                  })
                  .map((ord) => {
                    const cleanPhone = ord.customerPhone ? ord.customerPhone.replace(/[^0-9]/g, '') : '';
                    const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${ord.customerName}! We are contacting you from ZN Jewelers regarding your Order ID: ${ord.orderNumber}.`)}` : null;

                    return (
                      <div
                        key={ord.id}
                        className="p-5 rounded-xl bg-[#0e0c08] border border-[#241c11] hover:border-[#382b18] transition-colors space-y-4"
                      >
                        {/* Header Row */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-[#D6B16D] text-sm bg-[#16110a] px-2.5 py-0.5 rounded border border-[#3b2e1b]">
                                {ord.orderNumber}
                              </span>
                              <span className="text-neutral-500">•</span>
                              <span className="text-white font-semibold text-sm">{ord.customerName}</span>
                              <span className="text-neutral-400 text-xs">({ord.city})</span>
                              
                              {whatsappLink && (
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-[11px] hover:bg-emerald-900 transition-colors"
                                  title="Open WhatsApp Chat with Customer"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                                  <span>{ord.customerPhone}</span>
                                </a>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-400">
                              <span>Placed: <strong className="text-neutral-300">{formatDate(ord.createdAt)}</strong></span>
                              <span>•</span>
                              <span className="flex items-center gap-1.5">
                                Payment: 
                                <span className="text-white font-medium capitalize bg-[#161109] px-2 py-0.5 rounded border border-[#2b2114]">
                                  {ord.paymentMethod.replace('_', ' ')}
                                </span>
                              </span>

                              {ord.paymentReference && (
                                <>
                                  <span>•</span>
                                  <span className="text-neutral-300 bg-[#1a140a] px-2 py-0.5 rounded border border-[#382a17]">
                                    TRX / Ref: <strong className="text-[#D6B16D] font-mono">{ord.paymentReference}</strong>
                                  </span>
                                </>
                              )}

                              {ord.trackingNumber && (
                                <>
                                  <span>•</span>
                                  <span className="text-neutral-300">
                                    Courier: <strong className="text-white font-mono">{ord.trackingNumber}</strong>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Total and Actions */}
                          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1f1810]">
                            <div className="text-left lg:text-right">
                              <span className="text-base font-mono font-bold text-white block">{formatPKR(ord.total)}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#D6B16D]/20 text-[#D6B16D]">
                                  {ord.orderStatus}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : 'bg-amber-950 text-amber-300 border-amber-800'
                                }`}>
                                  {ord.paymentStatus}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedInvoiceOrder(ord)}
                                className="px-3 py-1.5 rounded-lg bg-[#141009] border border-[#3d311c] text-neutral-200 hover:text-[#D6B16D] hover:border-[#D6B16D] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="View & Print Formal Commercial Invoice"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#D6B16D]" />
                                <span>Invoice</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedOrderToEdit(ord);
                                  setNewOrderStatus(ord.orderStatus);
                                  setNewTrackingNumber(ord.trackingNumber || '');
                                  setNewPaymentStatus(ord.paymentStatus);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#17130a] border border-[#3d311c] text-[#D6B16D] text-xs font-semibold hover:bg-[#D6B16D] hover:text-black transition-colors cursor-pointer"
                              >
                                Manage Status
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Visual Ordered Items Grid with Product Images */}
                        <div className="pt-3 border-t border-[#1c150c] space-y-2">
                          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                            Ordered Pieces ({ord.items.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-[#141009] border border-[#231b10] hover:border-[#3b2e1b] transition-colors"
                              >
                                <img
                                  src={item.image || '/hero-steel.jpg'}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-[#3b2e1b] bg-black shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/hero-steel.jpg';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="font-serif font-medium text-white text-xs block truncate" title={item.name}>
                                    {item.name}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                                    <span className="font-mono text-neutral-400">SKU: {item.sku}</span>
                                    {item.selectedSize && (
                                      <span className="px-1.5 py-0.2 bg-[#211a10] text-neutral-300 rounded border border-[#3b2e1b]">
                                        Size: {item.selectedSize}
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.2 bg-[#211a10] text-[#D6B16D] font-bold rounded border border-[#3b2e1b]">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[#D6B16D] text-[11px] font-semibold block mt-0.5">
                                    {formatPKR(item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* TAB 4: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-xl bg-[#0f0c08] border border-[#261f13] space-y-6 max-w-3xl">
              <div className="flex items-center justify-between border-b border-[#221b11] pb-4">
                <div>
                  <h4 className="text-sm font-serif font-semibold text-white uppercase tracking-wider">
                    Store Information, Contacts & Logistics
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Changes here immediately update the website headers, footers, Contact page, Google Maps, and checkout policies.
                  </p>
                </div>
                {settingsSavedSuccess && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settings Saved!</span>
                  </div>
                )}
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSettingsSaving(true);
                  try {
                    await updateSettings(settingsForm);
                    setSettingsSavedSuccess(true);
                    setTimeout(() => setSettingsSavedSuccess(false), 3500);
                  } catch (err) {
                    console.error('Failed to save settings:', err);
                  } finally {
                    setSettingsSaving(false);
                  }
                }}
                className="space-y-6 text-xs"
              >
                {/* 1. Identity & Physical Location */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#D6B16D]">
                    1. Business Identity & Physical Store Address
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Business Name</label>
                      <input
                        type="text"
                        value={settingsForm.businessName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Official Contact Email</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Physical Store Address</label>
                    <input
                      type="text"
                      value={settingsForm.storeAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                      required
                      className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                    />
                    <span className="text-[10px] text-neutral-500 block mt-1">Exact location displayed on Google Maps card and invoices.</span>
                  </div>
                </div>

                {/* 2. Direct Channels (Phone & WhatsApp) */}
                <div className="space-y-3 pt-3 border-t border-[#1f1910]">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#D6B16D]">
                    2. Phone & WhatsApp Concierge
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Customer Phone Number</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">WhatsApp Number (e.g. +92 300 8294711)</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          const cleanDigits = val.replace(/[^0-9]/g, '');
                          setSettingsForm({ 
                            ...settingsForm, 
                            whatsappNumber: val,
                            whatsappUrl: `https://wa.me/${cleanDigits}` 
                          });
                        }}
                        required
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Social Media URLs */}
                <div className="space-y-3 pt-3 border-t border-[#1f1910]">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#D6B16D]">
                    3. Social Media Profiles (Instagram & TikTok)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Instagram Profile URL</label>
                      <input
                        type="url"
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        required
                        placeholder="https://www.instagram.com/yourhandle"
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">TikTok Profile URL</label>
                      <input
                        type="url"
                        value={settingsForm.tiktokUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                        required
                        placeholder="https://www.tiktok.com/@yourhandle"
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Shipping Logistics & Rates */}
                <div className="space-y-3 pt-3 border-t border-[#1f1910]">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#D6B16D]">
                    4. Shipping Fees & Delivery Timelines
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Free Delivery Threshold (PKR)</label>
                      <input
                        type="number"
                        value={settingsForm.freeShippingThreshold}
                        onChange={(e) => setSettingsForm({ 
                          ...settingsForm, 
                          freeShippingThreshold: Number(e.target.value),
                          shippingThreshold: Number(e.target.value)
                        })}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Karachi Delivery Fee (PKR)</label>
                      <input
                        type="number"
                        value={settingsForm.shippingRateKarachi}
                        onChange={(e) => setSettingsForm({ ...settingsForm, shippingRateKarachi: Number(e.target.value) })}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Nationwide Delivery Fee (PKR)</label>
                      <input
                        type="number"
                        value={settingsForm.shippingRateNationwide}
                        onChange={(e) => setSettingsForm({ 
                          ...settingsForm, 
                          shippingRateNationwide: Number(e.target.value),
                          standardShippingFee: Number(e.target.value)
                        })}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Estimated Karachi Delivery</label>
                      <input
                        type="text"
                        value={settingsForm.deliveryTimeKarachi}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryTimeKarachi: e.target.value })}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium">Estimated Nationwide Delivery</label>
                      <input
                        type="text"
                        value={settingsForm.deliveryTimeNationwide}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryTimeNationwide: e.target.value })}
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Pakistani Payment Accounts (Easypaisa, JazzCash & Meezan Bank) */}
                <div className="space-y-4 pt-4 border-t border-[#1f1910]">
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#D6B16D]">
                      5. Pakistani Payment Accounts & Merchant Details
                    </h5>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Configure your real Easypaisa, JazzCash, and Bank Transfer accounts shown to customers during checkout.
                    </p>
                  </div>

                  {/* Easypaisa */}
                  <div className="p-4 rounded-xl bg-[#110e09] border border-[#261e12] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Easypaisa Mobile Account</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Account Title</label>
                        <input
                          type="text"
                          value={settingsForm.easypaisaTitle || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, easypaisaTitle: e.target.value })}
                          placeholder="e.g. ZN Jewelers"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Mobile Account Number</label>
                        <input
                          type="text"
                          value={settingsForm.easypaisaNumber || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, easypaisaNumber: e.target.value })}
                          placeholder="e.g. 0300 8294711"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Customer Instructions (Easypaisa)</label>
                      <input
                        type="text"
                        value={settingsForm.easypaisaInstructions || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, easypaisaInstructions: e.target.value })}
                        placeholder="Instructions displayed to customer..."
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>

                  {/* JazzCash */}
                  <div className="p-4 rounded-xl bg-[#110e09] border border-[#261e12] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">JazzCash Mobile Account & Till</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Account Title</label>
                        <input
                          type="text"
                          value={settingsForm.jazzcashTitle || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, jazzcashTitle: e.target.value })}
                          placeholder="e.g. ZN Jewelers"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Mobile Account Number</label>
                        <input
                          type="text"
                          value={settingsForm.jazzcashNumber || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, jazzcashNumber: e.target.value })}
                          placeholder="e.g. 0300 8294711"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Till ID (Optional)</label>
                        <input
                          type="text"
                          value={settingsForm.jazzcashTillId || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, jazzcashTillId: e.target.value })}
                          placeholder="e.g. 00289140"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Customer Instructions (JazzCash)</label>
                      <input
                        type="text"
                        value={settingsForm.jazzcashInstructions || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, jazzcashInstructions: e.target.value })}
                        placeholder="Instructions displayed to customer..."
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>

                  {/* Bank Transfer (Meezan Bank) */}
                  <div className="p-4 rounded-xl bg-[#110e09] border border-[#261e12] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Bank Transfer (Meezan Bank / 1Link Raast)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Bank Name</label>
                        <input
                          type="text"
                          value={settingsForm.bankName || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                          placeholder="e.g. Meezan Bank Ltd"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Account Title</label>
                        <input
                          type="text"
                          value={settingsForm.bankAccountTitle || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountTitle: e.target.value })}
                          placeholder="e.g. ZN Jewelers"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Account Number</label>
                        <input
                          type="text"
                          value={settingsForm.bankAccountNumber || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountNumber: e.target.value })}
                          placeholder="e.g. 0108746201"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 mb-1 font-medium text-[11px]">IBAN Number</label>
                        <input
                          type="text"
                          value={settingsForm.bankIban || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bankIban: e.target.value })}
                          placeholder="e.g. PK42MEZN0099320108746201"
                          className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D6B16D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-300 mb-1 font-medium text-[11px]">Branch Name / Location</label>
                      <input
                        type="text"
                        value={settingsForm.bankBranch || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bankBranch: e.target.value })}
                        placeholder="e.g. Korangi Crossing Branch, Karachi"
                        className="w-full bg-[#15110a] border border-[#3b2e1b] rounded px-3 py-2 text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-[#1f1910] flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Synced automatically with Firestore document <code className="text-[#D6B16D]">settings/general</code>.
                  </span>
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="px-6 py-2.5 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#F4E0A5] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{settingsSaving ? 'Saving to Store...' : 'Save Store Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* OFFICIAL COMMERCIAL INVOICE PREVIEW MODAL */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e0c08] border border-[#D6B16D]/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-white my-auto max-h-[92vh] overflow-y-auto">
            {/* Header with Print & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-[#292014]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#D6B16D]/50 flex items-center justify-center text-[#D6B16D]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Commercial Purchase Invoice</h3>
                  <p className="text-xs text-neutral-400">ZN JEWELLERS Official Order Documentation</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D6B16D] text-black text-xs font-semibold hover:bg-[#F4E0A5] transition-colors flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#141009] p-4 rounded-xl border border-[#2b2114]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#D6B16D] font-bold block">Merchant Details</span>
                <p className="font-serif font-bold text-white text-sm">ZN JEWELLERS</p>
                <p className="text-neutral-400">Shop No. 47, Aman Tower, Korangi Crossing</p>
                <p className="text-neutral-400">Karachi, Sindh, Pakistan</p>
                <p className="text-neutral-400">Phone / WhatsApp: <strong className="text-neutral-200 font-mono">+92 317 8113817</strong></p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#D6B16D] font-bold block">Invoice / Order Details</span>
                <p className="font-mono font-bold text-white text-sm">{selectedInvoiceOrder.orderNumber}</p>
                <p className="text-neutral-400">Date: {formatDate(selectedInvoiceOrder.createdAt)}</p>
                <p className="text-neutral-400">
                  Payment: <strong className="text-white capitalize">{selectedInvoiceOrder.paymentMethod.replace('_', ' ')}</strong>
                </p>
                <p className="text-neutral-400">
                  Status: <span className="text-[#D6B16D] font-bold uppercase">{selectedInvoiceOrder.orderStatus}</span>
                </p>
                {selectedInvoiceOrder.trackingNumber && (
                  <p className="text-neutral-400">
                    Courier: <strong className="text-emerald-400 font-mono">{selectedInvoiceOrder.trackingNumber}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="p-3.5 rounded-xl bg-[#141009] border border-[#241a10] text-xs space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#D6B16D] font-bold block">Ship To Customer</span>
              <p className="font-medium text-white">{selectedInvoiceOrder.customerName}</p>
              <p className="text-neutral-400 font-mono">{selectedInvoiceOrder.customerPhone} {selectedInvoiceOrder.customerEmail && `• ${selectedInvoiceOrder.customerEmail}`}</p>
              <p className="text-neutral-300">{selectedInvoiceOrder.shippingAddress}, {selectedInvoiceOrder.city}, Pakistan</p>
            </div>

            {/* Line Items Table with Photos */}
            <div className="rounded-xl border border-[#292014] overflow-hidden bg-[#0c0a07]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#17120a] border-b border-[#292014] text-neutral-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Photo</th>
                    <th className="p-3">Product Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e170e]">
                  {selectedInvoiceOrder.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-[#141009] transition-colors">
                      <td className="p-3">
                        <img
                          src={it.image || '/hero-steel.jpg'}
                          alt={it.name}
                          className="w-12 h-12 object-cover rounded-lg border border-[#3b2e1b] bg-black"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/hero-steel.jpg'; }}
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-serif font-medium text-white block">{it.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          <span className="font-mono">SKU: {it.sku}</span>
                          {it.selectedSize && <span>• Size: {it.selectedSize}</span>}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-white">{it.quantity}</td>
                      <td className="p-3 text-right font-mono text-neutral-300">{formatPKR(it.price)}</td>
                      <td className="p-3 text-right font-mono font-semibold text-[#D6B16D]">
                        {formatPKR(it.price * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-xl bg-[#141009] border border-[#2b2114] space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal:</span>
                <span className="font-mono text-neutral-200">{formatPKR(selectedInvoiceOrder.subtotal || selectedInvoiceOrder.total)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Courier Express Shipping (Pakistan):</span>
                <span className="font-mono text-neutral-200">
                  {selectedInvoiceOrder.shippingCost === 0 ? 'FREE' : formatPKR(selectedInvoiceOrder.shippingCost)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#292014] flex justify-between text-sm font-bold">
                <span className="text-white">Total Amount (PKR):</span>
                <span className="font-mono text-[#D6B16D] text-base">{formatPKR(selectedInvoiceOrder.total)}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-[10px] text-neutral-500 text-center space-y-1">
              <p>Authentic ZN JEWELLERS creations • 7-day parcel inspection guarantee upon delivery.</p>
              <p>Need support? Contact customer concierge via WhatsApp at +92 317 8113817.</p>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TOAST FOR ACTIONS */}
      {deleteFeedback && (
        <div className="fixed top-6 right-6 z-[110] p-3.5 bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{deleteFeedback}</span>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL FOR DELETIONS */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#120f0a] border border-[#D6B16D]/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-base">
                  {deleteConfirmTarget.type === 'product' ? 'Delete Product' : 'Delete Collection'}
                </h4>
                <p className="text-xs text-neutral-400">
                  {deleteConfirmTarget.type === 'product' ? 'Store Catalogue & Inventory' : 'Storefront Collection'}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmTarget.name}"</strong>? This item will be removed immediately from your live website.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#261f14]">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = deleteConfirmTarget;
                  setDeleteConfirmTarget(null);
                  if (target.type === 'product') {
                    await deleteProduct(target.id);
                    setDeleteFeedback(`Product "${target.name}" removed successfully.`);
                  } else {
                    await deleteCollection(target.id);
                    setDeleteFeedback(`Collection "${target.name}" removed successfully.`);
                  }
                  setTimeout(() => setDeleteFeedback(null), 3500);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors shadow-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
