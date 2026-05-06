import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarLeftProps {
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
}

export default function SidebarLeft({
  sortOrder,
  setSortOrder
}: SidebarLeftProps) {
  return (
    <aside className="space-y-8" id="sidebar-left">
      <div className="space-y-6">
        <h3 className="text-xl font-bold uppercase tracking-widest border-b-2 border-current pb-2">Sort Posts</h3>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setSortOrder('desc')}
            className={cn(
                "flex items-center justify-between p-4 border-2 border-current font-bold transition-all",
                sortOrder === 'desc' ? "bg-white text-black" : "hover:bg-white/10"
            )}
            id="sort-newest-btn"
          >
            <span>Newest First</span>
            <ArrowDown size={20} />
          </button>
          
          <button
            onClick={() => setSortOrder('asc')}
            className={cn(
                "flex items-center justify-between p-4 border-2 border-current font-bold transition-all",
                sortOrder === 'asc' ? "bg-white text-black" : "hover:bg-white/10"
            )}
            id="sort-oldest-btn"
          >
            <span>Oldest First</span>
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
