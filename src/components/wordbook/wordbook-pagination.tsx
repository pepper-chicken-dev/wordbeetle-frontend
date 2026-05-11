'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { PaginationView } from '@/lib/dto/wordbook';
import { useSearchParams } from 'next/navigation';

type Props = {
  pagination: PaginationView;
};

export function WordbookPagination({ pagination }: Props) {
  const searchParams = useSearchParams();
  const { current_page: currentPage, total_pages: totalPages } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const buildHref = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return qs === '' ? '?' : `?${qs}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildHref(Math.max(1, currentPage - 1))}
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            className={
              isFirst ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={buildHref(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={buildHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
            className={
              isLast ? 'pointer-events-none opacity-50' : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
