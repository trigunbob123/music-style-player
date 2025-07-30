<template>
  <div class="bg-gradient-to-r from-orange-500 via-red-500 via-purple-500 via-blue-500 to-teal-500 p-6 rounded-2xl shadow-2xl">
    <!-- 標題區域 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-white font-bold text-lg">自選混和曲風數量</h2>
          <p class="text-white/80 text-sm">選擇曲風和數量，創造你的專屬播放清單</p>
        </div>
      </div>
      
      <!-- 重設按鈕 -->
      <button
        @click="resetMix"
        class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
      >
        重設
      </button>
    </div>

    <!-- 曲風選擇器區域 -->
    <div class="space-y-4 mb-6">
      <div
        v-for="(mix, index) in mixConfigs"
        :key="index"
        class="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300"
      >
        <!-- 序號 -->
        <div class="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-sm">{{ index + 1 }}</span>
        </div>

        <!-- 曲風選擇器 -->
        <div class="flex-1">
          <GenreSelector
            :selected-genre="mix.genre"
            :available-genres="availableGenres"
            :placeholder="`選擇曲風 ${index + 1}`"
            @genre-selected="(genre) => updateMixGenre(index, genre)"
          />
        </div>

        <!-- 加號 -->
        <div class="flex-shrink-0 text-white/60 font-bold text-xl">+</div>

        <!-- 數量選擇器 -->
        <div class="flex-shrink-0">
          <NumberSelector
            :selected-number="mix.count"
            :max-number="5"
            :placeholder="'首'"
            @number-selected="(count) => updateMixCount(index, count)"
          />
        </div>
      </div>
    </div>

    <!-- 預覽和播放區域 -->
    <div class="flex items-center justify-between">
      <!-- 混和預覽 -->
      <div class="flex-1">
        <p class="text-white/80 text-sm mb-2">預覽播放順序:</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(preview, index) in mixPreview"
            :key="index"
            class="px-3 py-1 bg-white/20 text-white text-xs rounded-full"
          >
            {{ preview }}
          </span>
          <span v-if="totalTracks === 0" class="text-white/60 text-xs italic">
            請選擇曲風和數量
          </span>
        </div>
        <p v-if="totalTracks > 0" class="text-white/60 text-xs mt-1">
          總共 {{ totalTracks }} 首歌曲
        </p>
      </div>

      <!-- 播放按鈕 -->
      <button
        @click="startMixPlayback"
        :disabled="!canPlay"
        :class="[
          'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
          canPlay
            ? 'bg-white text-gray-900 hover:bg-white/90 hover:scale-105 shadow-lg'
            : 'bg-white/20 text-white/50 cursor-not-allowed'
        ]"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>播放</span>
      </button>
    </div>

    <!-- 載入狀態覆蓋層 -->
    <div
      v-if="isLoadingMix"
      class="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center"
    >
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <span class="text-white text-sm">正在建立播放清單...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import GenreSelector from './GenreSelector.vue'
import NumberSelector from './NumberSelector.vue'

// 發送事件
const emit = defineEmits(['play-mix'])

// 響應式數據
const isLoadingMix = ref(false)

// 可用曲風
const availableGenres = [
  'POP', 'ROCK', 'HIP HOP', 'ELECTRONIC', 'JAZZ',
  'WORLD', 'METAL', 'CLASSICAL', 'SOUNDTRACK', 'LOUNGE'
]

// 混和配置 (3個曲風選擇器)
const mixConfigs = reactive([
  { genre: '', count: 0 },
  { genre: '', count: 0 },
  { genre: '', count: 0 }
])

// 計算屬性
const mixPreview = computed(() => {
  return mixConfigs
    .filter(config => config.genre && config.count > 0)
    .map(config => `${config.genre} × ${config.count}`)
})

const totalTracks = computed(() => {
  return mixConfigs.reduce((total, config) => total + (config.count || 0), 0)
})

const canPlay = computed(() => {
  return mixConfigs.some(config => config.genre && config.count > 0) && !isLoadingMix.value
})

// 方法
const updateMixGenre = (index, genre) => {
  mixConfigs[index].genre = genre
}

const updateMixCount = (index, count) => {
  mixConfigs[index].count = count
}

const resetMix = () => {
  mixConfigs.forEach(config => {
    config.genre = ''
    config.count = 0
  })
}

const startMixPlayback = async () => {
  if (!canPlay.value) return

  const validConfigs = mixConfigs.filter(config => config.genre && config.count > 0)
  
  if (validConfigs.length === 0) return

  isLoadingMix.value = true

  try {
    emit('play-mix', validConfigs)
  } catch (error) {
    console.error('開始混和播放失敗:', error)
  } finally {
    // 在父組件處理完成後會設為 false
    setTimeout(() => {
      isLoadingMix.value = false
    }, 1000)
  }
}
</script>
