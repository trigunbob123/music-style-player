export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const getGenreDisplayName = (genre) => {
  const displayNames = {
    'POP': '流行音樂',
    'ROCK': '搖滾音樂',
    'HIP HOP': '嘻哈音樂',
    'ELECTRONIC': '電子音樂',
    'JAZZ': '爵士音樂',
    'WORLD': '世界音樂',
    'METAL': '金屬音樂',
    'CLASSICAL': '古典音樂',
    'SOUNDTRACK': '原聲音樂',
    'LOUNGE': '酒吧音樂'
  }
  return displayNames[genre] || genre
}

export const getGenreDescription = (genre) => {
  const descriptions = {
    'POP': '當代流行音樂，節奏明快，旋律朗朗上口',
    'ROCK': '充滿力量的搖滾音樂，電吉他與鼓點的完美結合',
    'HIP HOP': '節拍強烈的嘻哈音樂，展現街頭文化',
    'ELECTRONIC': '電子合成音樂，科技感十足的聲音體驗',
    'JAZZ': '即興演奏的爵士樂，展現音樂家的創造力',
    'WORLD': '來自世界各地的傳統與現代音樂融合',
    'METAL': '重金屬音樂，強烈的節拍和激昂的情感',
    'CLASSICAL': '經典古典音樂，永恆的藝術瑰寶',
    'SOUNDTRACK': '電影、遊戲原聲音樂，情感豐富',
    'LOUNGE': '輕鬆愜意的背景音樂，適合放鬆時光'
  }
  return descriptions[genre] || '探索這個音樂類型的獨特魅力'
}

// 音樂播放統計
export const trackPlayHistory = {
  plays: JSON.parse(localStorage.getItem('track-plays') || '{}'),
  
  recordPlay(trackId) {
    this.plays[trackId] = (this.plays[trackId] || 0) + 1
    localStorage.setItem('track-plays', JSON.stringify(this.plays))
  },
  
  getPlayCount(trackId) {
    return this.plays[trackId] || 0
  },
  
  getMostPlayed(limit = 10) {
    return Object.entries(this.plays)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([trackId, plays]) => ({ trackId, plays }))
  }
}

// 本地存儲管理
export const localStorageManager = {
  // 收藏管理
  favorites: {
    get() {
      return JSON.parse(localStorage.getItem('favorite-tracks') || '[]')
    },
    add(trackId) {
      const favorites = this.get()
      if (!favorites.includes(trackId)) {
        favorites.push(trackId)
        localStorage.setItem('favorite-tracks', JSON.stringify(favorites))
      }
    },
    remove(trackId) {
      const favorites = this.get().filter(id => id !== trackId)
      localStorage.setItem('favorite-tracks', JSON.stringify(favorites))
    },
    toggle(trackId) {
      const favorites = this.get()
      if (favorites.includes(trackId)) {
        this.remove(trackId)
        return false
      } else {
        this.add(trackId)
        return true
      }
    }
  },
  
  // 播放清單管理
  playlists: {
    get() {
      return JSON.parse(localStorage.getItem('user-playlists') || '[]')
    },
    save(playlists) {
      localStorage.setItem('user-playlists', JSON.stringify(playlists))
    },
    create(name, tracks = []) {
      const playlists = this.get()
      const newPlaylist = {
        id: Date.now(),
        name,
        tracks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      playlists.push(newPlaylist)
      this.save(playlists)
      return newPlaylist
    }
  },
  
  // 搜尋歷史管理
  searchHistory: {
    get() {
      return JSON.parse(localStorage.getItem('search-history') || '[]')
    },
    add(query) {
      const history = this.get().filter(q => q !== query)
      history.unshift(query)
      const trimmedHistory = history.slice(0, 20) // 保留最近20次搜尋
      localStorage.setItem('search-history', JSON.stringify(trimmedHistory))
    },
    clear() {
      localStorage.removeItem('search-history')
    }
  }
}