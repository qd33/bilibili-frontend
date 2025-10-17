<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import echarts from '@/utils/echarts'

interface Props {
  width?: string
  height?: string
  data: Array<{
    value: number
    name: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '300px'
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})

watch(() => props.data, updateChart, { deep: true })

// 更新 PieChart.vue 的 updateChart 方法
function updateChart() {
  if (!chartInstance) return;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(26, 34, 56, 0.9)',
      borderColor: '#8b5cf6',
      textStyle: {
        color: '#ffffff'
      },
      formatter: (params: any) => {
        return `
          <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${params.color};"></span>
            <span>占比: </span>
            <span style="color: #8b5cf6; font-weight: bold; margin-left: 10px;">${params.percent}%</span>
          </div>
          <div>视频数: <span style="color: #8b5cf6; font-weight: bold;">${params.value}</span></div>
        `;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: {
        color: '#a0aec0',
        fontSize: 12
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#0f1421',
          borderWidth: 2,
          borderRadius: 4
        },
        label: {
          show: false,
          position: 'center',
          formatter: '{b}\n{c}',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#ffffff'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data,
        color: [
          '#00aeec', // 生活 - 蓝色
          '#8b5cf6', // 游戏 - 紫色
          '#10b981', // 知识 - 绿色
          '#f59e0b', // 音乐 - 橙色
          '#ef4444', // 科技 - 红色
          '#06b6d4'  // 动画 - 青色
        ]
      }
    ]
  };

  chartInstance.setOption(option);
}

defineExpose({ chartInstance })
</script>
