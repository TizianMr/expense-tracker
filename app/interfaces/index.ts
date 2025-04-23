import { Expense } from '@prisma/client';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface Filter<T> {
  sortBy: keyof T;
  sortDirection: SortDirection;
  filter?: {
    filterBy: keyof T;
    filterValue: T[keyof T];
  }[];
}
export interface FilterWithPagination<T> extends Filter<T> {
  page: number;
  pageSize: number;
}

export interface ListResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}

/*************QUERY PARAMS*************/
interface ExpenseQuery {
  page?: number;
  sortBy?: keyof Expense;
  sortDirection?: SortDirection;
}

interface BudgetQuery {
  page?: number;
}

interface BudgetDetailsQuery {
  page?: number;
  sortBy?: keyof Expense;
  sortDirection?: SortDirection;
  filter?: {
    filterBy: keyof Expense;
    filterValue: Expense[keyof Expense];
  };
}

export interface QueryParams {
  expense?: ExpenseQuery;
  budget?: BudgetQuery;
  budgetDetails?: BudgetDetailsQuery;
}

/*************TABLE*************/
export type ThDef = {
  id: string;
  title?: string;
  isSortable: boolean;
  options?: { align: 'left' | 'center' | 'right' };
}; // id is used for the 'sortBy' query param

export type TableState = {
  sortBy: string | null;
  sortDirection: SortDirection | null;
  paginationState: TablePaginationState;
};

export type TablePaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
};
