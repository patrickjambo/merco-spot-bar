"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const carouselItems = [
  {
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop",
    title1: "MERICO SPOT",
    title2: "BAR & GRILL",
    desc: "The ultimate destination for premium drinks, delicious food, and an unforgettable atmosphere.",
  },
  {
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=2000&auto=format&fit=crop",
    title1: "EXCEPTIONAL",
    title2: "CUSTOMER CARE",
    desc: "Our customers are our first priority. We provide world-class service with a smile.",
  },
  {
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2000&auto=format&fit=crop",
    title1: "VIBRANT",
    title2: "ATMOSPHERE",
    desc: "Feel the energy, enjoy the music, and make memories that will last a lifetime.",
  },
  {
    image: "/logo.png",
    title1: "ALWAYS",
    title2: "HERE FOR YOU",
    desc: "Merico Spot Bar & Grill is here for you. We provide the perfect environment for all your unforgettable moments.",
    isLogo: true,
  },
];

export default function HomeHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[92vh] flex items-center justify-center bg-black overflow-hidden">
      {carouselItems.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {item.isLogo && <div className="absolute inset-0 bg-black"></div>}
          <div
            className={`absolute inset-0 ${item.isLogo ? "opacity-80 bg-contain bg-no-repeat" : "opacity-50 bg-cover"} bg-center transition-transform duration-[10000ms] ease-linear transform hover:scale-110`}
            style={{ backgroundImage: `url('${item.image}')`, transform: index === currentIndex ? "scale(1.05)" : "scale(1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>

          <div className="relative z-20 text-center px-4 h-full flex flex-col items-center justify-center">
            <h1 className={`text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg transition-transform duration-700 delay-100 ${index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              {item.title1}
              <br className="md:hidden" /> <span className="text-yellow-500">{item.title2}</span>
            </h1>
            <p className={`text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto shadow-black drop-shadow-md transition-transform duration-700 delay-200 ${index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              {item.desc}
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto transition-transform duration-700 delay-300 ${index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              <Link
                href="/menu"
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-zinc-900 px-6 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                View Menu
              </Link>
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
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
            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-yellow-500 w-8" : "bg-white/50 hover:bg-white/80"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
