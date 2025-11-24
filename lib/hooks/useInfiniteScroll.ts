import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseInfiniteScrollReturn {
  sentryRef: (node: HTMLElement | null) => void;
  isIntersecting: boolean;
}

/**
 * Custom hook for infinite scroll
 * 
 * @example
 * const { sentryRef, isIntersecting } = useInfiniteScroll({
 *   threshold: 0.5,
 *   rootMargin: '100px',
 * });
 * 
 * useEffect(() => {
 *   if (isIntersecting && hasMore && !isLoading) {
 *     loadMore();
 *   }
 * }, [isIntersecting]);
 * 
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={sentryRef} />
 *   </div>
 * );
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentryRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          setIsIntersecting(entries[0].isIntersecting);
        },
        {
          threshold,
          rootMargin,
        }
      );

      observerRef.current.observe(node);
    },
    [threshold, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { sentryRef, isIntersecting };
}
