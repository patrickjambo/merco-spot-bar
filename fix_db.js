const { Client } = require('pg');

const imageMapping = {
  // Beer
  "primus-650ml.jpg": "https://images.unsplash.com/photo-1627572709292-62bda2db1946?q=80&w=800&auto=format&fit=crop",
  "heineken-330ml.jpg": "https://images.unsplash.com/photo-1614316311688-6617304dfdf1?q=80&w=800&auto=format&fit=crop",
  "amstel-330ml.jpg": "https://images.unsplash.com/photo-1634141571434-f6b92f7dc2a0?q=80&w=800&auto=format&fit=crop",
  "skol-650ml.jpg": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=800&auto=format&fit=crop",
  "skol-can-330ml.jpg": "https://images.unsplash.com/photo-1611078755088-7e44c20538f8?q=80&w=800&auto=format&fit=crop",
  "virunga-650ml.jpg": "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=800&auto=format&fit=crop",
  "red-bull-250ml.jpg": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=800&auto=format&fit=crop",
  "bavaria-500ml.jpg": "https://images.unsplash.com/photo-1611078755088-7e44c20538f8?q=80&w=800&auto=format&fit=crop",
  "savana-dry-330ml.jpg": "https://images.unsplash.com/photo-1563228965-0a56294d13b4?q=80&w=800&auto=format&fit=crop",
  "desperados-330ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?q=80&w=800&auto=format&fit=crop",

  // Soft Drinks / Juice / Water
  "fanta-orange-300ml.jpg": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop",
  "inyange-water-500ml.jpg": "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&auto=format&fit=crop",
  "petit-mitzing-250ml.jpg": "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?q=80&w=800&auto=format&fit=crop",
  "big-mitzing-1l.jpg": "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=800&auto=format&fit=crop",
  "inyange-juice-500ml.jpg": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop",

  // Spirits
  "smirnoff-ice-300ml.jpg": "https://images.unsplash.com/photo-1563228965-0a56294d13b4?q=80&w=800&auto=format&fit=crop",
  "smirnoff-quarter-200ml.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?q=80&w=800&auto=format&fit=crop",
  "smirnoff-1l.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?q=80&w=800&auto=format&fit=crop",
  "absolut-vodka-700ml.jpg": "https://images.unsplash.com/photo-1582236965045-8b839b2cd813?q=80&w=800&auto=format&fit=crop",
  "beefeater-small-200ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?q=80&w=800&auto=format&fit=crop",
  "beefeater-big-750ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?q=80&w=800&auto=format&fit=crop",
  "dry-gin-750ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?q=80&w=800&auto=format&fit=crop",
  "gilbeys-small-200ml.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?q=80&w=800&auto=format&fit=crop",
  "gilbeys-big-750ml.jpg": "https://images.unsplash.com/photo-1610452331580-0a273de07c39?q=80&w=800&auto=format&fit=crop",
  "golden-gin-750ml.jpg": "https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?q=80&w=800&auto=format&fit=crop",

  // Whiskey & Rum
  "jack-daniels-750ml.jpg": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=800&auto=format&fit=crop",
  "black-label-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=800&auto=format&fit=crop",
  "jameson-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=800&auto=format&fit=crop",
  "double-black-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=800&auto=format&fit=crop",
  "local-whiskey-750ml.jpg": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=800&auto=format&fit=crop",
  "bacardi-50cl.jpg": "https://images.unsplash.com/photo-1614315581176-88094628f804?q=80&w=800&auto=format&fit=crop",
  "camino-750ml.jpg": "https://images.unsplash.com/photo-1516531336495-263a43fa4ce8?q=80&w=800&auto=format&fit=crop",
  "leff-750ml.jpg": "https://images.unsplash.com/photo-1614315581176-88094628f804?q=80&w=800&auto=format&fit=crop",
  "amarula-750ml.jpg": "https://images.unsplash.com/photo-1569529465841-dfecdab7503a?q=80&w=800&auto=format&fit=crop",

  // Ciders / Alcopops
  "kvant-300ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?q=80&w=800&auto=format&fit=crop",
  "small-kony-200ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?q=80&w=800&auto=format&fit=crop",
  "big-kony-500ml.jpg": "https://images.unsplash.com/photo-1558826767-f49557451aa0?q=80&w=800&auto=format&fit=crop",
  "jagamaster-700ml.jpg": "https://images.unsplash.com/photo-1614315581176-88094628f804?q=80&w=800&auto=format&fit=crop",

  // Wine & Champagne
  "red-wine-750ml.jpg": "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=800&auto=format&fit=crop",
  "white-wine-750ml.jpg": "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop",
  "champagne-750ml.jpg": "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop",

  // Cigarettes
  "dunhill.jpg": "https://images.unsplash.com/photo-1562916669-e0e6c518b5b7?q=80&w=800&auto=format&fit=crop",
  "bond7-small.jpg": "https://images.unsplash.com/photo-1562916669-e0e6c518b5b7?q=80&w=800&auto=format&fit=crop",
  "bond7-big.jpg": "https://images.unsplash.com/photo-1562916669-e0e6c518b5b7?q=80&w=800&auto=format&fit=crop",
};

const defaultImage = "https://images.unsplash.com/photo-1582236965045-8b839b2cd813?q=80&w=800&auto=format&fit=crop";

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  const res = await client.query('SELECT id, name, image_url FROM products');
  let updatedCount = 0;

  for (let row of res.rows) {
    let newUrl = defaultImage;
    if (row.image_url && row.image_url.startsWith('/products/')) {
        const key = row.image_url.replace('/products/', '');
        newUrl = imageMapping[key] || defaultImage;
    }
    
    // Update the record
    await client.query('UPDATE products SET image_url = $1 WHERE id = $2', [newUrl, row.id]);
    updatedCount++;
    console.log(`Updated ${row.name} -> ${newUrl}`);
  }
  
  console.log(`SUCCESS. Updated ${updatedCount} products.`);
  await client.end();
}

run().catch(console.error);
