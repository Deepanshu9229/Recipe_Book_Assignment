# Complete Frontend Interview Guide

This guide contains comprehensive questions, answers, and explanations for all the components in this interview preparation repository. Use this to practice explaining your code and reasoning during interviews.

## 📚 Table of Contents

1. [General React Questions](#general-react-questions)
2. [Pagination Questions](#pagination-questions)
3. [Filtering Questions](#filtering-questions)
4. [Sorting Questions](#sorting-questions)
5. [Search & Debouncing Questions](#search--debouncing-questions)
6. [Infinite Scroll Questions](#infinite-scroll-questions)
7. [Modal Questions](#modal-questions)
8. [Performance Questions](#performance-questions)
9. [Accessibility Questions](#accessibility-questions)
10. [Advanced Topics](#advanced-topics)

---

## General React Questions

### Q: Walk me through your approach to building reusable components.

**Answer:**
I follow these principles:
- **Single Responsibility**: Each component has one clear purpose
- **Props API Design**: Flexible, well-documented props with sensible defaults
- **Composition over Inheritance**: Use children props and render props for flexibility
- **Performance**: Memoization with React.memo, useMemo, useCallback where appropriate
- **Accessibility**: ARIA attributes, keyboard navigation, focus management
- **Testing**: Unit tests for logic, integration tests for user interactions

**Example from our Pagination component:**
```jsx
const Pagination = ({
  currentPage = 1,      // Sensible default
  totalItems = 0,       // Required prop with fallback
  onPageChange = () => {}, // Callback pattern
  maxVisiblePages = 5,  // Configurable behavior
  showFirstLast = true, // Feature flags
  className = ""        // Style customization
}) => {
  // Implementation focuses on one responsibility: pagination logic
};
```

### Q: How do you handle state management in complex applications?

**Answer:**
I choose state management based on complexity:

1. **Local State** (useState): Component-specific data
2. **Lifted State**: Shared between siblings, lift to common parent
3. **Context**: Cross-cutting concerns (theme, auth) without prop drilling
4. **Custom Hooks**: Reusable stateful logic
5. **External Libraries**: Redux/Zustand for complex global state

**Example from our hooks:**
```jsx
// Custom hook encapsulates complex logic
export const usePagination = ({ totalItems, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Derived state with useMemo for performance
  const pagination = useMemo(() => ({
    totalPages: Math.ceil(totalItems / pageSize),
    // ... other computed values
  }), [totalItems, pageSize]);
  
  return { ...pagination, goToPage, nextPage, prevPage };
};
```

---

## Pagination Questions

### Q: Implement pagination for a large dataset. What are the key considerations?

**Answer:**
Key considerations include:

1. **Performance**: Only render visible items
2. **User Experience**: Clear navigation, loading states
3. **Accessibility**: ARIA labels, keyboard navigation
4. **Flexibility**: Support different page sizes, navigation styles

**Implementation approach:**
```jsx
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Page range calculation with useMemo for performance
  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisible - 1, totalPages);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(end - maxVisible + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);
  
  // Render with accessibility
  return (
    <nav aria-label="Pagination Navigation">
      {pageNumbers.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
    </nav>
  );
};
```

### Q: How would you optimize pagination for large datasets?

**Answer:**
Optimization strategies:

1. **Server-side pagination**: Only fetch needed data
2. **Virtual scrolling**: For very large lists
3. **Caching**: Store previously fetched pages
4. **Preloading**: Fetch next page in background
5. **Debounced navigation**: Prevent rapid page changes

```jsx
export const useServerPagination = ({ onPageChange, cacheSize = 10 }) => {
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map());
  
  const goToPage = useCallback(async (page) => {
    // Check cache first
    if (cache.current.has(page)) {
      return cache.current.get(page);
    }
    
    setLoading(true);
    try {
      const data = await onPageChange(page);
      
      // Manage cache size
      if (cache.current.size >= cacheSize) {
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }
      
      cache.current.set(page, data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [onPageChange, cacheSize]);
  
  return { goToPage, loading };
};
```

---

## Filtering Questions

### Q: Build a flexible filtering system that can handle multiple filter types.

**Answer:**
A good filtering system should:

1. **Support multiple filter types**: text, dropdown, range, multi-select
2. **Be performant**: Use useMemo for expensive operations
3. **Provide clear feedback**: Show active filters, result counts
4. **Be extensible**: Easy to add new filter types

**Implementation:**
```jsx
const FilterSystem = ({ data, onFilteredData }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tags: [],
    priceRange: { min: '', max: '' }
  });
  
  // Apply all filters with useMemo for performance
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(item => {
        const searchableText = [
          item.name,
          item.description,
          item.category
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
    }
    
    // Category filter
    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }
    
    // Tags filter (all selected tags must be present)
    if (filters.tags.length > 0) {
      result = result.filter(item =>
        filters.tags.every(tag => item.tags?.includes(tag))
      );
    }
    
    // Price range filter
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
      result = result.filter(item => {
        const price = item.price;
        const min = filters.priceRange.min === '' ? 0 : Number(filters.priceRange.min);
        const max = filters.priceRange.max === '' ? Infinity : Number(filters.priceRange.max);
        
        return price >= min && price <= max;
      });
    }
    
    return result;
  }, [data, filters]);
  
  // Notify parent component
  useEffect(() => {
    onFilteredData(filteredData);
  }, [filteredData, onFilteredData]);
  
  // Filter update functions
  const updateFilter = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);
  
  return (
    <div>
      {/* Filter UI components */}
      <SearchInput 
        value={filters.search}
        onChange={(value) => updateFilter('search', value)}
      />
      <CategorySelect
        value={filters.category}
        onChange={(value) => updateFilter('category', value)}
      />
      {/* More filter components */}
    </div>
  );
};
```

### Q: How do you handle filter performance with large datasets?

**Answer:**
Performance optimization strategies:

1. **Debounced input**: Prevent excessive filtering
2. **Memoization**: Cache filter results
3. **Virtual scrolling**: For large result sets
4. **Web Workers**: For complex filtering logic
5. **Indexed search**: Pre-process data for faster lookups

```jsx
// Debounced filter updates
const useDebouncedFilters = (filters, delay = 300) => {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [filters, delay]);
  
  return debouncedFilters;
};

// Memoized filtering with complex logic
const useFilteredData = (data, filters) => {
  return useMemo(() => {
    // Expensive filtering operations here
    return applyFilters(data, filters);
  }, [data, filters]);
};
```

---

## Sorting Questions

### Q: Implement a sortable table with multi-column sorting capability.

**Answer:**
Multi-column sorting allows users to sort by multiple criteria with priority order.

**Key features:**
- Visual indicators for sort direction and priority
- Support for different data types (string, number, date)
- Stable sorting to maintain order for equal values

```jsx
const MultiSortTable = ({ data, columns }) => {
  const [sortConfigs, setSortConfigs] = useState([]);
  
  // Multi-column sort function
  const sortedData = useMemo(() => {
    if (sortConfigs.length === 0) return data;
    
    return [...data].sort((a, b) => {
      for (let config of sortConfigs) {
        const aValue = getNestedValue(a, config.key);
        const bValue = getNestedValue(b, config.key);
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) continue;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        let comparison = 0;
        
        // Type-specific comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue - bValue;
        } else {
          // String comparison (case-insensitive)
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          comparison = aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        }
        
        if (comparison !== 0) {
          return config.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [data, sortConfigs]);
  
  const handleSort = useCallback((columnKey) => {
    setSortConfigs(prevConfigs => {
      const existingIndex = prevConfigs.findIndex(config => config.key === columnKey);
      
      if (existingIndex !== -1) {
        const newConfigs = [...prevConfigs];
        const existing = newConfigs[existingIndex];
        
        if (existing.direction === 'asc') {
          // Change to descending
          newConfigs[existingIndex] = { ...existing, direction: 'desc' };
        } else {
          // Remove from sort
          newConfigs.splice(existingIndex, 1);
        }
        return newConfigs;
      } else {
        // Add new sort
        return [...prevConfigs, { key: columnKey, direction: 'asc' }];
      }
    });
  }, []);
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.key} onClick={() => handleSort(column.key)}>
              {column.title}
              <SortIndicator 
                sortConfig={sortConfigs.find(config => config.key === column.key)}
                priority={sortConfigs.findIndex(config => config.key === column.key) + 1}
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map(row => (
          <tr key={row.id}>
            {columns.map(column => (
              <td key={column.key}>
                {column.render 
                  ? column.render(getNestedValue(row, column.key), row)
                  : getNestedValue(row, column.key)
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Q: How do you handle sorting performance with large datasets?

**Answer:**
Performance optimization for sorting:

1. **Stable sorting algorithms**: Maintain relative order
2. **Memoization**: Cache sorted results
3. **Virtual scrolling**: Only render visible rows
4. **Web Workers**: For complex sorting operations
5. **Server-side sorting**: For very large datasets

```jsx
// Custom sorting utilities
export const sortingUtils = {
  // Natural sort for strings with numbers
  naturalSort: (a, b, direction = 'asc') => {
    const comparison = String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: 'base'
    });
    return direction === 'asc' ? comparison : -comparison;
  },
  
  // Date sorting
  dateSort: (a, b, direction = 'asc') => {
    const aDate = new Date(a);
    const bDate = new Date(b);
    const comparison = aDate - bDate;
    return direction === 'asc' ? comparison : -comparison;
  }
};
```

---

## Search & Debouncing Questions

### Q: Implement a search feature with debouncing. Why is debouncing important?

**Answer:**
Debouncing prevents excessive API calls or expensive operations by delaying execution until after a pause in user input.

**Why debouncing is important:**
- **Performance**: Reduces unnecessary API calls
- **User Experience**: Prevents flickering results
- **Resource Management**: Reduces server load
- **Cost Optimization**: Fewer API requests = lower costs

**Implementation:**
```jsx
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // CRITICAL: Cleanup prevents memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage in search component
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  
  // Only triggers API call when user stops typing
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

### Q: How would you implement search with caching and error handling?

**Answer:**
Advanced search implementation with caching:

```jsx
export const useDebouncedAPI = (apiCall, delay = 300, cacheSize = 10) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  
  const cache = useRef(new Map());
  const abortController = useRef(null);
  
  const debouncedQuery = useDebounce(query, delay);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedQuery.trim()) {
        setData(null);
        return;
      }
      
      // Check cache first
      if (cache.current.has(debouncedQuery)) {
        setData(cache.current.get(debouncedQuery));
        return;
      }
      
      // Cancel previous request
      if (abortController.current) {
        abortController.current.abort();
      }
      
      abortController.current = new AbortController();
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiCall(debouncedQuery, {
          signal: abortController.current.signal
        });
        
        setData(result);
        
        // Add to cache with size management
        if (cache.current.size >= cacheSize) {
          const firstKey = cache.current.keys().next().value;
          cache.current.delete(firstKey);
        }
        cache.current.set(debouncedQuery, result);
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup on unmount
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [debouncedQuery, apiCall, cacheSize]);
  
  return { data, loading, error, query, setQuery };
};
```

---

## Infinite Scroll Questions

### Q: Implement infinite scroll. What are the performance considerations?

**Answer:**
Infinite scroll loads content progressively as the user scrolls.

**Performance considerations:**
- **Memory management**: Remove off-screen items for large lists
- **Intersection Observer**: More efficient than scroll event listeners
- **Virtual scrolling**: Only render visible items
- **Error handling**: Graceful failure and retry mechanisms

**Implementation:**
```jsx
const InfiniteScroll = ({
  items,
  loadMore,
  hasNextPage,
  isLoading,
  renderItem,
  threshold = 0.1,
  rootMargin = '100px'
}) => {
  const loadingRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoading) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );
    
    const currentElement = loadingRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [hasNextPage, isLoading, loadMore, threshold, rootMargin]);
  
  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id || index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      <div ref={loadingRef}>
        {isLoading && <LoadingSpinner />}
        {!hasNextPage && <div>No more items</div>}
      </div>
    </div>
  );
};
```

### Q: How would you implement virtual scrolling for very large lists?

**Answer:**
Virtual scrolling only renders visible items, dramatically improving performance for large datasets.

```jsx
const VirtualScrollList = ({
  items,
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  buffer = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + buffer
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, items.length, buffer]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
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
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## Modal Questions

### Q: Create a reusable modal component. What accessibility features should it include?

**Answer:**
A good modal component should handle:

**Accessibility features:**
- **Focus management**: Trap focus within modal
- **ARIA attributes**: Proper roles and labels
- **Keyboard navigation**: ESC to close, Tab trapping
- **Screen reader support**: Announce modal opening/closing

**Implementation:**
```jsx
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousActiveElement.current = document.activeElement;
      
      // Focus modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Restore scroll
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        onClose();
      }
      
      // Focus trapping
      if (event.key === 'Tab') {
        const modal = modalRef.current;
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
      >
        {title && <h2 id="modal-title">{title}</h2>}
        {children}
        <button onClick={onClose} aria-label="Close modal">
          ×
        </button>
      </div>
    </div>,
    document.body
  );
};
```

### Q: How do you manage multiple modals in an application?

**Answer:**
Modal management strategies:

1. **Modal Provider**: Centralized modal state
2. **Modal Stack**: Handle multiple modals
3. **Portal Management**: Proper z-index handling

```jsx
export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);
  
  const openModal = useCallback((ModalComponent, props = {}) => {
    const id = Date.now().toString();
    setModals(prev => [...prev, { id, component: ModalComponent, props }]);
    return id;
  }, []);
  
  const closeModal = useCallback((id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);
  
  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);
  
  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAllModals }}>
      {children}
      {modals.map(({ id, component: ModalComponent, props }, index) => (
        <ModalComponent
          key={id}
          {...props}
          isOpen={true}
          onClose={() => closeModal(id)}
          style={{ zIndex: 1000 + index }}
        />
      ))}
    </ModalContext.Provider>
  );
};
```

---

## Performance Questions

### Q: How do you optimize React component performance?

**Answer:**
Performance optimization strategies:

1. **React.memo**: Prevent unnecessary re-renders
2. **useMemo**: Expensive calculations
3. **useCallback**: Stable function references
4. **Code splitting**: Lazy loading
5. **Virtual scrolling**: Large lists

**Examples:**
```jsx
// Memoize expensive calculations
const ExpensiveComponent = ({ items, filters }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => applyFilters(item, filters));
  }, [items, filters]);
  
  const handleClick = useCallback((id) => {
    // Handle click
  }, []);
  
  return (
    <div>
      {filteredItems.map(item => (
        <MemoizedItem 
          key={item.id} 
          item={item} 
          onClick={handleClick}
        />
      ))}
    </div>
  );
};

