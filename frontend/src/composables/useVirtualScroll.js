import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useVirtualScroll(items, itemHeight = 200, containerHeight = 600) {
  const scrollTop = ref(0)
  const containerRef = ref(null)
  
  const visibleStart = computed(() => {
    return Math.floor(scrollTop.value / itemHeight)
  })
  
  const visibleEnd = computed(() => {
    return Math.min(
      visibleStart.value + Math.ceil(containerHeight / itemHeight) + 1,
      items.value.length
    )
  })
  
  const visibleItems = computed(() => {
    return items.value.slice(visibleStart.value, visibleEnd.value)
  })
  
  const totalHeight = computed(() => {
    return items.value.length * itemHeight
  })
  
  const offsetY = computed(() => {
    return visibleStart.value * itemHeight
  })
  
  const handleScroll = (e) => {
    scrollTop.value = e.target.scrollTop
  }
  
  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  }
}

// mockData/sampleTracks.js - 測試用音樂資料

export const sampleTracks = [
  {
    id: 1,
    name: "Summer Vibes",
    artist_name: "Cool Artist",
    album_name: "Chill Collection",
    duration: 180,
    image: "https://picsum.photos/300/300?random=1",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    genre: "POP"
  },
  {
    id: 2,
    name: "Electric Dreams",
    artist_name: "Synth Master",
    album_name: "Digital Era",
    duration: 240,
    image: "https://picsum.photos/300/300?random=2",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    genre: "ELECTRONIC"
  },
  // ... 更多測試資料
]

// 如果 Jamendo API 暫時無法使用，可以用這些測試資料
export const useMockData = () => {
  return {
    getTracks: async (options) => {
      return {
        tracks: sampleTracks.slice(0, options.limit || 20),
        totalPages: 1,
        currentPage: 1,
        totalResults: sampleTracks.length
      }
    },
    formatTrackData: (track) => track
  }
}