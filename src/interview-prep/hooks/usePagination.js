import { useState, useMemo } from 'react';

/**
 * INTERVIEW QUESTION: "Create a custom hook for pagination"
 * 
 * Key concepts covered:
 * - Custom hook creation
 * - State management with useState
 * - Derived state with useMemo
 * - API design for reusability
 * - Performance considerations
 */

export const usePagination = ({
  totalItems = 0,
  initialPage = 1,
  initialPageSize = 10
} = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Derived state - computed values
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const startItem = totalItems > 0 ? startIndex + 1 : 0;
    const endItem = endIndex;
    
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    
    return {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      startItem,
      endItem,
      hasNextPage,
      hasPrevPage,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [currentPage, pageSize, totalItems]);

  // Actions
  const goToPage = (page) => {
    const targetPage = Math.max(1, Math.min(page, pagination.totalPages));
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(pagination.totalPages);
  };

  const changePageSize = (newPageSize) => {
    const newTotalPages = Math.ceil(totalItems / newPageSize);
    setPageSize(newPageSize);
    
    // Adjust current page if it's now out of bounds
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  };

  const reset = () => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  };

  // Utility function to get items for current page
  const getPageItems = (items = []) => {
    return items.slice(pagination.startIndex, pagination.endIndex);
  };

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changePageSize,
    reset,
    getPageItems,
    // Alternative naming for consistency with different APIs
    setPage: goToPage,
    setPageSize: changePageSize,
  };
};

/**
 * Alternative hook for server-side pagination
 * When you don't have all items locally
 */
export const useServerPagination = ({
  totalItems = 0,
  initialPage = 1,
  initialPageSize = 10,
  onPageChange = () => {},
  onPageSizeChange = () => {}
} = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [loading, setLoading] = useState(false);

  const pagination = useMemo(() => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [currentPage, pageSize, totalItems]);

  const goToPage = async (page) => {
    const targetPage = Math.max(1, Math.min(page, pagination.totalPages));
    if (targetPage !== currentPage && !loading) {
      setLoading(true);
      setCurrentPage(targetPage);
      try {
        await onPageChange(targetPage, pageSize);
      } finally {
        setLoading(false);
      }
    }
  };

  const changePageSize = async (newPageSize) => {
    if (newPageSize !== pageSize && !loading) {
      setLoading(true);
      setPageSize(newPageSize);
      
      const newTotalPages = Math.ceil(totalItems / newPageSize);
      const newPage = currentPage > newTotalPages ? 1 : currentPage;
      
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
      
      try {
        await onPageSizeChange(newPage, newPageSize);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    ...pagination,
    loading,
    goToPage,
    changePageSize,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
    firstPage: () => goToPage(1),
    lastPage: () => goToPage(pagination.totalPages),
  };
};

export default usePagination;