// Memoize components
const MemoizedItem = React.memo(({ item, onClick }) => {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  );
});

// Custom equality function for complex props
const ComplexComponent = React.memo(({ data, config }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return (
    prevProps.data.id === nextProps.data.id &&
    JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config)
  );
});
```

### Q: How do you prevent memory leaks in React applications?

**Answer:**
Memory leak prevention:

1. **Cleanup effects**: Remove event listeners, timers
2. **Abort API calls**: Cancel pending requests
3. **Clear timeouts**: Prevent callback execution after unmount
4. **Remove references**: Avoid circular references

```jsx
const ComponentWithCleanup = () => {
  const abortController = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      // Handle scroll
    };
    
    // Add event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      abortController.current = new AbortController();
      
      try {
        const response = await fetch('/api/data', {
          signal: abortController.current.signal
        });
        // Handle response
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Handle error
        }
      }
    };
    
    fetchData();
    
    // Cleanup: abort ongoing requests
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);
  
  return <div>Component content</div>;
};
```

---

## Accessibility Questions

### Q: How do you ensure your components are accessible?

**Answer:**
Accessibility best practices:

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA attributes**: Labels, roles, states
3. **Keyboard navigation**: Tab order, focus management
4. **Screen readers**: Clear announcements
5. **Color contrast**: Sufficient contrast ratios

**Implementation examples:**
```jsx
// Accessible button with proper ARIA
const AccessibleButton = ({ onClick, disabled, children, ...props }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible form with labels and error handling
const AccessibleForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  return (
    <form>
      <div>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "email-error" : undefined}
        />
        {error && (
          <div id="email-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    </form>
  );
};

// Accessible modal with focus management
const AccessibleModal = ({ isOpen, onClose, title, children }) => {
  // Focus management implementation (see Modal section)
  
  return isOpen ? createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close modal">
          ×
        </button>
      </div>
    </div>,
    document.body
  ) : null;
};
```

---

## Advanced Topics

### Q: How do you handle complex state updates with useReducer?

**Answer:**
useReducer is better for complex state logic:

```jsx
const paginationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: Math.max(1, Math.min(action.payload, state.totalPages))
      };
    
    case 'SET_PAGE_SIZE':
      const newTotalPages = Math.ceil(state.totalItems / action.payload);
      return {
        ...state,
        pageSize: action.payload,
        totalPages: newTotalPages,
        currentPage: Math.min(state.currentPage, newTotalPages)
      };
    
    case 'SET_TOTAL_ITEMS':
      const totalPages = Math.ceil(action.payload / state.pageSize);
      return {
        ...state,
        totalItems: action.payload,
        totalPages,
        currentPage: Math.min(state.currentPage, totalPages)
      };
    
    default:
      return state;
  }
};

