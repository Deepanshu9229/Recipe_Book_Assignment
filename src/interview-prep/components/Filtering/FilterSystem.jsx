import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';

/**
 * INTERVIEW QUESTION: "Implement a flexible filtering system"
 * 
 * Key concepts covered:
 * - Complex state management for multiple filter types
 * - Performance optimization with useMemo and useCallback
 * - Controlled vs uncontrolled components
 * - Dynamic filter application
 * - Search with highlighting
 */

const FilterSystem = ({ 
  data = [], 
  onFilteredData = () => {},
  className = "" 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tags: [],
    priceRange: { min: '', max: '' },
    dateRange: { start: '', end: '' }
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
    const allTags = data.flatMap(item => item.tags || []);
    const uniqueTags = [...new Set(allTags)];
    const prices = data.map(item => item.price).filter(price => typeof price === 'number');
    const minPrice = Math.min(...prices, 0);
    const maxPrice = Math.max(...prices, 0);
    
    return {
      categories,
      tags: uniqueTags,
      priceRange: { min: minPrice, max: maxPrice }
    };
  }, [data]);

  // Apply all filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Text search - searches multiple fields
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(item => {
        const searchableText = [
          item.name,
          item.description,
          item.category,
          ...(item.tags || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
    }

    // Category filter
    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }

    // Tags filter (must include ALL selected tags)
    if (filters.tags.length > 0) {
      result = result.filter(item => 
        filters.tags.every(tag => item.tags?.includes(tag))
      );
    }

    // Price range filter
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') {
      result = result.filter(item => {
        const price = item.price;
        if (typeof price !== 'number') return false;
        
        const min = filters.priceRange.min === '' ? -Infinity : Number(filters.priceRange.min);
        const max = filters.priceRange.max === '' ? Infinity : Number(filters.priceRange.max);
        
        return price >= min && price <= max;
      });
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(item => {
        const itemDate = new Date(item.date);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : new Date(0);
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : new Date();
        
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return result;
  }, [data, filters]);

  // Notify parent of filtered data changes
  React.useEffect(() => {
    onFilteredData(filteredData);
  }, [filteredData, onFilteredData]);

  // Update functions
  const updateSearch = useCallback((value) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const updateCategory = useCallback((value) => {
    setFilters(prev => ({ ...prev, category: value }));
  }, []);

  const updateTags = useCallback((tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const updatePriceRange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: { ...prev.priceRange, [field]: value }
    }));
  }, []);

  const updateDateRange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value }
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      tags: [],
      priceRange: { min: '', max: '' },
      dateRange: { start: '', end: '' }
    });
  }, []);

  const clearFilter = useCallback((filterType, value = null) => {
    setFilters(prev => {
      switch (filterType) {
        case 'search':
          return { ...prev, search: '' };
        case 'category':
          return { ...prev, category: '' };
        case 'tag':
          return { ...prev, tags: prev.tags.filter(t => t !== value) };
        case 'priceRange':
          return { ...prev, priceRange: { min: '', max: '' } };
        case 'dateRange':
          return { ...prev, dateRange: { start: '', end: '' } };
        default:
          return prev;
      }
    });
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.tags.length > 0) count++;
    if (filters.priceRange.min !== '' || filters.priceRange.max !== '') count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => updateSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {filters.search && (
          <button
            onClick={() => clearFilter('search')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Filter size={16} />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} size={16} />
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <FilterChip
              label={`Search: "${filters.search}"`}
              onRemove={() => clearFilter('search')}
            />
          )}
          {filters.category && (
            <FilterChip
              label={`Category: ${filters.category}`}
              onRemove={() => clearFilter('category')}
            />
          )}
          {filters.tags.map(tag => (
            <FilterChip
              key={tag}
              label={`Tag: ${tag}`}
              onRemove={() => clearFilter('tag', tag)}
            />
          ))}
          {(filters.priceRange.min !== '' || filters.priceRange.max !== '') && (
            <FilterChip
              label={`Price: $${filters.priceRange.min || '0'} - $${filters.priceRange.max || '∞'}`}
              onRemove={() => clearFilter('priceRange')}
            />
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <FilterChip
              label={`Date: ${filters.dateRange.start || 'Start'} - ${filters.dateRange.end || 'End'}`}
              onRemove={() => clearFilter('dateRange')}
            />
          )}
        </div>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          {filterOptions.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => updateTags(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          {filterOptions.priceRange.max > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range ($)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => updatePriceRange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => updatePriceRange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateDateRange('start', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateDateRange('end', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} items
      </div>
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, onRemove }) => (
  <div className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="text-blue-600 hover:text-blue-800"
    >
      <X size={14} />
    </button>
  </div>
);

// Simple search component for basic use cases
export const SimpleSearch = ({ placeholder = "Search...", onSearch, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {searchTerm && (
        <button
          onClick={() => handleSearch('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default FilterSystem;