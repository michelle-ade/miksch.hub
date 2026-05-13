import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, DEFAULT_THEME, getThemeFromCategory, ThemeConfig } from './types';
import { supabase } from './supabaseClient';
import { cn } from './lib/utils';

interface ThemeContextType {
  categoryName: string;
  setCategoryName: (name: string) => void;
  theme: ThemeConfig;
  categories: Category[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [categoryName, setCategoryName] = useState<string>('Everything');
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteTheme, setSiteTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, bg_color, text_color')
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      const mapped = (data ?? []).map(cat => ({
        id: cat.id,
        name: cat.name,
        bgColor: cat.bg_color,
        textColor: cat.text_color,
      }));

      setCategories(mapped);
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
        .select('bg_color, text_color')
        .eq('id', 'site_theme')
        .single();

      if (error) {
        if (error.message !== 'Row not found') {
          console.error('Error loading site theme:', error);
        }
        return;
      }

      if (data) {
        setSiteTheme({
          bg: data.bg_color,
          text: data.text_color,
          accent: data.text_color,
          border: data.text_color,
        });
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

  const currentCategory = categories.find((c) => c.name === categoryName);
  const theme = getThemeFromCategory(currentCategory, siteTheme || undefined);

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ categoryName, setCategoryName, theme, categories }}>
      <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.text }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
}
