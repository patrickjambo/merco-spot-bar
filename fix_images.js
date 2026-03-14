const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imageMap = {
  // Beers
  'Heineken': 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=600&q=80',
  'Amstel': 'https://images.unsplash.com/photo-1605337046162-841fbd6d3ba4?w=600&q=80', // generic beer
  'Primus Beer': 'https://images.unsplash.com/photo-1575037614876-c385cb80ca8c?w=600&q=80', 
  'Skol Beer': 'https://images.unsplash.com/photo-1563514995-171120023a10?w=600&q=80',
  'Skol Lager': 'https://images.unsplash.com/photo-1542317148-8b4bdccaacaa?w=600&q=80',
  'Virunga': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=80',
  'Red Bull': 'https://images.unsplash.com/photo-1596706917711-2df82fc9bb9d?w=600&q=80', // energy drink
  'Desperados': 'https://images.unsplash.com/photo-1610452336306-0371900f0aa3?w=600&q=80',
  
  // Soft Drinks & Water
  'Fanta': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
  'Inyange Water': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80',
  'Petit Mitzing': 'https://images.unsplash.com/photo-1610873167013-2dd675d30ef4?w=600&q=80',
  'Big Mitzing': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80',
  'Inyange Juice': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
  
  // Vodka
  'Smirnoff Ice': 'https://images.unsplash.com/photo-1574514588720-dcee49b38fa1?w=600&q=80',
  'Smirnoff Quarter': 'https://images.unsplash.com/photo-1614316311894-399fb19ff296?w=600&q=80',
  'Smirnoff 1L': 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=600&q=80',
  'Absolute Vodka': 'https://images.unsplash.com/photo-1612260655383-0ec35aff27b5?w=600&q=80',
  
  // Gin
  'Beefeater': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
  'Dry Gin': 'https://images.unsplash.com/photo-1609951651556-5324f6854124?w=600&q=80',
  'Gilbey': 'https://images.unsplash.com/photo-1563223707-16d41819e931?w=600&q=80',
  'Golden Gin': 'https://images.unsplash.com/photo-1551538827-0c7f201ddff0?w=600&q=80',
  
  // Whiskey
  'Jack Daniel': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80',
  'Black Label': 'https://images.unsplash.com/photo-1563514957-c3132e0bf4ec?w=600&q=80',
  'Jameson': 'https://images.unsplash.com/photo-1565554673859-9b93699e1d88?w=600&q=80',
  'Double Black': 'https://images.unsplash.com/photo-1582222010898-3238ea39caba?w=600&q=80',
  'Local Wiskey': 'https://images.unsplash.com/photo-1560508180-03f285f67eae?w=600&q=80',
  
  // Rum
  'Bacardi': 'https://images.unsplash.com/photo-1614316311910-18464fc5644d?w=600&q=80',
  'Camino': 'https://images.unsplash.com/photo-1512413917415-c28df95c4794?w=600&q=80',
  'Amarula': 'https://images.unsplash.com/photo-1610960533303-f36fb7153da1?w=600&q=80',

  // Wine
  'Red Wine': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80',
  'White Wine': 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=600&q=80',
  'Champagne': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&q=80',
  
  // Ciders
  'K Vant': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
  'Kony': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80',
  'Jagamaster': 'https://images.unsplash.com/photo-1508711003445-5658e46950ee?w=600&q=80',

  // Cigarettes
  'Dunhill': 'https://images.unsplash.com/photo-1533558110531-29471ab7911b?w=600&q=80',
  'Bond 7': 'https://images.unsplash.com/photo-1524317134375-9c8846c98aa2?w=600&q=80'
};

async function main() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    let newImage = null;
    
    // Exact matching over substring
    for (const key of Object.keys(imageMap)) {
      if (p.name.includes(key)) {
        newImage = imageMap[key];
        break;
      }
    }
    
    // Fallback based on category
    if (!newImage) {
      if (p.category.includes('Beer')) newImage = 'https://images.unsplash.com/photo-1538481199005-27dec80631f2?w=600&q=80';
      else if (p.category.includes('Vodka')) newImage = 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&q=80';
      else if (p.category.includes('Gin')) newImage = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80';
      else if (p.category.includes('Whiskey')) newImage = 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80';
      else if (p.category.includes('Wine')) newImage = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80';
      else if (p.category.includes('Water')) newImage = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80';
      else newImage = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80'; // generic drink
    }

    await prisma.product.update({
      where: { id: p.id },
      data: { imageUrl: newImage }
    });
    console.log(`Updated ${p.name} -> ${newImage}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
