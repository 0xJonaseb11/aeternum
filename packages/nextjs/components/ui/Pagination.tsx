"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = "",
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageRange = 2; // Number of pages to show around current page

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - pageRange && i <= currentPage + pageRange)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  if (totalPages <= 1 && !onPageSizeChange) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <>
            <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/40">Show</span>
            <select
              className="select select-bordered select-xs bg-base-100/50 hover:bg-base-100 transition-all font-medium"
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/40">items</span>
          </>
        )}
        <span className="text-[10px] font-medium text-base-content/30 ml-2">
          Total: <span className="text-base-content/60 font-bold">{totalItems}</span>
        </span>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <button
          className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div className="join join-horizontal bg-base-200/50 rounded-xl p-0.5 border border-base-300/30">
          {getVisiblePages().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                className={`join-item btn btn-xs border-none h-7 min-h-0 min-w-[28px] rounded-lg transition-all ${
                  currentPage === page
                    ? "btn-primary shadow-lg shadow-primary/20 scale-105 z-10"
                    : "btn-ghost hover:bg-base-300/50 text-base-content/60"
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="join-item btn btn-xs btn-ghost btn-disabled h-7 min-h-0 px-1 opacity-40">
                ...
              </span>
            ),
          )}
        </div>

        <button
          className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