const usePaginationReducer = (initialState) => {
  const [state, dispatch] = useReducer(paginationReducer, initialState);
  
  const setPage = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);
  
  const setPageSize = useCallback((pageSize) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  }, []);
  
  return { ...state, setPage, setPageSize };
};
```

### Q: How do you test these components?

**Answer:**
Testing strategies:

```jsx
// Unit test for pagination logic
describe('usePagination', () => {
  it('calculates total pages correctly', () => {
    const { result } = renderHook(() => 
      usePagination({ totalItems: 25, initialPageSize: 10 })
    );
    
    expect(result.current.totalPages).toBe(3);
  });
  
  it('handles page navigation', () => {
    const { result } = renderHook(() => 
      usePagination({ totalItems: 25, initialPageSize: 10 })
    );
    
    act(() => {
      result.current.goToPage(2);
    });
    
    expect(result.current.currentPage).toBe(2);
  });
});

// Integration test for filtering
describe('FilterSystem', () => {
  it('filters data correctly', async () => {
    const mockData = [
      { id: 1, name: 'John', category: 'Frontend' },
      { id: 2, name: 'Jane', category: 'Backend' }
    ];
    
    const onFilteredData = jest.fn();
    
    render(
      <FilterSystem data={mockData} onFilteredData={onFilteredData} />
    );
    
    const searchInput = screen.getByPlaceholderText('Search items...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(onFilteredData).toHaveBeenCalledWith([
        { id: 1, name: 'John', category: 'Frontend' }
      ]);
    });
  });
});
```

---

## 🎯 Interview Tips

### Before the Interview
1. **Practice explaining** your code out loud
2. **Understand the tradeoffs** of your implementations
3. **Prepare for follow-up questions** about optimization
4. **Review accessibility** and performance considerations

### During the Interview
1. **Think out loud** - explain your reasoning
2. **Ask clarifying questions** about requirements
3. **Start simple** then add complexity
4. **Consider edge cases** and error handling
5. **Discuss testing** strategies

### Common Follow-up Questions
- "How would you optimize this for mobile?"
- "What if we had millions of items?"
- "How would you test this component?"
- "What accessibility concerns should we consider?"
- "How would you handle errors?"

### Key Concepts to Emphasize
- **Performance optimization** (memoization, virtualization)
- **Accessibility** (ARIA, keyboard navigation)
- **User experience** (loading states, error handling)
- **Code organization** (custom hooks, separation of concerns)
- **Testing** (unit tests, integration tests)

Remember: The goal isn't just to write working code, but to demonstrate your understanding of React principles, performance considerations, and user experience best practices. Good luck! 🚀