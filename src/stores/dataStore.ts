import { defineStore } from 'pinia';
import { request } from '../utils/request';

interface Video {
  bvid: string;
  title: string;
  cover: string;
  description: string;
  play: number;
  like: number;
  danmaku: number;
  publishTime: string;
  partition: string;
  _raw?: any; // 保留原始数据用于调试
}

interface Up {
  id: number;
  uid: string;
  name: string;
  avatar: string;
  videos?: Video[];
}

export const useDataStore = defineStore('data', {
  state: () => ({
    currentUp: null as Up | null,
    videoList: [] as Video[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    hasVideos: (state) => state.videoList.length > 0,
    videoCount: (state) => state.videoList.length,
    firstVideo: (state) => state.videoList[0] || null
  },

  actions: {
    /**
     * 获取UP主基本信息
     */
    async fetchUpDetail(uid: string) {
      try {
        console.log(`🔍 开始获取UP主 ${uid} 的详情`);
        this.loading = true;
        this.error = null;

        const response = await request.get(`/api/up/${uid}`);

        console.log('📊 UP主详情API完整响应:', response);

        // 多重响应格式支持
        if (response.data && response.data.success) {
          const upData = response.data.up || response.data.data;

          if (upData) {
            console.log('✅ 成功获取UP主详情:', upData.name);
            this.currentUp = upData;
            return upData;
          } else {
            console.error('❌ UP主数据为空');
            throw new Error('UP主数据为空');
          }
        } else {
          const errorMsg = response.data?.message || 'UP主不存在';
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
     * 获取UP主视频列表 - 修复后的核心方法
     */
    async fetchUpVideos(uid: string) {
      try {
        console.log(`🎬 开始获取UP主 ${uid} 的视频列表`);
        this.loading = true;
        this.error = null;

        const response = await request.get(`/api/up/${uid}/videos`);

        // 🆕 详细的调试日志
        console.log('📊 视频列表API完整响应:', response);
        console.log('🔍 响应数据结构分析:', {
          data: response.data,
          hasVideos: !!response.data?.videos,
          videosType: typeof response.data?.videos,
          isArray: Array.isArray(response.data?.videos),
          videoCount: Array.isArray(response.data?.videos) ? response.data.videos.length : 0,
          success: response.data?.success
        });

        let videoList: any[] = [];

        // 🆕 多重数据解析策略，适应不同的响应格式
        if (response.data && response.data.success) {
          // 格式1: { success: true, videos: [...] }
          if (Array.isArray(response.data.videos)) {
            videoList = response.data.videos;
            console.log('✅ 使用格式1解析视频列表 (videos数组)');
          }
          // 格式2: { success: true, data: { videos: [...] } }
          else if (response.data.data && Array.isArray(response.data.data.videos)) {
            videoList = response.data.data.videos;
            console.log('✅ 使用格式2解析视频列表 (data.videos数组)');
          }
          // 格式3: { success: true, data: [...] } (直接是视频数组)
          else if (Array.isArray(response.data.data)) {
            videoList = response.data.data;
            console.log('✅ 使用格式3解析视频列表 (data数组)');
          }
          // 格式4: { success: true, videoList: [...] }
          else if (Array.isArray(response.data.videoList)) {
            videoList = response.data.videoList;
            console.log('✅ 使用格式4解析视频列表 (videoList数组)');
          }
        }
        // 格式5: 直接返回视频数组
        else if (Array.isArray(response.data)) {
          videoList = response.data;
          console.log('✅ 使用格式5解析视频列表 (根级别data数组)');
        }
        // 格式6: 响应在根级别有videos字段
        else if (Array.isArray(response.videos)) {
          videoList = response.videos;
          console.log('✅ 使用格式6解析视频列表 (根级别videos数组)');
        }
        // 格式7: 从UP主详情中提取视频列表
        else if (response.data && response.data.up && Array.isArray(response.data.up.videos)) {
          videoList = response.data.up.videos;
          console.log('✅ 使用格式7解析视频列表 (up.videos数组)');
        }
        else {
          console.warn('⚠️ 无法识别的响应格式，尝试深度搜索视频数组');
          // 深度搜索数组
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

          videoList = findVideos(response.data || response);
        }

        // 🆕 验证和清理视频数据
        const validVideos = videoList
          .filter((video, index) => {
            const hasId = !!(video.bvid || video.bvId || video.id);
            const hasTitle = !!video.title;
            const isValid = video && hasId && hasTitle;

            if (!isValid) {
              console.warn(`⚠️ 跳过无效视频数据 [${index}]:`, {
                hasId,
                hasTitle,
                video
              });
            }

            return isValid;
          })
          .map(video => {
            // 🆕 统一字段名，确保前端使用一致的字段
            const normalizedVideo: Video = {
              bvid: video.bvid || video.bvId || video.id, // 统一使用 bvid
              title: video.title,
              cover: video.cover || video.coverUrl || video.pic || video.cover_url || '/default-cover.jpg', // 支持多种封面字段名
              description: video.description || video.desc || '',
              play: video.play || video.view || video.viewCount || video.view_count || 0,
              like: video.like || video.likeCount || video.like_count || 0,
              danmaku: video.danmaku || video.danmakuCount || video.danmaku_count || video.video_review || 0,
              publishTime: video.publishTime || video.pubdate || video.createTime || '',
              partition: video.partition || video.videoPartition || video.tname || video.type || '未知分区'
            };

            // 调试第一个视频的字段映射
            if (validVideos.length === 0) {
              console.log('🔧 视频字段映射详情:', {
                原始数据: video,
                标准化后: normalizedVideo
              });
            }

            return normalizedVideo;
          });

        console.log(`✅ 成功解析 ${validVideos.length} 个有效视频`);

        if (validVideos.length > 0) {
          console.log('🎉 第一个视频样例:', validVideos[0]);
          console.log('🖼️ 封面URL:', validVideos[0].cover);
          console.log('📝 标题:', validVideos[0].title);
        } else {
          console.warn('⚠️ 没有解析到有效视频，原始数据:', videoList);
        }

        this.videoList = validVideos;
        return validVideos;

      } catch (error: any) {
        console.error('❌ 获取视频列表失败:', error);
        console.error('📋 错误详情:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });

        this.error = error.message || '获取视频列表失败';
        this.videoList = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取UP主完整信息（包含视频列表）
     */
    async fetchUpWithVideos(uid: string) {
      try {
        console.log(`📦 开始获取UP主 ${uid} 的完整信息`);

        // 并行请求UP主信息和视频列表
        const [upDetail, videos] = await Promise.all([
          this.fetchUpDetail(uid),
          this.fetchUpVideos(uid)
        ]);

        console.log(`🎉 成功获取UP主完整信息: ${upDetail.name}, 视频数量: ${videos.length}`);

        return {
          up: upDetail,
          videos: videos
        };

      } catch (error) {
        console.error('❌ 获取UP主完整信息失败:', error);
        throw error;
      }
    },

    /**
     * 调试方法：全面检查UP主数据
     */
    async debugUpData(uid: string) {
      try {
        console.group(`🔧 UP主数据深度调试: ${uid}`);

        // 测试基本信息接口
        console.log('1. 📋 测试基本信息接口...');
        const basicResponse = await request.get(`/api/up/${uid}`);
        console.log('基本信息响应:', JSON.stringify(basicResponse.data, null, 2));

        // 测试视频列表接口
        console.log('2. 🎬 测试视频列表接口...');
        const videosResponse = await request.get(`/api/up/${uid}/videos`);
        console.log('视频列表响应:', JSON.stringify(videosResponse.data, null, 2));

        // 测试完整详情接口
        console.log('3. 📊 测试完整详情接口...');
        const detailResponse = await request.get(`/api/up/${uid}/detail`);
        console.log('完整详情响应:', JSON.stringify(detailResponse.data, null, 2));

        // 分析视频数据结构
        console.log('4. 🔍 分析视频数据结构...');
        const allResponses = [basicResponse, videosResponse, detailResponse];
        allResponses.forEach((response, index) => {
          console.log(`响应 ${index + 1} 中的视频数据:`, this.findVideosInObject(response.data));
        });

        console.groupEnd();

        return {
          basic: basicResponse.data,
          videos: videosResponse.data,
          detail: detailResponse.data,
          analysis: allResponses.map(response => this.findVideosInObject(response.data))
        };

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
        // 检查是否是视频数组
        if (obj.length > 0 && obj[0] && (obj[0].bvid || obj[0].title)) {
          return {
            type: '视频数组',
            count: obj.length,
            firstVideo: obj[0]
          };
        }
        return null;
      }

      if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key in obj) {
          const found = this.findVideosInObject(obj[key]);
          if (found) {
            result[key] = found;
          }
        }
        return Object.keys(result).length > 0 ? result : null;
      }

      return null;
    },

    /**
     * 清除数据
     */
    clearData() {
      this.currentUp = null;
      this.videoList = [];
      this.error = null;
    },

    /**
     * 触发UP主数据爬取
     */
    async triggerUpCrawl(uid: string) {
      try {
        console.log(`🚀 触发UP主数据爬取: ${uid}`);
        const response = await request.post(`/api/up/${uid}/crawl`);
        console.log('✅ 爬取响应:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ 爬取失败:', error);
        this.error = error.message || '数据爬取失败';
        throw error;
      }
    }
  }
});
