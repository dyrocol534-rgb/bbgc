"use client";

import { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (imgError || !src) {
    return (
      <div className="flex flex-col items-center justify-center text-zinc-600 z-10 w-full h-full bg-zinc-900/60">
        <Gamepad2 className="w-8 h-8 mb-1.5 opacity-40 text-indigo-400" />
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-center px-2 leading-tight">
          Game Preview
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Subtle skeleton shimmer before image loads */}
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-zinc-800/60 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        className={`object-cover transform group-hover:scale-105 transition-all duration-300 ${
          isLoaded || priority ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgError(true)}
      />
    </>
  );
}
