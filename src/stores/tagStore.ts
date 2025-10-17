// stores/tagStore.ts
import { defineStore } from 'pinia';
import { get, post, crawlPost, getWithRetry } from '@/utils/request';

// 标签数据类型定义
export interface Tag {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  hotValue: number;
  growth: number;
  videoCount: number;
  playCount: number;
  interactionRate: number;
  isNew: boolean;
  newVideos: number;
  description?: string;
  subscribeCount?: number;
  crawlTime?: string;
  fontSize?: number;
  opacity?: number;
  color?: string;
}

export interface TagStats {
  tagName: string;
  totalVideos: number;
  totalPlays: number;
  totalLikes: number;
  totalFavorites: number;
  totalComments: number;
  totalShares: number;
  hotValue: number;
  growthRate: number;
  interactionRate: number;
  avgPlayPerVideo: number;
  avgLikePerVideo: number;
  topVideos: any[];
  relatedTags: any[];
  crawlDate: string;
}

export interface TagVideo {
  bvid: string;
  title: string;
  upName: string;
  cover: string;
  play: number;
  like: number;
  danmaku: number;
  coin: number;
  favorite: number;
  share: number;
  comment: number;
  publishTime: string;
  duration: string;
  hotScore: number;
  tags: string[];
}

export interface TagAnalysisResponse {
  success: boolean;
  tagName: string;
  tagStats: TagStats;
  videos: TagVideo[];
  relatedTags: any[];
  trendData: any[];
  ranking: any[];
  crawlTime: string;
  processingTime: number;
  totalVideosFound: number;
  message: string;
}

export interface TagRankingResponse {
  success: boolean;
  ranking: Tag[];
  total: number;
  period: string;
  updatedAt: string;
}

export interface TagCloudResponse {
  success: boolean;
  data: {
    tags: TagItemDTO[];
    totalTags: number;
    poolSize: number;
    lastUpdateTime: number;
  };
}

export interface TagItemDTO {
  name: string;
  displayName: string;
  category: string;
  color: string;
  value: number;
  fontSize: number;
  opacity: number;
  hotScore: number;
}

// 标签分析状态
interface TagState {
  currentTag: Tag | null;
  tagStats: TagStats | null;
  tagVideos: TagVideo[];
  relatedTags: Tag[];
  trendData: any[];
  rankingData: Tag[];
  tagCloud: TagItemDTO[];
  loading: boolean;
  error: string | null;
  searchResults: Tag[];
  comparedTags: Tag[];
  crawlProgress: number;
  isCrawling: boolean;
}

