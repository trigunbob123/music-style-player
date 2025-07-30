<!-- 4. PlayerControls.vue - 播放控制 -->
<template>
  <div class="flex items-center space-x-4">
    <!-- 上一首 -->
    <button 
      @click="$emit('previous')"
      :disabled="!canGoPrevious"
      :class="[
        'p-2 rounded-full transition-all duration-200',
        canGoPrevious 
          ? 'text-white hover:bg-gray-700 hover:scale-110' 
          : 'text-gray-600 cursor-not-allowed'
      ]"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
      </svg>
    </button>
    
    <!-- 播放/暫停 -->
    <button 
      @click="$emit('play-pause')"
      class="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <svg v-if="!isPlaying" class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>
    
    <!-- 下一首 -->
    <button 
      @click="$emit('next')"
      :disabled="!canGoNext"
      :class="[
        'p-2 rounded-full transition-all duration-200',
        canGoNext 
          ? 'text-white hover:bg-gray-700 hover:scale-110' 
          : 'text-gray-600 cursor-not-allowed'
      ]"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  canGoPrevious: {
    type: Boolean,
    default: false
  },
  canGoNext: {
    type: Boolean,
    default: true
  }
})

defineEmits(['play-pause', 'previous', 'next'])
</script>