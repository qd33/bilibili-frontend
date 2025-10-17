// 分区基本信息
export interface Partition {
  id: string
  name: string
  tid: number
  color: string
}

// 分区统计信息
export interface PartitionStats {
  videoCount: number
  totalViews: number
  totalLikes: number
  hotValue: number
  avgViews: number
  avgLikes: number
}

// 视频信息
export interface PartitionVideo {
  id: string
  title: string
  upName: string
  cover: string
  play: number
  like: number
  danmaku: number
  publishTime: string
}

// 分布数据
export interface DistributionData {
  name: string
  value: number
  percentage: number
}

// API响应格式
export interface PartitionOverviewResponse {
  success: boolean
  partitions: Partition[]
  stats: any[]
  videos: PartitionVideo[]
  distribution: DistributionData[]
  partitionName: string
  message?: string
}
