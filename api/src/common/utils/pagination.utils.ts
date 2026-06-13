import { PaginationMeta } from '../types/pagination.interface';

export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    currentPage: page,
    totalPages,
    limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function getPaginationParams(page = 1, limit = 20): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
