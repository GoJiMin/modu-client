import * as React from 'react';
import {ChevronLeft, ChevronRight, MoreHorizontal} from 'lucide-react';

import {cn} from '@/shared/lib/utils/cn';
import {ButtonProps, buttonVariants} from '@/shared/shadcnComponent/ui/button';
import Link from 'next/link';

const ShadcnPagination = ({className, ...props}: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
ShadcnPagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({className, ...props}, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-0.5 md:gap-1', className)} {...props} />
  ),
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({className, ...props}, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<typeof Link>;

const PaginationLink = ({className, isActive, size = 'icon', ...props}: PaginationLinkProps) => (
  <Link
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({className, ...props}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="이전 페이지로 이동"
    size="default"
    className={cn('gap-0.5 pl-1.5 text-sm md:text-base', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>이전</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({className, ...props}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="다음 페이지로 이동"
    size="default"
    className={cn('gap-0.5 pr-1.5 text-sm md:text-base', className)}
    {...props}
  >
    <span>다음</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({className, ...props}: React.ComponentProps<'span'>) => (
  <span aria-hidden className={cn('flex h-3 w-3 md:w-6 md:h-6 items-center justify-center', className)} {...props}>
    <MoreHorizontal className="h-3 md:h-4 w-3 md:w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  ShadcnPagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
