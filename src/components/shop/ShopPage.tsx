import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  Search, 
  Sparkles, 
  RotateCcw, 
  X
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from './ProductCard';
import { Product, ProductCategory } from '../../types';

interface ShopPageProps {
  onQuickView: (product: Product) => void;
  initialCategory?: ProductCategory | null;
  initialFilter?: 'new' | 'all' | null;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onQuickView,
  initialCategory = null,
  initialFilter = null
}) => {
  const { products, categories: allStoreCategories, selectedCategory, setSelectedCategory } = useProducts();

  // Active filters
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>(
    initialCategory || (selectedCategory as any) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('price-asc');

  // Sync when initialCategory prop changes
  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const customCategoryNames = allStoreCategories.filter(c => c.isCustom).map(c => c.name);
  const categories: (ProductCategory | 'all')[] = [
    'all',
    'Stainless Steel Jewellery',
    'Jewellery Sets',
    'Rings',
    'Earrings',
    'Watches',
    'Bangles',
    'Handbags',
    ...customCategoryNames
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // High-Precision Search Filter
        if (searchQuery.trim()) {
          const rawQ = searchQuery.toLowerCase().trim();
          const cleanQ = rawQ.replace(/[^a-z0-9]/g, '');
          const words = rawQ.split(/\s+/).filter(Boolean);

          const prodName = p.name.toLowerCase();
          const prodCat = p.category.toLowerCase();
          const prodSku = p.sku.toLowerCase();
          const prodMaterial = (p.material || '').toLowerCase();
          const prodDesc = p.description.toLowerCase();

          // 1. Check for specific category-intent searches
          const isWatchQuery = words.some((w) => ['watch', 'watches', 'chronograph', 'timepiece', 'ghari'].includes(w));
          const isHandbagQuery = words.some((w) => ['handbag', 'handbags', 'bag', 'bags', 'clutch', 'purse', 'tote'].includes(w)) || cleanQ === 'handbag' || cleanQ === 'handbags';
          const isBangleQuery = words.some((w) => ['bangle', 'bangles', 'bangal', 'bangals', 'kada', 'kadas', 'choodiyan', 'churiya'].includes(w)) || cleanQ === 'bangle' || cleanQ === 'bangles';
          const isRingQuery = words.length === 1 && ['ring', 'rings', 'band'].includes(words[0]);
          const isEarringQuery = words.some((w) => ['earring', 'earrings', 'earing', 'earings', 'jhumka', 'hoop', 'hoops', 'chandbali'].includes(w));

          if (isWatchQuery) {
            const isWatchProduct = prodCat.includes('watch') || prodName.includes('watch') || prodName.includes('chronograph') || prodName.includes('timepiece');
            if (!isWatchProduct) return false;
          } else if (isHandbagQuery) {
            const isHandbagProduct = prodCat.includes('handbag') || prodName.includes('handbag') || prodName.includes('bag') || prodName.includes('clutch') || prodName.includes('tote');
            if (!isHandbagProduct) return false;
          } else if (isBangleQuery) {
            const isBangleProduct = prodCat.includes('bangle') || prodName.includes('bangle') || prodName.includes('kada') || prodName.includes('choodiyan');
            if (!isBangleProduct) return false;
          } else if (isRingQuery) {
            const isRingProduct = prodCat.includes('ring') || prodName.includes('ring');
            if (!isRingProduct) return false;
          } else if (isEarringQuery) {
            const isEarringProduct = prodCat.includes('earring') || prodName.includes('earring') || prodName.includes('hoop') || prodName.includes('chandbali');
            if (!isEarringProduct) return false;
          } else {
            // General query: check Title, Category, SKU, Material, or full Description
            const searchField = `${prodName} ${prodCat} ${prodSku} ${prodMaterial}`;
            const cleanField = searchField.replace(/[^a-z0-9]/g, '');

            const directMatch = searchField.includes(rawQ) || cleanField.includes(cleanQ);
            const allWordsMatch = words.every((w) => searchField.includes(w) || cleanField.includes(w.replace(/[^a-z0-9]/g, '')) || prodDesc.includes(w));

            if (!directMatch && !allWordsMatch) return false;
          }
        } else {
          // Category filter applies when not searching
          if (activeCategory !== 'all') {
            if (p.category !== activeCategory) {
              if (activeCategory === 'Watches' && (p.category === "Men's Watches" || p.category === "Women's Watches")) {
                // Match watches
              } else {
                return false;
              }
            }
          }
        }

        // New in filter
        if (initialFilter === 'new' && !p.isNewArrival) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return priceA - priceB;
      });
  }, [products, activeCategory, searchQuery, sortBy, initialFilter]);

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('price-asc');
  };

  return (
    <div className="py-12 px-6 lg:px-12 bg-[#080808] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B16D]" />
            <span>High Jewellery Catalogue</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-wide">
            {activeCategory === 'all' ? (
              <>Haute <span className="italic font-serif gold-gradient-text">Collections</span></>
            ) : (
              <span className="gold-gradient-text">{activeCategory}</span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            Every creation is handcrafted with premium materials, bespoke personalization, and waterproof anti-tarnish quality.
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedCategory(cat === 'all' ? null : cat);
                setSearchQuery(''); // Immediately clear search text so clicked collection's products display right away
              }}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold shadow-md shadow-[#D6B16D]/15'
                  : 'bg-[#110e09] text-neutral-300 border-[#261f13] hover:border-[#D6B16D]'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>

        {/* Filter and Search Control Bar: Search + Single Price Filter */}
        <div className="p-4 rounded-xl bg-[#0e0c08] border border-[#241c11] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search Input with 1-Click Clear Button */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by product title, handbags, bangles, or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() && activeCategory !== 'all') {
                  setActiveCategory('all');
                  setSelectedCategory(null);
                }
              }}
              className="w-full bg-[#141009] border border-[#2d2214] rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D6B16D]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Just Price Filter Dropdown (English Only) */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#141009] border border-[#3b2e1b] rounded-lg px-3 py-2 text-xs text-white shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#D6B16D] shrink-0" />
              <span className="text-neutral-300 text-xs font-medium">Price:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-[#D6B16D] font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="price-asc" className="bg-[#141009] text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-[#141009] text-white">Price: High to Low</option>
                <option value="newest" className="bg-[#141009] text-white">Newest Arrivals</option>
              </select>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-2 rounded-lg bg-[#1a140b] border border-[#3d2e1b] text-neutral-300 hover:text-white hover:border-[#D6B16D] text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear Search & Filters"
              >
                <RotateCcw className="w-3 h-3 text-[#D6B16D]" />
                <span className="text-[11px]">Reset</span>
              </button>
            )}
          </div>

        </div>

        {/* Product Count & Status */}
        <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-[#1c160e] pb-3">
          <span>Showing <strong className="text-white">{filteredProducts.length}</strong> products</span>
          {searchQuery && (
            <span className="text-[#D6B16D] font-medium">Search: &ldquo;{searchQuery}&rdquo;</span>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-base font-serif text-white">No creations match the selected filters.</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Please adjust your price range or category criteria to view our handcrafted inventory.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F4E0A5] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
