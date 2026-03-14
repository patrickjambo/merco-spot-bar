"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const carouselItems = [
  {
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop",
    title1: "MERICO SPOT",
    title2: "BAR & GRILL",
    desc: "The ultimate destination for premium drinks, delicious food, and an unforgettable atmosphere."
  },
  {
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=2000&auto=format&fit=crop",
    title1: "EXCEPTIONAL",
    title2: "CUSTOMER CARE",
    desc: "Our customers are our first priority. We provide world-class service with a smile."
  },
  {
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2000&auto=format&fit=crop",
    title1: "VIBRANT",
    title2: "ATMOSPHERE",
    desc: "Feel the energy, enjoy the music, and make memories that will last a lifetime."
  },
  {
    image: "/logo.png",
    title1: "ALWAYS",
    title2: "HERE FOR YOU",
    desc: "Merico Spot Bar & Grill is here for you. We provide the perfect environment for all your unforgettable moments.",
    isLogo: true
  }
];


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

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[92vh] flex items-center justify-center bg-black overflow-hidden">
        {carouselItems.map((item, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {item.isLogo && <div className="absolute inset-0 bg-black"></div>}
            <div 
              className={`absolute inset-0 ${item.isLogo ? 'opacity-80 bg-contain bg-no-repeat' : 'opacity-50 bg-cover'} bg-center transition-transform duration-[10000ms] ease-linear transform hover:scale-110`}
              style={{ backgroundImage: `url('${item.image}')`, transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
            
            <div className="relative z-20 text-center px-4 h-full flex flex-col items-center justify-center">
              <h1 className={`text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg transition-transform duration-700 delay-100 ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {item.title1}<br className="md:hidden" /> <span className="text-yellow-500">{item.title2}</span>
              </h1>
              <p className={`text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto shadow-black drop-shadow-md transition-transform duration-700 delay-200 ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {item.desc}
              </p>
              
              <div className={`flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto transition-transform duration-700 delay-300 ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <Link 
                  href="/login" 
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-zinc-900 px-6 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Staff Login
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-yellow-500 w-8' : 'bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
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
