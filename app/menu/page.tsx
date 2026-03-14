import { getPrisma } from "@/lib/prisma";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          Merico Spot Bar & Grill Menu
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Cold drinks. Great atmosphere. Every time. Browse our complete catalog of beers, spirits, wines, and more below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col items-center bg-white dark:bg-zinc-900 transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className="relative w-32 h-40 mb-4 rounded-xl overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 w-full">
              {product.imageUrl ? (
                <div className="relative w-full h-full p-2">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="text-zinc-400 flex flex-col items-center justify-center opacity-50">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-medium">No Image</span>
                </div>
              )}
            </div>
            
            <div className="w-full text-center flex-grow flex flex-col">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-500 mb-1 uppercase tracking-widest">
                {product.category || "Beverage"}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 leading-snug">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-xs text-zinc-500 mb-4">{product.brand}</p>
              )}
              
              <div className="mt-auto">
                <div className="inline-block bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800/50">
                  <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300">
                    {product.pricePerUnit.toLocaleString()} <span className="text-sm font-semibold opacity-80">RWF</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500">Menu items are currently being updated. Please check back soon!</p>
        </div>
      )}
    </div>
  );
}
