import React from 'react';

export default function Header() {
  return (
    <header className="mb-8" id="site-header">
      <h1 className="text-8xl font-bold lowercase tracking-tighter mb-2" id="site-title">
        miksch
      </h1>
      <p className="text-lg opacity-80" id="site-description">
        This is my blog where I write about things I enjoy, including programming, 2D and 3D art, music, and everything else.
      </p>
    </header>
  );
}
