// src/composables/useAudioPlayer.js
import { ref, reactive, computed, watch, nextTick } from 'vue'

export function useAudioPlayer() {
  // 音频元素
  const audio = ref(null)
  
  // 播放器状态
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
  
  // 计算属性
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

  // 初始化音频元素
  const initAudio = () => {
    if (typeof window !== 'undefined') {
      audio.value = new Audio()
      
      // 音频事件监听
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
        console.error('音频播放错误:', e)
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

  // 播放音轨
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
      
      // 获取音频 URL
      const audioUrl = getTrackAudioURL(track)
      if (!audioUrl) {
        throw new Error('无法获取音频 URL')
      }

      audio.value.src = audioUrl
      audio.value.volume = isMuted.value ? 0 : volume.value / 100
      
      await audio.value.load()
      await audio.value.play()
      
      isPlaying.value = true
    } catch (error) {
      console.error('播放失败:', error)
      isLoading.value = false
      isPlaying.value = false
    }
  }

  // 播放/暂停
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
      console.error('播放/暂停失败:', error)
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
      return // 已经是第一首且不是循环模式
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
      return // 已经是最后一首且不是循环模式
    }

    currentIndex.value = newIndex
    playTrack(playlist.value[newIndex])
  }

  // 处理音轨结束
  const handleTrackEnd = () => {
    if (playMode.value === 'repeat-one') {
      // 单曲循环
      audio.value.currentTime = 0
      audio.value.play()
    } else {
      // 自动播放下一首
      nextTrack()
    }
  }

  // 跳转到指定时间
  const seekTo = (time) => {
    if (audio.value && duration.value) {
      const seekTime = Math.max(0, Math.min(time, duration.value))
      audio.value.currentTime = seekTime
      currentTime.value = seekTime
    }
  }

  // 设置音量
  const setVolume = (newVolume) => {
    volume.value = Math.max(0, Math.min(100, newVolume))
    if (audio.value && !isMuted.value) {
      audio.value.volume = volume.value / 100
    }
  }

  // 切换静音
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audio.value) {
      audio.value.volume = isMuted.value ? 0 : volume.value / 100
    }
  }

  // 设置播放模式
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

  // 从播放列表移除
  const removeFromPlaylist = (index) => {
    if (index >= 0 && index < playlist.value.length) {
      playlist.value.splice(index, 1)
      if (currentIndex.value >= index && currentIndex.value > 0) {
        currentIndex.value--
      }
    }
  }

  // 获取音轨播放 URL (与 Jamendo API 整合)
  const getTrackAudioURL = (track) => {
    if (track.audiodownload_allowed && track.audiodownload) {
      return track.audiodownload
    }
    return track.audio || null
  }

  // 格式化时间
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 监听音量变化
  watch(volume, (newVolume) => {
    if (audio.value && !isMuted.value) {
      audio.value.volume = newVolume / 100
    }
  })

  // 监听静音状态变化
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
    // 状态
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
    
    // 计算属性
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
    
    // 音频元素引用
    audio
  }
}