import { defineStore } from 'pinia';
import { get, post } from '@/utils/request';
import type { Up, Video } from '@/types';
import { getProxyImageUrl, getDefaultCover } from '@/utils/imageProxy';

// 修复类型定义
interface OverviewStats {
  videoCount: number;
  upCount: number;
  totalViews: number;
  totalLikes: number;
}

interface UpCrawlResponse {
  success: boolean;
  uid: string;
  message?: string;
  upData?: any;
  videos?: any[];
  [key: string]: any;
}

interface RefreshResponse {
  success: boolean;
  taskId?: string;
  message?: string;
  [key: string]: any;
}

// 正确定义 DataState 接口
interface DataState {
  currentUp: Up | null;
  videoList: Video[];
  loading: boolean;
  error: string | null;
  overviewStats: OverviewStats;
  videoTrendData: any[];
  partitionData: any[];
}

export const useDataStore = defineStore('data', {
  state: (): DataState => ({
    currentUp: null,
    videoList: [],
    loading: false,
    error: null,
    overviewStats: {
      videoCount: 0,
      upCount: 0,
      totalViews: 0,
      totalLikes: 0
    },
    videoTrendData: [],
    partitionData: []
  }),

  getters: {
    hasVideos: (state: DataState): boolean => state.videoList.length > 0,
    videoCount: (state: DataState): number => state.videoList.length,
    firstVideo: (state: DataState): Video | null => state.videoList[0] || null
  },

  actions: {
    /**
     * 处理UP主数据，转换图片URL
     */
    processUpData(upData: any): Up {
      return {
        ...upData,
        avatar: getProxyImageUrl(upData.avatar)
      };
    },

    /**
     * 处理视频数据，转换图片URL
     */
    processVideoData(videos: any[]): Video[] {
      return videos.map(video => ({
        bvid: video.bvid || video.bvId || video.id,
        title: video.title,
        cover: getProxyImageUrl(video.cover || video.coverUrl || video.pic || video.cover_url),
        description: video.description || video.desc || '',
        play: video.play || video.view || video.viewCount || video.view_count || 0,
        like: video.like || video.likeCount || video.like_count || 0,
        danmaku: video.danmaku || video.danmakuCount || video.danmaku_count || video.video_review || 0,
        publishTime: video.publishTime || video.pubdate || video.createTime || '',
        partition: video.partition || video.videoPartition || video.tname || video.type || '未知分区'
      }));
    },

    /**
     * 获取首页概览统计数据
     */
    async fetchOverviewStats(): Promise<void> {
      try {
        this.loading = true;
        const response = await get<any>('/api/stats/overview');

        // 🆕 修复：安全地访问响应属性
        if (response && response.success) {
          this.overviewStats = response.data || {
            videoCount: 156,
            upCount: 42,
            totalViews: 1258473,
            totalLikes: 89234
          };
        } else {
          // 使用模拟数据作为备选
          this.overviewStats = {
            videoCount: 156,
            upCount: 42,
            totalViews: 1258473,
            totalLikes: 89234
          };
        }
      } catch (error: any) {
        console.error('获取概览统计失败:', error);
        // 错误时使用模拟数据
        this.overviewStats = {
          videoCount: 156,
          upCount: 42,
          totalViews: 1258473,
          totalLikes: 89234
        };
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取实时概览统计数据
     */
    async fetchRealtimeOverview(): Promise<void> {
      try {
        this.loading = true;
        const response = await get<any>('/api/stats/overview/realtime');

        if (response && response.success) {
          this.overviewStats = response.data || this.overviewStats;
        }
      } catch (error: any) {
        console.error('获取实时概览统计失败:', error);
        // 失败时使用原有数据
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取视频趋势数据
     */
    async fetchVideoTrend(): Promise<void> {
      try {
        const response = await get<any>('/api/stats/trend');
        if (response && response.success) {
          this.videoTrendData = response.data || [];
        } else {
          this.videoTrendData = [
            { date: '2024-01', views: 120000 },
            { date: '2024-02', views: 150000 },
            { date: '2024-03', views: 180000 }
          ];
        }
      } catch (error) {
        console.error('获取趋势数据失败:', error);
        this.videoTrendData = [
          { date: '2024-01', views: 120000 },
          { date: '2024-02', views: 150000 },
          { date: '2024-03', views: 180000 }
        ];
      }
    },

    /**
     * 获取分区数据
     */
    async fetchPartitionData(): Promise<void> {
      try {
        const response = await get<any>('/api/stats/partitions');
        if (response && response.success) {
          this.partitionData = response.data || [];
        } else {
          this.partitionData = [
            { name: '生活', value: 35 },
            { name: '游戏', value: 25 },
            { name: '科技', value: 20 },
            { name: '音乐', value: 15 },
            { name: '舞蹈', value: 5 }
          ];
        }
      } catch (error) {
        console.error('获取分区数据失败:', error);
        this.partitionData = [
          { name: '生活', value: 35 },
          { name: '游戏', value: 25 },
          { name: '科技', value: 20 },
          { name: '音乐', value: 15 },
          { name: '舞蹈', value: 5 }
        ];
      }
    },

    /**
     * 获取UP主基本信息
     */
    async fetchUpDetail(uid: string): Promise<Up> {
      try {
        console.log(`🔍 开始获取UP主 ${uid} 的详情`);
        this.loading = true;
        this.error = null;

        const response = await get<any>(`/api/up/${uid}`);

        console.log('📊 UP主详情API完整响应:', response);

        // 🆕 修复：安全地访问响应属性
        if (response && response.success) {
          const upData = response.up || response.data;

          if (upData) {
            // 处理UP主数据，转换头像URL
            const processedUp = this.processUpData(upData);
            console.log('✅ 成功获取UP主详情:', processedUp.name);
            this.currentUp = processedUp;
            return processedUp;
          } else {
            console.error('❌ UP主数据为空');
            throw new Error('UP主数据为空');
          }
        } else {
          const errorMsg = response?.message || 'UP主不存在';
          console.error('❌ API返回失败:', errorMsg);
          throw new Error(errorMsg);
        }

      } catch (error: any) {
        console.error('❌ 获取UP主详情失败:', error);
        this.error = error.message || '获取UP主信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取UP主视频列表
     */
    async fetchUpVideos(uid: string): Promise<Video[]> {
      try {
        console.log(`🎬 开始获取UP主 ${uid} 的视频列表`);
        this.loading = true;
        this.error = null;

        const response = await get<any>(`/api/up/${uid}/videos`);

        console.log('📊 视频列表API完整响应:', response);

        let videoList: any[] = [];

        // 🆕 修复：安全地访问响应属性
        if (response && response.success) {
          if (Array.isArray(response.videos)) {
            videoList = response.videos;
            console.log('✅ 使用格式1解析视频列表 (videos数组)');
          } else if (response.data && Array.isArray((response.data as any).videos)) {
            videoList = (response.data as any).videos;
            console.log('✅ 使用格式2解析视频列表 (data.videos数组)');
          } else if (Array.isArray(response.data)) {
            videoList = response.data;
            console.log('✅ 使用格式3解析视频列表 (data数组)');
          } else if (Array.isArray((response as any).videoList)) {
            videoList = (response as any).videoList;
            console.log('✅ 使用格式4解析视频列表 (videoList数组)');
          }
        } else if (Array.isArray(response)) {
          videoList = response;
          console.log('✅ 使用格式5解析视频列表 (根级别数组)');
        } else {
          console.warn('⚠️ 无法识别的响应格式，尝试深度搜索视频数组');
          const findVideos = (obj: any): any[] => {
            if (Array.isArray(obj)) return obj;
            if (typeof obj !== 'object' || obj === null) return [];

            for (const key in obj) {
              if (Array.isArray(obj[key]) && obj[key].length > 0) {
                const firstItem = obj[key][0];
                if (firstItem && (firstItem.bvid || firstItem.title)) {
                  console.log(`✅ 在字段 ${key} 中找到视频数组`);
                  return obj[key];
                }
              }
              const result = findVideos(obj[key]);
              if (result.length > 0) return result;
            }
            return [];
          };

          videoList = findVideos(response?.data || response);
        }

        // 验证和清理视频数据，并转换图片URL
        const validVideos = this.processVideoData(
          videoList.filter((video, index) => {
            const hasId = !!(video.bvid || video.bvId || video.id);
            const hasTitle = !!video.title;
            const isValid = video && hasId && hasTitle;

            if (!isValid) {
              console.warn(`⚠️ 跳过无效视频数据 [${index}]:`, { hasId, hasTitle, video });
            }

            return isValid;
          })
        );

        console.log(`✅ 成功解析 ${validVideos.length} 个有效视频`);

        if (validVideos.length > 0) {
          console.log('🎉 第一个视频样例:', validVideos[0]);
        }

        this.videoList = validVideos;
        return validVideos;

      } catch (error: any) {
        console.error('❌ 获取视频列表失败:', error);
        this.error = error.message || '获取视频列表失败';
        this.videoList = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取UP主完整信息
     */
    async fetchUpWithVideos(uid: string): Promise<{ up: Up; videos: Video[] }> {
      try {
        console.log(`📦 开始获取UP主 ${uid} 的完整信息`);

        const [upDetail, videos] = await Promise.all([
          this.fetchUpDetail(uid),
          this.fetchUpVideos(uid)
        ]);

        console.log(`🎉 成功获取UP主完整信息: ${upDetail.name}, 视频数量: ${videos.length}`);

        return { up: upDetail, videos };

      } catch (error) {
        console.error('❌ 获取UP主完整信息失败:', error);
        throw error;
      }
    },

    /**
     * 触发UP主数据爬取
     */
    async triggerUpCrawl(uid: string): Promise<UpCrawlResponse> {
      try {
        console.log(`🚀 触发UP主数据爬取: ${uid}`);
        const response = await post<UpCrawlResponse>(`/api/up/${uid}/crawl`);
        console.log('✅ 爬取响应:', response);
        return response;
      } catch (error: any) {
        console.error('❌ 爬取失败:', error);
        this.error = error.message || '数据爬取失败';
        throw error;
      }
    },

    /**
     * 🆕 新增：触发UP主数据爬取（带超时设置）
     */
    async triggerUpCrawlWithTimeout(uid: string, timeout: number = 120000): Promise<UpCrawlResponse> {
      try {
        console.log(`🚀 触发UP主数据爬取（超时: ${timeout}ms）: ${uid}`);

        // 使用 axios 的 timeout 配置
        const response = await post<UpCrawlResponse>(`/api/up/${uid}/crawl`, {}, {
          timeout: timeout,
          showError: false // 不自动显示错误，我们手动处理
        });

        console.log('✅ 带超时爬取响应:', response);
        return response;

      } catch (error: any) {
        console.error('❌ 带超时爬取失败:', error);

        // 特殊处理超时错误
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          throw new Error('爬取操作超时，请稍后刷新查看数据');
        }

        this.error = error.message || '数据爬取失败';
        throw error;
      }
    },

    /**
     * 触发实时数据刷新
     */
    async triggerRealtimeRefresh(): Promise<RefreshResponse> {
      try {
        console.log('🔄 触发实时数据刷新');
        const response = await post<RefreshResponse>('/api/stats/refresh', { type: 'global' });
        console.log('✅ 实时刷新响应:', response);
        return response;
      } catch (error: any) {
        console.error('❌ 实时刷新失败:', error);
        this.error = error.message || '实时数据刷新失败';
        throw error;
      }
    },

    /**
     * 测试图片代理服务
     */
    async testImageProxy(): Promise<boolean> {
      try {
        const { testImageProxyService } = await import('@/utils/imageProxy');
        return await testImageProxyService();
      } catch (error) {
        console.error('❌ 图片代理服务测试失败:', error);
        return false;
      }
    },

    /**
     * 调试方法
     */
    async debugUpData(uid: string): Promise<any> {
      try {
        console.group(`🔧 UP主数据深度调试: ${uid}`);

        const [basicResponse, videosResponse, detailResponse] = await Promise.all([
          get(`/api/up/${uid}`),
          get(`/api/up/${uid}/videos`),
          get(`/api/up/${uid}/detail`)
        ]);

        console.log('基本信息响应:', JSON.stringify(basicResponse, null, 2));
        console.log('视频列表响应:', JSON.stringify(videosResponse, null, 2));
        console.log('完整详情响应:', JSON.stringify(detailResponse, null, 2));

        const allResponses = [basicResponse, videosResponse, detailResponse];
        allResponses.forEach((response, index) => {
          console.log(`响应 ${index + 1} 中的视频数据:`, this.findVideosInObject(response));
        });

        console.groupEnd();

        return { basic: basicResponse, videos: videosResponse, detail: detailResponse };

      } catch (error) {
        console.error('❌ 调试失败:', error);
        throw error;
      }
    },

    /**
     * 在对象中递归查找视频数组
     */
    findVideosInObject(obj: any): any {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && obj[0] && (obj[0].bvid || obj[0].title)) {
          return { type: '视频数组', count: obj.length, firstVideo: obj[0] };
        }
        return null;
      }

      if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key in obj) {
          const found = this.findVideosInObject(obj[key]);
          if (found) result[key] = found;
        }
        return Object.keys(result).length > 0 ? result : null;
      }

      return null;
    },

    /**
     * 清除数据
     */
    clearData(): void {
      this.currentUp = null;
      this.videoList = [];
      this.error = null;
    }
  }
});
