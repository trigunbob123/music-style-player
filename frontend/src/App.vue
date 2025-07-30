<template>
  <div id="app" class="h-screen bg-gray-900 overflow-hidden">
    <div class="flex h-full">
      <!-- 左側邊欄 -->
      <SidebarMenu 
        @section-changed="handleSectionChange"
        class="flex-shrink-0"
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
          class="flex-shrink-0 p-4"
        />
        
        <!-- 自選混和曲風區域 -->
        <CustomMixControls 
          @play-mix="handlePlayMix"
          class="flex-shrink-0 p-4"
        />
        
        <!-- 曲風按鈕區域 -->
        <GenreButtons 
          :genres="availableGenres"
          :active-genre="activeGenre"
          @genre-selected="handleGenreSelect"
          class="flex-shrink-0 p-4"
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
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
const isSearchActive = computed(() => searchQuery.value.trim().length > 0)

// 處理側邊欄區域變更
const handleSectionChange = async (sectionInfo) => {
  activeSection.value = sectionInfo.section
  activeGenre.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  
  await loadTracks()
}

// 處理曲風選擇
const handleGenreSelect = async (genre) => {
  activeGenre.value = genre
  searchQuery.value = ''
  currentPage.value = 1
  
  await loadTracks()
}

// 處理搜尋
const handleSearch = async (query) => {
  searchQuery.value = query
  activeGenre.value = ''
  currentPage.value = 1
  
  if (query.trim()) {
    await performSearch()
  } else {
    await loadTracks()
  }
}

// 處理音軌選擇
const handleTrackSelect = (track) => {
  const currentTrackList = isSearchActive.value ? searchResults.tracks : displayTracks.value
  playTrack(track, currentTrackList)
}

// 處理自選混和播放
const handlePlayMix = async (mixConfig) => {
  try {
    tracksLoading.value = true
    const mixPlaylist = []
    
    // 根據配置獲取每個曲風的歌曲
    for (const config of mixConfig) {
      const { genre, count } = config
      const genreData = await jamendoAPI.getTracksByGenre(genre, {
        limit: count,
        order: 'popularity_total'
      })
      
      mixPlaylist.push(...genreData.tracks.map(jamendoAPI.formatTrackData))
    }
    
    if (mixPlaylist.length > 0) {
      // 播放混和列表的第一首歌
      playTrack(mixPlaylist[0], mixPlaylist)
    }
  } catch (error) {
    console.error('載入混和播放列表失敗:', error)
  } finally {
    tracksLoading.value = false
  }
}

// 載入更多音軌
const loadMoreTracks = async () => {
  if (tracksLoading.value) return
  
  currentPage.value++
  
  if (isSearchActive.value) {
    await performSearch(true) // 追加模式
  } else {
    await loadTracks(true) // 追加模式
  }
}

// 載入音軌資料
const loadTracks = async (append = false) => {
  try {
    tracksLoading.value = true
    
    let data
    const options = {
      limit: 20,
      offset: (currentPage.value - 1) * 20
    }
    
    if (activeGenre.value) {
      // 載入特定曲風的音軌
      data = await jamendoAPI.getTracksByGenre(activeGenre.value, options)
    } else if (activeSection.value === 'popular') {
      // 載入熱門音軌
      data = await jamendoAPI.getPopularTracks(options)
    } else {
      // 載入最新音軌
      data = await jamendoAPI.getLatestTracks(options)
    }
    
    const formattedTracks = data.tracks.map(jamendoAPI.formatTrackData)
    
    if (append) {
      displayTracks.value.push(...formattedTracks)
    } else {
      displayTracks.value = formattedTracks
    }
    
  } catch (error) {
    console.error('載入音軌失敗:', error)
  } finally {
    tracksLoading.value = false
  }
}

// 執行搜尋
const performSearch = async (append = false) => {
  try {
    tracksLoading.value = true
    
    const options = {
      limit: 20,
      offset: (currentPage.value - 1) * 20
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
    
  } catch (error) {
    console.error('搜尋失敗:', error)
  } finally {
    tracksLoading.value = false
  }
}

// 監聽音頻元素變化，初始化視覺化器
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

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
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