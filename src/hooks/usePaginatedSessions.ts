import { useMemo, useState, useCallback } from 'react';
import { Session } from '../types';

const SESSIONS_PER_PAGE = 50;

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  paginatedSessions: Session[];
  hasMore: boolean;
  loadMore: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

export function usePaginatedSessions(
  allSessions: Session[],
  itemsPerPage: number = SESSIONS_PER_PAGE
): PaginationResult {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allSessions.length / itemsPerPage);

  const paginatedSessions = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    return allSessions.slice(startIndex, endIndex);
  }, [allSessions, currentPage, itemsPerPage]);

  const hasMore = currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    paginatedSessions,
    hasMore,
    loadMore,
    goToPage,
    reset,
  };
}