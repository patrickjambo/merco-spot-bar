"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?includeSales=true");
      const data = await res.json();
      // Ensure strict alphabetical sorting regardless of case
      const sorted = data.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      setProducts(sorted);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_SIZE = 500;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64String = canvas.toDataURL('image/jpeg', 0.8);
          setFormData((prev: any) => ({ ...prev, imageUrl: base64String }));
        }
        setUploadingImage(false);
      };
      
      img.onerror = () => {
        alert("Failed to parse image.");
        setUploadingImage(false);
      };
      
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    
    reader.onerror = () => {
      alert("Failed to read file.");
      setUploadingImage(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  const handleEditClick = (product: any) => {
    setIsEditing(product.id);
    setFormData(product);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/products/${isEditing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pricePerUnit: Number(formData.pricePerUnit),
          pricePerPacket: Number(formData.pricePerPacket),
          stockUnits: Number(formData.stockUnits),
          packetSize: Number(formData.packetSize)
        }),
      });
      if (res.ok) {
        setIsEditing(null);
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to update product", error);
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pricePerUnit: Number(formData.pricePerUnit || 0),
          pricePerPacket: Number(formData.pricePerPacket || 0),
          stockUnits: Number(formData.stockUnits || 0),
          packetSize: Number(formData.packetSize || 1)
        }),
      });
      if (res.ok) {
        setIsAdding(false);
        setFormData({});
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to create product", error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const uniqueNames = Array.from(new Set(products.map(p => p.name).filter(Boolean)));

  const totalStockRemain = products.reduce((acc, p) => acc + p.stockUnits, 0);
  const totalUnitsSold = products.reduce((acc, p) => acc + (p.unitsSold || 0), 0);
  const totalRevenue = products.reduce((acc, p) => acc + (p.revenue || 0), 0);
  const totalStockValue = products.reduce((acc, p) => acc + (p.stockUnits * p.pricePerUnit), 0);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Product Management</h1>
          <div className="flex gap-4 text-sm mt-2">
            <Link href="/admin/dashboard" className="text-amber-600 hover:underline">← Back to Dashboard</Link>
            <span className="text-zinc-500">|</span>
            <Link href="/menu" target="_blank" className="text-amber-600 hover:underline">View Public Menu ↗</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsAdding(true); setFormData({}); }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded shadow"
          >
            + Add New Product
          </button>
          <LogoutButton />
        </div>
      </header>

      <datalist id="category-list">
        {uniqueCategories.map((c: any) => <option key={c} value={c} />)}
      </datalist>
      <datalist id="brand-list">
        {uniqueBrands.map((b: any) => <option key={b} value={b} />)}
      </datalist>
      <datalist id="name-list">
        {uniqueNames.map((n: any) => <option key={n} value={n} />)}
      </datalist>

      {/* Summary Metrics Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Stock Remaining</p>
            <p className="text-3xl font-black text-zinc-900 dark:text-white">{totalStockRemain} <span className="text-sm font-medium text-zinc-500">items</span></p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Sold (All Time)</p>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-500">{totalUnitsSold} <span className="text-sm font-medium text-zinc-500">units</span></p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue (All Time)</p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-500 whitespace-nowrap">{totalRevenue.toLocaleString()} <span className="text-sm font-medium text-zinc-500">RWF</span></p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Est. Stock Value</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500 whitespace-nowrap">{totalStockValue.toLocaleString()} <span className="text-sm font-medium text-zinc-500">RWF</span></p>
          </div>
        </div>
      )}

      {/* Advanced Search Auto-Complete Box */}
      <div className="mb-6 relative max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search product by name or letter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input list="name-list" type="text" placeholder="Name" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input list="category-list" type="text" placeholder="Category" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} />
            <input list="brand-list" type="text" placeholder="Brand" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} />
            <input type="number" placeholder="Price/Unit (RWF)" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.pricePerUnit || ''} onChange={e => setFormData({...formData, pricePerUnit: e.target.value})} />
            <input type="number" placeholder="Price/Packet (RWF)" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.pricePerPacket || ''} onChange={e => setFormData({...formData, pricePerPacket: e.target.value})} />
            <input type="number" placeholder="Packet Size" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.packetSize || ''} onChange={e => setFormData({...formData, packetSize: e.target.value})} />
            <input type="number" placeholder="Stock Units" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.stockUnits || ''} onChange={e => setFormData({...formData, stockUnits: e.target.value})} />
            
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Product Image</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Image URL (Or Auto-generated)" className="flex-1 border p-2 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                <label className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer font-medium whitespace-nowrap">
                  {uploadingImage ? 'Uploading...' : 'Upload File'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 md:col-span-2 pt-6">
              <input type="checkbox" id="addIsActive" checked={formData.isActive ?? true} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              <label htmlFor="addIsActive" className="text-zinc-900 dark:text-white cursor-pointer font-bold">Active Product (Visible on POS)</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow">Save Product</button>
            <button onClick={() => setIsAdding(false)} className="bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-medium px-6 py-2 rounded text-zinc-900 dark:text-zinc-100">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-10 text-zinc-500 animate-pulse font-medium">Loading products database...</p>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price (Unit)</th>
                  <th className="px-4 py-3">Price (Packet)</th>
                  <th className="px-4 py-3">Stock remaining</th>
                  <th className="px-4 py-3">Units Sold</th>
                  <th className="px-4 py-3">Revenue Made</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-500">No products found matching "{searchQuery}"</td></tr>
                )}
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    {isEditing === product.id ? (
                      <td colSpan={9} className="px-4 py-6 bg-amber-50/50 dark:bg-amber-900/10">
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold">Product Name</label>
                            <input list="name-list" type="text" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold">Category</label>
                            <input list="category-list" type="text" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold">Unit Price</label>
                            <input type="number" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500" value={formData.pricePerUnit} onChange={e => setFormData({...formData, pricePerUnit: e.target.value})} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold">Packet Price</label>
                            <input type="number" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500" value={formData.pricePerPacket} onChange={e => setFormData({...formData, pricePerPacket: e.target.value})} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold">Stock Count</label>
                            <input type="number" className="border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500" value={formData.stockUnits} onChange={e => setFormData({...formData, stockUnits: e.target.value})} />
                          </div>
                          
                          <div className="flex flex-col gap-1 md:col-span-3">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold">Image Source (URL or File)</label>
                            <div className="flex gap-2">
                              <input type="text" className="flex-1 border p-2 rounded w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Image URL" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                              <label className="flex items-center justify-center px-4 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer font-bold text-sm whitespace-nowrap">
                                {uploadingImage ? 'Uploading...' : 'Upload File'}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-5">
                            <input type="checkbox" id="editIsActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 cursor-pointer accent-amber-500" />
                            <label htmlFor="editIsActive" className="text-zinc-900 dark:text-white font-bold cursor-pointer">Active in POS</label>
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end items-center mt-2 border-t border-amber-200 dark:border-amber-900/30 pt-4">
                          <button onClick={() => setIsEditing(null)} className="px-5 py-2 font-medium bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded text-zinc-900 dark:text-white transition-colors">Cancel</button>
                          <button onClick={handleSave} className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm transition-colors">Save Changes</button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white flex items-center gap-3 min-w-[200px]">
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] font-normal text-zinc-400">No Pic</span>}
                          </div>
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{product.category}</td>
                        <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200">{product.pricePerUnit.toLocaleString()} RWF</td>
                        <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200">{product.pricePerPacket?.toLocaleString()} RWF</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-black shadow-sm border ${product.stockUnits <= product.minStockThreshold ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400' : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:border-green-900/50 dark:text-green-400'}`}>
                            {product.stockUnits} in stock
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {product.unitsSold || 0}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {(product.revenue || 0).toLocaleString()} RWF
                        </td>
                        <td className="px-4 py-3">
                          {product.isActive ? (
                            <span className="text-green-600 dark:text-green-500 text-xs font-black uppercase tracking-wider">Active</span>
                          ) : (
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Hidden</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold mr-4 transition-colors">Edit</button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-bold transition-colors">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}