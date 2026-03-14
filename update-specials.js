const fs = require('fs');

let page = fs.readFileSync('app/page.tsx', 'utf8');

const specialItems = `
const specialItems = [
  {
    title: "Signature Cocktails",
    desc: "Expertly crafted drinks mixed perfectly by our professional bartenders to light up your night.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Gourmet Grills",
    desc: "Mouth-watering grilled specials, from juicy burgers to premium steak cuts, seasoned to perfection.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Ice Cold Drafts",
    desc: "A wide selection of local and imported beers on tap, served at the absolute perfect temperature.",
    image: "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Premium Wines",
    desc: "An exquisite collection of vintage and reserve wines to perfectly complement your evening.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Exclusive Whiskey",
    desc: "Aged to perfection, our top-shelf whiskey selection offers a smooth and rich tasting experience.",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Home() {`;

page = page.replace('export default function Home() {', specialItems);

const sectionOld = `{/* Featured Products Section */}
      <section id="products" className="w-full py-20 px-6 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Specials</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Item 1 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <div className="h-64 bg-gray-300 relative">
                <Image src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop" alt="Signature Cocktails" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Signature Cocktails</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Expertly crafted drinks mixed perfectly by our professional bartenders to light up your night.</p>
              </div>
            </div>
            {/* Item 2 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <div className="h-64 bg-gray-300 relative">
                <Image src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop" alt="Grilled Delights" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Gourmet Grills</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Mouth-watering grilled specials, from juicy burgers to premium steak cuts, seasoned to perfection.</p>
              </div>
            </div>
            {/* Item 3 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <div className="h-64 bg-gray-300 relative">
                <Image src="https://images.unsplash.com/photo-1600041162228-567406834b12?q=80&w=800&auto=format&fit=crop" alt="Tap Beers" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Ice Cold Drafts</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">A wide selection of local and imported beers on tap, served at the absolute perfect temperature.</p>
              </div>
            </div>
          </div>
        </div>
      </section>`;

const sectionNew = `{/* Featured Products Section */}
      <section id="products" className="w-full py-20 bg-zinc-50 dark:bg-zinc-950 overflow-hidden relative">
        <style>{\`
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
        \`}</style>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 relative z-10 inline-block bg-zinc-50 dark:bg-zinc-950 px-4">Our Specials</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full mt-2"></div>
          </div>
        </div>
        
        <div className="relative w-full">
          {/* Gradient fading edges for smoother look */}
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          
          <div className="animate-marquee gap-8 px-4 pb-8">
            {/* We duplicate the array to create a seamless infinite scroll loop */}
            {[...specialItems, ...specialItems].map((item, index) => (
              <div key={index} className="w-[350px] flex-shrink-0 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 mx-2">
                <div className="h-64 bg-gray-300 relative group">
                  <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>`;

page = page.replace(sectionOld, sectionNew);

fs.writeFileSync('app/page.tsx', page);
console.log("Updated!");
