import { environment } from '../../environments/environment';

const BASE = `${environment.mediaServerUrl}/media/vz/gioielleria/images/immagini_gioielli`;

function range(category: string, prefix: string, count: number, overrides: Record<number, string> = {}): string[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const filename = overrides[n] ?? `${prefix}${n}.avif`;
    return `${BASE}/${category}/${filename}`;
  });
}

const CATEGORY_POOLS: Record<string, string[]> = {
  anelli:    range('anelli', 'anello', 12),
  bracciali: range('bracciali', 'bracciali', 10),
  ciondoli:  range('ciondoli', 'ciondoli', 10, { 6: 'cionodoli6.avif' }),
  collane:   [
    ...range('collane', 'collana', 13),
    `${BASE}/collane/collana_perle1.avif`,
    `${BASE}/collane/collana_perle2.avif`,
    `${BASE}/collane/collana_perle3.avif`,
    `${BASE}/collane/collana_perle4.avif`,
    `${BASE}/collane/collana_perle5.avif`,
  ],
  orecchini: range('orecchini', 'orecchini', 10),
};

const GENERAL: string[] = [
  CATEGORY_POOLS['anelli'][0],
  CATEGORY_POOLS['collane'][0],
  CATEGORY_POOLS['orecchini'][0],
  CATEGORY_POOLS['bracciali'][0],
  CATEGORY_POOLS['ciondoli'][0],
  CATEGORY_POOLS['anelli'][4],
  CATEGORY_POOLS['collane'][4],
  CATEGORY_POOLS['orecchini'][4],
];

function pickImages(pool: string[], productId: number, count: number): string[] {
  const start = productId % pool.length;
  return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]);
}

export function getProductImages(productId: number, categoryName: string): string[] {
  const categoryLower = categoryName.toLowerCase();
  const matchedCategory = Object.keys(CATEGORY_POOLS).find(cat => categoryLower.includes(cat));
  return matchedCategory
    ? pickImages(CATEGORY_POOLS[matchedCategory], productId, 3)
    : pickImages(GENERAL, productId, 3);
}
