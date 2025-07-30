<template>
  <div class="flex items-center space-x-4 w-80">
    <!-- 專輯封面 -->
    <div class="relative group">
      <img 
        :src="currentSong?.image || '/default-album.jpg'" 
        :alt="currentSong?.name || 'No song'"
        class="w-14 h-14 rounded-lg object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
        @error="handleImageError"
      />
      <div v-if="isPlaying" class="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>
    
    <!-- 歌曲資訊 -->
    <div class="flex-1 min-w-0">
      <h3 class="text-white font-semibold text-sm truncate">
        {{ currentSong?.name || '选择一首歌曲' }}
      </h3>
      <p class="text-gray-400 text-xs truncate mt-1">
        {{ currentSong?.artist_name || '未知艺人' }}
      </p>
      <p class="text-gray-500 text-xs truncate">
        {{ currentSong?.album_name || '未知专辑' }}
      </p>
    </div>
    
    <!-- 收藏按钮 -->
    <button 
      v-if="currentSong"
      @click="toggleFavorite"
      :class="[
        'p-2 rounded-full transition-all duration-200',
        isFavorite ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'
      ]"
    >
      <!-- 修复后的心形图标 -->
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 添加缺失的 props
const props = defineProps({
  currentSong: {
    type: Object,
    default: null
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-favorite'])

const isFavorite = ref(false)

const handleImageError = (event) => {
  event.target.src = '/default-album.jpg'
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  emit('toggle-favorite', props.currentSong)
}
</script>