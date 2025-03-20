export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface ITableHeader {
  title: string;
  isSortable: boolean;
}

export interface Filter {
  page: number;
  pageSize: number;
}

export interface ListResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
}
