<!-- 修正後的 App.vue -->
<template>
  <div class="min-h-screen bg-gray-900">
    <div class="flex">
      <!-- 左側邊欄 -->
      <SidebarMenu 
        @section-changed="handleSectionChange"
        class="w-64 flex-shrink-0"
      />
      
      <!-- 主要內容區域 -->
      <div class="flex-1 flex flex-col">
        <!-- 頂部播放器 -->
        <TopPlayer 
          :current-song="currentSong"
          :is-playing="isPlaying"
          :current-time="currentTime"
          :duration="duration"
          :progress="progress"
          :volume="volume"
          :is-muted="isMuted"
          :audio-data="audioData"
          @play-pause="togglePlayPause"
          @previous="previousTrack"
          @next="nextTrack"
          @seek="seekTo"
          @volume-change="setVolume"
          @toggle-mute="toggleMute"
          class="flex-shrink-0"
        />
        
        <!-- 搜尋區域 -->
        <SearchBar 
          @search="handleSearch"
          @track-selected="handleTrackSelect"
          @artist-selected="handleArtistSelect"
          @album-selected="handleAlbumSelect"
          @clear-search="handleClearSearch"
          class="p-6"
        />
        
        <!-- 自選混和曲風 -->
        <CustomMixControls 
          @play-mix="handlePlayMix"
          class="px-6"
        />
        
        <!-- 曲風按鈕區域 -->
        <GenreButtons 
          :genres="availableGenres"
          :active-genre="activeGenre"
          @genre-selected="handleGenreSelect"
        />
        
        <!-- 音樂卡牌區域 -->
        <MusicCards 
          :tracks="displayTracks"
          :loading="tracksLoading"
          :section-title="currentSectionTitle"
          :active-genre="activeGenre"
          :has-more="hasMoreTracks"
          @track-selected="handleTrackSelect"
          @track-favorite="handleTrackFavorite"
          @add-to-playlist="handleAddToPlaylist"
          @load-more="handleLoadMore"
          @sort-changed="handleSortChange"
          class="flex-1 overflow-y-auto"
        />
      </div>
    </div>
    
    <!-- 載入中覆蓋層 -->
    <div 
      v-if="initialLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span class="text-white">載入音樂資料中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import SidebarMenu from '@/components/Sidebar/SidebarMenu.vue'
import TopPlayer from '@/components/Player/TopPlayer.vue'
import SearchBar from '@/components/Search/SearchBar.vue'
import CustomMixControls from '@/components/MixGenres/CustomMixControls.vue'
import GenreButtons from '@/components/Genres/GenreButtons.vue'
import MusicCards from '@/components/Music/MusicCards.vue'

// Composables
import { useJamendoAPI } from '@/composables/useJamendoAPI'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useAudioVisualizer } from '@/composables/useAudioVisualizer'

// 初始化 composables
const jamendoAPI = useJamendoAPI()
const {
  currentSong,
  isPlaying,
  currentTime,
  duration,
  progress,
  volume,
  isMuted,
  playTrack,
  togglePlayPause,
  previousTrack,
  nextTrack,
  seekTo,
  setVolume,
  toggleMute,
  audio
} = useAudioPlayer()

const { audioData, initAnalyser, watchAudioElement } = useAudioVisualizer(audio)

// 應用狀態
const initialLoading = ref(true)
const tracksLoading = ref(false)
const activeSection = ref('latest') // 'latest' | 'popular'
const activeGenre = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const currentSortBy = ref('popularity')
const hasMoreTracks = ref(true)

// 音樂資料
const allTracks = reactive([])
const displayTracks = ref([])
const searchResults = reactive({
  tracks: [],
  artists: [],
  albums: []
})

// 可用的曲風
const availableGenres = [
  'POP', 'ROCK', 'HIP HOP', 'ELECTRONIC', 'JAZZ',
  'WORLD', 'METAL', 'CLASSICAL', 'SOUNDTRACK', 'LOUNGE'
]

// 計算屬性
const currentSectionTitle = computed(() => {
  if (searchQuery.value) {
    return `搜尋結果: "${searchQuery.value}"`
  }
  if (activeGenre.value) {
    return `${activeGenre.value} 音樂`
  }
  if (activeSection.value === 'popular') {
    return '熱門歌曲'
  }
  return '最新音樂'
})

const isSearchMode = computed(() => searchQuery.value.trim().length > 0)

// 處理側邊欄區域變更
const handleSectionChange = async (sectionInfo) => {
  activeSection.value = sectionInfo.section
  activeGenre.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  hasMoreTracks.value = true
  
  await loadTracks()
}

// 處理曲風選擇
const handleGenreSelect = async (genre) => {
  activeGenre.value = activeGenre.value === genre ? '' : genre
  searchQuery.value = ''
  currentPage.value = 1
  hasMoreTracks.value = true
  
  await loadTracks()
}

// 處理搜尋
const handleSearch = async (query) => {
  searchQuery.value = query
  activeGenre.value = ''
  currentPage.value = 1
  hasMoreTracks.value = true
  
  if (query.trim()) {
    await performSearch()
  } else {
    await loadTracks()
  }
}

// 處理音軌選擇
const handleTrackSelect = (track) => {
  const currentTrackList = isSearchMode.value ? searchResults.tracks : displayTracks.value
  playTrack(track, currentTrackList)
}

// 處理藝人選擇
const handleArtistSelect = async (artist) => {
  // 載入該藝人的音軌
  searchQuery.value = artist.name
  await performSearch()
}

// 處理專輯選擇
const handleAlbumSelect = async (album) => {
  // 載入該專輯的音軌
  searchQuery.value = album.name
  await performSearch()
}

