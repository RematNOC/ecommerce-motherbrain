"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Package, DollarSign, Activity, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function AdminPortal() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Upgraded: We now track price_dollars instead of price_cents in the form
  const [formData, setFormData] = useState({ title: '', price_dollars: '', sku: '' });

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    if (error) console.error("Fetch error:", error);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // THE MAGIC: Convert the dollar string (e.g. "10.50") into an integer of cents (1050)
    const centsValue = Math.round(parseFloat(formData.price_dollars) * 100);

    const { error } = await supabase.from('products').insert([{
      title: formData.title,
      price_cents: centsValue,
      sku: formData.sku,
      is_active: true
    }]);
    
    setIsSubmitting(false);
    if (!error) {
      setIsModalOpen(false);
      setFormData({ title: '', price_dollars: '', sku: '' });
      fetchProducts();
    } else {
      alert("Database Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8 font-mono">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase">MotherBrain Portal</h1>
          <p className="text-white/40 text-xs">V4.1 // Live Uplink // Auto-Math</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 hover:bg-white/90 transition-all text-sm font-bold uppercase tracking-widest"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-white/10 p-6 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-white/40 mb-2 uppercase text-[10px] tracking-widest">
            <Package size={14} /> Total Inventory
          </div>
          <div className="text-3xl font-bold">{products.length}</div>
        </div>
        <div className="border border-white/10 p-6 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-white/40 mb-2 uppercase text-[10px] tracking-widest">
            <DollarSign size={14} /> System Status
          </div>
          <div className="text-3xl font-bold text-[#00FF00]">ONLINE</div>
        </div>
        <div className="border border-white/10 p-6 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-white/40 mb-2 uppercase text-[10px] tracking-widest">
            <Activity size={14} /> Database
          </div>
          <div className="text-3xl font-bold">SYNCED</div>
        </div>
      </div>

      <div className="border border-white/10 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.03] text-white/40 text-[10px] uppercase tracking-widest border-b border-white/10">
              <th className="px-6 py-4 font-normal">Product</th>
              <th className="px-6 py-4 font-normal text-right">SKU</th>
              <th className="px-6 py-4 font-normal text-right">Price</th>
              <th className="px-6 py-4 font-normal text-right">Stock</th>
              <th className="px-6 py-4 font-normal text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-24 text-white/40"><Loader2 className="animate-spin mx-auto" /></td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-24 text-white/40 font-bold tracking-widest uppercase">Vault Empty. Awaiting Input.</td>
              </tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-white/10 hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-4"><span className="font-bold text-sm">{p.title}</span></td>
                <td className="px-6 py-4 text-right"><span className="text-xs text-white/40">{p.sku}</span></td>
                <td className="px-6 py-4 text-right font-bold text-sm">${(p.price_cents / 100).toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-bold text-sm">{p.inventory_count}</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-[#00FF00]/10 text-[#00FF00] text-[10px] px-2 py-0.5 border border-[#00FF00]/20 font-bold uppercase tracking-wider">
                    {p.is_active ? 'Active' : 'Offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-[#000] border border-white/10 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold uppercase tracking-tighter">Add New Product</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40" placeholder="Product name..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Price (USD)</label>
                    <input required step="0.01" min="0" value={formData.price_dollars} onChange={e => setFormData({...formData, price_dollars: e.target.value})} type="number" className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40" placeholder="e.g. 10.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-white/40 tracking-widest font-bold">SKU</label>
                    <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} type="text" className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40" placeholder="SKU-..." />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black py-4 font-bold uppercase tracking-[0.2em] text-sm mt-4 hover:invert transition-all disabled:opacity-50">
                  {isSubmitting ? 'Transmitting...' : 'Initialize Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
