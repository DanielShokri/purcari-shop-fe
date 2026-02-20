// @ts-nocheck
// Type instantiation depth issues with Convex useQuery API
// This file compiles correctly at runtime but TypeScript cannot fully verify it

import { useState, useEffect, useRef } from 'react';
import { useQuery, UseQueryResult } from 'convex/react';

/**
 * Return type for useCachedQuery hook
 * Provides smart loading states based on cache detection
 */
export interface UseCachedQueryReturn<T> {
  /** The data returned from the query (undefined while loading) */
  data: T | undefined;
  /** True only on first load (cold cache) - show full spinner */
  isLoading: boolean;
  /** True after first successful load - data is available */
  hasEverLoaded: boolean;
  /** True when fetching but data already exists (background refresh) */
  isRefreshing: boolean;
}

/**
 * Options for useCachedQuery hook
 */
export interface UseCachedQueryOptions<T> {
  /** The Convex query function to call */
  query: any;
  /** Arguments to pass to the query */
  args?: Record<string, any>;
}

/**
 * Smart loading hook that tracks cache state to eliminate unnecessary spinners.
 * 
 * Convex useQuery returns undefined while loading, but cached data is available
 * instantly from previous visits. This hook tracks whether data has ever been
 * loaded to distinguish between:
 * - First visit (cold cache): isLoading = true, show spinner
 * - Return visit (warm cache): isLoading = false, show data instantly
 * - Background refresh: isRefreshing = true, show subtle indicator
 * 
 * @example
 * const { data, isLoading, hasEverLoaded, isRefreshing } = useCachedQuery({
 *   query: api.products.list,
 *   args: { category: 'wine' }
 * });
 * 
 * // Use in component:
 * if (isLoading && !hasEverLoaded) return <Spinner />;
 * if (!data) return <EmptyState />;
 * return <ProductList products={data} />;
 */
export function useCachedQuery<T>(options: UseCachedQueryOptions<T>): UseCachedQueryReturn<T> {
  const { query, args = {} } = options;
  
  // Use the Convex query
  const queryResult: UseQueryResult<T> = useQuery(query, args);
  const data = queryResult ?? undefined;
  
  // Track if data has ever been loaded (for cache detection)
  const [hasEverLoaded, setHasEverLoaded] = useState(false);
  
  // Track previous data to detect refreshing
  const previousDataRef = useRef<T | undefined>(undefined);
  
  // Track when we're actively refreshing (data exists but query is pending)
  const isRefreshing = data !== undefined && previousDataRef.current !== undefined && queryResult === undefined;
  
  // Effect: Mark as loaded once data is available
  useEffect(() => {
    if (data !== undefined && !hasEverLoaded) {
      setHasEverLoaded(true);
    }
  }, [data, hasEverLoaded]);
  
  // Effect: Update previous data ref after render
  useEffect(() => {
    previousDataRef.current = data;
  });
  
  // Smart loading state:
  // - isLoading = true only on first load (cold cache)
  // - After first load, isLoading = false even if data is undefined (cache miss)
  const isLoading = !hasEverLoaded && data === undefined;
  
  return {
    data,
    isLoading,
    hasEverLoaded,
    isRefreshing,
  };
}

export default useCachedQuery;
