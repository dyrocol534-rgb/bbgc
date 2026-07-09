"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Gamepad2 } from 'lucide-react';

interface GameImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function GameImage({ src, alt, priority = false }: GameImageProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className="flex flex-col items-center justify-center text-zinc-600 z-10 w-full h-full">
        <Gamepad2 className="w-10 h-10 mb-2 opacity-50" />
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 text-center px-2 leading-tight">Game<br/>Preview</span>
      </div>
    );
  }

  return (
    <Image 
      src={src} 
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
      onError={() => setImgError(true)}
    />
  );
}
