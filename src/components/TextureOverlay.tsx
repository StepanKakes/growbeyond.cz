"use client";

import React from 'react';

interface TextureOverlayProps {
  className?: string;
}

export const TextureOverlay = ({ className = "absolute inset-0 z-[5] pointer-events-none" }: TextureOverlayProps) => {
  return (
    <div
      className={`pointer-events-none h-full w-full opacity-100 mix-blend-overlay ${className}`}
      style={{
        backgroundImage: 'url(/texture.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '1200px 1200px' // Slightly finer grain
      }}
    ></div>
  );
};
