import React, { useState, useEffect } from 'react';
import { ThemeProvider, useAppTheme } from './ThemeContext';
import { Category, Post } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import Feed from './components/Feed';
import AdminPanel from './components/Admin/AdminPanel';
import { Toaster } from 'react-hot-toast';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

function AppContent() {
  const { categoryName, categories } = useAppTheme();
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showContactLinks, setShowContactLinks] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(p);
    });
    return unsub;
  }, []);

  const filteredPosts = posts
    .filter(p => {
        if (!p.date) return false;
        if (categoryName === 'Everything') return true;
        const currentCat = categories.find(c => c.name === categoryName);
        if (!currentCat) return false;
        return p.categoryIds.includes(currentCat.id);
    })
    .sort((a, b) => {
      const timeA = a.date?.toMillis() || 0;
      const timeB = b.date?.toMillis() || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  if (view === 'admin') {
    return <AdminPanel onBack={() => setView('public')} posts={posts} categories={categories} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header />
      <Navigation categories={categories} />
      
      <div className="mt-8">
         <h2 className="text-4xl font-bold mb-8">Currently Viewing: {categoryName}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_250px] gap-8">
        <SidebarLeft 
          sortOrder={sortOrder} 
          setSortOrder={setSortOrder}
        />
        <Feed posts={filteredPosts} categories={categories} />
        <SidebarRight categories={categories} />
      </div>

      <footer className="mt-20 py-20 border-t border-current flex flex-col items-center gap-12 text-center">
        <div className="flex flex-col items-center gap-6">
            {!showContactLinks ? (
                <button 
                onClick={() => setShowContactLinks(true)}
                className="px-8 py-3 border-2 border-current font-bold hover:bg-white hover:text-black transition-all"
                id="contact-me-btn"
                >
                Contact Me
                </button>
            ) : (
                <div className="flex flex-col sm:flex-row gap-6 animate-in slide-in-from-bottom-2 duration-300">
                    <a 
                        href="mailto:contact@miksch.com" 
                        className="text-2xl font-bold hover:underline underline-offset-8"
                        id="contact-email-link"
                    >
                        Email: contact@miksch.com
                    </a>
                    <span className="hidden sm:inline text-current/30">|</span>
                    <a 
                        href="https://linkedin.com/in/miksch" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-2xl font-bold hover:underline underline-offset-8"
                        id="contact-linkedin-link"
                    >
                        LinkedIn
                    </a>
                </div>
            )}
        </div>

        <button 
          onClick={() => setView('admin')}
          className="text-sm font-bold uppercase tracking-widest text-current/40 hover:text-current transition-colors"
          id="footer-admin-login-btn"
        >
          {user ? 'Admin Dashboard' : 'Settings / Login'}
        </button>
      </footer>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
