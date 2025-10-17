import { ApiResponse } from './api';

// UP主基础信息
export interface Up {
  id: number;
  uid: string;
  name: string;
  avatar: string;
  videos?: Video[];
  _raw?: any;
}

// UP主统计数据
export interface UpStat {
  id: number;
  upId: number;
  recordDate: string;
  followerCount: number;
  totalViewCount: number;
}

// UP主详情响应
export interface UpDetailResponse extends ApiResponse {
  up: Up;
  stats?: UpStat[];
  statsCount?: number;
}

// UP主视频列表响应
export interface UpVideosResponse extends ApiResponse {
  videos?: Video[];
  videoCount?: number;
  up?: Up;
}

// UP主完整信息响应
export interface UpFullResponse extends ApiResponse {
  up: Up;
  videos: Video[];
  stats: UpStat[];
  videoCount: number;
  statsCount: number;
}

// UP主爬取响应
export interface UpCrawlResponse extends ApiResponse {
  uid: string;
  output?: string;
  error?: string;
}
