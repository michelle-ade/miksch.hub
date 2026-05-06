import React from 'react';
import { useAppTheme } from '../ThemeContext';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface NavigationProps {
  categories: Category[];
}

export default function Navigation({ categories }: NavigationProps) {
  const { categoryName, setCategoryName } = useAppTheme();

  const tabs = ['Everything', ...categories.map(c => c.name)];

  return (
    <nav className="flex flex-wrap gap-2 border-b-4 border-current pb-4" id="main-nav">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setCategoryName(tab)}
          id={`nav-tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            "text-2xl font-bold px-6 py-3 transition-all duration-300 border-2 border-transparent",
            categoryName === tab 
              ? "bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]" 
              : "hover:bg-white/10"
          )}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
