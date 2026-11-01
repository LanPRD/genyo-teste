export interface PaginationMeta {
  limit: number;
  nextCursor: string | null;
}

export class ApiResponse {
  static ok<T>(data: T) {
    return { data };
  }

  static paginated<T>(data: T[], meta: PaginationMeta) {
    return { data, meta };
  }
}
