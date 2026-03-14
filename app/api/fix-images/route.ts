import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prisma = getPrisma();
    
    const imageMapping: Record<string, string> = {
      // Beer
      "primus-650ml.jpg": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80",
      "heineken-330ml.jpg": "https://images.unsplash.com/photo-1614316311688-6617304dfdf1?w=500&q=80",
      "amstel-330ml.jpg": "https://images.unsplash.com/photo-1657805175956-621ca0e97669?w=500&q=80",
      "skol-650ml.jpg": "https://images.unsplash.com/photo-1575037614876-c3852d24268e?w=500&q=80",
      "skol-can-330ml.jpg": "https://images.unsplash.com/photo-1611078755088-7e44c20538f8?w=500&q=80",
      "virunga-650ml.jpg": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&q=80",
      "red-bull-250ml.jpg": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&q=80",
      "bavaria-500ml.jpg": "https://images.unsplash.com/photo-1611078755088-7e44c20538f8?w=500&q=80",
      "savana-dry-330ml.jpg": "https://images.unsplash.com/photo-1563228965-0a56294d13b4?w=500&q=80",
      "desperados-330ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?w=500&q=80",

      // Soft Drinks / Juice / Water
      "fanta-orange-300ml.jpg": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
      "inyange-water-500ml.jpg": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&q=80",
      "petit-mitzing-250ml.jpg": "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=500&q=80",
      "big-mitzing-1l.jpg": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&q=80",
      "inyange-juice-500ml.jpg": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",

      // Spirits
      "smirnoff-ice-300ml.jpg": "https://images.unsplash.com/photo-1563228965-0a56294d13b4?w=500&q=80",
      "smirnoff-quarter-200ml.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?w=500&q=80",
      "smirnoff-1l.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?w=500&q=80",
      "absolut-vodka-700ml.jpg": "https://images.unsplash.com/photo-1582236965045-8b839b2cd813?w=500&q=80",
      "beefeater-small-200ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?w=500&q=80",
      "beefeater-big-750ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?w=500&q=80",
      "dry-gin-750ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?w=500&q=80",
      "gilbeys-small-200ml.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?w=500&q=80",
      "gilbeys-big-750ml.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?w=500&q=80",
      "golden-gin-750ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?w=500&q=80",

      // Whiskey & Rum
      "jack-daniels-750ml.jpg": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&q=80",
      "black-label-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?w=500&q=80",
      "jameson-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?w=500&q=80",
      "double-black-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?w=500&q=80",
      "local-whiskey-750ml.jpg": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&q=80",
      "bacardi-50cl.jpg": "https://images.unsplash.com/photo-1614315581176-88094628f804?w=500&q=80",
      "camino-750ml.jpg": "https://images.unsplash.com/photo-1516531336495-263a43fa4ce8?w=500&q=80",
      "leff-750ml.jpg": "https://images.unsplash.com/photo-1614315581176-88094628f804?w=500&q=80",
      "amarula-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?w=500&q=80",

      // Ciders / Alcopops
      "kvant-300ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?w=500&q=80",
      "small-kony-200ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?w=500&q=80",
      "big-kony-500ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?w=500&q=80",
      "jagamaster-700ml.jpg": "https://images.unsplash.com/photo-1614315581176-88094628f804?w=500&q=80",

      // Wine & Champagne
      "red-wine-750ml.jpg": "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=500&q=80",
      "white-wine-750ml.jpg": "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80",
      "champagne-750ml.jpg": "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&q=80",

      // Cigarettes
      "dunhill.jpg": "https://images.unsplash.com/photo-1562916669-e0e6c518b5b7?w=500&q=80",
      "bond7-small.jpg": "https://images.unsplash.com/photo-1562916669-e0e6c518b5b7?w=500&q=80",
      "bond7-big.jpg": "https://images.unsplash.com/photo-1562916669-e0e6c518b5b7?w=500&q=80",
    };

    const defaultImage = "https://images.unsplash.com/photo-1582236965045-8b839b2cd813?w=500&q=80";

    const products = await prisma.product.findMany();
    let updatedCount = 0;
    
    for (const p of products) {
      if (p.imageUrl && p.imageUrl.startsWith('/products/')) {
        const fileName = p.imageUrl.replace('/products/', '');
        const newUrl = imageMapping[fileName] || defaultImage;
        await prisma.product.update({
          where: { id: p.id },
          data: { imageUrl: newUrl }
        });
        updatedCount++;
      } else if (!p.imageUrl || p.imageUrl.includes('unsplash.com/photo-1600041162228')) {
        await prisma.product.update({
          where: { id: p.id },
          data: { imageUrl: defaultImage }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ message: `Successfully updated ${updatedCount} product images!` });
  } catch (error: any) {
    console.error("Image fix error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
