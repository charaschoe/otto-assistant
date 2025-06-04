<template>
  <div 
    class="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
    @click="navigateToDetail"
  >
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-gray-500">last update {{ lastUpdate }}</p>
      </div>
    </div>
    
    <!-- Einfaches Liniendiagramm -->
    <div class="h-32 mb-4">
      <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
        <!-- Aktuelle Zeitlinie -->
        <line
          :x1="currentPosition"
          y1="0"
          :x2="currentPosition"
          y2="100"
          stroke="#9CA3AF"
          stroke-width="2"
          stroke-dasharray="4"
        />
        <path
          :d="getTruncatedPath"
          fill="none"
          stroke="#4F46E5"
          stroke-width="2"
        />
      </svg>
    </div>

    <div class="flex justify-between text-sm text-gray-600">
      <div>
        <p>{{ startDate }}</p>
        <p class="font-medium">Kick-Off</p>
      </div>
      <div class="text-right">
        <p>{{ endDate }}</p>
        <p class="font-medium">Ende</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  lastUpdate: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  chartPath: {
    type: String,
    default: ''
  },
  currentPosition: {
    type: Number,
    default: 150
  }
})

const getTruncatedPath = computed(() => {
  const defaultPath = 'M0,80 L50,70 L100,75 L150,60 L200,65 L250,50 L300,55'
  const path = props.chartPath || defaultPath
  
  // Extrahiere die Koordinaten aus dem Pfad
  const points = path.split(' ').filter(p => p.startsWith('L') || p.startsWith('M'))
  let truncatedPoints = []
  
  for (const point of points) {
    const [x, y] = point.substring(1).split(',').map(Number)
    if (x <= props.currentPosition) {
      truncatedPoints.push(point)
    } else {
      // Füge den letzten Punkt an der currentPosition hinzu
      const lastPoint = truncatedPoints[truncatedPoints.length - 1]
      const [lastX, lastY] = lastPoint.substring(1).split(',').map(Number)
      const ratio = (props.currentPosition - lastX) / (x - lastX)
      const newY = lastY + (y - lastY) * ratio
      truncatedPoints.push(`L${props.currentPosition},${newY}`)
      break
    }
  }
  
  return truncatedPoints.join(' ')
})

const router = useRouter()

const navigateToDetail = () => {
  const route = props.title.toLowerCase().replace(/\s+/g, '-')
  router.push(`/${route}`)
}
</script> 