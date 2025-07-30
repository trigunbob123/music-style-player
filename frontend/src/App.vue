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
        <TopPlayer />
        
        <!-- 搜尋區域 -->
        <SearchBar 
          @search="handleSearch"
          @track-selected="handleTrackSelect"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import SidebarMenu from '@/components/Sidebar/SidebarMenu.vue'
import TopPlayer from '@/components/Player/TopPlayer.vue'
import SearchBar from '@/components/Search/SearchBar.vue'
import CustomMixControls from '@/components/MixGenres/CustomMixControls.vue'
import GenreButtons from '@/components/Genres/GenreButtons.vue'
import MusicCards from '@/components/Music/MusicCards.vue'

// Composables
import { useJamendoAPI } from '@/composables/useJamendoAPI'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

// 初始化 composables
const jamendoAPI = useJamendoAPI()
const { playTrack } = useAudioPlayer()

// 響應式數據
const activeSection = ref('latest') // 'latest' | 'popular'
const activeGenre = ref('')
const currentSortBy = ref('popularity')
const tracksLoading = ref(false)
const currentPage = ref(1)
const hasMoreTracks = ref(true)

// 音樂資料
const allTracks = reactive([])
const displayTracks = ref([])
const searchQuery = ref('')

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

// 事件處理函數
const handleSectionChange = async (sectionInfo) => {
  activeSection.value = sectionInfo.section
  activeGenre.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  hasMoreTracks.value = true
  
  await loadTracks()
}

const handleGenreSelect = async (genre) => {
  activeGenre.value = activeGenre.value === genre ? '' : genre
  searchQuery.value = ''
  currentPage.value = 1
  hasMoreTracks.value = true
  
  await loadTracks()
}

const handleSearch = async (query) => {
  searchQuery.value = query
  activeGenre.value = ''
  currentPage.value = 1
  hasMoreTracks.value = true
  
  await loadTracks()
}

const handleTrackSelect = (track) => {
  // 播放選中的音軌，並將當前顯示的列表作為播放清單
  playTrack(track, displayTracks.value)
}

const handleTrackFavorite = (data) => {
  const { track, isFavorite } = data
  console.log(`${track.name} ${isFavorite ? '已加入' : '已移除'}收藏`)
  
  // 這裡可以發送到後端或進行其他處理
}

const handleAddToPlaylist = (track) => {
  console.log(`將 "${track.name}" 加入播放清單`)
  
  // 簡單版本：直接加入當前播放清單
  // 在實際應用中，可能會顯示播放清單選擇對話框
}

const handleLoadMore = async () => {
  if (tracksLoading.value || !hasMoreTracks.value) return
  
  currentPage.value++
  await loadTracks(true) // append = true
}

const handleSortChange = async (sortBy) => {
  currentSortBy.value = sortBy
  currentPage.value = 1
  hasMoreTracks.value = true
  
  await loadTracks()
}

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
      limit: 24, // 每次載入24首歌 (6x4 網格)
      offset: (currentPage.value - 1) * 24,
      order: getSortOrder(currentSortBy.value)
    }
    
    if (isSearchMode.value) {
      // 搜尋模式
      data = await jamendoAPI.searchTracks(searchQuery.value, options)
    } else if (activeGenre.value) {
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

// 應用初始化
onMounted(async () => {
  try {
    await loadTracks()
  } catch (error) {
    console.error('應用初始化失敗:', error)
  }
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
</style>