import Image from "next/image";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import HomeHero from "@/app/components/HomeHero";

// Render on request (like the menu) so product images optimize at request time and
// the build never depends on the database being reachable.
export const dynamic = "force-dynamic";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop";

// Only trust real image sources (uploaded base64 or full URLs); anything else
// (e.g. legacy "/products/x.jpg" paths) falls back to a generic drink photo.
function resolveImage(imageUrl?: string | null) {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("data:"))) return imageUrl;
  return FALLBACK_IMAGE;
}

export default async function Home() {
  const prisma = getPrisma();

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        pricePerUnit: true,
        imageUrl: true,
        stockUnits: true,
        minStockThreshold: true,
      },
    });
  } catch (error) {
    console.error("Homepage products load failed:", error);
  }

  // Showcase in-stock items first, then take a handful for the specials strip.
  const featured = [...products]
    .sort((a, b) => (b.stockUnits > 0 ? 1 : 0) - (a.stockUnits > 0 ? 1 : 0))
    .slice(0, 12)
    .map((p) => {
      const soldOut = p.stockUnits <= 0;
      const low = !soldOut && p.stockUnits <= p.minStockThreshold;
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.pricePerUnit,
        image: resolveImage(p.imageUrl),
        badge: soldOut ? "Sold out" : low ? "Few left" : "Available",
        badgeClass: soldOut
          ? "bg-red-500 text-white"
          : low
          ? "bg-amber-500 text-black"
          : "bg-green-500 text-white",
      };
    });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section (interactive carousel) */}
      <HomeHero />

      {/* Live Menu Specials Section */}
      <section id="products" className="w-full py-20 bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
            display: flex;
            width: max-content;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 relative z-10 inline-block bg-zinc-50 dark:bg-zinc-950 px-4">From Our Menu</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full mt-2"></div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4">Live prices, straight from the bar.</p>
          </div>
        </div>

        {featured.length === 0 ? (
          <div className="text-center">
            <Link href="/menu" className="inline-block bg-yellow-500 text-zinc-900 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all">
              Browse the full menu &rarr;
            </Link>
          </div>
        ) : (
          <div className="relative w-full">
            {/* Gradient fading edges for a smoother look */}
            <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none"></div>

            <div className="animate-marquee gap-8 px-4 pb-8">
              {/* Duplicate the list for a seamless infinite scroll loop */}
              {[...featured, ...featured].map((item, index) => (
                <div key={index} className="w-[300px] flex-shrink-0 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 mx-2">
                  <div className="h-56 bg-gray-200 dark:bg-zinc-800 relative group">
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate">{item.name}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{item.category}</p>
                      </div>
                      <span className="text-lg font-extrabold text-yellow-600 dark:text-yellow-500 whitespace-nowrap">
                        {item.price.toLocaleString()} <span className="text-xs">RWF</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/menu" className="inline-flex items-center gap-2 text-yellow-600 font-bold hover:text-yellow-700">
                See the full menu <span>&rarr;</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="w-full py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl font-bold mb-6">About Merico Spot</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Founded on the idea of bringing great people together over exceptional food and drinks, Merico Spot Bar & Grill has quickly become the hottest destination in town.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              With live music, dedicated staff, and a vibrant atmosphere, we guarantee an experience that will keep you coming back.
            </p>
            <Link href="#contact" className="text-yellow-600 font-bold hover:text-yellow-700 flex items-center gap-2">
              Book a Table Today <span>&rarr;</span>
            </Link>
          </div>
          <div className="w-full md:w-1/2 h-80 relative rounded-2xl overflow-hidden shadow-2xl">
            <Image src="https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=1200&auto=format&fit=crop" alt="Inside Merico Spot" fill className="object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
