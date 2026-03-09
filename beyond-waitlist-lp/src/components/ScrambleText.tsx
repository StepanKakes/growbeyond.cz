"use client";

import React, { useEffect, useState, useRef } from 'react';

const CHARS = "ABCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

interface ScrambleTextProps {
  text: string;           // The target string to animate towards
  duration?: number;      // Duration of the animation in milliseconds
  className?: string;     // Support for styling
  trigger?: boolean;      // Trigger animation immediately when true
  delay?: number;         // Delay before animation starts (ms)
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({ text, duration = 800, className = "", trigger = true, delay = 0 }) => {
  const [resolvedCount, setResolvedCount] = useState(0);
  const previousTextRef = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!trigger) return;

    // Reset when text changes (optional)
    if (text !== previousTextRef.current) {
      previousTextRef.current = text;
      setResolvedCount(0);
    }

    const targetLength = text.length;
    let startTime = Date.now() + delay;

    if (intervalRef.current) clearInterval(intervalRef.current);

    const animate = () => {
      const now = Date.now();

      if (now < startTime) {
        setResolvedCount(0);
        return;
      }

      const rawProgress = (now - startTime) / duration;
      const progress = Math.min(rawProgress, 1);

      const currentResolved = Math.floor(progress * targetLength);
      setResolvedCount(currentResolved);

      if (progress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    intervalRef.current = setInterval(animate, 16);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, duration, trigger, delay]);

  return (
    <span className={`inline-block ${className}`}>
      <span>{text.slice(0, resolvedCount)}</span>
      <span className="opacity-0">{text.slice(resolvedCount)}</span>
    </span>
  );
};
