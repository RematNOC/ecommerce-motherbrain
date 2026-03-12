"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Package, DollarSign, Activity, Search, Filter, X, Loader2, CheckCircle2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function PolarisAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', price_dollars: '', sku: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let imageUrl = '';

    // 1. Upload the Image to Supabase Storage (if selected)
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    // 2. Save the Product Data
    const centsValue = Math.round(parseFloat(formData.price_dollars) * 100);
    const { error } = await supabase.from('products').insert([{
      title: formData.title,
      price_cents: centsValue,
      sku: formData.sku,
      image_url: imageUrl,
      is_active: true
    }]);
    
    setIsSubmitting(false);
    if (!error) {
      setIsModalOpen(false);
      setFormData({ title: '', price_dollars: '', sku: '' });
      setImageFile(null);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F2F4] text-[#1A1C1D] font-sans pb-24">
      {/* Top Nav */}
      <nav className="bg-white border-b border-[#E1E3E5] px-8 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-1.5 rounded-md"><Package size={18} /></div>
          <span className="font-bold text-sm tracking-tight">MotherBrain <span className="text-[#6D7175] font-normal">/ Products</span></span>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto mt-8 px-8">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-xl font-bold">Products</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
            <Plus size={16} /> Add product
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-[#E1E3E5] shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#6D7175] text-xs font-medium mb-1 uppercase tracking-wider"><Package size={16}/> Total Inventory</div>
            <div className="text-xl font-bold">{products.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E1E3E5] shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#6D7175] text-xs font-medium mb-1 uppercase tracking-wider"><Activity size={16}/> Active Storefronts</div>
            <div className="text-xl font-bold">1</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E1E3E5] shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#6D7175] text-xs font-medium mb-1 uppercase tracking-wider"><CheckCircle2 size={16} className="text-[#008060]"/> Vault Status</div>
            <div className="text-xl font-bold">Synced</div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl border border-[#E1E3E5] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E1E3E5] flex gap-2 bg-white">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 text-[#6D7175]" size={16} />
              <input type="text" placeholder="Filter products" className="w-full pl-10 pr-4 py-2 bg-white border border-[#8C9196] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#008060] transition-all" />
            </div>
            <button className="px-4 py-2 border border-[#8C9196] rounded-md text-sm font-semibold hover:bg-[#F6F6F7] flex items-center gap-2 transition-colors"><Filter size={14}/> Status</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#F6F6F7] text-[#6D7175] text-xs font-semibold uppercase tracking-wider border-b border-[#E1E3E5]">
                  <th className="px-6 py-3 font-semibold w-12"></th>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">SKU</th>
                  <th className="px-6 py-3 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E3E5]">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#6D7175]" /></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-[#6D7175] text-sm">No products found in the vault.</td></tr>
                ) : products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F6F6F7] transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover rounded-md border border-[#E1E3E5]" />
                      ) : (
                        <div className="w-10 h-10 bg-[#EBEBEB] rounded-md border border-[#E1E3E5] flex items-center justify-center"><ImageIcon size={16} className="text-[#8C9196]" /></div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-[#202223] group-hover:underline">{p.title}</td>
                    <td className="px-6 py-4"><span className="bg-[#E3F1DF] text-[#008060] text-[11px] px-2.5 py-0.5 rounded-full font-bold">Active</span></td>
                    <td className="px-6 py-4 text-sm text-[#6D7175] font-mono">{p.sku}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right">${(p.price_cents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1c1d]/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-[#E1E3E5]">
              <div className="px-6 py-4 border-b border-[#E1E3E5] flex justify-between items-center bg-[#F6F6F7]">
                <h2 className="font-bold text-base">Add Product</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[#6D7175] hover:text-black transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                {/* Image Uploader */}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#202223]">Product Media</label>
                  <label className="border-2 border-dashed border-[#8C9196] hover:border-[#008060] bg-[#F6F6F7] hover:bg-white transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-[#6D7175] mb-2" />
                    <span className="text-sm font-medium text-[#202223]">
                      {imageFile ? imageFile.name : "Click to upload image"}
                    </span>
                    <span className="text-xs text-[#6D7175] mt-1">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setImageFile(e.target.files[0]); }} />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#202223]">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full border border-[#8C9196] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#008060] outline-none transition-shadow" placeholder="e.g. Titanium Keycap" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#202223]">Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-[#6D7175]" size={14} />
                      <input required value={formData.price_dollars} onChange={e => setFormData({...formData, price_dollars: e.target.value})} type="number" step="0.01" min="0" className="w-full border border-[#8C9196] rounded-md pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#008060] transition-shadow" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[#202223]">SKU</label>
                    <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} type="text" className="w-full border border-[#8C9196] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#008060] transition-shadow" placeholder="SKU-123" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-[#E1E3E5] mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[#8C9196] rounded-md text-sm font-semibold hover:bg-[#F6F6F7] transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-[#008060] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#006e52] disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Uploading...' : 'Save product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