export const useTagStore = defineStore('tag', {
  state: (): TagState => ({
    currentTag: null,
    tagStats: null,
    tagVideos: [],
    relatedTags: [],
    trendData: [],
    rankingData: [],
    tagCloud: [],
    loading: false,
    error: null,
    searchResults: [],
    comparedTags: [],
    crawlProgress: 0,
    isCrawling: false
  }),

  getters: {
    hasTagData: (state): boolean => !!state.currentTag,
    hasVideos: (state): boolean => state.tagVideos.length > 0,
    videoCount: (state): number => state.tagVideos.length,
    topVideos: (state): TagVideo[] => state.tagVideos.slice(0, 10),
    isInComparison: (state) => (tag: Tag) =>
      state.comparedTags.some(t => t.id === tag.id),
    comparisonCount: (state): number => state.comparedTags.length,
    cloudTags: (state): TagItemDTO[] => state.tagCloud
  },

  actions: {
    /**
     * 获取词云数据
     */
    async fetchTagCloud(): Promise<TagItemDTO[]> {
      try {
        console.log('🌈 获取词云数据...');
        this.loading = true;
        this.error = null;

        const response = await get<TagCloudResponse>('/api/tags/cloud');

        if (response && response.success) {
          this.tagCloud = response.data.tags || [];
          console.log(`✅ 获取词云数据成功，共 ${this.tagCloud.length} 个标签`);
          return this.tagCloud;
        } else {
          throw new Error(response?.message || '获取词云数据失败');
        }
      } catch (error: any) {
        console.error('❌ 获取词云数据失败:', error);
        this.error = error.message || '获取词云数据失败';
        this.tagCloud = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 搜索标签
     */
    async searchTags(keyword: string, category?: string): Promise<Tag[]> {
      try {
        console.log(`🔍 搜索标签: ${keyword}`, category ? `分类: ${category}` : '');
        this.loading = true;
        this.error = null;

        const response = await get<TagRankingResponse>('/api/tags/search', {
          keyword,
          category,
          limit: 20
        });

        if (response && response.success) {
          this.searchResults = response.ranking || [];
          console.log(`✅ 搜索成功，找到 ${this.searchResults.length} 个标签`);
          return this.searchResults;
        } else {
          throw new Error(response?.message || '搜索失败');
        }
      } catch (error: any) {
        console.error('❌ 搜索标签失败:', error);
        this.error = error.message || '搜索失败';
        this.searchResults = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取标签热度榜单
     */
    async fetchTagRanking(rankingType: string = 'hot', period: string = '7d'): Promise<Tag[]> {
      try {
        console.log(`📊 获取标签榜单: ${rankingType} - ${period}`);
        this.loading = true;

        const response = await get<TagRankingResponse>('/api/tags/ranking', {
          type: rankingType,
          period: period,
          limit: 50
        });

        if (response && response.success) {
          this.rankingData = response.ranking || [];
          console.log(`✅ 获取榜单成功，共 ${this.rankingData.length} 个标签`);
          return this.rankingData;
        } else {
          throw new Error(response?.message || '获取榜单失败');
        }
      } catch (error: any) {
        console.error('❌ 获取标签榜单失败:', error);
        this.error = error.message || '获取榜单失败';
        this.rankingData = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取标签详情分析
     */
    async fetchTagAnalysis(tagName: string): Promise<TagAnalysisResponse> {
      try {
        console.log(`🔍 获取标签分析: ${tagName}`);
        this.loading = true;
        this.error = null;

        const response = await getWithRetry<TagAnalysisResponse>(`/api/tags/${encodeURIComponent(tagName)}/analysis`);

        if (response && response.success) {
          this.currentTag = {
            id: response.tagName,
            name: response.tagName,
            category: '待分类',
            categoryColor: '#667eea',
            hotValue: response.tagStats?.hotValue || 0,
            growth: response.tagStats?.growthRate || 0,
            videoCount: response.tagStats?.totalVideos || 0,
            playCount: response.tagStats?.totalPlays || 0,
            interactionRate: response.tagStats?.interactionRate || 0,
            isNew: false,
            newVideos: 0,
            crawlTime: response.crawlTime
          };

          this.tagStats = response.tagStats;
          this.tagVideos = response.videos || [];
          this.relatedTags = response.relatedTags || [];
          this.trendData = response.trendData || [];

          console.log(`✅ 标签分析成功: ${tagName}`, {
            视频数量: this.tagVideos.length,
            相关标签: this.relatedTags.length,
            趋势数据: this.trendData.length
          });

          return response;
        } else {
          throw new Error(response?.message || '获取标签分析失败');
        }
      } catch (error: any) {
        console.error('❌ 获取标签分析失败:', error);
        this.error = error.message || '获取标签分析失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 触发标签数据爬取
     */
    async triggerTagCrawl(tagName: string): Promise<any> {
      try {
        console.log(`🚀 触发标签数据爬取: ${tagName}`);
        this.isCrawling = true;
        this.crawlProgress = 0;

        // 模拟进度更新
        const progressInterval = setInterval(() => {
          if (this.crawlProgress < 90) {
            this.crawlProgress += 10;
          }
        }, 1000);

        const response = await crawlPost<any>(`/api/tags/${encodeURIComponent(tagName)}/crawl`, {
          maxPages: 3,
          maxVideos: 100
        });

        clearInterval(progressInterval);
        this.crawlProgress = 100;

        if (response && response.success) {
          console.log('✅ 标签数据爬取成功');
          // 爬取完成后自动刷新分析数据
          await this.fetchTagAnalysis(tagName);
          return response;
        } else {
          throw new Error(response?.message || '数据爬取失败');
        }
      } catch (error: any) {
        console.error('❌ 标签数据爬取失败:', error);
        this.error = error.message || '数据爬取失败';
        throw error;
      } finally {
        this.isCrawling = false;
        this.crawlProgress = 0;
      }
    },

    /**
     * 添加到词云池
     */
    async addToCloudPool(tagName: string): Promise<any> {
      try {
        console.log(`➕ 添加标签到词云池: ${tagName}`);

        const response = await post<any>(`/api/tags/${encodeURIComponent(tagName)}/add-to-cloud`);

        if (response && response.success) {
          console.log('✅ 标签已添加到词云池');
          // 刷新词云数据
          await this.fetchTagCloud();
          return response;
        } else {
          throw new Error(response?.message || '添加到词云池失败');
        }
      } catch (error: any) {
        console.error('❌ 添加到词云池失败:', error);
        this.error = error.message || '添加到词云池失败';
        throw error;
      }
    },

    /**
     * 从词云池移除
     */
    async removeFromCloudPool(tagName: string): Promise<any> {
      try {
        console.log(`➖ 从词云池移除标签: ${tagName}`);

        const response = await post<any>(`/api/tags/${encodeURIComponent(tagName)}/remove-from-cloud`);

        if (response && response.success) {
          console.log('✅ 标签已从词云池移除');
          // 刷新词云数据
          await this.fetchTagCloud();
          return response;
        } else {
          throw new Error(response?.message || '从词云池移除失败');
        }
      } catch (error: any) {
        console.error('❌ 从词云池移除失败:', error);
        this.error = error.message || '从词云池移除失败';
        throw error;
      }
    },

    /**
     * 刷新词云池
     */
    async refreshCloudPool(): Promise<any> {
      try {
        console.log('🔄 刷新词云池...');

        const response = await post<any>('/api/tags/cloud/refresh');

        if (response && response.success) {
          console.log('✅ 词云池刷新成功');
          // 刷新词云数据
          await this.fetchTagCloud();
          return response;
        } else {
          throw new Error(response?.message || '刷新词云池失败');
        }
      } catch (error: any) {
        console.error('❌ 刷新词云池失败:', error);
        this.error = error.message || '刷新词云池失败';
        throw error;
      }
    },

    /**
     * 添加标签到对比列表
     */
    addToComparison(tag: Tag): void {
      if (this.comparedTags.length >= 3) {
        throw new Error('最多可以比较3个标签');
      }

      if (!this.comparedTags.some(t => t.id === tag.id)) {
        this.comparedTags.push(tag);
        console.log(`✅ 已添加标签到对比: ${tag.name}`);
      }
    },

    /**
     * 从对比列表移除标签
     */
    removeFromComparison(tag: Tag): void {
      this.comparedTags = this.comparedTags.filter(t => t.id !== tag.id);
      console.log(`✅ 已从对比移除标签: ${tag.name}`);
    },

    /**
     * 清空对比列表
     */
    clearComparison(): void {
      this.comparedTags = [];
      console.log('✅ 已清空对比列表');
    },

    /**
     * 清除当前标签数据
     */
    clearCurrentTag(): void {
      this.currentTag = null;
      this.tagStats = null;
      this.tagVideos = [];
      this.relatedTags = [];
      this.trendData = [];
      this.error = null;
      console.log('✅ 已清除当前标签数据');
    },

    /**
     * 重置所有数据
     */
    reset(): void {
      this.currentTag = null;
      this.tagStats = null;
      this.tagVideos = [];
      this.relatedTags = [];
      this.trendData = [];
      this.rankingData = [];
      this.tagCloud = [];
      this.searchResults = [];
      this.comparedTags = [];
      this.loading = false;
      this.error = null;
      this.crawlProgress = 0;
      this.isCrawling = false;
      console.log('✅ 已重置标签分析状态');
    }
  }
});
