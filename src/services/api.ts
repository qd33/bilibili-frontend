import { get, post, crawlPost } from '@/utils/request'; // 使用封装的请求方法
import type {
  VideoDetailResponse,
  VideoTrendResponse,
  UpDetailResponse,
  UpVideosResponse,
  UpFullResponse,
  UpCrawlResponse,
  ApiResponse
} from '@/types';

const API_BASE_URL = '/api';

export const videoApi = {
  getVideoDetail: (bvId: string): Promise<VideoDetailResponse> => {
    return get(`${API_BASE_URL}/video/${bvId}`);
  },

  getVideoTrend: (bvId: string): Promise<VideoTrendResponse> => {
    return get(`${API_BASE_URL}/video/${bvId}/trend`);
  },

  checkVideoExists: (bvId: string): Promise<ApiResponse<{ exists: boolean }>> => {
    return get(`${API_BASE_URL}/video/${bvId}/exists`);
  },

  saveVideo: (videoData: any): Promise<ApiResponse> => {
    return post(`${API_BASE_URL}/video`, videoData);
  },

  saveVideoStats: (bvId: string, statData: any): Promise<ApiResponse> => {
    return post(`${API_BASE_URL}/video/${bvId}/stats`, statData);
  },

  getHotVideos: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/video/hot`);
  },

  searchVideos: (keyword: string): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/video/search?keyword=${encodeURIComponent(keyword)}`);
  }
};

export const upApi = {
  getUpDetail: (uid: string): Promise<UpDetailResponse> => {
    return get(`${API_BASE_URL}/up/${uid}`);
  },

  getUpTrend: (uid: string): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/up/${uid}/trend`);
  },

  checkUpExists: (uid: string): Promise<ApiResponse<{ exists: boolean }>> => {
    return get(`${API_BASE_URL}/up/${uid}/exists`);
  },

  saveUp: (upData: any): Promise<ApiResponse> => {
    return post(`${API_BASE_URL}/up`, upData);
  },

  // 🎯 修复：使用专门的 crawlPost 方法
  triggerUpCrawl: (uid: string): Promise<UpCrawlResponse> => {
    return crawlPost(`${API_BASE_URL}/up/${uid}/crawl`);
  },

  getUpVideos: (uid: string): Promise<UpVideosResponse> => {
    return get(`${API_BASE_URL}/up/${uid}/videos`);
  },

  getUpDetailWithVideos: (uid: string): Promise<UpFullResponse> => {
    return get(`${API_BASE_URL}/up/${uid}/detail`);
  },

  checkPythonEnvironment: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/up/python/check`);
  }
};

export const statsApi = {
  getOverviewStats: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/stats/overview`);
  },

  getPartitionStats: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/stats/partitions`);
  },

  getSystemStatus: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/stats/system`);
  }
};

export const testApi = {
  testHello: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/test/hello`);
  },

  testConnection: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/test/connection`);
  },

  testVideoController: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/video/test`);
  },

  testUpController: (): Promise<ApiResponse> => {
    return get(`${API_BASE_URL}/up/test`);
  },

  testEcho: (data: any): Promise<ApiResponse> => {
    return post(`${API_BASE_URL}/test/echo`, data);
  }
};

export default {
  video: videoApi,
  up: upApi,
  stats: statsApi,
  test: testApi
};
