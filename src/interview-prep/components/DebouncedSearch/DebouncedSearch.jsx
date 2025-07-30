import React, { useState, useMemo } from 'react';
import { Search, X, Loader, Clock } from 'lucide-react';
import { useDebounce, useDebouncedSearch, useDebouncedAPI } from '../../hooks/useDebounce';

/**
 * INTERVIEW QUESTION: "Implement a search with debouncing"
 * 
 * Key concepts covered:
 * - Debouncing to prevent excessive API calls
 * - Performance optimization
 * - User experience improvements
 * - Loading states and error handling
 * - Search highlighting
 */

// Mock search function to simulate API call
const mockSearchAPI = async (query) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  // Mock data
  const items = [
    { id: 1, name: 'React Hooks Guide', description: 'Learn about useState, useEffect, and custom hooks', category: 'Frontend' },
    { id: 2, name: 'JavaScript Fundamentals', description: 'Master the basics of JavaScript programming', category: 'Programming' },
    { id: 3, name: 'CSS Grid Layout', description: 'Build responsive layouts with CSS Grid', category: 'Frontend' },
    { id: 4, name: 'Node.js Backend', description: 'Server-side development with Node.js', category: 'Backend' },
    { id: 5, name: 'Database Design', description: 'Learn SQL and database optimization', category: 'Database' },
    { id: 6, name: 'React Performance', description: 'Optimize React applications for speed', category: 'Frontend' },
    { id: 7, name: 'TypeScript Basics', description: 'Add type safety to your JavaScript', category: 'Programming' },
    { id: 8, name: 'API Development', description: 'Build RESTful APIs and GraphQL', category: 'Backend' },
  ];
  
  // Filter based on query
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
  
  return filtered;
};

// Basic debounced search component
export const DebouncedSearch = ({ delay = 300, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  
  // Mock data for local filtering
  const allItems = useMemo(() => [
    { id: 1, name: 'React', description: 'A JavaScript library for building user interfaces' },
    { id: 2, name: 'Vue.js', description: 'The Progressive JavaScript Framework' },
    { id: 3, name: 'Angular', description: 'Platform for building mobile and desktop web applications' },
    { id: 4, name: 'Svelte', description: 'Cybernetically enhanced web apps' },
    { id: 5, name: 'Next.js', description: 'The React Framework for Production' },
  ], []);
  
  // Filter results based on debounced search term
  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    
    return allItems.filter(item =>
      item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm, allItems]);
  
  // Highlight matching text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };
  
  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search frameworks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Search info */}
      <div className="mt-2 text-sm text-gray-500 flex items-center space-x-2">
        {searchTerm !== debouncedSearchTerm && (
          <>
            <Clock size={14} />
            <span>Searching...</span>
          </>
        )}
        {searchTerm && searchTerm === debouncedSearchTerm && (
          <span>Found {filteredResults.length} results</span>
        )}
      </div>
      
      {/* Results */}
      {filteredResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {filteredResults.map(item => (
            <div key={item.id} className="p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900">
                {highlightText(item.name, debouncedSearchTerm)}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {highlightText(item.description, debouncedSearchTerm)}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {searchTerm && debouncedSearchTerm && filteredResults.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          No results found for "{debouncedSearchTerm}"
        </div>
      )}
    </div>
  );
};

// Advanced search with API integration
export const AdvancedDebouncedSearch = ({ className = "" }) => {
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    clearSearch,
    debouncedSearchTerm
  } = useDebouncedSearch(mockSearchAPI, 400);
  
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search courses and tutorials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        {loading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={20} />
        )}
        {searchTerm && !loading && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/* Search Status */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-gray-500">
          {loading && 'Searching...'}
          {!loading && searchTerm && searchTerm === debouncedSearchTerm && (
            `Found ${results.length} results in courses`
          )}
          {searchTerm !== debouncedSearchTerm && searchTerm && (
            'Typing...'
          )}
        </div>
        {error && (
          <div className="text-red-500">
            Error: {error}
          </div>
        )}
      </div>
      
      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map(item => (
            <div key={item.id} className="p-4 bg-white border rounded-lg hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {highlightSearchTerm(item.name, debouncedSearchTerm)}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {highlightSearchTerm(item.description, debouncedSearchTerm)}
                  </p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Results */}
      {!loading && searchTerm && debouncedSearchTerm && results.length === 0 && (
        <div className="mt-8 text-center">
          <div className="text-gray-500 mb-4">
            No results found for "{debouncedSearchTerm}"
          </div>
          <div className="text-sm text-gray-400">
            Try searching for "React", "JavaScript", or "CSS"
          </div>
        </div>
      )}
    </div>
  );
};

// Search with caching demonstration
export const CachedDebouncedSearch = ({ className = "" }) => {
  const {
    data,
    loading,
    error,
    query,
    setQuery,
    clearCache,
    cacheSize
  } = useDebouncedAPI(mockSearchAPI, 300, 5);
  
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Search with Caching</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Cache: {cacheSize}/5 entries
          </span>
          <button
            onClick={clearCache}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Cache
          </button>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search with caching..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={20} />
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          Error: {error}
        </div>
      )}
      
      {data && data.length > 0 && (
        <div className="mt-4 grid gap-3">
          {data.map(item => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Utility function for highlighting search terms
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
};

export default DebouncedSearch;