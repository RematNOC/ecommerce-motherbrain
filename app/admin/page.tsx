"use client";

import React, { useState } from 'react';
import { Plus, Package, DollarSign, Activity, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PRODUCTS = [
  { id: '1', title: 'Cyberpunk Hoodie', price_cents: 8500, sku: 'CB-H-001', inventory_count: 42, is_active: true },
  { id: '2', title: 'Onyx Ring', price_cents: 12000, sku: 'ONX-R-001', inventory_count: 12, is_active: true },
  { id: '3', title: 'Neural Uplink V2', price_cents: 45000, sku: 'NU-V2-88', inventory_count: 5, is_active: true },
  { id: '4', title: 'Carbon Fiber Case', price_cents: 4500, sku: 'CF-C-12', inventory_count: 156, is_active: true },
  { id: '5', title: 'Obsidian Blade', price_cents: 22000, sku: 'OBS-B-07', inventory_count: 3, is_active: true },
];

export default function AdminPortal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white p-8 font-mono">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase">MotherBrain Portal</h1>
          <p className="text-white/40 text-xs">V4.0 // Headless E-Commerce Engine</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2 hover:bg-white/90 transition-all text-sm font-bold uppercase tracking-widest">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-white/10 p-6 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-white/40 mb-2 uppercase text-[10px] tracking-widest"><Package size={14} /> Total Inventory</div>
          <div className="text-3xl font-bold">218</div>
        </div>
        <div className="border border-white/10 p-6 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-white/40 mb-2 uppercase text-[10px] tracking-widest"><DollarSign size={14} /> Revenue (30d)</div>
          <div className="text-3xl font-bold">$14,204.00</div>
        </div>
        <div className="border border-white/10 p-6 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-white/40 mb-2 uppercase text-[10px] tracking-widest"><Activity size={14} /> Live Sessions</div>
          <div className="text-3xl font-bold">42</div>
        </div>
      </div>

      <div className="border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.03] text-white/40 text-[10px] uppercase tracking-widest border-b border-white/10">
              <th className="px-6 py-4 font-normal">Product</th>
              <th className="px-6 py-4 font-normal text-right">SKU</th>
              <th className="px-6 py-4 font-normal text-right">Price</th>
              <th className="px-6 py-4 font-normal text-right">Stock</th>
              <th className="px-6 py-4 font-normal text-center">Status</th>
              <th className="px-6 py-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PRODUCTS.map((p) => (
              <tr key={p.id} className="border-b border-white/10 hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-4"><span className="font-bold text-sm">{p.title}</span></td>
                <td className="px-6 py-4 text-right"><span className="text-xs text-white/40">{p.sku}</span></td>
                <td className="px-6 py-4 text-right font-bold text-sm">$ {(p.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-right font-bold text-sm">{p.inventory_count}</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-[#00FF00]/10 text-[#00FF00] text-[10px] px-2 py-0.5 border border-[#00FF00]/20 font-bold uppercase tracking-wider">Active</span>
                </td>
                <td className="px-6 py-4 text-right"><ChevronRight size={16} className="text-white/20 group-hover:text-white transition-all ml-auto cursor-pointer" /></td>
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
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Title</label>
                  <input type="text" className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40" placeholder="Product name..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Price (Cents)</label>
                    <input type="number" className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-white/40 tracking-widest font-bold">SKU</label>
                    <input type="text" className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40" placeholder="SKU-..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Image Upload</label>
                  <div className="border-2 border-dashed border-white/10 py-12 text-center text-xs text-white/20 hover:border-white/40 transition-all cursor-pointer">DROP ASSETS HERE OR CLICK TO BROWSE</div>
                </div>
                <button className="w-full bg-white text-black py-4 font-bold uppercase tracking-[0.2em] text-sm mt-4 hover:invert transition-all">Initialize Product</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
