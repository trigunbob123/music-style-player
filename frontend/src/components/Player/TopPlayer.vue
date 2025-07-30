<!-- TopPlayer.vue - 主容器  處理播放邏輯協調 整合所有子組件 管理循環和隨機播放模式 -->
<template>
  <div class="h-20 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-b border-gray-700 flex items-center px-4 shadow-lg">
    <CurrentSongInfo 
      :current-song="currentSong" 
      class="flex-shrink-0"
    />
    
    <AudioVisualizer 
      :is-playing="isPlaying"
      :audio-data="audioData"
      class="ml-6 flex-shrink-0"
    />
    
    <div class="flex-1 flex items-center justify-center space-x-4">
      <PlayerControls 
        :is-playing="isPlaying"
        :can-go-previous="canGoPrevious"
        :can-go-next="canGoNext"
        @play-pause="togglePlayPause"
        @previous="previousTrack"
        @next="nextTrack"
      />
    </div>
    
    <div class="flex-1 max-w-md mx-4">
      <ProgressBar 
        :current-time="currentTime"
        :duration="duration"
        :progress="progress"
        @seek="seekTo"
      />
    </div>
    
    <div class="flex items-center space-x-4 flex-shrink-0">
      <button 
        @click="toggleRepeat"
        :class="[
          'p-2 rounded-full transition-all duration-200',
          repeatMode !== 'none' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
        ]"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zM17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
        </svg>
      </button>
      
      <button 
        @click="toggleShuffle"
        :class="[
          'p-2 rounded-full transition-all duration-200',
          isShuffled ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
        ]"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
        </svg>
      </button>
      
      <VolumeControl 
        :volume="volume"
        :is-muted="isMuted"
        @volume-change="setVolume"
        @toggle-mute="toggleMute"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CurrentSongInfo from './CurrentSongInfo.vue'
import AudioVisualizer from './AudioVisualizer.vue'
import PlayerControls from './PlayerControls.vue'
import ProgressBar from './ProgressBar.vue'
import VolumeControl from './VolumeControl.vue'
import { useJamendoAPI } from '@/composables/useJamendoAPI'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

// Composables
const { currentSong, isPlaying, currentTime, duration, progress, volume, isMuted } = useAudioPlayer()
const jamendoAPI = useJamendoAPI()

// 響應式資料
const audioData = ref(new Array(14).fill(0))
const repeatMode = ref('none') // 'none', 'one', 'all'
const isShuffled = ref(false)
const canGoPrevious = ref(false)
const canGoNext = ref(true)

// 方法
const togglePlayPause = () => {
  // 播放/暫停邏輯
}

const previousTrack = () => {
  // 上一首邏輯
}

const nextTrack = () => {
  // 下一首邏輯
}

const seekTo = (time) => {
  // 跳轉播放位置
}

const setVolume = (newVolume) => {
  // 設置音量
}

const toggleMute = () => {
  // 切換靜音
}

const toggleRepeat = () => {
  const modes = ['none', 'one', 'all']
  const currentIndex = modes.indexOf(repeatMode.value)
  repeatMode.value = modes[(currentIndex + 1) % modes.length]
}

const toggleShuffle = () => {
  isShuffled.value = !isShuffled.value
}

// 音頻視覺化數據更新
let animationFrame
const updateAudioData = () => {
  if (isPlaying.value) {
    // 模擬音頻數據 (實際應用中從Web Audio API獲取)
    audioData.value = audioData.value.map(() => Math.random() * 100)
  }
  animationFrame = requestAnimationFrame(updateAudioData)
}

onMounted(() => {
  updateAudioData()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

