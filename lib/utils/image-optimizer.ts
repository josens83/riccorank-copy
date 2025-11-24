/**
 * Image Optimization Utilities
 * 
 * Provides helper functions for image optimization
 */

import { encode } from 'blurhash';

/**
 * Generate blurhash from image (client-side only)
 */
export async function generateBlurhashFromImage(
  imageUrl: string,
  componentX = 4,
  componentY = 3
): Promise<string> {
  try {
    // Load image
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');

    // Resize for performance
    const scale = 32 / Math.max(img.width, img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const blurhash = encode(
      imageData.data,
      imageData.width,
      imageData.height,
      componentX,
      componentY
    );

    return blurhash;
  } catch (error) {
    console.error('Error generating blurhash:', error);
    return 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'; // Default blurhash
  }
}

/**
 * Optimize image sizes for responsive loading
 */
export function getResponsiveImageSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'high') {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }

  document.head.appendChild(link);
}

/**
 * Intersection Observer for lazy loading
 */
export function createLazyLoadObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}
