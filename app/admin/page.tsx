"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Package, DollarSign, Activity, Search, Filter, X, Loader2, CheckCircle2, Image as ImageIcon, UploadCloud, LayoutTemplate, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function PolarisAdmin() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
  const MASTER_PASSCODE = '0000'; // Change this to your secret PIN

  // Dashboard State
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', price_dollars: '', sku: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // CMS State
  const [settings, setSettings] = useState({ hero_heading: '', hero_subheading: '', hero_image_url: '' });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (passcode === MASTER_PASSCODE) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setAuthError(true);
      setPasscode('');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pData) setProducts(pData);
    const { data: sData } = await supabase.from('store_settings').select('*').eq('id', 1).single();
    if (sData) setSettings(sData);
    setIsLoading(false);
  };

  const handleProductSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    let imageUrl = '';
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `product_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data: uploadData, error } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (!error && uploadData) {
        imageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
      }
    }
    const centsValue = Math.round(parseFloat(formData.price_dollars) * 100);
    await supabase.from('products').insert([{ title: formData.title, price_cents: centsValue, sku: formData.sku, image_url: imageUrl, is_active: true }]);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ title: '', price_dollars: '', sku: '' });
    setImageFile(null);
    fetchData();
  };

  const handleSettingsSubmit = async (e: any) => {
    e.preventDefault();
    setIsSavingSettings(true);
    let newImageUrl = settings.hero_image_url;
    if (bannerFile) {
      const fileExt = bannerFile.name.split('.').pop();
      const fileName = `banner_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data: uploadData, error } = await supabase.storage.from('product-images').upload(fileName, bannerFile);
      if (!error && uploadData) {
        newImageUrl = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
      }
    }
    await supabase.from('store_settings').update({ hero_heading: settings.hero_heading, hero_subheading: settings.hero_subheading, hero_image_url: newImageUrl }).eq('id', 1);
    setSettings({ ...settings, hero_image_url: newImageUrl });
    setBannerFile(null);
    setIsSavingSettings(false);
    alert('Storefront updated successfully!');
  };

  // ------------------------------------------------------------------
  // 1. THE LOCK SCREEN
  // ------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A1C1D] flex flex-col items-center justify-center p-4 font-sans selection:bg-white selection:text-black">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-white w-5 h-5" />
            </div>
            <h1 className="text-white text-xl font-medium tracking-widest uppercase">MotherBrain</h1>
            <p className="text-[#6D7175] text-xs tracking-widest uppercase">Vault Authentication</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                autoFocus
                placeholder="ENTER PASSCODE" 
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setAuthError(false); }}
                className={`w-full bg-transparent border-b-2 px-0 py-3 text-center text-white text-lg tracking-[0.5em] focus:outline-none transition-colors ${authError ? 'border-red-500' : 'border-[#6D7175] focus:border-white'}`}
              />
            </div>
            {authError && <p className="text-red-500 text-[10px] text-center uppercase tracking-widest">Access Denied</p>}
            <button type="submit" className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
              Decrypt & Enter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 2. THE MOTHERBRAIN DASHBOARD (Only visible if authenticated)
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F1F2F4] text-[#1A1C1D] font-sans pb-24">
      {/* Top Nav */}
      <nav className="bg-white border-b border-[#E1E3E5] px-8 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-1.5 rounded-md"><Package size={18} /></div>
          <span className="font-bold text-sm tracking-tight">MotherBrain</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('inventory')} className={`text-sm font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-[#F1F2F4] text-black' : 'text-[#6D7175] hover:bg-[#F6F6F7]'}`}>Inventory</button>
          <button onClick={() => setActiveTab('storefront')} className={`text-sm font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'storefront' ? 'bg-[#F1F2F4] text-black' : 'text-[#6D7175] hover:bg-[#F6F6F7]'}`}><LayoutTemplate size={16}/> CMS</button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto mt-8 px-8">
        {activeTab === 'inventory' ? (
          <>
            <div className="flex justify-between items-end mb-6">
              <h1 className="text-xl font-bold">Products</h1>
              <button onClick={() => setIsModalOpen(true)} className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                <Plus size={16} /> Add product
              </button>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-xl border border-[#E1E3E5] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#F6F6F7] text-[#6D7175] text-xs font-semibold uppercase tracking-wider border-b border-[#E1E3E5]">
                    <th className="px-6 py-3 font-semibold w-12"></th>
                    <th className="px-6 py-3 font-semibold">Product</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E3E5]">
                  {isLoading ? <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#6D7175]" /></td></tr> : products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F6F6F7] transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        {p.image_url ? <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover rounded-md border border-[#E1E3E5]" /> : <div className="w-10 h-10 bg-[#EBEBEB] rounded-md border border-[#E1E3E5] flex items-center justify-center"><ImageIcon size={16} className="text-[#8C9196]" /></div>}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">{p.title}</td>
                      <td className="px-6 py-4"><span className="bg-[#E3F1DF] text-[#008060] text-[11px] px-2.5 py-0.5 rounded-full font-bold">Active</span></td>
                      <td className="px-6 py-4 text-sm font-bold text-right">${(p.price_cents / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6"><h1 className="text-xl font-bold">Storefront Settings</h1></div>
            <div className="bg-white rounded-xl border border-[#E1E3E5] shadow-sm p-6 max-w-2xl">
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#202223]">Hero Banner Image</label>
                  {settings.hero_image_url && !bannerFile && (
                    <div className="mb-4 relative h-48 w-full rounded-md overflow-hidden border border-[#E1E3E5]">
                      <img src={settings.hero_image_url} alt="Current Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="border-2 border-dashed border-[#8C9196] hover:border-[#008060] bg-[#F6F6F7] hover:bg-white transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-[#6D7175] mb-2" />
                    <span className="text-sm font-medium text-[#202223]">{bannerFile ? bannerFile.name : "Upload new seasonal banner"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files) setBannerFile(e.target.files[0]); }} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#202223]">Hero Heading</label>
                  <input value={settings.hero_heading} onChange={e => setSettings({...settings, hero_heading: e.target.value})} type="text" className="w-full border border-[#8C9196] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#008060] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[#202223]">Hero Subheading</label>
                  <input value={settings.hero_subheading} onChange={e => setSettings({...settings, hero_subheading: e.target.value})} type="text" className="w-full border border-[#8C9196] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#008060] outline-none" />
                </div>
                <div className="pt-4 border-t border-[#E1E3E5] flex justify-end">
                  <button type="submit" disabled={isSavingSettings} className="bg-[#008060] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#006e52] disabled:opacity-50">
                    {isSavingSettings ? 'Syncing to Storefront...' : 'Publish to Storefront'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1c1d]/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-[#E1E3E5]">
              <div className="px-6 py-4 border-b border-[#E1E3E5] flex justify-between items-center bg-[#F6F6F7]">
                <h2 className="font-bold text-base">Add Product</h2>
                <button type="button" onClick={() => setIsModalOpen(false)}><X size={20} className="text-[#6D7175]" /></button>
              </div>
              <form onSubmit={handleProductSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Product Media</label>
                  <label className="border-2 border-dashed border-[#8C9196] hover:border-[#008060] bg-[#F6F6F7] rounded-lg p-6 flex flex-col items-center cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-[#6D7175] mb-2" />
                    <span className="text-sm font-medium text-[#202223]">{imageFile ? imageFile.name : "Click to upload image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files) setImageFile(e.target.files[0]); }} />
                  </label>
                </div>
                <div><label className="block text-sm font-medium mb-1.5">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full border border-[#8C9196] rounded-md px-3 py-2 text-sm outline-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">Price (USD)</label><input required value={formData.price_dollars} onChange={e => setFormData({...formData, price_dollars: e.target.value})} type="number" step="0.01" className="w-full border border-[#8C9196] rounded-md px-3 py-2 text-sm outline-none" /></div>
                  <div><label className="block text-sm font-medium mb-1.5">SKU</label><input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} type="text" className="w-full border border-[#8C9196] rounded-md px-3 py-2 text-sm outline-none" /></div>
                </div>
                <div className="flex justify-end pt-4 border-t border-[#E1E3E5]"><button type="submit" disabled={isSubmitting} className="bg-[#008060] text-white px-4 py-2 rounded-md text-sm font-semibold">{isSubmitting ? 'Uploading...' : 'Save product'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
