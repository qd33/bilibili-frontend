// utils/tagUtils.ts
/**
 * 格式化数字显示
 */
export const formatNumber = (num: number): string => {
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + '千'
  return num.toString()
}

/**
 * 获取排名样式类名
 */
export const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return 'rank-normal'
}
