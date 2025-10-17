// API通用响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 错误响应
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  status?: number;
  timestamp?: string;
  path?: string;
}
