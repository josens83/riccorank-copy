/**
 * Dynamic Imports for Code Splitting
 *
 * Lazy load heavy components to reduce initial bundle size
 *
 * Note: Component imports are commented out as they need to be implemented.
 * Uncomment and use when components are ready.
 */

// Example usage:
// import dynamic from 'next/dynamic';
//
// export const DynamicLineChart = dynamic(
//   () => import('@/components/widgets/LineChart').then(mod => mod.LineChart),
//   {
//     loading: () => <div>Loading...</div>,
//     ssr: false,
//   }
// );

/**
 * Helper function to create dynamic imports
 */
export function createDynamicImport<T = any>(
  importFn: () => Promise<{ default: T } | T>,
  options?: {
    loading?: React.ComponentType;
    ssr?: boolean;
  }
) {
  // This is a helper for future use
  return {
    importFn,
    options: options || { ssr: false },
  };
}

/**
 * Preload a dynamic component
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    importFn().catch(console.error);
  }
}
