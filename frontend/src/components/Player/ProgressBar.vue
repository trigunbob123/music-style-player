<!-- 5. ProgressBar.vue - 進度條 -->
<template>
  <div class="flex items-center space-x-3">
    <!-- 當前時間 -->
    <span class="text-xs text-gray-400 w-10 text-center">
      {{ formatTime(currentTime) }}
    </span>
    
    <!-- 進度條 -->
    <div 
      ref="progressBar"
      @click="handleProgressClick"
      class="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer relative group"
    >
      <div 
        :style="{ width: `${progress}%` }"
        class="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full relative"
      >
        <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"></div>
      </div>
    </div>
    
    <!-- 總時長 -->
    <span class="text-xs text-gray-400 w-10 text-center">
      {{ formatTime(duration) }}
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['seek'])

const progressBar = ref(null)

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleProgressClick = (event) => {
  if (!progressBar.value || !props.duration) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * props.duration
  
  emit('seek', newTime)
}
</script>