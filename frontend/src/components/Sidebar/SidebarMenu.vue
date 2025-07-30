<template>
  <div class="w-64 bg-gradient-to-b from-purple-900 to-purple-800 h-full flex flex-col shadow-2xl">
    <!-- Logo區域 -->
    <div class="p-6 border-b border-purple-700/50">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white font-bold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-white font-bold text-xl">VECTOR</h1>
          <p class="text-purple-300 text-xs">Music Streaming</p>
        </div>
      </div>
    </div>

    <!-- 主要功能按鈕區域 -->
    <div class="flex-1 p-4 space-y-3 sidebar-scroll">
      <!-- 最新音樂按鈕 -->
      <button 
        @click="selectLatestMusic"
        :class="[
          'w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group',
          activeSection === 'latest' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25 transform scale-105' 
            : 'bg-purple-800/50 hover:bg-purple-700/70 hover:transform hover:scale-105'
        ]"
      >
        <div :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300',
          activeSection === 'latest' ? 'bg-white/20' : 'bg-purple-700/50 group-hover:bg-purple-600/50'
        ]">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
          </svg>
        </div>
        <div class="flex-1 text-left">
          <p class="text-white font-semibold text-sm">最新音樂</p>
          <p :class="[
            'text-xs transition-colors duration-300',
            activeSection === 'latest' ? 'text-blue-100' : 'text-purple-300 group-hover:text-purple-200'
          ]">
            Latest Music
          </p>
        </div>
        <div v-if="activeSection === 'latest'" 
             class="w-2 h-8 bg-white rounded-full opacity-80">
        </div>
      </button>

      <!-- 熱門歌曲按鈕 -->
      <button 
        @click="selectPopularSongs"
        :class="[
          'w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group',
          activeSection === 'popular' 
            ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/25 transform scale-105' 
            : 'bg-purple-800/50 hover:bg-purple-700/70 hover:transform hover:scale-105'
        ]"
      >
        <div :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300',
          activeSection === 'popular' ? 'bg-white/20' : 'bg-purple-700/50 group-hover:bg-purple-600/50'
        ]">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4.318 6.318a4.5 4.5 0-000 6.364L12 20.364l7.682-7.682a4.5 4.5 0-00-6.364L12 4.636l-1.318 1.682z"/>
          </svg>
        </div>
        <div class="flex-1 text-left">
          <p class="text-white font-semibold text-sm">熱門歌曲</p>
          <p :class="[
            'text-xs transition-colors duration-300',
            activeSection === 'popular' ? 'text-red-100' : 'text-purple-300 group-hover:text-purple-200'
          ]">
            Popular Songs
          </p>
        </div>
        <div v-if="activeSection === 'popular'" 
             class="w-2 h-8 bg-white rounded-full opacity-80">
        </div>
      </button>

      <!-- 分隔線 -->
      <div class="border-t border-purple-700/50 my-6"></div>

      <!-- 其他功能區域 -->
      <div class="space-y-2">
        <button class="w-full flex items-center space-x-3 p-3 rounded-lg text-purple-300 hover:text-white hover:bg-purple-700/50 transition-all duration-300 group">
          <div class="w-8 h-8 rounded-lg bg-purple-700/50 group-hover:bg-purple-600/50 flex items-center justify-center transition-all duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </div>
          <span class="text-sm font-medium">我的收藏</span>
        </button>

        <button class="w-full flex items-center space-x-3 p-3 rounded-lg text-purple-300 hover:text-white hover:bg-purple-700/50 transition-all duration-300 group">
          <div class="w-8 h-8 rounded-lg bg-purple-700/50 group-hover:bg-purple-600/50 flex items-center justify-center transition-all duration-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <span class="text-sm font-medium">會員登入</span>
        </button>
      </div>
    </div>

    <!-- 底部資訊 -->
    <div class="p-4 border-t border-purple-700/50">
      <div class="text-center">
        <p class="text-purple-400 text-xs">Version 1.0</p>
        <p class="text-purple-500 text-xs mt-1">© 2025 Vector Music</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 響應式數據
const activeSection = ref('latest') // 預設選中最新音樂

// 發送事件給父組件
const emit = defineEmits(['section-changed'])

// 方法
const selectLatestMusic = () => {
  activeSection.value = 'latest'
  emit('section-changed', {
    section: 'latest',
    title: '最新音樂',
    description: '探索最新發布的音樂作品'
  })
}

const selectPopularSongs = () => {
  activeSection.value = 'popular'
  emit('section-changed', {
    section: 'popular',
    title: '熱門歌曲',
    description: '當前最受歡迎的音樂排行'
  })
}

// 計算屬性
const currentSectionInfo = computed(() => {
  return {
    latest: {
      title: '最新音樂',
      description: '探索最新發布的音樂作品',
      color: 'blue'
    },
    popular: {
      title: '熱門歌曲', 
      description: '當前最受歡迎的音樂排行',
      color: 'red'
    }
  }[activeSection.value]
})

// 暴露給父組件的數據和方法
defineExpose({
  activeSection,
  currentSectionInfo,
  selectLatestMusic,
  selectPopularSongs
})
</script>

<style scoped>
/* 自定義滾動條 */
.sidebar-scroll::-webkit-scrollbar {
  width: 4px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: rgba(139, 92, 246, 0.1);
  border-radius: 2px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 2px;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}

/* 按鈕點擊動畫 */
button:active {
  transform: scale(0.95);
  transition: transform 0.1s ease-in-out;
}
</style>