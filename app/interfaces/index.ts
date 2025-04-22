export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface Filter<T> {
  sortBy: keyof T;
  sortDirection: SortDirection;
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
interface ExpenseQuery<T> {
  page?: number;
  sortBy?: keyof T;
  sortDirection?: SortDirection;
}

interface BudgetQuery {
  page?: number;
}

export interface QueryParams<T> {
  expense?: ExpenseQuery<T>;
  budget?: BudgetQuery;
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
