export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export type TableHeader =
  | { id: string; title?: string; isSortable: true; width?: string } // id is used for the 'sortBy' query param
  | { id?: string; title?: string; isSortable: false; width?: string };

export interface Filter<T> {
  page: number;
  pageSize: number;
  sortBy: keyof T;
  sortDirection: SortDirection;
}

export interface ListResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}
