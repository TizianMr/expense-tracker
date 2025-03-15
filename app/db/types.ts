export type Filter = {
  page: number;
  pageSize: number;
};

export type ListResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
};
