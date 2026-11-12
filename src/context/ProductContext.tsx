import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, CollectionItem } from '../types';
import { INITIAL_PRODUCTS, CATEGORIES_LIST } from '../data/sampleProducts';

const DEFAULT_COLLECTIONS: CollectionItem[] = CATEGORIES_LIST.map((c, i) => ({
  id: `cat-default-${i}`,
  name: c.name,
  description: c.description,
  image: c.image,
  tagline: c.tagline,
  isCustom: false
}));

interface ProductContextType {
  products: Product[];
  categories: CollectionItem[];
  loading: boolean;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCollection: (col: Omit<CollectionItem, 'id' | 'isCustom' | 'createdAt'>) => Promise<string>;
  deleteCollection: (id: string) => Promise<void>;
  seedInitialData: () => Promise<number>;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Helper to get permanently deleted product IDs
const getDeletedProductIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('zn_deleted_product_ids');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

// Helper to get permanently deleted collection IDs
const getDeletedCollectionIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('zn_deleted_collection_ids');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

// Helper to get persistent stock overrides so purchased stock decrements stick
const getStockOverrides = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem('zn_product_stock_overrides');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const applyStockOverrides = (items: Product[]): Product[] => {
  const overrides = getStockOverrides();
  return items.map((p) => {
    if (overrides[p.id] !== undefined) {
      return { ...p, stock: overrides[p.id] };
    }
    return p;
  });
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to ensure NO old pure bullion gold, certified diamond bullion, or Nikkah sets slip in
  const isExcludedItem = (p: { id?: string; name?: string; category?: string; price?: number }) => {
    if (p.id && getDeletedProductIds().has(p.id)) return true;
    const forbiddenCats = ['Gold Jewellery', 'Diamond Jewellery', 'Customised Nikkah Essentials'];
    const forbiddenWords = ['22K Gold', '21K Gold', 'Royal Gold Choker', 'Emerald-Cut Diamond', 'Marquise Diamond', 'Solitaire Diamond', 'Tennis Bracelet', 'nikkah', 'nikah'];
    if (p.price && p.price > 150000) return true;
    if (p.category && forbiddenCats.includes(p.category)) return true;
    if (p.name && forbiddenWords.some((w) => p.name!.toLowerCase().includes(w.toLowerCase()))) return true;
    return false;
  };

  const [products, setProducts] = useState<Product[]>(() => {
    const deletedIds = getDeletedProductIds();
    try {
      const saved = localStorage.getItem('zn_custom_products');
      if (saved) {
        const customProds = (JSON.parse(saved) as Product[]).filter(
          (p) => !isExcludedItem(p) && !deletedIds.has(p.id)
        );
        const customIds = new Set(customProds.map((p) => p.id));
        const filteredInitial = INITIAL_PRODUCTS.filter((p) => !customIds.has(p.id) && !deletedIds.has(p.id));
        return applyStockOverrides([...customProds, ...filteredInitial]);
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
    return applyStockOverrides(INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id)));
  });

  const [customCollections, setCustomCollections] = useState<CollectionItem[]>(() => {
    const deletedCols = getDeletedCollectionIds();
    try {
      const saved = localStorage.getItem('zn_custom_collections');
      if (saved) {
        const parsed = JSON.parse(saved) as CollectionItem[];
        return parsed.filter((c) => !deletedCols.has(c.id) && !deletedCols.has(c.name));
      }
    } catch (e) {
      console.warn('LocalStorage read custom collections error:', e);
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Fetch products and collections from Firestore
  const fetchProductsAndCollections = async () => {
    const deletedIds = getDeletedProductIds();
    const deletedCols = getDeletedCollectionIds();

    try {
      // 1. Fetch products
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const firestoreList: Product[] = [];
        snap.forEach((d) => {
          const item = { id: d.id, ...d.data() } as Product;
          if (!isExcludedItem(item) && !deletedIds.has(item.id)) {
            firestoreList.push(item);
          }
        });

        if (firestoreList.length > 0) {
          let merged = [...firestoreList];
          try {
            const saved = localStorage.getItem('zn_custom_products');
            if (saved) {
              const customProds = (JSON.parse(saved) as Product[]).filter(
                (p) => !isExcludedItem(p) && !deletedIds.has(p.id)
              );
              const fsIds = new Set(firestoreList.map((p) => p.id));
              const pendingUploads = customProds.filter((p) => !fsIds.has(p.id));
              merged = [...pendingUploads, ...firestoreList];
            }
          } catch {}

          setProducts(applyStockOverrides(merged));
        } else {
          setProducts(applyStockOverrides(INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id))));
        }
      }

      // 2. Fetch custom collections from Firestore
      try {
        const colsSnap = await getDocs(collection(db, 'collections'));
        if (!colsSnap.empty) {
          const fsCols: CollectionItem[] = [];
          colsSnap.forEach((d) => {
            const colItem = { id: d.id, ...d.data() } as CollectionItem;
            if (!deletedCols.has(colItem.id) && !deletedCols.has(colItem.name)) {
              fsCols.push(colItem);
            }
          });
          setCustomCollections(fsCols);
          localStorage.setItem('zn_custom_collections', JSON.stringify(fsCols));
        }
      } catch (err) {
        console.warn('Could not read custom collections from Firestore:', err);
      }
    } catch (err) {
      console.warn('Could not read from Firestore products collection, using local catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCollections();
  }, []);

  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    const id = `zn-prod-${Date.now()}`;
    const newProduct: Product = {
      ...prodData,
      id,
      createdAt: new Date().toISOString()
    };

    setProducts((prev) => [newProduct, ...prev]);

    try {
      const stored = localStorage.getItem('zn_custom_products');
      const list = stored ? (JSON.parse(stored) as Product[]) : [];
      localStorage.setItem('zn_custom_products', JSON.stringify([newProduct, ...list]));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      const cleanProduct: Record<string, any> = {};
      for (const [k, v] of Object.entries(newProduct)) {
        if (v !== undefined) {
          cleanProduct[k] = v;
        }
      }
      await setDoc(doc(db, 'products', id), cleanProduct);
      console.log('[ZN Jewellers] Successfully wrote product to Cloud Firestore:', id);
    } catch (error) {
      console.warn('Firestore write notice (product safely stored in client state):', error);
    }

    return id;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    // 1. Immediately update React state so UI updates in real-time
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // 2. If stock is updated, store in persistent stock overrides
    if (updates.stock !== undefined) {
      try {
        const overrides = getStockOverrides();
        overrides[id] = updates.stock;
        localStorage.setItem('zn_product_stock_overrides', JSON.stringify(overrides));
      } catch (e) {
        console.warn('Stock override save error:', e);
      }
    }

    // 3. Update in zn_custom_products if present
    try {
      const stored = localStorage.getItem('zn_custom_products');
      if (stored) {
        const list = JSON.parse(stored) as Product[];
        const updatedList = list.map((p) => (p.id === id ? { ...p, ...updates } : p));
        localStorage.setItem('zn_custom_products', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.warn('LocalStorage update error:', e);
    }

    // 4. Update in Firestore with full document merge so security rules pass
    try {
      const existingProduct = products.find((p) => p.id === id);
      const cleanUpdates: Record<string, any> = existingProduct ? { ...existingProduct } : {};
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) {
          cleanUpdates[k] = v;
        }
      }
      await setDoc(doc(db, 'products', id), cleanUpdates, { merge: true });
    } catch (error) {
      console.warn('Firestore update notice:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    // 1. Instantly remove from local active products
    setProducts((prev) => prev.filter((p) => p.id !== id));

    // 2. Mark permanently deleted in localStorage so it never comes back
    try {
      const deletedIds = getDeletedProductIds();
      deletedIds.add(id);
      localStorage.setItem('zn_deleted_product_ids', JSON.stringify(Array.from(deletedIds)));

      const stored = localStorage.getItem('zn_custom_products');
      if (stored) {
        const list = JSON.parse(stored) as Product[];
        localStorage.setItem('zn_custom_products', JSON.stringify(list.filter((p) => p.id !== id)));
      }
    } catch (e) {
      console.warn('LocalStorage delete error:', e);
    }

    // 3. Delete from Firestore if exists
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.warn('Firestore delete notice:', error);
    }
  };

  // Custom Collections Management
  const addCollection = async (colData: Omit<CollectionItem, 'id' | 'isCustom' | 'createdAt'>): Promise<string> => {
    const id = `col-${Date.now()}`;
    const newCol: CollectionItem = {
      ...colData,
      id,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    setCustomCollections((prev) => {
      const updated = [...prev, newCol];
      localStorage.setItem('zn_custom_collections', JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, 'collections', id), newCol);
      console.log('[ZN Jewellers] Successfully created custom collection in Firestore:', id);
    } catch (err) {
      console.warn('Firestore collection save fallback to local:', err);
    }

    return id;
  };

  const deleteCollection = async (idOrName: string) => {
    // 1. Remove from custom collections state
    setCustomCollections((prev) => {
      const updated = prev.filter((c) => c.id !== idOrName && c.name !== idOrName);
      localStorage.setItem('zn_custom_collections', JSON.stringify(updated));
      return updated;
    });

    // 2. Permanently record in deleted collections set
    try {
      const deletedCols = getDeletedCollectionIds();
      deletedCols.add(idOrName);
      localStorage.setItem('zn_deleted_collection_ids', JSON.stringify(Array.from(deletedCols)));
    } catch (e) {
      console.warn('LocalStorage collection delete error:', e);
    }

    // 3. Delete from Firestore
    try {
      await deleteDoc(doc(db, 'collections', idOrName));
    } catch (err) {
      console.warn('Firestore collection delete fallback to local:', err);
    }
  };

  const seedInitialData = async (): Promise<number> => {
    // Reset deleted IDs so seeding restores catalog
    try {
      localStorage.removeItem('zn_deleted_product_ids');
      localStorage.removeItem('zn_deleted_collection_ids');
    } catch {}

    let count = 0;
    try {
      for (const item of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', item.id), item);
        count++;
      }
      await fetchProductsAndCollections();
      return count;
    } catch (err) {
      console.error('Failed to seed products into Firestore:', err);
      throw err;
    }
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Filter out any deleted collections (custom or standard)
  const deletedCols = getDeletedCollectionIds();
  const allCategories: CollectionItem[] = [...DEFAULT_COLLECTIONS, ...customCollections].filter(
    (c) => !deletedCols.has(c.id) && !deletedCols.has(c.name)
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        categories: allCategories,
        loading,
        selectedCategory,
        setSelectedCategory,
        selectedProductForModal,
        setSelectedProductForModal,
        addProduct,
        updateProduct,
        deleteProduct,
        addCollection,
        deleteCollection,
        seedInitialData,
        getProductById
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
