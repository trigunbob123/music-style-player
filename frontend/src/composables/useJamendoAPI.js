// composables/useJamendoAPI.js
import { ref, reactive } from 'vue'

export function useJamendoAPI() {
  // Jamendo API 配置
const API_BASE_URL = import.meta.env.VITE_JAMENDO_API_BASE_URL || 'https://api.jamendo.com/v3.0'
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID

if (!CLIENT_ID) {
  console.error('請在 .env 文件中設置 VITE_JAMENDO_CLIENT_ID')
}
  // 響應式狀態
  const loading = ref(false)
  const error = ref(null)
  const cache = reactive(new Map()) // 簡單的快取機制

  // 通用 API 請求函數
  const makeAPIRequest = async (endpoint, params = {}) => {
    const url = new URL(`${API_BASE_URL}/${endpoint}`)
    
    // 添加必要的參數
    url.searchParams.append('client_id', CLIENT_ID)
    url.searchParams.append('format', 'json')
    
    // 添加其他參數
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value)
      }
    })

    const cacheKey = url.toString()
    
    // 檢查快取
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    try {
      loading.value = true
      error.value = null
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // 儲存到快取
      cache.set(cacheKey, data)
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Jamendo API Error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 獲取音軌資料
  const getTracks = async (options = {}) => {
    const params = {
      limit: options.limit || 20,
      offset: options.offset || 0,
      order: options.order || 'popularity_total',
      tags: options.tags || '',
      search: options.search || '',
      include: 'stats+licenses+musicinfo',
      ...options.extraParams
    }

    const data = await makeAPIRequest('tracks', params)
    return {
      tracks: data.results || [],
      totalPages: Math.ceil((data.headers?.results_count || 0) / params.limit),
      currentPage: Math.floor(params.offset / params.limit) + 1,
      totalResults: data.headers?.results_count || 0
    }
  }

  // 獲取藝人資料
  const getArtists = async (options = {}) => {
    const params = {
      limit: options.limit || 20,
      offset: options.offset || 0,
      order: options.order || 'popularity_total',
      search: options.search || '',
      include: 'stats+musicinfo',
      ...options.extraParams
    }

    const data = await makeAPIRequest('artists', params)
    return {
      artists: data.results || [],
      totalPages: Math.ceil((data.headers?.results_count || 0) / params.limit),
      currentPage: Math.floor(params.offset / params.limit) + 1,
      totalResults: data.headers?.results_count || 0
    }
  }

  // 獲取專輯資料
  const getAlbums = async (options = {}) => {
    const params = {
      limit: options.limit || 20,
      offset: options.offset || 0,
      order: options.order || 'popularity_total',
      search: options.search || '',
      include: 'stats+musicinfo',
      ...options.extraParams
    }

    const data = await makeAPIRequest('albums', params)
    return {
      albums: data.results || [],
      totalPages: Math.ceil((data.headers?.results_count || 0) / params.limit),
      currentPage: Math.floor(params.offset / params.limit) + 1,
      totalResults: data.headers?.results_count || 0
    }
  }

  // 根據曲風獲取音軌
  const getTracksByGenre = async (genre, options = {}) => {
    const genreTagMap = {
      'POP': 'pop',
      'ROCK': 'rock',
      'HIP HOP': 'hiphop',
      'ELECTRONIC': 'electronic',
      'JAZZ': 'jazz',
      'WORLD': 'world',
      'METAL': 'metal',
      'CLASSICAL': 'classical',
      'SOUNDTRACK': 'soundtrack',
      'LOUNGE': 'lounge'
    }

    return await getTracks({
      ...options,
      tags: genreTagMap[genre] || genre.toLowerCase(),
      extraParams: {
        ...options.extraParams,
        tags: genreTagMap[genre] || genre.toLowerCase()
      }
    })
  }

  // 獲取熱門音軌
  const getPopularTracks = async (options = {}) => {
    return await getTracks({
      ...options,
      order: 'popularity_total',
      extraParams: {
        ...options.extraParams,
        order: 'popularity_total'
      }
    })
  }

  // 獲取最新音軌
  const getLatestTracks = async (options = {}) => {
    return await getTracks({
      ...options,
      order: 'releasedate_desc',
      extraParams: {
        ...options.extraParams,
        order: 'releasedate_desc'
      }
    })
  }

  // 搜尋功能
  const searchTracks = async (query, options = {}) => {
    if (!query.trim()) return { tracks: [], totalPages: 0, currentPage: 1, totalResults: 0 }
    
    return await getTracks({
      ...options,
      search: query,
      extraParams: {
        ...options.extraParams,
        search: query
      }
    })
  }

  const searchArtists = async (query, options = {}) => {
    if (!query.trim()) return { artists: [], totalPages: 0, currentPage: 1, totalResults: 0 }
    
    return await getArtists({
      ...options,
      search: query,
      extraParams: {
        ...options.extraParams,
        search: query
      }
    })
  }

  const searchAlbums = async (query, options = {}) => {
    if (!query.trim()) return { albums: [], totalPages: 0, currentPage: 1, totalResults: 0 }
    
    return await getAlbums({
      ...options,
      search: query,
      extraParams: {
        ...options.extraParams,
        search: query
      }
    })
  }

  // 格式化音軌資料
  const formatTrackData = (track) => {
    return {
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      artist_id: track.artist_id,
      album_name: track.album_name,
      album_id: track.album_id,
      duration: track.duration,
      image: track.album_image || track.image || '/default-album.jpg',
      audio: track.audio,
      audiodownload: track.audiodownload,
      audiodownload_allowed: track.audiodownload_allowed,
      position: track.position,
      releasedate: track.releasedate,
      stats: track.stats,
      musicinfo: track.musicinfo,
      licenses: track.licenses
    }
  }

  // 獲取音軌播放 URL
  const getTrackAudioURL = (track) => {
    if (track.audiodownload_allowed && track.audiodownload) {
      return track.audiodownload
    }
    return track.audio || null
  }

  // 清除快取
  const clearCache = () => {
    cache.clear()
  }

  return {
    // 狀態
    loading,
    error,
    
    // 方法
    getTracks,
    getArtists,
    getAlbums,
    getTracksByGenre,
    getPopularTracks,
    getLatestTracks,
    searchTracks,
    searchArtists,
    searchAlbums,
    formatTrackData,
    getTrackAudioURL,
    clearCache,
    
    // 原始 API 請求方法
    makeAPIRequest
  }
}

