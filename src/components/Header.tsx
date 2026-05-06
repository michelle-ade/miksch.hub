import React from 'react';

export default function Header() {
  return (
    <header className="mb-8" id="site-header">
      <h1 className="text-8xl font-bold lowercase tracking-tighter mb-2" id="site-title">
        miksch
      </h1>
      <p className="text-xl font-medium mb-1 font-mono uppercase tracking-widest text-current/70" id="site-subtitle">
        computer scientist, artist, and musician
      </p>
      <p className="text-lg opacity-80" id="site-description">
        a portfolio of my creative pursuits.
      </p>
    </header>
  );
}
