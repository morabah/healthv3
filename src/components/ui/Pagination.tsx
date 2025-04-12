/**
 * Pagination Component
 * A versatile pagination component for navigating through large datasets
 */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  size = 'md',
  className = ''
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    // Always include first and last page
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;
    
    // Calculate the range of pages to show around the current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPageIndex);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPageIndex);
    
    // Determine if we need to show ellipses
    const shouldShowLeftDots = leftSiblingIndex > firstPageIndex + 1;
    const shouldShowRightDots = rightSiblingIndex < lastPageIndex - 1;
    
    // Generate the page numbers array
    const pageNumbers: (number | 'dots')[] = [];
    
    // Always show first page if showFirstLast is true
    if (showFirstLast && firstPageIndex < leftSiblingIndex) {
      pageNumbers.push(firstPageIndex);
      
      // Add left ellipsis if needed
      if (shouldShowLeftDots) {
        pageNumbers.push('dots');
      }
    }
    
    // Add page numbers around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pageNumbers.push(i);
    }
    
    // Add right ellipsis if needed
    if (shouldShowRightDots) {
      pageNumbers.push('dots');
    }
    
    // Always show last page if showFirstLast is true
    if (showFirstLast && lastPageIndex > rightSiblingIndex) {
      pageNumbers.push(lastPageIndex);
    }
    
    return pageNumbers;
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };
  
  // Page numbers to display
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className={`flex items-center justify-center ${className}`} aria-label="Pagination">
      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center rounded-md
          ${currentPage === 1 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        aria-label="Previous page"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" aria-hidden="true" />
      </button>
      
      {/* Page numbers */}
      <div className="flex items-center mx-2">
        {pageNumbers.map((page, index) => {
          if (page === 'dots') {
            return (
              <span
                key={`dots-${index}`}
                className={`${sizeClasses[size]} flex items-center justify-center text-gray-500`}
              >
                <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" aria-hidden="true" />
              </span>
            );
          }
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                ${sizeClasses[size]} 
                flex items-center justify-center rounded-md mx-1
                ${currentPage === page 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>
      
      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center rounded-md
          ${currentPage === totalPages 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        aria-label="Next page"
      >
        <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
