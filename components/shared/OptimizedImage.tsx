import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Optimized Image component wrapper around Next.js Image
 * Provides automatic image optimization, lazy loading, and responsive images
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  // Handle external images
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes || '100vw'}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
    );
  }

  if (!width || !height) {
    console.warn('OptimizedImage: width and height are required when fill is false');
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      {...(isExternal && { unoptimized: true })}
    />
  );
}

/**
 * Avatar component with optimized image loading
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = '',
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold ${className}`}
        style={{ width: size, height: size }}
      >
        {alt[0]?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-cover ${className}`}
      quality={60}
    />
  );
}

/**
 * Logo component with optimized loading
 */
export function OptimizedLogo({
  width = 200,
  height = 50,
  priority = true,
}: {
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src="/logo.png"
      alt="RANKUP Logo"
      width={width}
      height={height}
      priority={priority}
      quality={90}
    />
  );
}

/**
 * Background image with blur effect
 */
export function OptimizedBackground({
  src,
  alt = 'Background',
  className = '',
  overlay = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  overlay?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        quality={60}
        sizes="100vw"
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
    </div>
  );
}
