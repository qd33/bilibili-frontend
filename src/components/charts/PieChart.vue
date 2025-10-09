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

function updateChart() {
  if (!chartInstance) return

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(26, 34, 56, 0.9)',
      borderColor: '#8b5cf6'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: {
        color: '#a0aec0'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: '#0f1421',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data,
        color: ['#00aeec', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
      }
    ]
  }

  chartInstance.setOption(option)
}

defineExpose({ chartInstance })
</script>
