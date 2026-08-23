"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Gamepad2 } from 'lucide-react';

interface GameImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export default function GameImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw",
  className = "",
}: GameImageProps) {
  const [useFallbackImg, setUseFallbackImg] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sanitize image URL (ensure https, clean protocol-relative URLs, trim whitespace)
  const cleanSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return '';
    let s = src.trim();
    if (s.startsWith('//')) {
      s = `https:${s}`;
    } else if (s.startsWith('http://')) {
      s = s.replace('http://', 'https://');
    }
    return s;
  }, [src]);

  if (imgError || !cleanSrc) {
    return (
      <div className="flex flex-col items-center justify-center text-zinc-600 z-10 w-full h-full bg-zinc-900/80">
        <Gamepad2 className="w-8 h-8 mb-1.5 opacity-40 text-indigo-400" />
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-center px-2 leading-tight">
          {alt || "Game"}
        </span>
      </div>
    );
  }

  // If next/image server optimization fails, fall back to browser-native <img>
  if (useFallbackImg) {
    return (
      <img
        src={cleanSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-300 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <>
      {/* Subtle skeleton shimmer before image loads */}
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-zinc-800/60 animate-pulse pointer-events-none" />
      )}
      <Image
        src={cleanSrc}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        className={`object-cover transform group-hover:scale-105 transition-all duration-300 ${
          isLoaded || priority ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          // If next/image optimization fails, gracefully fall back to native <img> tag
          setUseFallbackImg(true);
        }}
      />
    </>
  );
}
