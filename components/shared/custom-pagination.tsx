"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  params: {
    page: number;
  };
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export default function CustomPagination({
  params,
  totalPages,
  handlePageChange,
}: CustomPaginationProps) {
  return (
    <div className="mt-8 flex justify-center">
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(params.page - 1);
              }}
              className={
                params.page === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {/* Page Numbers */}
          {Array.from({ length: 5 }, (_, index) => {
            const pageNumber = params.page - 2 + index;

            if (pageNumber > 0 && pageNumber <= totalPages) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNumber);
                    }}
                    className={
                      params.page === pageNumber
                        ? "bg-primary text-white hover:bg-primary/90 hover:text-white"
                        : ""
                    }
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(params.page + 1);
              }}
              className={
                params.page === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
