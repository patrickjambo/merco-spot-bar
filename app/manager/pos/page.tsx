"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { useSearchParams } from "next/navigation";

type Product = {
  id: string;
  name: string;
  category: string;
  pricePerUnit: number;
  pricePerPacket: number;
  packetSize: number;
  stockUnits: number;
  minStockThreshold: number;
};

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  saleType: "unit" | "packet";
};

function POSContent() {
  const searchParams = useSearchParams();
  const initialTable = searchParams.get("table") || "1";

  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(initialTable);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data: Product[] = await res.json();
          setProducts(data);
          const uniqueCats = Array.from(new Set(data.map(p => p.category)));
          if (uniqueCats.length > 0) {
            setCategories(["All", ...uniqueCats]);
          }
        }
      } catch (err) {
        console.error("Failed to load products", err);
      }
    }
    loadProducts();
  }, []);

  const addToCart = (product: Product, saleType: "unit" | "packet") => {
    setCart((prev) => {
      const price = saleType === "packet" ? product.pricePerPacket : product.pricePerUnit;
      const cartItemId = `${product.id}-${saleType}`;
      
      const existing = prev.find((c) => c.id === cartItemId);
      if (existing) {
        return prev.map((c) => (c.id === cartItemId ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { 
        id: cartItemId, 
        productId: product.id, 
        name: `${product.name} (${saleType})`, 
        price, 
        quantity: 1, 
        saleType 
      }];
    });
    // Open cart automatically on mobile if first item
    if (cart.length === 0) {
      setIsCartOpenMobile(true);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
    if (cart.length === 1) {
      setIsCartOpenMobile(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSendOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setIsSubmitting(true);
    
    try {
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        saleType: item.saleType
      }));

      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      
      if (res.ok) {
        if (selectedTable) {
           const savedTables = localStorage.getItem("merico_tables");
           if (savedTables) {
              const tables = JSON.parse(savedTables);
              const updatedTables = tables.map((t: any) => {
                 if (t.id === selectedTable || t.name.toLowerCase() === selectedTable.toLowerCase()) {
                    return { ...t, totalBill: (t.totalBill || 0) + total, status: "OCCUPIED" };
                 }
                 return t;
              });
              localStorage.setItem("merico_tables", JSON.stringify(updatedTables));
              window.dispatchEvent(new Event("storage"));
           }
        }
        
        alert(`✅ Order confirmed! Total: ${total.toLocaleString()} RWF`);
        setCart([]);
        setIsCartOpenMobile(false);
        
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) {
          const freshData = await productsRes.json();
          setProducts(freshData);
        }
        
        window.location.href = "/manager/tables";
      } else {
        alert(`❌ Transaction Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("System error communicating with the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-[100dvh] w-full bg-zinc-100 dark:bg-zinc-950 flex flex-col overflow-hidden relative">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-3 lg:p-4 flex flex-wrap lg:flex-nowrap justify-between items-center z-10 shadow-sm gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/manager/dashboard" className="text-zinc-500 hover:text-zinc-900 border border-zinc-300 rounded px-2 lg:px-3 py-1 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap">
            &larr; Back<span className="hidden sm:inline"> to Dashboard</span>
          </Link>
          <h1 className="text-lg lg:text-xl font-bold dark:text-white hidden sm:block">Record Sale</h1>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 lg:px-3 py-1 lg:mr-4 border border-zinc-200 dark:border-zinc-700 focus-within:border-yellow-500 transition-colors flex-1 lg:flex-none">
            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm px-2 w-full lg:w-48 text-zinc-900 dark:text-white placeholder-zinc-500"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-sm font-medium dark:text-zinc-300 hidden sm:block">Table:</label>
            <select 
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md py-1 px-2 !outline-none text-zinc-900 dark:text-white text-sm lg:py-1.5"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              {["1","2","3","4","5","bar","vip1","vip2"].map(t => (
                <option key={t} value={t}>Table {t}</option>
              ))}
            </select>
          </div>
          <div className="pl-2 border-l border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Left Side: Menu Selection */}
        <div className="flex-1 flex flex-col pt-3 lg:pt-4 overflow-hidden w-full lg:w-auto">
          {/* Categories Horizontal Scroll */}
          <div className="flex overflow-x-auto lg:flex-wrap gap-2 px-3 lg:px-6 mb-3 shrink-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-bold transition-all shadow-sm text-[13px] lg:text-sm whitespace-nowrap ${
                  activeCategory === cat 
                    ? "bg-yellow-500 text-black border-2 border-yellow-600"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className={`flex-1 overflow-y-auto px-3 lg:px-6 pb-24 lg:pb-6 ${isCartOpenMobile ? 'hidden lg:block' : 'block'}`}>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 lg:p-4 flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-all h-[150px] lg:h-[180px]"
                >
                  <div className="w-full flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-1">
                       <p className="font-bold text-sm lg:text-base text-zinc-900 dark:text-white truncate" title={item.name}>{item.name}</p>
                       <span className="text-[10px] lg:text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mt-1 inline-block truncate max-w-full">
                         {item.category}
                       </span>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className={`text-[10px] lg:text-xs font-bold px-1.5 py-0.5 rounded-md ${item.stockUnits <= item.minStockThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {item.stockUnits} left
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full mt-auto mb-0.5">
                    <button 
                      onClick={() => addToCart(item, 'unit')}
                      className="w-full py-1.5 lg:py-2 flex justify-between items-center px-2 lg:px-4 bg-zinc-100 hover:bg-yellow-100 dark:bg-zinc-800 dark:hover:bg-yellow-900/40 text-zinc-800 dark:text-zinc-200 font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors"
                    >
                      <span className="text-[10px] lg:text-xs uppercase tracking-wider">Add Unit</span>
                      <span className="text-xs lg:text-sm">{item.pricePerUnit.toLocaleString()}</span>
                    </button>
                    {item.packetSize > 1 && (
                      <button 
                        onClick={() => addToCart(item, 'packet')}
                        className="w-full py-1.5 lg:py-2 flex justify-between items-center px-2 lg:px-4 bg-zinc-100 hover:bg-yellow-100 dark:bg-zinc-800 dark:hover:bg-yellow-900/40 text-zinc-800 dark:text-zinc-200 font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors"
                      >
                        <span className="text-[10px] lg:text-xs uppercase tracking-wider">Add Pack</span>
                        <span className="text-xs lg:text-sm">{item.pricePerPacket.toLocaleString()}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500">
                  <svg className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm lg:text-lg">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Order Ticket / Checkout Cart */}
        <div className={`${isCartOpenMobile ? 'flex absolute inset-0 z-30' : 'hidden'} lg:flex lg:relative w-full lg:w-[400px] lg:min-w-[350px] h-full bg-white dark:bg-zinc-900 lg:border-l border-zinc-200 dark:border-zinc-800 flex-col shadow-2xl shrink-0`}>
          <div className="p-3 lg:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-white">Current Order</h2>
              <p className="text-xs lg:text-sm text-zinc-500 font-medium">Table {selectedTable}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 px-2 lg:px-3 py-1 rounded font-bold text-xs lg:text-sm">
                #{cart.length > 0 ? Math.floor(Math.random() * 90000) + 10000 : '----'}
              </div>
              <button 
                onClick={() => setIsCartOpenMobile(false)}
                className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg bg-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <svg className="w-12 h-12 lg:w-16 lg:h-16 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p className="font-medium text-sm lg:text-lg">Your cart is empty</p>
                <p className="text-xs mt-1">Select items from the menu to start</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-2 lg:p-3 gap-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-[13px] lg:text-sm text-zinc-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-zinc-500 text-[11px] lg:text-xs">{item.price.toLocaleString()} RWF / ea</p>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 justify-end shrink-0">
                    <span className="font-bold px-2 py-1 lg:px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs">
                      x{item.quantity}
                    </span>
                    <p className="font-bold w-[65px] lg:w-[75px] text-right text-zinc-900 dark:text-yellow-500 text-[13px] lg:text-sm">
                      {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 lg:p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-md ml-1 transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-5 h-5 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals & Action */}
          <div className="p-3 lg:p-5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 space-y-3 lg:space-y-4 shrink-0 pb-6 lg:pb-5">
            <div className="flex justify-between items-end">
              <span className="text-zinc-500 font-medium pb-0.5 text-sm lg:text-base">Total Amount</span>
              <span className="text-2xl lg:text-3xl font-extrabold text-green-600 dark:text-green-500">
                {total.toLocaleString()} <span className="text-sm lg:text-lg">RWF</span>
              </span>
            </div>
            <button 
              onClick={handleSendOrder}
              disabled={cart.length === 0 || isSubmitting}
              className={`w-full py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all flex justify-center items-center gap-2 ${
                cart.length === 0 || isSubmitting
                  ? "bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-lg active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Confirm & Send Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating View Cart Button on Mobile */}
      {!isCartOpenMobile && cart.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 lg:hidden z-20">
          <button 
            onClick={() => setIsCartOpenMobile(true)}
            className="w-full bg-zinc-900 border-2 border-yellow-500 text-white p-4 rounded-xl shadow-2xl font-bold flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <span className="bg-yellow-500 text-zinc-900 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
              <span>View Order</span>
            </div>
            <span className="text-yellow-400">{total.toLocaleString()} RWF &rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] w-full bg-zinc-100 flex items-center justify-center p-6"><p>Loading POS...</p></div>}>
      <POSContent />
    </Suspense>
  );
}
