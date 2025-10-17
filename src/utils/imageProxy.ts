/**
 * 图片代理工具函数
 * 用于解决B站图片防盗链问题
 */

// 获取API基础URL
const getApiBaseUrl = (): string => {
  // 优先使用环境变量配置
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  // 开发环境默认使用8080端口
  if (import.meta.env.DEV) {
    return 'http://localhost:8080';
  }

  // 生产环境使用相对路径
  return '';
};

/**
 * 将B站图片URL转换为代理URL
 * @param originalUrl 原图片URL
 * @returns 代理图片URL
 */
export const getProxyImageUrl = (originalUrl: string): string => {
  if (!originalUrl || originalUrl.trim() === '') {
    return getDefaultCover();
  }

  // 如果已经是代理URL或者默认图片，直接返回
  if (originalUrl.includes('/api/proxy/image') ||
    originalUrl.includes('data:image/svg+xml') ||
    originalUrl.includes('/default-cover')) {
    return originalUrl;
  }

  // 如果是相对路径，直接返回
  if (originalUrl.startsWith('/') || originalUrl.startsWith('./')) {
    return originalUrl;
  }

  // 如果是base64图片，直接返回
  if (originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  try {
    // 对原URL进行编码
    const encodedUrl = encodeURIComponent(originalUrl);
    const baseUrl = getApiBaseUrl();
    const proxyUrl = `${baseUrl}/api/proxy/image?url=${encodedUrl}`;

    console.log('🖼️ 图片URL转换:', {
      original: originalUrl,
      proxy: proxyUrl,
      baseUrl: baseUrl,
      mode: import.meta.env.MODE,
      isDev: import.meta.env.DEV
    });
    return proxyUrl;
  } catch (error) {
    console.error('❌ 图片URL转换失败:', error);
    return getDefaultCover();
  }
};

/**
 * 获取默认封面图片
 */
export const getDefaultCover = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2OCIgdmlld0JveD0iMCAwIDMwMCAxNjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFhMjMzMiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NDc0ODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+QklMSUJJTEkgQ09WRVI8L3RleHQ+CiAgPHBhdGggZD0iTTE1MCA4OGMtMTcuNjcgMC0zMi0xNC4zMy0zMi0zMnMxNC4zMy0zMiAzMi0zMiAzMiAxNC4zMyAzMiAzMi0xNC4zMyAzMi0zMiAzMnoiIGZpbGw9IiM2NDc0ODgiLz4KPC9zdmc+';
};

/**
 * 图片加载失败处理
 */
export const handleImageError = (event: Event, fallbackUrl?: string) => {
  const img = event.target as HTMLImageElement;
  console.warn('🖼️ 图片加载失败，使用默认封面:', {
    currentSrc: img.src,
    originalSrc: img.getAttribute('data-original-src') || 'unknown',
    mode: import.meta.env.MODE
  });

  // 使用提供的回退URL或默认封面
  img.src = fallbackUrl || getDefaultCover();

  // 防止无限循环
  img.onerror = null;
};

/**
 * 预加载图片
 */
export const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => {
      console.warn('⚠️ 图片预加载失败:', url);
      resolve(getDefaultCover());
    };
    img.src = url;
  });
};

/**
 * 批量转换图片URL
 */
export const batchConvertImageUrls = (urls: string[]): string[] => {
  return urls.map(url => getProxyImageUrl(url));
};

/**
 * 使用CORS代理获取图片（备选方案）
 */
export const getCorsProxyImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return getDefaultCover();

  // 使用公共CORS代理（注意：这些服务可能有限制，仅适合开发或低流量使用）
  const proxyUrls = [
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors-anywhere.herokuapp.com/'
  ];

  const proxyUrl = proxyUrls[0]; // 使用第一个代理
  return proxyUrl + encodeURIComponent(originalUrl);
};

/**
 * 检查图片URL是否有效
 */
export const checkImageUrl = async (url: string): Promise<boolean> => {
  try {
    // 如果是代理URL，检查代理服务是否正常
    if (url.includes('/api/proxy/image')) {
      const testUrl = `${getApiBaseUrl()}/api/proxy/health`;
      const response = await fetch(testUrl);
      return response.ok;
    }

    // 普通URL检查
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('❌ 图片URL检查失败:', error);
    return false;
  }
};

/**
 * 测试图片代理服务
 */
export const testImageProxyService = async (): Promise<boolean> => {
  try {
    const testUrl = `${getApiBaseUrl()}/api/proxy/health`;
    console.log('🖼️ 测试图片代理服务:', testUrl);

    const response = await fetch(testUrl);
    const result = await response.json();

    console.log('🖼️ 图片代理服务响应:', result);
    return result.success === true;
  } catch (error) {
    console.error('❌ 图片代理服务测试失败:', error);
    return false;
  }
};

/**
 * 获取当前环境信息
 */
export const getEnvironmentInfo = () => {
  return {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    baseUrl: getApiBaseUrl(),
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL
  };
};

export default {
  getProxyImageUrl,
  getDefaultCover,
  handleImageError,
  preloadImage,
  batchConvertImageUrls,
  getCorsProxyImageUrl,
  checkImageUrl,
  testImageProxyService,
  getEnvironmentInfo
};