// composables/useAudioPlayer.js
import { ref, reactive, computed, watch, nextTick } from 'vue'

export function useAudioPlayer() {
  // 音頻元素
  const audio = ref(null)
  
  // 播放器狀態
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(50)
  const isMuted = ref(false)
  const isLoading = ref(false)
  
  // 播放列表
  const playlist = ref([])
  const currentIndex = ref(0)
  const playMode = ref('sequence') // sequence, repeat, shuffle
  
  // 計算屬性
  const progress = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  const canGoPrevious = computed(() => {
    return currentIndex.value > 0 || playMode.value === 'repeat'
  })

  const canGoNext = computed(() => {
    return currentIndex.value < playlist.value.length - 1 || playMode.value === 'repeat'
  })

  // 初始化音頻元素
  const initAudio = () => {
    if (typeof window !== 'undefined') {
      audio.value = new Audio()
      
      // 音頻事件監聽
      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value.duration
        isLoading.value = false
      })
      
      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value.currentTime
      })
      
      audio.value.addEventListener('ended', () => {
        handleTrackEnd()
      })
      
      audio.value.addEventListener('error', (e) => {
        console.error('音頻播放錯誤:', e)
        isLoading.value = false
        isPlaying.value = false
      })
      
      audio.value.addEventListener('canplay', () => {
        isLoading.value = false
      })
      
      audio.value.addEventListener('waiting', () => {
        isLoading.value = true
      })
    }
  }

  // 播放音軌
  const playTrack = async (track, trackList = null) => {
    try {
      if (!audio.value) {
        initAudio()
      }

      // 如果提供了新的播放列表，更新它
      if (trackList) {
        playlist.value = trackList
        currentIndex.value = trackList.findIndex(t => t.id === track.id)
      }

      currentSong.value = track
      isLoading.value = true
      
      // 獲取音頻 URL
      const audioUrl = getTrackAudioURL(track)
      if (!audioUrl) {
        throw new Error('無法獲取音頻 URL')
      }

      audio.value.src = audioUrl
      audio.value.volume = isMuted.value ? 0 : volume.value / 100
      
      await audio.value.load()
      await audio.value.play()
      
      isPlaying.value = true
    } catch (error) {
      console.error('播放失敗:', error)
      isLoading.value = false
      isPlaying.value = false
    }
  }

  // 播放/暫停
  const togglePlayPause = async () => {
    if (!audio.value || !currentSong.value) return

    try {
      if (isPlaying.value) {
        audio.value.pause()
        isPlaying.value = false
      } else {
        await audio.value.play()
        isPlaying.value = true
      }
    } catch (error) {
      console.error('播放/暫停失敗:', error)
    }
  }

  // 上一首
  const previousTrack = () => {
    if (!playlist.value.length) return

    let newIndex
    if (playMode.value === 'shuffle') {
      newIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (currentIndex.value > 0) {
      newIndex = currentIndex.value - 1
    } else if (playMode.value === 'repeat') {
      newIndex = playlist.value.length - 1
    } else {
      return // 已經是第一首且不是循環模式
    }

    currentIndex.value = newIndex
    playTrack(playlist.value[newIndex])
  }

  // 下一首
  const nextTrack = () => {
    if (!playlist.value.length) return

    let newIndex
    if (playMode.value === 'shuffle') {
      newIndex = Math.floor(Math.random() * playlist.value.length)
    } else if (currentIndex.value < playlist.value.length - 1) {
      newIndex = currentIndex.value + 1
    } else if (playMode.value === 'repeat') {
      newIndex = 0
    } else {
      return // 已經是最後一首且不是循環模式
    }

    currentIndex.value = newIndex
    playTrack(playlist.value[newIndex])
  }

  // 處理音軌結束
  const handleTrackEnd = () => {
    if (playMode.value === 'repeat-one') {
      // 單曲循環
      audio.value.currentTime = 0
      audio.value.play()
    } else {
      // 自動播放下一首
      nextTrack()
    }
  }

  // 跳轉到指定時間
  const seekTo = (time) => {
    if (audio.value && duration.value) {
      const seekTime = Math.max(0, Math.min(time, duration.value))
      audio.value.currentTime = seekTime
      currentTime.value = seekTime
    }
  }

  // 設置音量
  const setVolume = (newVolume) => {
    volume.value = Math.max(0, Math.min(100, newVolume))
    if (audio.value && !isMuted.value) {
      audio.value.volume = volume.value / 100
    }
  }

  // 切換靜音
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) {
      audio.value.volume = isMuted.value ? 0 : volume.value / 100
    }
  }

  // 設置播放模式
  const setPlayMode = (mode) => {
    playMode.value = mode
  }

  // 添加到播放列表
  const addToPlaylist = (tracks) => {
    if (Array.isArray(tracks)) {
      playlist.value.push(...tracks)
    } else {
      playlist.value.push(tracks)
    }
  }

  // 清空播放列表
  const clearPlaylist = () => {
    playlist.value = []
    currentIndex.value = 0
  }

  // 從播放列表移除
  const removeFromPlaylist = (index) => {
    if (index >= 0 && index < playlist.value.length) {
      playlist.value.splice(index, 1)
      if (currentIndex.value >= index && currentIndex.value > 0) {
        currentIndex.value--
      }
    }
  }

  // 獲取音軌播放 URL (與 Jamendo API 整合)
  const getTrackAudioURL = (track) => {
    if (track.audiodownload_allowed && track.audiodownload) {
      return track.audiodownload
    }
    return track.audio || null
  }

  // 格式化時間
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 監聽音量變化
  watch(volume, (newVolume) => {
    if (audio.value && !isMuted.value) {
      audio.value.volume = newVolume / 100
    }
  })

  // 監聽靜音狀態變化
  watch(isMuted, (muted) => {
    if (audio.value) {
      audio.value.volume = muted ? 0 : volume.value / 100
    }
  })

  // 初始化
  if (typeof window !== 'undefined') {
    nextTick(() => {
      initAudio()
    })
  }

  return {
    // 狀態
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    playlist,
    currentIndex,
    playMode,
    
    // 計算屬性
    progress,
    canGoPrevious,
    canGoNext,
    
    // 方法
    playTrack,
    togglePlayPause,
    previousTrack,
    nextTrack,
    seekTo,
    setVolume,
    toggleMute,
    setPlayMode,
    addToPlaylist,
    clearPlaylist,
    removeFromPlaylist,
    formatTime,
    
    // 音頻元素引用
    audio
  }
}

