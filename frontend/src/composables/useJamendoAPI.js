// src/composables/useJamendoAPI.js - 帶有測試資料的版本
import { ref, reactive } from 'vue'

export function useJamendoAPI() {
  // Jamendo API 配置
  const API_BASE_URL = import.meta.env.VITE_JAMENDO_API_BASE_URL || 'https://api.jamendo.com/v3.0'
  const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID || '93957ee4'

  // 響應式狀態
  const loading = ref(false)
  const error = ref(null)
  const cache = reactive(new Map()) // 簡單的快取機制

  // 測試資料
  const getMockTracks = () => [
    {
      id: 1,
      name: "夏日微風",
      artist_name: "清新樂團",
      album_name: "夏日精選",
      duration: 210,
      image: "https://picsum.photos/300/300?random=1",
      audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload_allowed: true,
      artist_id: 101,
      album_id: 201,
      position: 1,
      releasedate: "2024-01-15",
      stats: { downloads: 1000, listens: 5000 },
      musicinfo: { tags: { genres: ["pop"], instruments: ["guitar"] } },
      licenses: []
    },
    {
      id: 2,
      name: "電子夢境",
      artist_name: "合成器大師",
      album_name: "數位時代",
      duration: 185,
      image: "https://picsum.photos/300/300?random=2",
      audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload_allowed: true,
      artist_id: 102,
      album_id: 202,
      position: 1,
      releasedate: "2024-01-10",
      stats: { downloads: 800, listens: 3200 },
      musicinfo: { tags: { genres: ["electronic"], instruments: ["synthesizer"] } },
      licenses: []
    },
    {
      id: 3,
      name: "搖滾之魂",
      artist_name: "雷鳴樂隊",
      album_name: "搖滾傳說",
      duration: 195,
      image: "https://picsum.photos/300/300?random=3",
      audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload_allowed: true,
      artist_id: 103,
      album_id: 203,
      position: 1,
      releasedate: "2024-01-05",
      stats: { downloads: 1200, listens: 6800 },
      musicinfo: { tags: { genres: ["rock"], instruments: ["guitar", "drums"] } },
      licenses: []
    },
    {
      id: 4,
      name: "爵士咖啡",
      artist_name: "午夜三重奏",
      album_name: "咖啡館夜晚",
      duration: 220,
      image: "https://picsum.photos/300/300?random=4",
      audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload_allowed: true,
      artist_id: 104,
      album_id: 204,
      position: 1,
      releasedate: "2023-12-20",
      stats: { downloads: 600, listens: 2400 },
      musicinfo: { tags: { genres: ["jazz"], instruments: ["piano", "saxophone"] } },
      licenses: []
    },
    {
      id: 5,
      name: "古典晨曲",
      artist_name: "室內樂團",
      album_name: "晨光序曲",
      duration: 300,
      image: "https://picsum.photos/300/300?random=5",
      audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload_allowed: true,
      artist_id: 105,
      album_id: 205,
      position: 1,
      releasedate: "2023-12-15",
      stats: { downloads: 400, listens: 1800 },
      musicinfo: { tags: { genres: ["classical"], instruments: ["violin", "piano"] } },
      licenses: []
    },
    {
      id: 6,
      name: "嘻哈節拍",
      artist_name: "節拍製造者",
      album_name: "街頭韻律",
      duration: 175,
      image: "https://picsum.photos/300/300?random=6",
      audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      audiodownload_allowed: true,
      artist_id: 106,
      album_id: 206,
      position: 1,
      releasedate: "2024-01-20",
      stats: { downloads: 1500, listens: 7200 },
      musicinfo: { tags: { genres: ["hiphop"], instruments: ["drums", "bass"] } },
      licenses: []
    }
  ]

  // 通用 API 請求函數（帶有 fallback）
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
      console.warn('🔄 API 請求失敗，使用測試資料:', err.message)
      error.value = `API 連接失敗: ${err.message}`
      
      // 返回測試資料
      return getMockData(endpoint, params)
    } finally {
      loading.value = false
    }
  }

  // 測試資料產生器
  const getMockData = (endpoint, params) => {
    const mockTracks = getMockTracks()
    
    if (endpoint === 'tracks') {
      const limit = parseInt(params.limit) || 20
      const offset = parseInt(params.offset) || 0
      
      // 根據標籤篩選
      let filteredTracks = mockTracks
      if (params.tags) {
        filteredTracks = mockTracks.filter(track => 
          track.musicinfo.tags.genres.includes(params.tags)
        )
      }
      
      // 根據搜尋篩選
      if (params.search) {
        const searchTerm = params.search.toLowerCase()
        filteredTracks = mockTracks.filter(track => 
          track.name.toLowerCase().includes(searchTerm) ||
          track.artist_name.toLowerCase().includes(searchTerm) ||
          track.album_name.toLowerCase().includes(searchTerm)
        )
      }
      
      // 分頁
      const paginatedTracks = filteredTracks.slice(offset, offset + limit)
      
      return {
        results: paginatedTracks,
        headers: {
          results_count: filteredTracks.length,
          status: 'success'
        }
      }
    }
    
    // 其他端點的預設回應
    return { 
      results: [], 
      headers: { 
        results_count: 0,
        status: 'success'
      } 
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
      image: track.image || `/api/placeholder/300/300?text=${encodeURIComponent(track.name)}`,
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