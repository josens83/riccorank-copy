'use client';

import { Virtuoso } from 'react-virtuoso';
import { useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  itemHeight?: number;
  overscan?: number;
}

/**
 * Virtualized List Component
 * 
 * Features:
 * - Virtual scrolling for performance
 * - Infinite scroll support
 * - Customizable item renderer
 * - Memory efficient (only renders visible items)
 * 
 * @example
 * <VirtualizedList
 *   items={posts}
 *   renderItem={(post) => <PostCard post={post} />}
 *   onLoadMore={loadMorePosts}
 *   hasMore={hasMore}
 * />
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  itemHeight,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  const Footer = () => {
    if (!hasMore) return null;

    return (
      <div className="flex justify-center p-4">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        ) : (
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            더 보기
          </button>
        )}
      </div>
    );
  };

  return (
    <Virtuoso
      data={items}
      endReached={loadMore}
      overscan={overscan}
      itemContent={(index, item) => (
        <div key={index} style={itemHeight ? { height: itemHeight } : undefined}>
          {renderItem(item, index)}
        </div>
      )}
      components={{
        Footer,
      }}
      style={{ height: '100%' }}
    />
  );
}