// 處理清除搜尋
const handleClearSearch = () => {
  searchQuery.value = ''
  activeGenre.value = ''
  currentPage.value = 1
  hasMoreTracks.value = true
  loadTracks()
}

// 處理收藏
const handleTrackFavorite = (data) => {
  const { track, isFavorite } = data
  console.log(`${track.name} ${isFavorite ? '已加入' : '已移除'}收藏`)
}

// 處理加入播放清單
const handleAddToPlaylist = (track) => {
  console.log(`將 "${track.name}" 加入播放清單`)
}

// 處理載入更多
const handleLoadMore = async () => {
  if (tracksLoading.value || !hasMoreTracks.value) return
  
  currentPage.value++
  
  if (isSearchMode.value) {
    await performSearch(true)
  } else {
    await loadTracks(true)
  }
}

// 處理排序變更
const handleSortChange = async (sortBy) => {
  currentSortBy.value = sortBy
  currentPage.value = 1
  hasMoreTracks.value = true
  
  await loadTracks()
}

// 處理自選混和播放
const handlePlayMix = async (mixConfigs) => {
  try {
    tracksLoading.value = true
    const mixPlaylist = []
    
    // 根據配置獲取每個曲風的歌曲
    for (const config of mixConfigs) {
      const { genre, count } = config
      const genreData = await jamendoAPI.getTracksByGenre(genre, {
        limit: count,
        order: 'popularity_total'
      })
      
      const formattedTracks = genreData.tracks.map(jamendoAPI.formatTrackData)
      mixPlaylist.push(...formattedTracks)
    }
    
    if (mixPlaylist.length > 0) {
      // 播放混和列表的第一首歌
      playTrack(mixPlaylist[0], mixPlaylist)
      
      // 同時更新顯示的音樂卡牌為混和播放清單
      displayTracks.value = mixPlaylist
      activeGenre.value = ''
      searchQuery.value = ''
    }
  } catch (error) {
    console.error('載入混和播放列表失敗:', error)
  } finally {
    tracksLoading.value = false
  }
}

// 載入音軌資料
const loadTracks = async (append = false) => {
  try {
    tracksLoading.value = true
    
    let data
    const options = {
      limit: 24,
      offset: (currentPage.value - 1) * 24,
      order: getSortOrder(currentSortBy.value)
    }
    
    if (activeGenre.value) {
      // 特定曲風
      data = await jamendoAPI.getTracksByGenre(activeGenre.value, options)
    } else if (activeSection.value === 'popular') {
      // 熱門音樂
      data = await jamendoAPI.getPopularTracks(options)
    } else {
      // 最新音樂
      data = await jamendoAPI.getLatestTracks(options)
    }
    
    const formattedTracks = data.tracks.map(jamendoAPI.formatTrackData)
    
    if (append) {
      displayTracks.value.push(...formattedTracks)
    } else {
      displayTracks.value = formattedTracks
    }
    
    // 檢查是否還有更多資料
    hasMoreTracks.value = formattedTracks.length === options.limit
    
  } catch (error) {
    console.error('載入音軌失敗:', error)
    hasMoreTracks.value = false
  } finally {
    tracksLoading.value = false
  }
}

// 執行搜尋
const performSearch = async (append = false) => {
  try {
    tracksLoading.value = true
    
    const options = {
      limit: 24,
      offset: (currentPage.value - 1) * 24
    }
    
    const data = await jamendoAPI.searchTracks(searchQuery.value, options)
    const formattedTracks = data.tracks.map(jamendoAPI.formatTrackData)
    
    if (append) {
      searchResults.tracks.push(...formattedTracks)
      displayTracks.value = [...searchResults.tracks]
    } else {
      searchResults.tracks = formattedTracks
      displayTracks.value = formattedTracks
    }
    
    hasMoreTracks.value = formattedTracks.length === options.limit
    
  } catch (error) {
    console.error('搜尋失敗:', error)
    hasMoreTracks.value = false
  } finally {
    tracksLoading.value = false
  }
}

// 獲取排序參數
const getSortOrder = (sortBy) => {
  const sortMap = {
    'popularity': 'popularity_total',
    'newest': 'releasedate_desc', 
    'name': 'name',
    'duration': 'duration_desc'
  }
  return sortMap[sortBy] || 'popularity_total'
}

// 監聽音頻元素變化
watch(audio, (newAudio) => {
  if (newAudio) {
    watchAudioElement(newAudio)
  }
})

// 應用初始化
onMounted(async () => {
  try {
    // 載入初始音軌資料
    await loadTracks()
    
    // 初始化音頻視覺化器
    if (audio.value) {
      initAnalyser()
    }
    
  } catch (error) {
    console.error('應用初始化失敗:', error)
  } finally {
    initialLoading.value = false
  }
})

// 鍵盤快捷鍵
const handleKeydown = (event) => {
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      togglePlayPause()
      break
    case 'ArrowLeft':
      if (event.ctrlKey) {
        event.preventDefault()
        previousTrack()
      }
      break
    case 'ArrowRight':
      if (event.ctrlKey) {
        event.preventDefault()
        nextTrack()
      }
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})
</script>

<style>
/* 音樂卡牌的自定義滾動條 */
.music-cards-scroll::-webkit-scrollbar {
  width: 8px;
}

.music-cards-scroll::-webkit-scrollbar-track {
  background: rgba(75, 85, 99, 0.3);
  border-radius: 4px;
}

.music-cards-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.6);
  border-radius: 4px;
}

.music-cards-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.8);
}

/* 載入動畫優化 */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 全局樣式 */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 滾動條樣式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(75, 85, 99, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.8);
}

/* 選擇文字的樣式 */
::selection {
  background-color: rgba(139, 92, 246, 0.3);
  color: white;
}

/* 隱藏音頻元素的默認控制器 */
audio {
  display: none;
}
</style>