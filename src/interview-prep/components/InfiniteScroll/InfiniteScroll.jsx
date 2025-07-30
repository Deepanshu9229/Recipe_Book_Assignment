import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * INTERVIEW QUESTION: "Implement infinite scroll with performance optimization"
 * 
 * Key concepts covered:
 * - Intersection Observer API
 * - Performance optimization with virtualization
 * - Memory management for large lists
 * - Error handling and retry logic
 * - Loading states and user feedback
 */

const InfiniteScroll = ({
  items = [],
  loadMore = () => {},
  hasNextPage = true,
  isLoading = false,
  error = null,
  renderItem = (item) => <div>{JSON.stringify(item)}</div>,
  threshold = 0.1,
  rootMargin = '100px',
  className = ""
}) => {
  const [displayedItems, setDisplayedItems] = useState(items);
  const loadingRef = useRef(null);
  const retryCount = useRef(0);

  // Update displayed items when items prop changes
  useEffect(() => {
    setDisplayedItems(items);
  }, [items]);

  // Intersection Observer for detecting when to load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoading && !error) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) {
        observer.unobserve(currentLoadingRef);
      }
    };
  }, [hasNextPage, isLoading, error, loadMore, threshold, rootMargin]);

  const handleRetry = useCallback(() => {
    retryCount.current += 1;
    loadMore();
  }, [loadMore]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Items List */}
      <div className="space-y-2">
        {displayedItems.map((item, index) => (
          <div key={item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading/Error States */}
      <div ref={loadingRef} className="flex justify-center py-4">
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader className="animate-spin" size={20} />
            <span>Loading more items...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle size={20} />
            <span>Failed to load more items</span>
            <button
              onClick={handleRetry}
              className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <RefreshCw size={16} className="inline mr-1" />
              Retry
            </button>
          </div>
        )}

        {!hasNextPage && displayedItems.length > 0 && (
          <div className="text-gray-500 text-center">
            No more items to load
          </div>
        )}
      </div>
    </div>
  );
};

// Virtual Infinite Scroll for large datasets
export const VirtualInfiniteScroll = ({
  items = [],
  loadMore = () => {},
  hasNextPage = true,
  isLoading = false,
  renderItem = (item) => <div>{JSON.stringify(item)}</div>,
  itemHeight = 60,
  containerHeight = 400,
  buffer = 5,
  className = ""
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  const visibleRange = useMemo(() => {
    const containerTop = scrollTop;
    const containerBottom = scrollTop + containerHeight;
    
    const startIndex = Math.max(0, Math.floor(containerTop / itemHeight) - buffer);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor(containerBottom / itemHeight) + buffer
    );

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, items.length, buffer]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
    
    // Check if we need to load more
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const threshold = scrollHeight - clientHeight - 200; // 200px before bottom
    
    if (scrollTop >= threshold && hasNextPage && !isLoading) {
      loadMore();
    }
  }, [hasNextPage, isLoading, loadMore]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div 
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id || (visibleRange.startIndex + index)}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center py-2 bg-white">
          <Loader className="animate-spin" size={20} />
        </div>
      )}
    </div>
  );
};

// Hook for infinite scroll logic
export const useInfiniteScroll = ({
  fetchMore,
  hasNextPage = true,
  threshold = 1.0
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight * threshold) {
        if (hasNextPage && !isFetching) {
          setIsFetching(true);
          fetchMore()
            .then(() => setError(null))
            .catch(err => setError(err))
            .finally(() => setIsFetching(false));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchMore, hasNextPage, isFetching, threshold]);

  return { isFetching, error };
};

// Grid-based infinite scroll
export const InfiniteGrid = ({
  items = [],
  loadMore = () => {},
  hasNextPage = true,
  isLoading = false,
  error = null,
  renderItem = (item) => <div className="p-4 bg-gray-100">{item.name}</div>,
  columns = 3,
  gap = 16,
  className = ""
}) => {
  const triggerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading && !error) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [hasNextPage, isLoading, error, loadMore]);

  return (
    <div className={className}>
      <div 
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`
        }}
      >
        {items.map((item, index) => (
          <div key={item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading trigger */}
      <div ref={triggerRef} className="mt-8 flex justify-center">
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader className="animate-spin" size={20} />
            <span>Loading more...</span>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center">
            <p>Error loading more items</p>
            <button
              onClick={loadMore}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!hasNextPage && items.length > 0 && (
          <p className="text-gray-500">No more items to load</p>
        )}
      </div>
    </div>
  );
};

// Advanced infinite scroll with page-based loading
export const PagedInfiniteScroll = ({
  loadPage,
  renderItem,
  pageSize = 20,
  className = ""
}) => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasNextPage) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await loadPage(currentPage, pageSize);
      
      setItems(prev => [...prev, ...response.data]);
      setHasNextPage(response.hasNextPage);
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [loadPage, currentPage, pageSize, isLoading, hasNextPage]);

  // Load initial data
  useEffect(() => {
    loadMoreItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <InfiniteScroll
      items={items}
      loadMore={loadMoreItems}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
      error={error}
      renderItem={renderItem}
      className={className}
    />
  );
};

// Performance monitoring component
export const InfiniteScrollWithMetrics = ({ children, onMetrics = () => {} }) => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    setMetrics(prev => {
      const newRenderCount = prev.renderCount + 1;
      const renderTime = performance.now() - startTime;
      const newAverageTime = (prev.averageRenderTime * (newRenderCount - 1) + renderTime) / newRenderCount;
      
      const newMetrics = {
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverageTime
      };

      onMetrics(newMetrics);
      return newMetrics;
    });
  });

  return (
    <div>
      {children}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
        <div>Renders: {metrics.renderCount}</div>
        <div>Last: {metrics.lastRenderTime.toFixed(2)}ms</div>
        <div>Avg: {metrics.averageRenderTime.toFixed(2)}ms</div>
      </div>
    </div>
  );
};

export default InfiniteScroll;