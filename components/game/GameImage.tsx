"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Gamepad2 } from 'lucide-react';

interface GameImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  className?: string;
}

export default function GameImage({
  src,
  alt,
  priority = false,
  loading,
  sizes = "(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 160px",
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

  const isEager = loading === 'eager' || (priority && loading !== 'lazy');
  const loadingMode = isEager ? 'eager' : 'lazy';


  if (imgError || !cleanSrc) {
    return (
      <div className="flex flex-col items-center justify-center text-zinc-400 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 p-2 text-center select-none">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mb-1.5 shadow-inner">
          <Gamepad2 className="w-5 h-5 text-white opacity-80" />
        </div>
        <span className="text-[10px] font-semibold text-zinc-300 line-clamp-2 px-1 leading-tight">
          {alt || "Game"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Visual skeleton shimmer placeholder while downloading */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer z-0" />
      )}

      {useFallbackImg ? (
        <img
          src={cleanSrc}
          alt={alt}
          loading={loadingMode}
          fetchPriority={isEager ? "high" : "auto"}
          decoding="async"
          className={`w-full h-full object-cover transform-gpu group-hover:scale-105 transition-opacity duration-300 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <Image
          src={cleanSrc}
          alt={alt}
          fill
          unoptimized
          quality={75}
          preload={priority}
          loading={loadingMode}
          fetchPriority={isEager ? "high" : "auto"}
          sizes={sizes}
          decoding="async"
          className={`object-cover transform-gpu group-hover:scale-105 transition-opacity duration-300 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            // If next/image optimization fails, gracefully fall back to native <img> tag
            setUseFallbackImg(true);
          }}
        />
      )}
    </div>
  );
}

