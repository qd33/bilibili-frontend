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
  if (!chartInstance) return;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 34, 56, 0.9)',
      borderColor: '#00aeec',
      textStyle: {
        color: '#ffffff'
      },
      formatter: (params: any) => {
        const data = params[0];
        return `
          <div style="font-weight: bold; margin-bottom: 5px;">${data.name}</div>
          <div style="display: flex; align-items: center;">
            <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:#00aeec;"></span>
            播放量: <span style="color: #00aeec; font-weight: bold; margin-left: 5px;">${data.value.toLocaleString()}</span>
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
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
        color: '#a0aec0',
        fontSize: 12
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '播放量',
      nameTextStyle: {
        color: '#a0aec0',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#4a5568'
        }
      },
      axisLabel: {
        color: '#a0aec0',
        formatter: (value: number) => {
          if (value >= 10000) {
            return (value / 10000).toFixed(0) + '万';
          }
          return value.toString();
        }
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
          width: 3,
          shadowColor: 'rgba(0, 174, 236, 0.5)',
          shadowBlur: 10
        },
        itemStyle: {
          color: '#00aeec',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(0, 174, 236, 0.8)',
          shadowBlur: 8
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 174, 236, 0.6)' },
            { offset: 1, color: 'rgba(0, 174, 236, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3,
            shadowColor: 'rgba(0, 174, 236, 1)',
            shadowBlur: 12
          }
        }
      }
    ]
  };

  chartInstance.setOption(option);
}

defineExpose({ chartInstance })
</script>
