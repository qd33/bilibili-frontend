<!-- src/components/charts/RadarChart.vue -->
<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import echarts from '@/utils/echarts.ts'

interface Props {
  width?: string
  height?: string
  data: {
    indicators: Array<{ name: string; max: number }>
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
      trigger: 'item',
      backgroundColor: 'rgba(26, 34, 56, 0.9)',
      borderColor: '#8b5cf6'
    },
    radar: {
      indicator: props.data.indicators,
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: '#a0aec0',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: props.data.series,
            name: '互动数据',
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(139, 92, 246, 0.6)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.1)' }
              ])
            },
            lineStyle: {
              color: '#8b5cf6',
              width: 2
            },
            itemStyle: {
              color: '#8b5cf6'
            }
          }
        ]
      }
    ]
  }

  chartInstance.setOption(option)
}

defineExpose({ chartInstance })
</script>
