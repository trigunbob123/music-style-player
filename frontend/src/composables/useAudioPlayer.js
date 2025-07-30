// src/composables/useJamendoAPI.js - 只包含 API 相關功能
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