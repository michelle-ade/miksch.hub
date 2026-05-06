import React from 'react';
import { Post, Category } from '../types';
import PostCard from './PostCard';

interface FeedProps {
  posts: Post[];
  categories: Category[];
}

export default function Feed({ posts, categories }: FeedProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center border-4 border-dashed border-current opacity-40">
        <p className="text-2xl font-bold">No posts found.</p>
      </div>
    );
  }

  return (
    <main className="space-y-12" id="post-feed">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} categories={categories} />
      ))}
    </main>
  );
}
