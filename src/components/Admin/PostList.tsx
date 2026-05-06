import React from 'react';
import { Post, Category } from '../../types';
import { formatDate } from '../../lib/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface PostListProps {
  posts: Post[];
  categories: Category[];
  onEdit: (post: Post) => void;
}

export default function PostList({ posts, categories, onEdit }: PostListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      toast.success('Post deleted.');
    } catch (e) {
      toast.error('Failed to delete post.');
    }
  };

  const getPostCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-4xl font-bold uppercase tracking-widest border-l-8 border-black pl-4 mb-8">Post History</h2>
      
      <div className="border-4 border-black divide-y-4 divide-black" id="admin-post-list">
        {posts.map(post => (
          <div key={post.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white hover:bg-black/5 transition-colors group">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold opacity-60 uppercase">
                {formatDate(post.date.toDate())} — {getPostCategoryNames(post.categoryIds || [])}
              </span>
              <h3 className="text-2xl font-bold uppercase tracking-tight">{post.title}</h3>
            </div>
            
            <div className="flex gap-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(post)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-black font-bold uppercase text-sm hover:bg-black hover:text-white transition-all"
                id={`edit-post-${post.id}`}
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                onClick={() => handleDelete(post.id)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 font-bold uppercase text-sm hover:bg-red-500 hover:text-white transition-all"
                id={`delete-post-${post.id}`}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="p-12 text-center opacity-40 font-bold">No posts found. Create your first one!</div>
        )}
      </div>
    </div>
  );
}
