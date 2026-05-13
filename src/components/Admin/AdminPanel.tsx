import React, { useState, useEffect } from 'react'; // 1. Added useEffect here
import { Post, Category } from '../../types';
import PostEditor from './PostEditor';
import CategoryManager from './CategoryManager';
import PostList from './PostList';
import { ArrowLeft, Plus, Tags, FileText, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../supabaseClient';

interface AdminPanelProps {
  onBack: () => void;
  posts: Post[];
  categories: Category[];
}

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

export default function AdminPanel({ onBack, posts, categories }: AdminPanelProps) {
  // 2. Changed initialization to null (we will fill it via useEffect)
  const [user, setUser] = useState<any>(null); 
  const [activeTab, setActiveTab] = useState<'posts' | 'new-post' | 'categories'>('posts');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 3. THIS IS THE MISSING PIECE
  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes (like successful redirect login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // This must match exactly what you have in Supabase Site URL
          redirectTo: window.location.origin + window.location.pathname,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error('Login failed.');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    onBack();
  };

  // 4. Added a "loading" check so it doesn't flicker the login screen 
  // while checking the session
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(() => setLoading(false));
  }, []);

  if (loading) return null; 

  if (!user || user.email !== adminEmail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-black">
        <h1 className="text-4xl font-bold mb-8">Admin Access</h1>
        <button 
          onClick={handleLogin}
          className="px-8 py-3 border-4 border-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all underline decoration-2"
        >
          Login with Google
        </button>
        <button onClick={onBack} className="mt-8 text-black opacity-60 hover:opacity-100 flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Site
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* ... the rest of your JSX remains the same ... */}
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b-4 border-black pb-8">
          <div>
            <h1 className="text-6xl font-bold lowercase tracking-tighter">Admin Dashboard</h1>
            <p className="font-bold opacity-60 uppercase tracking-widest mt-2">{user?.email}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => { setActiveTab('new-post'); setEditingPost(null); }}
              className={`px-4 py-2 border-2 border-black font-bold flex items-center gap-2 ${activeTab === 'new-post' ? 'bg-black text-white' : ''}`}
            >
              <Plus size={18} /> New Post
            </button>
            <button 
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 border-2 border-black font-bold flex items-center gap-2 ${activeTab === 'posts' ? 'bg-black text-white' : ''}`}
            >
              <FileText size={18} /> Post History
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 border-2 border-black font-bold flex items-center gap-2 ${activeTab === 'categories' ? 'bg-black text-white' : ''}`}
            >
              <Tags size={18} /> Categories
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 border-2 border-red-500 text-red-500 font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <main>
          {activeTab === 'posts' && (
            <PostList 
              posts={posts} 
              categories={categories}
              onEdit={(p) => { setEditingPost(p); setActiveTab('new-post'); }} 
            />
          )}
          {activeTab === 'new-post' && (
            <PostEditor 
              post={editingPost} 
              categories={categories} 
              onSuccess={() => setActiveTab('posts')} 
            />
          )}
          {activeTab === 'categories' && (
            <CategoryManager />
          )}
        </main>

        <button onClick={onBack} className="mt-20 opacity-40 hover:opacity-100 flex items-center gap-2">
          <ArrowLeft size={16} /> Exit Admin View
        </button>
      </div>
    </div>
  );
}