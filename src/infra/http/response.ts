export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export class ApiResponse {
  static ok<T>(data: T) {
    return { data };
  }

  static paginated<T>(data: T[], meta: PaginationMeta) {
    return { data, meta };
  }
}
