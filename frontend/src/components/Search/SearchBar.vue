<template>
  <div class="relative">
    <!-- 搜尋框 -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      
      <input
        v-model="searchQuery"
        @input="handleInput"
        @keydown.enter="performSearch"
        @focus="showSuggestions = true"
        @blur="handleBlur"
        type="text"
        placeholder="搜尋歌曲、藝人或專輯..."
        :class="[
          'w-full pl-10 pr-12 py-3 text-white bg-gray-800/50 backdrop-blur-sm',
          'border border-gray-600 rounded-xl transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
          'hover:bg-gray-700/50 placeholder-gray-400'
        ]"
      />
      
      <!-- 清除按鈕 -->
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- 搜尋建議下拉選單 -->
    <div
      v-if="showSuggestions && (searchSuggestions.length > 0 || isSearching)"
      class="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
    >
      <!-- 載入中狀態 -->
      <div v-if="isSearching" class="p-4 text-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
        <p class="text-gray-400 text-sm mt-2">搜尋中...</p>
      </div>

      <!-- 搜尋建議 -->
      <div v-else class="py-2">
        <!-- 分類標題 -->
        <div v-if="searchSuggestions.length > 0" class="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-700">
          搜尋建議
        </div>

        <!-- 歌曲建議 -->
        <div v-if="suggestions.tracks.length > 0">
          <div class="px-4 py-2 text-xs font-medium text-purple-400">歌曲</div>
          <button
            v-for="track in suggestions.tracks.slice(0, 3)"
            :key="`track-${track.id}`"
            @mousedown.prevent="selectTrack(track)"
            class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <img
              :src="track.image"
              :alt="track.name"
              class="w-8 h-8 rounded object-cover"
              @error="handleImageError"
            />
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ track.name }}</p>
              <p class="text-gray-400 text-xs truncate">{{ track.artist_name }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- 藝人建議 -->
        <div v-if="suggestions.artists.length > 0" class="border-t border-gray-700">
          <div class="px-4 py-2 text-xs font-medium text-green-400">藝人</div>
          <button
            v-for="artist in suggestions.artists.slice(0, 3)"
            :key="`artist-${artist.id}`"
            @mousedown.prevent="selectArtist(artist)"
            class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ artist.name }}</p>
              <p class="text-gray-400 text-xs">藝人</p>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- 專輯建議 -->
        <div v-if="suggestions.albums.length > 0" class="border-t border-gray-700">
          <div class="px-4 py-2 text-xs font-medium text-blue-400">專輯</div>
          <button
            v-for="album in suggestions.albums.slice(0, 3)"
            :key="`album-${album.id}`"
            @mousedown.prevent="selectAlbum(album)"
            class="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <img
              :src="album.image"
              :alt="album.name"
              class="w-8 h-8 rounded object-cover"
              @error="handleImageError"
            />
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm truncate">{{ album.name }}</p>
              <p class="text-gray-400 text-xs truncate">{{ album.artist_name }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- 無搜尋結果 -->
        <div v-if="suggestions.tracks.length === 0 && suggestions.artists.length === 0 && suggestions.albums.length === 0 && searchQuery.length > 2">
          <div class="px-4 py-8 text-center">
            <svg class="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.766-6.077-2.072C5.348 11.89 5 10.456 5 9c0-1.657.346-3.11.923-4.428A7.962 7.962 0 0112 3c2.34 0 4.5.766 6.077 2.072C18.652 6.11 19 7.544 19 9c0 1.456-.348 2.89-.923 4.072A7.962 7.962 0 0112 15z"/>
            </svg>
            <p class="text-gray-400 text-sm">找不到相關結果</p>
            <p class="text-gray-500 text-xs mt-1">試試其他關鍵字</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近搜尋 -->
    <div
      v-if="showSuggestions && searchQuery.length === 0 && recentSearches.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50"
    >
      <div class="py-2">
        <div class="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-700">
          最近搜尋
        </div>
        <button
          v-for="(search, index) in recentSearches.slice(0, 5)"
          :key="index"
          @mousedown.prevent="applyRecentSearch(search)"
          class="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-left group"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-white text-sm">{{ search }}</span>
          </div>
          <button
            @click.stop="removeRecentSearch(index)"
            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useJamendoAPI } from '@/composables/useJamendoAPI'

