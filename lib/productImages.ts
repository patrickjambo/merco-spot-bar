// Single source of truth for product imagery.
//
// We only use image URLs the app was already serving (known-good), grouped by
// category with several options each. A product with a real uploaded/linked
// image keeps it; everything else gets a category-appropriate photo chosen
// deterministically by name, so different products don't all share one image.
// The first entry of every category is treated as the guaranteed-safe fallback.

const U = {
  primus: "https://images.unsplash.com/photo-1627572709292-62bda2db1946?q=80&w=800&auto=format&fit=crop",
  heineken: "https://images.unsplash.com/photo-1614316311688-6617304dfdf1?q=80&w=800&auto=format&fit=crop",
  amstel: "https://images.unsplash.com/photo-1634141571434-f6b92f7dc2a0?q=80&w=800&auto=format&fit=crop",
  skol: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=800&auto=format&fit=crop",
  can: "https://images.unsplash.com/photo-1611078755088-7e44c20538f8?q=80&w=800&auto=format&fit=crop",
  darkBottle: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=800&auto=format&fit=crop",
  redBull: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=800&auto=format&fit=crop",
  clearCider: "https://images.unsplash.com/photo-1563228965-0a56294d13b4?q=80&w=800&auto=format&fit=crop",
  cider: "https://images.unsplash.com/photo-1558826767-f49557451aa0?q=80&w=800&auto=format&fit=crop",
  fanta: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop",
  water: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&auto=format&fit=crop",
  mitzing: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?q=80&w=800&auto=format&fit=crop",
  bigMitzing: "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&auto=format&fit=crop",
  clearSpirit: "https://images.unsplash.com/photo-1610452331580-0a273de07c39?q=80&w=800&auto=format&fit=crop",
  vodka: "https://images.unsplash.com/photo-1582236965045-8b839b2cd813?q=80&w=800&auto=format&fit=crop",
  gin: "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?q=80&w=800&auto=format&fit=crop",
  whiskeyAmber: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=800&auto=format&fit=crop",
  whiskeyDark: "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=800&auto=format&fit=crop",
  rum: "https://images.unsplash.com/photo-1614315581176-88094628f804?q=80&w=800&auto=format&fit=crop",
  tequila: "https://images.unsplash.com/photo-1516531336495-263a43fa4ce8?q=80&w=800&auto=format&fit=crop",
  whiteWine: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop",
  champagne: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop",
  cigarette: "https://images.unsplash.com/photo-1562916669-e0e6c518b5b7?q=80&w=800&auto=format&fit=crop",
};

const BEER = [U.primus, U.heineken, U.skol, U.amstel, U.can];
const SOFT = [U.fanta, U.water, U.mitzing, U.bigMitzing, U.redBull];
const VODKA = [U.vodka, U.clearSpirit];
const GIN = [U.gin, U.clearSpirit, U.vodka];
const WHISKEY = [U.whiskeyAmber, U.whiskeyDark];
const RUM = [U.rum, U.tequila];
const CIDER = [U.clearCider, U.cider, U.darkBottle];
const WINE = [U.whiteWine, U.darkBottle, U.champagne];
const CIGARETTE = [U.cigarette];
const SPIRITS = [U.vodka, U.gin, U.whiskeyAmber, U.rum, U.clearSpirit];
const DEFAULT = [U.vodka, U.primus, U.fanta];

function categoryImages(category: string): string[] {
  const c = (category || "").toLowerCase();
  if (/beer/.test(c)) return BEER;
  if (/wine|champagne/.test(c)) return WINE;
  if (/vodka/.test(c)) return VODKA;
  if (/gin/.test(c)) return GIN;
  if (/whisk/.test(c)) return WHISKEY;
  if (/rum/.test(c)) return RUM;
  if (/cider|alcopop/.test(c)) return CIDER;
  if (/soft|water|juice|soda|energy/.test(c)) return SOFT;
  if (/cigar/.test(c)) return CIGARETTE;
  if (/spirit/.test(c)) return SPIRITS;
  return DEFAULT;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Guaranteed-safe, category-appropriate image (the first, known-good entry).
export function fallbackForCategory(category?: string | null): string {
  return categoryImages(category || "")[0];
}

// Best image for a product: keep a real uploaded/linked image, otherwise pick a
// category photo spread by name so neighbouring products look different.
export function resolveProductImage(
  imageUrl?: string | null,
  category?: string | null,
  name?: string | null
): string {
  if (imageUrl && (imageUrl.startsWith("data:") || imageUrl.startsWith("http"))) return imageUrl;
  const list = categoryImages(category || "");
  return list[hashString(name || category || "x") % list.length];
}
