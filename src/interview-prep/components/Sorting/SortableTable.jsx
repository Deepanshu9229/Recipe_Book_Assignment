import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ArrowUpDown } from 'lucide-react';

/**
 * INTERVIEW QUESTION: "Implement sorting functionality for a table"
 * 
 * Key concepts covered:
 * - Array sorting with multiple criteria
 * - State management for sort configuration
 * - Performance optimization with useMemo
 * - Generic sorting functions
 * - Visual feedback for sort state
 */

const SortableTable = ({ data = [], columns = [], className = "" }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  // Generic sort function that handles different data types
  const sortData = useCallback((items, sortKey, sortDirection) => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey);
      const bValue = getNestedValue(b, sortKey);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String comparison (case-insensitive)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, []);

  // Memoized sorted data
  const sortedData = useMemo(() => {
    return sortData(data, sortConfig.key, sortConfig.direction);
  }, [data, sortConfig, sortData]);

  // Handle column sort
  const handleSort = useCallback((columnKey) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === columnKey) {
        // Same column: toggle direction or reset
        if (prevConfig.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        } else {
          return { key: null, direction: 'asc' }; // Reset to no sorting
        }
      } else {
        // Different column: start with ascending
        return { key: columnKey, direction: 'asc' };
      }
    });
  }, []);

  // Get sort icon for column
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown size={16} className="text-gray-400" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="text-blue-600" />
      : <ChevronDown size={16} className="text-blue-600" />;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.title}</span>
                  {column.sortable !== false && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, index) => (
            <tr key={row.id || index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {column.render 
                    ? column.render(getNestedValue(row, column.key), row, index)
                    : getNestedValue(row, column.key)
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Sort info */}
      {sortConfig.key && (
        <div className="mt-2 text-sm text-gray-500">
          Sorted by {columns.find(col => col.key === sortConfig.key)?.title} 
          ({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
        </div>
      )}
    </div>
  );
};

// Multi-column sorting component
export const MultiSortTable = ({ data = [], columns = [], className = "" }) => {
  const [sortConfigs, setSortConfigs] = useState([]);

  // Multi-column sort function
  const multiSort = useCallback((items, configs) => {
    if (configs.length === 0) return items;

    return [...items].sort((a, b) => {
      for (let config of configs) {
        const aValue = getNestedValue(a, config.key);
        const bValue = getNestedValue(b, config.key);

        // Handle null/undefined
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
  }, []);

  const sortedData = useMemo(() => {
    return multiSort(data, sortConfigs);
  }, [data, sortConfigs, multiSort]);

  const handleSort = useCallback((columnKey) => {
    setSortConfigs(prevConfigs => {
      const existingIndex = prevConfigs.findIndex(config => config.key === columnKey);
      
      if (existingIndex !== -1) {
        const newConfigs = [...prevConfigs];
        const existing = newConfigs[existingIndex];
        
        if (existing.direction === 'asc') {
          newConfigs[existingIndex] = { ...existing, direction: 'desc' };
        } else {
          newConfigs.splice(existingIndex, 1); // Remove sort
        }
        return newConfigs;
      } else {
        return [...prevConfigs, { key: columnKey, direction: 'asc' }];
      }
    });
  }, []);

  const getSortIndicator = (columnKey) => {
    const config = sortConfigs.find(config => config.key === columnKey);
    if (!config) return <ChevronsUpDown size={16} className="text-gray-400" />;
    
    const index = sortConfigs.findIndex(config => config.key === columnKey);
    return (
      <div className="flex items-center space-x-1">
        {config.direction === 'asc' 
          ? <ChevronUp size={16} className="text-blue-600" />
          : <ChevronDown size={16} className="text-blue-600" />
        }
        <span className="text-xs bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
          {index + 1}
        </span>
      </div>
    );
  };

  const clearSort = () => setSortConfigs([]);

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Multi-Column Sorting</h3>
        {sortConfigs.length > 0 && (
          <button
            onClick={clearSort}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all sorts ({sortConfigs.length})
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable !== false && getSortIndicator(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {column.render 
                      ? column.render(getNestedValue(row, column.key), row, index)
                      : getNestedValue(row, column.key)
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple sort buttons component
export const SortButtons = ({ onSort, className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600">Sort by:</span>
      <button
        onClick={() => onSort('name', 'asc')}
        className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
      >
        Name A-Z
      </button>
      <button
        onClick={() => onSort('name', 'desc')}
        className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
      >
        Name Z-A
      </button>
      <button
        onClick={() => onSort('date', 'desc')}
        className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
      >
        Newest First
      </button>
      <button
        onClick={() => onSort('price', 'asc')}
        className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
      >
        Price Low-High
      </button>
    </div>
  );
};

// Custom hook for sorting
export const useSort = (initialData = [], initialSort = null) => {
  const [data, setData] = useState(initialData);
  const [sortConfig, setSortConfig] = useState(initialSort);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      const comparison = aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const sort = useCallback((key, direction = 'asc') => {
    setSortConfig({ key, direction });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  return {
    data: sortedData,
    setData,
    sort,
    clearSort,
    sortConfig,
    isLoading: false // Can be extended for async operations
  };
};

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Advanced sorting utilities
export const sortingUtils = {
  // Natural sort (handles numbers in strings correctly)
  naturalSort: (a, b, direction = 'asc') => {
    const aStr = String(a);
    const bStr = String(b);
    
    const comparison = aStr.localeCompare(bStr, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
    
    return direction === 'asc' ? comparison : -comparison;
  },

  // Date sort
  dateSort: (a, b, direction = 'asc') => {
    const aDate = new Date(a);
    const bDate = new Date(b);
    
    const comparison = aDate - bDate;
    return direction === 'asc' ? comparison : -comparison;
  },

  // Custom sort with multiple fallbacks
  multiFieldSort: (a, b, fields, direction = 'asc') => {
    for (let field of fields) {
      const aValue = getNestedValue(a, field);
      const bValue = getNestedValue(b, field);
      
      if (aValue !== bValue) {
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        const comparison = aValue < bValue ? -1 : 1;
        return direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  }
};

export default SortableTable;