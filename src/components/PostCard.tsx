import React from 'react';
import { Post, Category } from '../types';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';

interface PostCardProps {
  post: Post;
  categories: Category[];
}

export default function PostCard({ post, categories }: PostCardProps) {
  const postCategories = categories.filter(c => post.categoryIds.includes(c.id));

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b-4 border-current pb-12 last:border-0"
      id={`post-${post.id}`}
    >
      <header className="mb-6">
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-tighter opacity-60">
                {formatDate(post.date.toDate())}
            </span>
        </div>
        <h2 className="text-5xl font-bold leading-tight" id={`post-title-${post.id}`}>
          {post.title}
        </h2>
      </header>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4" id={`post-media-${post.id}`}>
          {post.mediaUrls.map((url, i) => (
            <img 
              key={i} 
              src={url} 
              alt={post.title} 
              className="w-full h-auto border-4 border-current object-cover max-h-[600px]"
              id={`post-img-${post.id}-${i}`}
            />
          ))}
        </div>
      )}

      <div 
        className="prose prose-xl max-w-none prose-headings:font-bold prose-headings:text-current prose-p:text-current font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
        id={`post-content-${post.id}`}
      />

      {postCategories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2" id={`post-categories-${post.id}`}>
          {postCategories.map(cat => (
            <span 
              key={cat.id}
              className="px-3 py-1 border-2 border-current text-sm font-bold uppercase tracking-widest"
              id={`post-category-${post.id}-${cat.id}`}
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
