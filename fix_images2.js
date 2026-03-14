const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imageMap = {
  // Better Unsplash/Web images for accuracy
  
  // Bralirwa / Heineken / Skol (Beers)
  'Primus Beer 650ml': 'https://www.heinekenafrica.com/wp-content/uploads/2019/08/Primus.png',
  'Heineken 330ml': 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?q=80&w=800&auto=format&fit=crop',
  'Amstel 330ml': 'https://www.heinekenrussia.com/wp-content/uploads/2021/05/Amstel-Premium-Pilsener.png',
  'Skol Beer 650ml': 'https://www.skol.rw/wp-content/uploads/2020/06/skol_gros_plan-1.png',
  'Skol Lager 330ml can': 'https://www.skol.rw/wp-content/uploads/2020/06/skol_can-1.png',
  'Virunga 650ml': 'https://www.skol.rw/wp-content/uploads/2020/06/virunga_mist_gros-1.png',
  'Bavaria 500ml': 'https://images.unsplash.com/photo-1628269785501-c81729b46ba1?q=80&w=800&auto=format&fit=crop', // Better beer icon
  
  // Soft Drinks Bralirwa / Inyange
  'Fanta Orange 300ml': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
  'Inyange Water 500ml': 'https://inyangeindustries.com/api/public/storage/products/1662973167.png',
  'Inyange Juice 500ml': 'https://inyangeindustries.com/api/public/storage/products/1662972986.png',
  'Petit Mitzing 250ml': 'https://www.heinekenafrica.com/wp-content/uploads/2019/08/Mutzig.png',
  'Big Mitzing 1L': 'https://www.heinekenafrica.com/wp-content/uploads/2019/08/Mutzig.png',
  
  // Spirits (Vodka, Gin, Whiskey, Rum)
  'Smirnoff Ice 300ml': 'https://images.unsplash.com/photo-1549416878-1a525547ddb7?q=80&w=800&auto=format&fit=crop',
  'Smirnoff Quarter 200ml': 'https://images.unsplash.com/photo-1643900388294-87cc728e2171?q=80&w=800&auto=format&fit=crop',
  'Smirnoff 1L': 'https://images.unsplash.com/photo-1563228965-0a56294d13b4?q=80&w=800&auto=format&fit=crop',
  'Absolute Vodka 700ml': 'https://images.unsplash.com/photo-1612260655383-0ec35aff27b5?q=80&w=800&auto=format&fit=crop',
  
  'Beefeater Small 200ml': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
  'Beefeater Big 750ml': 'https://images.unsplash.com/photo-1517441584318-7b98d361bdf1?q=80&w=800&auto=format&fit=crop',
  'Dry Gin 750ml': 'https://images.unsplash.com/photo-1609951651556-5324f6854124?q=80&w=800&auto=format&fit=crop',
  
  'Jack Daniel\'s 750ml': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=800&auto=format&fit=crop',
  'Black Label (J&B) 750ml': 'https://images.unsplash.com/photo-1563514957-c3132e0bf4ec?q=80&w=800&auto=format&fit=crop',
  'Jameson Big 750ml': 'https://images.unsplash.com/photo-1565554673859-9b93699e1d88?q=80&w=800&auto=format&fit=crop',
  'Double Black 750ml': 'https://images.unsplash.com/photo-1582222010898-3238ea39caba?q=80&w=800&auto=format&fit=crop',
  'Local Wiskey 750ml': 'https://images.unsplash.com/photo-1560508180-03f285f67eae?q=80&w=800&auto=format&fit=crop',

  'Bacardi 50cl': 'https://images.unsplash.com/photo-1614316311910-18464fc5644d?q=80&w=800&auto=format&fit=crop',
  'Camino 750ml': 'https://images.unsplash.com/photo-1512413917415-c28df95c4794?q=80&w=800&auto=format&fit=crop',
  'Amarula 750ml': 'https://images.unsplash.com/photo-1610960533303-f36fb7153da1?q=80&w=800&auto=format&fit=crop',
  
  // Wine
  'Red Wine Bottle 750ml': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop',
  'White Wine Bottle 750ml': 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=800&auto=format&fit=crop',
  'Champagne 750ml': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop',
  
  // Energy/Other
  'Red Bull 250ml': 'https://images.unsplash.com/photo-1596706917711-2df82fc9bb9d?q=80&w=800&auto=format&fit=crop',
  'Desperados 330ml': 'https://images.unsplash.com/photo-1610452336306-0371900f0aa3?q=80&w=800&auto=format&fit=crop',
  
  // Cigarettes
  'Dunhill': 'https://images.unsplash.com/photo-1533558110531-29471ab7911b?q=80&w=800&auto=format&fit=crop',
  'Bond 7 Small': 'https://images.unsplash.com/photo-1524317134375-9c8846c98aa2?q=80&w=800&auto=format&fit=crop',
  'Bond 7 Big': 'https://images.unsplash.com/photo-1524317134375-9c8846c98aa2?q=80&w=800&auto=format&fit=crop',
};

// Generic fallback mappings based on category terms to use actual realistic drink photos
const fallbacks = {
  'Beers': 'https://images.unsplash.com/photo-1538481199005-27dec80631f2?q=80&w=800&auto=format&fit=crop',
  'Vodka': 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop',
  'Gin': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
  'Whiskey': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=800&auto=format&fit=crop',
  'Wine': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop',
  'Rum': 'https://images.unsplash.com/photo-1516531336495-263a43fa4ce8?q=80&w=800&auto=format&fit=crop',
  'Water': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=800&auto=format&fit=crop',
  'Juice': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
  'Cigarettes': 'https://images.unsplash.com/photo-1533558110531-29471ab7911b?q=80&w=800&auto=format&fit=crop',
  'Ciders': 'https://images.unsplash.com/photo-1610452336306-0371900f0aa3?q=80&w=800&auto=format&fit=crop',
  'Premium': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop',
};

async function main() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    let newImage = imageMap[p.name];
    
    if (!newImage) {
      for (const cat in fallbacks) {
        if (p.category.includes(cat) || p.name.includes(cat)) {
          newImage = fallbacks[cat];
          break;
        }
      }
    }
    
    if (!newImage) {
       newImage = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop';
    }

    if (p.imageUrl !== newImage) {
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: newImage }
      });
      console.log(`Updated [${p.category}] ${p.name} -> ${newImage.substring(0,60)}...`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
