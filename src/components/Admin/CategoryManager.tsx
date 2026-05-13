import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Category } from '../../types';
import { Trash2, Plus, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newBgColor, setNewBgColor] = useState('#1e293b');
  const [newTextColor, setNewTextColor] = useState('#e2e8f0');
  const [siteTheme, setSiteTheme] = useState<{ bgColor: string; textColor: string } | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, bg_color as bgColor, text_color as textColor')
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      setCategories(data ?? []);
    };

    fetchCategories();

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
      .subscribe();

    return () => {
      categoriesChannel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchSiteTheme = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('bg_color as bgColor, text_color as textColor')
        .eq('id', 'site_theme')
        .single();

      if (error) {
        if (error.message !== 'Row not found') {
          console.error('Error loading site theme:', error);
        }
        return;
      }

      if (data) {
        setSiteTheme({ bgColor: data.bgColor, textColor: data.textColor });
      }
    };

    fetchSiteTheme();

    const settingsChannel = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchSiteTheme())
      .subscribe();

    return () => {
      settingsChannel.unsubscribe();
    };
  }, []);

  const handleUpdateSiteTheme = async (field: 'bgColor' | 'textColor', value: string) => {
    const payload = field === 'bgColor' ? { id: 'site_theme', bg_color: value } : { id: 'site_theme', text_color: value };

    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' });
    if (error) {
      toast.error('Failed to update site theme.');
      console.error('Supabase settings error:', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const { error } = await supabase.from('categories').insert({
      name: newCatName,
      bg_color: newBgColor,
      text_color: newTextColor,
    });

    if (error) {
      toast.error('Failed to add category.');
      console.error('Supabase add category error:', error);
      return;
    }

    setNewCatName('');
    toast.success('Category added.');
  };

  const handleUpdateColor = async (id: string, field: 'bgColor' | 'textColor', value: string) => {
    const update = field === 'bgColor' ? { bg_color: value } : { text_color: value };
    const { error } = await supabase.from('categories').update(update).eq('id', id);

    if (error) {
      toast.error('Failed to update category color.');
      console.error('Supabase category update error:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will remove this category from the site navigation and all posts.')) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete category.');
      console.error('Supabase delete category error:', error);
      return;
    }

    toast.success('Category deleted.');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-4xl font-bold uppercase tracking-widest border-l-8 border-black pl-4">Category Management</h2>
      <p className="opacity-60 font-medium">Add or remove categories. Note: specific themes are tied to names like "Music", "3D Art", etc.</p>
      
      <form onSubmit={handleAddCategory} className="space-y-4 p-6 border-4 border-black bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New category name..."
            className="flex-1 p-3 border-4 border-black font-bold uppercase tracking-tight focus:outline-none"
            id="new-category-input"
          />
          <div className="flex gap-4 items-center">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase opacity-50">Background</label>
              <input 
                type="color" 
                value={newBgColor} 
                onChange={(e) => setNewBgColor(e.target.value)}
                className="w-12 h-12 cursor-pointer border-2 border-black"
                id="new-category-bg-color"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase opacity-50">Text/Accent</label>
              <input 
                type="color" 
                value={newTextColor} 
                onChange={(e) => setNewTextColor(e.target.value)}
                className="w-12 h-12 cursor-pointer border-2 border-black"
                id="new-category-text-color"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-3 h-12 bg-black text-white font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black/90 transition-all self-end"
              id="add-category-btn"
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="admin-category-list">
        {/* Everything Category (Special) */}
        {siteTheme && (
          <div className="border-4 border-black overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
            <div 
              className="p-4 border-b-4 border-black flex justify-between items-center"
              style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}
            >
              <span className="font-black text-2xl uppercase tracking-tighter">Everything (Global View)</span>
              <Settings size={20} className="opacity-50" />
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50 block">Bg Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    defaultValue={siteTheme.bgColor} 
                    onBlur={(e) => handleUpdateSiteTheme('bgColor', e.target.value)}
                    className="w-8 h-8 cursor-pointer border-2 border-black"
                  />
                  <span className="text-xs font-mono font-bold">{siteTheme.bgColor}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    defaultValue={siteTheme.textColor} 
                    onBlur={(e) => handleUpdateSiteTheme('textColor', e.target.value)}
                    className="w-8 h-8 cursor-pointer border-2 border-black"
                  />
                  <span className="text-xs font-mono font-bold">{siteTheme.textColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {categories.map(cat => (
          <div 
            key={cat.id} 
            className="border-4 border-black overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
          >
            <div 
              className="p-4 border-b-4 border-black flex justify-between items-center"
              style={{ backgroundColor: cat.bgColor, color: cat.textColor }}
            >
              <span className="font-black text-2xl uppercase tracking-tighter truncate">{cat.name}</span>
              <button 
                onClick={() => handleDeleteCategory(cat.id)}
                className="hover:scale-110 transition-transform p-1 bg-white/20 rounded"
                id={`delete-category-${cat.id}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50 block">Bg Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    defaultValue={cat.bgColor || '#ffffff'} 
                    onBlur={(e) => handleUpdateColor(cat.id, 'bgColor', e.target.value)}
                    className="w-8 h-8 cursor-pointer border-2 border-black"
                  />
                  <span className="text-xs font-mono font-bold">{cat.bgColor}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-50 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    defaultValue={cat.textColor || '#000000'} 
                    onBlur={(e) => handleUpdateColor(cat.id, 'textColor', e.target.value)}
                    className="w-8 h-8 cursor-pointer border-2 border-black"
                  />
                  <span className="text-xs font-mono font-bold">{cat.textColor}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
