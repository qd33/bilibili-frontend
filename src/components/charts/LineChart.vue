<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import echarts from '@/utils/echarts'

interface Props {
  width?: string
  height?: string
  data: {
    xAxis: string[]
    series: number[]
  }
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

function updateChart() {
  if (!chartInstance) return

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 34, 56, 0.9)',
      borderColor: '#00aeec'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.xAxis,
      axisLine: {
        lineStyle: {
          color: '#4a5568'
        }
      },
      axisLabel: {
        color: '#a0aec0'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#4a5568'
        }
      },
      axisLabel: {
        color: '#a0aec0'
      },
      splitLine: {
        lineStyle: {
          color: '#2d3748',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        data: props.data.series,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#00aeec',
          width: 3
        },
        itemStyle: {
          color: '#00aeec',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 174, 236, 0.3)' },
            { offset: 1, color: 'rgba(0, 174, 236, 0.1)' }
          ])
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

defineExpose({ chartInstance })
</script>
