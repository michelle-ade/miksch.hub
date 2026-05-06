import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, DEFAULT_THEME, getThemeFromCategory, ThemeConfig } from './types';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
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
    const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const c = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(c);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'site_theme'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSiteTheme({
          bg: data.bgColor,
          text: data.textColor,
          accent: data.textColor,
          border: data.textColor
        });
      }
    });
    return unsub;
  }, []);

  const currentCategory = categories.find(c => c.name === categoryName);
  const theme = getThemeFromCategory(currentCategory, siteTheme || undefined);

  useEffect(() => {
    // Apply background color to body for smooth transitions
    document.body.style.backgroundColor = theme.bg;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ categoryName, setCategoryName, theme, categories }}>
      <div 
        className="min-h-screen transition-colors duration-500" 
        style={{ backgroundColor: theme.bg, color: theme.text }}
      >
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
