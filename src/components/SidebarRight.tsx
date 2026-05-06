import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

import { Category } from '../types';

interface SidebarRightProps {
  categories: Category[];
}

export default function SidebarRight({ categories }: SidebarRightProps) {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'newsletter'), {
        email,
        topicIds: selectedTopics,
        subscribedAt: serverTimestamp()
      });
      toast.success('Subscribed successfully!');
      setEmail('');
      setSelectedTopics([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'newsletter');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    );
  };

  return (
    <aside className="space-y-8" id="sidebar-right">
      <div className="p-6 border-4 border-current bg-transparent" id="newsletter-box">
        <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Newsletter</h3>
        <p className="text-sm mb-6 opacity-80">Get updates on new posts and creative pursuits.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-transparent border-2 border-current font-bold placeholder:text-current/40"
            required
            id="newsletter-email"
          />

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase opacity-60">Topics</p>
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(cat.id)}
                  onChange={() => toggleTopic(cat.id)}
                  className="w-5 h-5 border-2 border-current appearance-none checked:bg-black transition-all cursor-pointer"
                  id={`newsletter-topic-${cat.id}`}
                />
                <span className="font-bold text-sm group-hover:underline">{cat.name}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all"
            id="newsletter-submit-btn"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </aside>
  );
}
