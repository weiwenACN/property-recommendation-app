export type SearchMode = 'rent' | 'buy';

export function formatRent(monthlyGbp: number): string {
  return `£${monthlyGbp.toLocaleString('en-GB')} pcm`;
}

export function formatSalePrice(totalGbp: number): string {
  return `£${totalGbp.toLocaleString('en-GB')}`;
}

export function formatFromPrice(
  mode: SearchMode,
  source: { avgRent: number; avgSalePrice: number },
): string {
  return mode === 'rent'
    ? `From £${source.avgRent.toLocaleString('en-GB')}/mo`
    : `From £${source.avgSalePrice.toLocaleString('en-GB')}`;
}

export function priceFor(
  mode: SearchMode,
  property: { rentPrice: number; salePrice: number },
): string {
  return mode === 'rent' ? formatRent(property.rentPrice) : formatSalePrice(property.salePrice);
}

export function priceLabel(mode: SearchMode): string {
  return mode === 'rent' ? 'Avg rent' : 'Avg sale price';
}
