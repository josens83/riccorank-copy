'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Blurhash } from 'react-blurhash';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurhash?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Blurhash placeholder
 * - Progressive loading
 * - Lazy loading (unless priority)
 * - Next.js Image optimization
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  blurhash,
  priority = false,
  className = '',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // Default blurhash for fallback
  const defaultBlurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blurhash Placeholder */}
      {!isLoaded && !isError && blurhash && (
        <Blurhash
          hash={blurhash || defaultBlurhash}
          width={width}
          height={height}
          resolutionX={32}
          resolutionY={32}
          punch={1}
        />
      )}

      {/* Optimized Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        quality={90}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsError(true);
          console.error(`Failed to load image: ${src}`);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Error Fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <span className="text-gray-500">이미지를 불러올 수 없습니다</span>
        </div>
      )}
    </div>
  );
}
