import { ApiResponse } from './api';

// 视频基础信息
export interface Video {
  bvid: string;
  title: string;
  cover: string;
  description: string;
  play: number;
  like: number;
  danmaku: number;
  publishTime: string;
  partition: string;
  _raw?: any;
}

// 视频统计数据
export interface VideoStat {
  id: number;
  videoId: number;
  recordDate: string;
  viewCount: number;
  likeCount: number;
  coinCount: number;
  favoriteCount: number;
  danmakuCount: number;
  replyCount: number;
  shareCount: number;
}

// 视频详情响应
export interface VideoDetailResponse extends ApiResponse {
  video: Video;
  stats?: VideoStat[];
  statsCount?: number;
}

// 视频趋势响应
export interface VideoTrendResponse extends ApiResponse {
  trend: VideoStat[];
}
