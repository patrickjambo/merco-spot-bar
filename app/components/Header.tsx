// Header
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import "./HeaderWave.css";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full header-wave text-white px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(251,191,36,0.15)] transition-all">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image src="/logo.png" alt="Merico Spot Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-bold uppercase tracking-wider hidden sm:block text-wave">
              Merico Spot Bar & Grill
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-yellow-500 transition-colors">Home</Link>
          <Link href="/menu" className="hover:text-yellow-500 transition-colors text-yellow-500 font-bold">Menu</Link>
          <Link href="#products" className="hover:text-yellow-500 transition-colors">Our Products</Link>
          <Link href="#about" className="hover:text-yellow-500 transition-colors">About</Link>
          <Link href="#contact" className="hover:text-yellow-500 transition-colors">Contact</Link>
        </nav>

        {/* Staff Login Button */}
        <div className="flex items-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-semibold text-sm transition-colors"
          >
            Staff Login
          </button>
        </div>
      </header>

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">System Login</h2>
            <div className="flex flex-col gap-4">
              <Link 
                href="/manager/login" 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black text-center font-bold rounded-lg transition-colors"
              >
                Manager Login
              </Link>
              <Link 
                href="/admin/login" 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 text-center font-bold rounded-lg transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
