import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';
import { formatPKR } from '../../lib/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categoryName: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectCategory
}) => {
  const { products } = useProducts();
  const [queryText, setQueryText] = useState('');

  const suggestions = [
    'Bridal Bangles',
    'Antique Gold Kada Pair',
    'Men Chronograph Watch',
    'Waterproof Anti-Tarnish Chain',
    'Velvet Bridal Clutch'
  ];

  const searchResults = useMemo(() => {
    const rawQ = queryText.trim().toLowerCase();
    if (!rawQ) return [];
    const cleanQ = rawQ.replace(/[^a-z0-9]/g, '');
    const words = rawQ.split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      const prodName = p.name.toLowerCase();
      const prodCat = p.category.toLowerCase();
      const prodSku = p.sku.toLowerCase();
      const prodMaterial = (p.material || '').toLowerCase();
      const prodDesc = p.description.toLowerCase();

      // Check for specific category intent
      const isWatchQuery = words.some((w) => ['watch', 'watches', 'chronograph', 'timepiece', 'ghari'].includes(w));
      const isHandbagQuery = words.some((w) => ['handbag', 'handbags', 'bag', 'bags', 'clutch', 'purse', 'tote'].includes(w)) || cleanQ === 'handbag' || cleanQ === 'handbags';
      const isBangleQuery = words.some((w) => ['bangle', 'bangles', 'bangal', 'bangals', 'kada', 'kadas', 'choodiyan', 'churiya'].includes(w)) || cleanQ === 'bangle' || cleanQ === 'bangles';
      const isRingQuery = words.length === 1 && ['ring', 'rings', 'band'].includes(words[0]);
      const isEarringQuery = words.some((w) => ['earring', 'earrings', 'earing', 'earings', 'jhumka', 'hoop', 'hoops', 'chandbali'].includes(w));

      if (isWatchQuery) {
        return prodCat.includes('watch') || prodName.includes('watch') || prodName.includes('chronograph') || prodName.includes('timepiece');
      }
      if (isHandbagQuery) {
        return prodCat.includes('handbag') || prodName.includes('handbag') || prodName.includes('bag') || prodName.includes('clutch') || prodName.includes('tote');
      }
      if (isBangleQuery) {
        return prodCat.includes('bangle') || prodName.includes('bangle') || prodName.includes('kada') || prodName.includes('choodiyan');
      }
      if (isRingQuery) {
        return prodCat.includes('ring') || prodName.includes('ring');
      }
      if (isEarringQuery) {
        return prodCat.includes('earring') || prodName.includes('earring') || prodName.includes('hoop') || prodName.includes('chandbali');
      }

      // General query match
      const searchField = `${prodName} ${prodCat} ${prodSku} ${prodMaterial}`;
      const cleanField = searchField.replace(/[^a-z0-9]/g, '');

      return (
        searchField.includes(rawQ) ||
        cleanField.includes(cleanQ) ||
        words.every((w) => searchField.includes(w) || prodDesc.includes(w))
      );
    });
  }, [queryText, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-20">
      <div 
        className="relative w-full max-w-2xl bg-[#0c0a07] border border-[#3b2e1b] rounded-2xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#241d13] flex items-center gap-3 bg-[#110e09]">
          <Search className="w-5 h-5 text-[#D6B16D] shrink-0" />
          <input
            type="text"
            placeholder="Search by watches, bridal bangles, handbags, steel jewellery..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-neutral-500 focus:outline-none"
          />
          {queryText && (
            <button
              onClick={() => setQueryText('')}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion tags */}
        {!queryText && (
          <div className="p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-bold block">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => setQueryText(sug)}
                  className="px-3.5 py-1.5 rounded-full bg-[#15110a] border border-[#2b2214] text-xs text-neutral-300 hover:text-[#D6B16D] hover:border-[#D6B16D] transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#1e170e] space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-bold block">
                Browse By Category
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Jewellery', "Men's Watches", "Women's Watches", 'Stainless Steel Jewellery', 'Handbags'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onSelectCategory(cat);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-[#110e09] border border-[#231a10] text-xs text-neutral-300 hover:text-white hover:border-[#D6B16D] text-left transition-colors truncate"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {queryText && (
          <div className="max-h-96 overflow-y-auto p-4 space-y-2">
            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
                <p>No masterworks found matching "{queryText}".</p>
                <p className="text-neutral-500">Try searching "Bangles", "Watch", "Handbag", or "Steel".</p>
              </div>
            ) : (
              searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#110e09] hover:bg-[#18130a] border border-[#231a10] hover:border-[#D6B16D] transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-[#1c160e]"
                    />
                    <div>
                      <h4 className="text-xs font-serif font-semibold text-white group-hover:text-[#D6B16D] transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>{product.category}</span>
                        <span>•</span>
                        <span className="font-mono">{product.sku}</span>
                        {product.goldPurity && (
                          <>
                            <span>•</span>
                            <span className="text-[#D6B16D]">{product.goldPurity}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-[#D6B16D]">
                      {formatPKR(product.salePrice ?? product.price)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