// Composables
const jamendoAPI = useJamendoAPI()

// 響應式數據
const searchQuery = ref('')
const showSuggestions = ref(false)
const isSearching = ref(false)
const searchTimeout = ref(null)

// 搜尋結果
const suggestions = reactive({
  tracks: [],
  artists: [],
  albums: []
})

// 最近搜尋紀錄
const recentSearches = ref(JSON.parse(localStorage.getItem('recent-searches') || '[]'))

// 發送事件
const emit = defineEmits([
  'search', 
  'track-selected', 
  'artist-selected', 
  'album-selected',
  'clear-search'
])

// 計算屬性
const searchSuggestions = computed(() => {
  return [
    ...suggestions.tracks.map(item => ({ ...item, type: 'track' })),
    ...suggestions.artists.map(item => ({ ...item, type: 'artist' })),
    ...suggestions.albums.map(item => ({ ...item, type: 'album' }))
  ]
})

// 方法
const handleInput = () => {
  // 清除之前的延遲搜尋
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // 如果搜尋字串少於2個字符，清空建議
  if (searchQuery.value.length < 2) {
    suggestions.tracks = []
    suggestions.artists = []
    suggestions.albums = []
    return
  }

  // 延遲搜尋 (300ms)
  searchTimeout.value = setTimeout(() => {
    fetchSuggestions()
  }, 300)
}

const fetchSuggestions = async () => {
  if (searchQuery.value.length < 2) return

  try {
    isSearching.value = true

    // 並行搜尋歌曲、藝人、專輯
    const [tracksData, artistsData, albumsData] = await Promise.all([
      jamendoAPI.searchTracks(searchQuery.value, { limit: 5 }),
      jamendoAPI.searchArtists(searchQuery.value, { limit: 5 }),
      jamendoAPI.searchAlbums(searchQuery.value, { limit: 5 })
    ])

    suggestions.tracks = tracksData.tracks.map(jamendoAPI.formatTrackData)
    suggestions.artists = artistsData.artists
    suggestions.albums = albumsData.albums

  } catch (error) {
    console.error('搜尋建議失敗:', error)
  } finally {
    isSearching.value = false
  }
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    addToRecentSearches(searchQuery.value.trim())
    emit('search', searchQuery.value.trim())
    showSuggestions.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.tracks = []
  suggestions.artists = []
  suggestions.albums = []
  emit('clear-search')
}

const selectTrack = (track) => {
  emit('track-selected', track)
  addToRecentSearches(track.name)
  showSuggestions.value = false
}

const selectArtist = (artist) => {
  searchQuery.value = artist.name
  emit('artist-selected', artist)
  addToRecentSearches(artist.name)
  showSuggestions.value = false
}

const selectAlbum = (album) => {
  searchQuery.value = album.name
  emit('album-selected', album)
  addToRecentSearches(album.name)
  showSuggestions.value = false
}

const addToRecentSearches = (query) => {
  const searches = recentSearches.value.filter(search => search !== query)
  searches.unshift(query)
  recentSearches.value = searches.slice(0, 10) // 保留最近10次搜尋
  localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value))
}

const applyRecentSearch = (search) => {
  searchQuery.value = search
  performSearch()
}

const removeRecentSearch = (index) => {
  recentSearches.value.splice(index, 1)
  localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value))
}

const handleBlur = () => {
  // 延遲隱藏建議，讓點擊事件能夠觸發
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleImageError = (event) => {
  event.target.src = '/default-album.jpg'
}

// 監聽搜尋查詢變化
watch(searchQuery, (newQuery) => {
  if (newQuery.length === 0) {
    suggestions.tracks = []
    suggestions.artists = []
    suggestions.albums = []
  }
})
</script>