import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * INTERVIEW QUESTION: "Implement a pagination component"
 * 
 * Key concepts covered:
 * - State management for current page
 * - Mathematical calculations for page ranges
 * - Performance optimization with useMemo
 * - Accessibility considerations
 * - Flexible API design
 */

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange = () => {},
  maxVisiblePages = 5,
  showFirstLast = true,
  showPrevNext = true,
  className = "",
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Performance optimization: Only recalculate when dependencies change
  const pageNumbers = useMemo(() => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(currentPage - half, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);
  
  // Show ellipsis logic
  const showStartEllipsis = pageNumbers[0] > 2;
  const showEndEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages - 1;
  
  if (totalPages <= 1) return null;
  
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };
  
  const buttonClass = (isActive = false, isDisabled = false) => `
    px-3 py-2 mx-1 text-sm font-medium rounded-lg transition-all duration-200
    ${isActive 
      ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
    }
    ${isDisabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:shadow-md cursor-pointer'
    }
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `.trim();
  
  return (
    <nav 
      className={`flex items-center justify-center space-x-1 ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* First Page Button */}
      {showFirstLast && currentPage > 1 && (
        <button
          onClick={() => handlePageClick(1)}
          className={buttonClass(false, false)}
          aria-label="Go to first page"
        >
          First
        </button>
      )}
      
      {/* Previous Button */}
      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={buttonClass(false, currentPage === 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      
      {/* Page 1 (if not in visible range) */}
      {showStartEllipsis && (
        <>
          <button
            onClick={() => handlePageClick(1)}
            className={buttonClass(false, false)}
            aria-label="Go to page 1"
          >
            1
          </button>
          <span className="px-2 py-2 text-gray-500">
            <MoreHorizontal size={16} />
          </span>
        </>
      )}
      
      {/* Page Numbers */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={buttonClass(page === currentPage, false)}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      {/* Last Page (if not in visible range) */}
      {showEndEllipsis && (
        <>
          <span className="px-2 py-2 text-gray-500">
            <MoreHorizontal size={16} />
          </span>
          <button
            onClick={() => handlePageClick(totalPages)}
            className={buttonClass(false, false)}
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}
      
      {/* Next Button */}
      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={buttonClass(false, currentPage === totalPages)}
          aria-label="Go to next page"
        >
          <ChevronRight size={16} />
        </button>
      )}
      
      {/* Last Page Button */}
      {showFirstLast && currentPage < totalPages && (
        <button
          onClick={() => handlePageClick(totalPages)}
          className={buttonClass(false, false)}
          aria-label="Go to last page"
        >
          Last
        </button>
      )}
    </nav>
  );
};

// Alternative implementation: Simple pagination
export const SimplePagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm bg-white border rounded-lg disabled:opacity-50"
      >
        Previous
      </button>
      
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm bg-white border rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

// Alternative implementation: Pagination with page size selector
export const PaginationWithPageSize = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border rounded"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span className="text-sm text-gray-700">entries</span>
      </div>
      
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        maxVisiblePages={3}
      />
    </div>
  );
};

export default Pagination;