// composables/useAudioVisualizer.js
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export function useAudioVisualizer(audioElement) {
  const audioContext = ref(null)
  const analyser = ref(null)
  const dataArray = ref(null)
  const source = ref(null)
  const animationId = ref(null)
  
  // 14條音頻條的數據
  const audioData = reactive(new Array(14).fill(0))
  const isInitialized = ref(false)

  // 初始化音頻分析器
  const initAnalyser = () => {
    if (!audioElement.value || isInitialized.value) return

    try {
      // 創建音頻上下文
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      
      // 創建分析器節點
      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 512 // 512 個頻率數據點
      analyser.value.smoothingTimeConstant = 0.8
      
      // 創建音頻源節點
      source.value = audioContext.value.createMediaElementSource(audioElement.value)
      
      // 連接節點
      source.value.connect(analyser.value)
      analyser.value.connect(audioContext.value.destination)
      
      // 創建數據陣列
      const bufferLength = analyser.value.frequencyBinCount
      dataArray.value = new Uint8Array(bufferLength)
      
      isInitialized.value = true
      
      // 開始分析
      startAnalysis()
    } catch (error) {
      console.error('音頻分析器初始化失敗:', error)
    }
  }

  // 開始音頻分析
  const startAnalysis = () => {
    if (!analyser.value || !dataArray.value) return

    const analyze = () => {
      // 獲取頻率數據
      analyser.value.getByteFrequencyData(dataArray.value)
      
      // 將 256 個頻率數據點映射到 14 個音頻條
      const barsCount = 14
      const dataPointsPerBar = Math.floor(dataArray.value.length / barsCount)
      
      for (let i = 0; i < barsCount; i++) {
        let sum = 0
        const startIndex = i * dataPointsPerBar
        const endIndex = startIndex + dataPointsPerBar
        
        // 計算每個音頻條的平均值
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray.value[j]
        }
        
        const average = sum / dataPointsPerBar
        // 轉換為百分比 (0-100)
        audioData[i] = Math.max(10, (average / 255) * 100)
      }
      
      animationId.value = requestAnimationFrame(analyze)
    }
    
    analyze()
  }

  // 停止分析
  const stopAnalysis = () => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
      animationId.value = null
    }
    
    // 重置音頻數據
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = 10
    }
  }

  // 恢復音頻上下文 (某些瀏覽器需要用戶互動後才能啟動)
  const resumeAudioContext = async () => {
    if (audioContext.value && audioContext.value.state === 'suspended') {
      try {
        await audioContext.value.resume()
      } catch (error) {
        console.error('恢復音頻上下文失敗:', error)
      }
    }
  }

  // 清理資源
  const cleanup = () => {
    stopAnalysis()
    
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    
    analyser.value = null
    source.value = null
    dataArray.value = null
    isInitialized.value = false
  }

  // 監聽音頻元素變化
  const watchAudioElement = (newAudioElement) => {
    if (newAudioElement && !isInitialized.value) {
      audioElement.value = newAudioElement
      initAnalyser()
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    audioData,
    isInitialized,
    initAnalyser,
    startAnalysis,
    stopAnalysis,
    resumeAudioContext,
    cleanup,
    watchAudioElement
  }
}