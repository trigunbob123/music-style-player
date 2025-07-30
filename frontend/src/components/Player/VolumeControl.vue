<!-- 6. VolumeControl.vue - 音量控制 -->
<template>
  <div class="flex items-center space-x-2 group">
    <!-- 音量圖示 -->
    <button 
      @click="$emit('toggle-mute')"
      class="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
    >
      <svg v-if="isMuted || volume === 0" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>
      <svg v-else-if="volume < 50" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
      </svg>
      <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    </button>
    
    <!-- 音量滑桿 -->
    <div class="w-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <input 
        type="range"
        min="0"
        max="100"
        :value="volume"
        @input="$emit('volume-change', $event.target.value)"
        class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  volume: {
    type: Number,
    default: 50
  },
  isMuted: {
    type: Boolean,
    default: false
  }
})

defineEmits(['volume-change', 'toggle-mute'])
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>