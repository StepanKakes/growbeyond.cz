"use client";

import React from 'react';

export const GlowDivider = ({ className = "" }: { className?: string }) => {
  return (
    // TODO: Replace with motion.div for scroll stretching animation
    <div className={`w-full mix-blend-screen pointer-events-none ${className}`}>
      <img
        src="/glowdivider.avif"
        alt=""
        draggable={false}
        className="w-full h-auto"
      />
    </div>
  );
};
