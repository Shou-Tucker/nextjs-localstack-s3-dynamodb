// 画像エントリーの型定義
export interface ImageEntry {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

// APIレスポンスの型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
