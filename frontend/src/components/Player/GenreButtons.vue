<template>
  <div class="p-6">
    <!-- 曲風按鈕標題 -->
    <div class="mb-6">
      <h2 class="text-white font-bold text-xl mb-2">音樂曲風</h2>
      <p class="text-gray-400 text-sm">探索不同的音樂風格</p>
    </div>

    <!-- 曲風按鈕網格 -->
    <div class="grid grid-cols-5 gap-4">
      <button
        v-for="genre in genres"
        :key="genre"
        @click="selectGenre(genre)"
        :class="[
          'group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105',
          'flex flex-col items-center justify-center text-center min-h-[120px]',
          activeGenre === genre 
            ? `${getGenreColor(genre)} shadow-lg shadow-${getGenreColorName(genre)}-500/25 ring-2 ring-white/30` 
            : 'bg-gray-800/70 hover:bg-gray-700/80'
        ]"
      >
        <!-- 背景漸層效果 -->
        <div 
          :class="[
            'absolute inset-0 opacity-20 transition-opacity duration-300',
            activeGenre === genre ? 'opacity-30' : 'opacity-0 group-hover:opacity-10',
            getGenreGradient(genre)
          ]"
        ></div>

        <!-- 曲風圖示 -->
        <div 
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300',
            activeGenre === genre 
              ? 'bg-white/20 scale-110' 
              : 'bg-gray-700/50 group-hover:bg-gray-600/60 group-hover:scale-105'
          ]"
        >
          <component :is="getGenreIcon(genre)" class="w-6 h-6 text-white" />
        </div>

        <!-- 曲風名稱 -->
        <h3 
          :class="[
            'font-bold text-sm transition-colors duration-300 relative z-10',
            activeGenre === genre 
              ? 'text-white' 
              : 'text-gray-300 group-hover:text-white'
          ]"
        >
          {{ genre }}
        </h3>

        <!-- 選中指示器 -->
        <div 
          v-if="activeGenre === genre"
          class="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-90"
        ></div>

        <!-- 載入狀態 -->
        <div 
          v-if="loadingGenre === genre"
          class="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center"
        >
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'

// Props
const props = defineProps({
  genres: {
    type: Array,
    default: () => ['POP', 'ROCK', 'HIP HOP', 'ELECTRONIC', 'JAZZ', 'WORLD', 'METAL', 'CLASSICAL', 'SOUNDTRACK', 'LOUNGE']
  },
  activeGenre: {
    type: String,
    default: ''
  }
})

// 發送事件
const emit = defineEmits(['genre-selected'])

// 響應式數據
const loadingGenre = ref('')

// 方法
const selectGenre = async (genre) => {
  if (loadingGenre.value) return
  
  loadingGenre.value = genre
  
  try {
    emit('genre-selected', genre)
  } catch (error) {
    console.error('選擇曲風失敗:', error)
  } finally {
    // 延遲清除載入狀態
    setTimeout(() => {
      loadingGenre.value = ''
    }, 500)
  }
}

// 獲取曲風顏色
const getGenreColor = (genre) => {
  const colorMap = {
    'POP': 'bg-gradient-to-br from-pink-500 to-rose-500',
    'ROCK': 'bg-gradient-to-br from-red-600 to-red-700',
    'HIP HOP': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'ELECTRONIC': 'bg-gradient-to-br from-cyan-500 to-blue-500',
    'JAZZ': 'bg-gradient-to-br from-amber-500 to-yellow-500',
    'WORLD': 'bg-gradient-to-br from-green-500 to-emerald-500',
    'METAL': 'bg-gradient-to-br from-gray-600 to-gray-800',
    'CLASSICAL': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'SOUNDTRACK': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'LOUNGE': 'bg-gradient-to-br from-teal-500 to-teal-600'
  }
  return colorMap[genre] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

// 獲取曲風顏色名稱 (用於 shadow)
const getGenreColorName = (genre) => {
  const colorMap = {
    'POP': 'pink',
    'ROCK': 'red',
    'HIP HOP': 'orange',
    'ELECTRONIC': 'cyan',
    'JAZZ': 'yellow',
    'WORLD': 'green',
    'METAL': 'gray',
    'CLASSICAL': 'purple',
    'SOUNDTRACK': 'indigo',
    'LOUNGE': 'teal'
  }
  return colorMap[genre] || 'gray'
}

// 獲取曲風漸層背景
const getGenreGradient = (genre) => {
  return getGenreColor(genre)
}

// 獲取曲風圖示
const getGenreIcon = (genre) => {
  const iconMap = {
    'POP': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' })),
    
    'ROCK': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M17.5 12A1.5 1.5 0 0 1 16 10.5A1.5 1.5 0 0 1 17.5 9A1.5 1.5 0 0 1 19 10.5A1.5 1.5 0 0 1 17.5 12M14.5 8A1.5 1.5 0 0 1 13 6.5A1.5 1.5 0 0 1 14.5 5A1.5 1.5 0 0 1 16 6.5A1.5 1.5 0 0 1 14.5 8M9.5 8A1.5 1.5 0 0 1 8 6.5A1.5 1.5 0 0 1 9.5 5A1.5 1.5 0 0 1 11 6.5A1.5 1.5 0 0 1 9.5 8M6.5 12A1.5 1.5 0 0 1 5 10.5A1.5 1.5 0 0 1 6.5 9A1.5 1.5 0 0 1 8 10.5A1.5 1.5 0 0 1 6.5 12M12 3L13.5 6L16.5 7.5L13.5 9L12 12L10.5 9L7.5 7.5L10.5 6L12 3Z' })),
    
    'HIP HOP': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z' })),
    
    'ELECTRONIC': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M5,9V21H9V9H5M10,5V21H14V5H10M15,13V21H19V13H15M3,13V21H4V13H3M20,17V21H21V17H20Z' })),
    
    'JAZZ': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M8.5,8.5L10,10L8.5,11.5L7,10L8.5,8.5M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M15.5,8.5L17,10L15.5,11.5L14,10L15.5,8.5M12,6.5L13.5,8L12,9.5L10.5,8L12,6.5Z' })),
    
    'WORLD': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' })),
    
    'METAL': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M6,2L2,6V8L6,4H8L6,2M18,2L22,6V8L18,4H16L18,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z' })),
    
    'CLASSICAL': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M21 3V15.5A3.5 3.5 0 0 1 17.5 19A3.5 3.5 0 0 1 14 15.5A3.5 3.5 0 0 1 17.5 12A3.5 3.5 0 0 1 21 15.5V5H3V4A1 1 0 0 1 4 3M19 15.5A1.5 1.5 0 0 0 17.5 14A1.5 1.5 0 0 0 16 15.5A1.5 1.5 0 0 0 17.5 17A1.5 1.5 0 0 0 19 15.5Z' })),
    
    'SOUNDTRACK': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M18,3V5H22V3M18,7V9H22V7M18,11V13H22V11M16,3V21H2V3M4,5V7H14V5M4,9V11H14V9M4,13V15H14V13M4,17V19H14V17Z' })),
    
    'LOUNGE': () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 24 24'
    }, h('path', { d: 'M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20A8 8 0 0 1 4 12A8 8 0 0 1 12 4M11 6V18L18 12' }))
  }
  
  return iconMap[genre] || iconMap['POP']
}
</script>