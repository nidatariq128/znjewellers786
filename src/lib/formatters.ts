/**
 * Formats a number to Pakistani Rupee currency string
 * e.g., 185000 -> "₨ 185,000"
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₨ 0';
  }
  return `₨ ${Math.round(amount).toLocaleString('en-PK')}`;
}

/**
 * Generates an executive luxury order ID
 */
export function generateOrderNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ZN-${currentYear}-${randomSuffix}`;
}

/**
 * Generates a luxury SKU based on category
 */
export function generateSKU(category: string, idSuffix?: string): string {
  const prefixMap: Record<string, string> = {
    'Watches': 'ZN-WTC',
    "Men's Watches": 'ZN-MWT',
    "Women's Watches": 'ZN-WWT',
    'Bangles': 'ZN-BNG',
    'Handbags': 'ZN-HBG',
    'Rings': 'ZN-RNG',
    'Earrings': 'ZN-EAR',
    'Jewellery Sets': 'ZN-SET',
    'Jewellery': 'ZN-JWL',
    'Stainless Steel Jewellery': 'ZN-SSJ',
  };
  const prefix = prefixMap[category] || 'ZN-LUX';
  const num = idSuffix || Math.floor(100 + Math.random() * 900).toString();
  return `${prefix}-${num}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
