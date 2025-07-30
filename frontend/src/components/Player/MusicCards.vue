<template>
  <div class="p-6">
    <!-- 音樂卡牌標題區域 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-white font-bold text-xl mb-2">
          {{ sectionTitle }}
        </h2>
        <p class="text-gray-400 text-sm">
          {{ tracks.length }} 首歌曲 {{ activeGenre ? `• ${activeGenre}` : '' }}
        </p>
      </div>

      <!-- 排序選項 -->
      <div class="flex items-center space-x-2">
        <span class="text-gray-400 text-sm">排序:</span>
        <select
          v-model="sortBy"
          @change="handleSortChange"
          class="bg-gray-800 text-white text-sm border border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="popularity">人氣</option>
          <option value="newest">最新</option>
          <option value="name">歌名</option>
          <option value="duration">時長</option>
        </select>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="grid grid-cols-6 gap-4">
      <div
        v-for="n in 12"
        :key="n"
        class="bg-gray-800/50 rounded-lg p-4 animate-pulse"
      >
        <div class="aspect-square bg-gray-700 rounded-lg mb-3"></div>
        <div class="h-4 bg-gray-700 rounded mb-2"></div>
        <div class="h-3 bg-gray-700 rounded w-2/3 mb-1"></div>
        <div class="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>

    <!-- 音樂卡牌網格 -->
    <div v-else-if="tracks.length > 0" class="grid grid-cols-6 gap-4">
      <div
        v-for="track in tracks"
        :key="track.id"
        @click="selectTrack(track)"
        class="group bg-gray-800/70 rounded-lg p-4 hover:bg-gray-700/80 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl"
      >
        <!-- 專輯封面 -->
        <div class="relative mb-4">
          <img
            :src="track.image || '/default-album.jpg'"
            :alt="track.name"
            class="w-full aspect-square object-cover rounded-lg shadow-lg"
            @error="handleImageError"
          />
          
          <!-- 播放按鈕覆蓋層 -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button class="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg">
              <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>

          <!-- 收藏按鈕 -->
          <button
            @click.stop="toggleFavorite(track)"
            :class="[
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              'opacity-0 group-hover:opacity-100',
              favorites.includes(track.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-black/50 text-white hover:bg-black/70'
            ]"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          <!-- 時長標籤 -->
          <span class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {{ formatDuration(track.duration) }}
          </span>
        </div>

        <!-- 歌曲資訊 -->
        <div class="space-y-1">
          <!-- 歌名 -->
          <h3 class="text-white font-semibold text-sm truncate group-hover:text-purple-400 transition-colors duration-300">
            {{ track.name }}
          </h3>
          
          <!-- 藝人名稱 -->
          <p class="text-gray-400 text-xs truncate hover:text-gray-300 transition-colors duration-200">
            {{ track.artist_name }}
          </p>
          
          <!-- 專輯名稱 -->
          <p class="text-gray-500 text-xs truncate">
            {{ track.album_name }}
          </p>
        </div>

        <!-- 額外操作按鈕 -->
        <div class="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <!-- 更多選項 -->
          <button
            @click.stop="showTrackMenu(track)"
            class="p-1 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          <!-- 加入播放清單 -->
          <button
            @click.stop="addToPlaylist(track)"
            class="p-1 text-gray-400 hover:text-white transition-colors duration-200"
            title="加入播放清單"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 無音樂狀態 -->
    <div v-else class="text-center py-16">
      <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
      </svg>
      <h3 class="text-gray-400 text-lg font-medium mb-2">暫無音樂</h3>
      <p class="text-gray-500 text-sm">選擇一個曲風來探索音樂</p>
    </div>

    <!-- 載入更多按鈕 -->
    <div v-if="hasMore && tracks.length > 0" class="flex justify-center mt-8">
      <button
        @click="loadMore"
        :disabled="loadingMore"
        class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <span>{{ loadingMore ? '載入中...' : '載入更多' }}</span>
        <div v-if="loadingMore" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  tracks: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  sectionTitle: {
    type: String,
    default: '探索音樂'
  },
  activeGenre: {
    type: String,
    default: ''
  },
  hasMore: {
    type: Boolean,
    default: true
  }
})

// 發送事件
const emit = defineEmits([
  'track-selected',
  'track-favorite',
  'add-to-playlist',
  'load-more',
  'sort-changed'
])

// 響應式數據
const sortBy = ref('popularity')
const loadingMore = ref(false)
const favorites = ref(JSON.parse(localStorage.getItem('favorite-tracks') || '[]'))

// 計算屬性
const displayTitle = computed(() => {
  if (props.activeGenre) {
    return `${props.activeGenre} 音樂`
  }
  return props.sectionTitle
})

// 方法
const selectTrack = (track) => {
  emit('track-selected', track)
}

const toggleFavorite = (track) => {
  const index = favorites.value.indexOf(track.id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(track.id)
  }
  
  // 保存到本地存儲
  localStorage.setItem('favorite-tracks', JSON.stringify(favorites.value))
  
  emit('track-favorite', { track, isFavorite: favorites.value.includes(track.id) })
}

const addToPlaylist = (track) => {
  emit('add-to-playlist', track)
  
  // 顯示添加成功提示 (簡單版本)
  console.log(`已將 "${track.name}" 加入播放清單`)
}

const showTrackMenu = (track) => {
  // 顯示更多選項選單 (簡單版本)
  console.log('顯示音軌選單:', track.name)
}

const loadMore = async () => {
  if (loadingMore.value) return
  
  loadingMore.value = true
  
  try {
    emit('load-more')
  } catch (error) {
    console.error('載入更多失敗:', error)
  } finally {
    setTimeout(() => {
      loadingMore.value = false
    }, 1000)
  }
}

const handleSortChange = () => {
  emit('sort-changed', sortBy.value)
}

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleImageError = (event) => {
  event.target.src = '/default-album.jpg'
}

// 監聽收藏變化
watch(favorites, (newFavorites) => {
  localStorage.setItem('favorite-tracks', JSON.stringify(newFavorites))
}, { deep: true })
</script>