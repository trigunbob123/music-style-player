<!-- 3. AudioVisualizer.vue - 音頻視覺化 -->
<template>
  <div class="flex items-end space-x-1 h-12 w-32">
    <div 
      v-for="(bar, index) in bars" 
      :key="index"
      :style="{ height: `${bar}%` }"
      :class="[
        'bg-gradient-to-t transition-all duration-150 ease-out rounded-t-sm',
        isPlaying 
          ? 'from-purple-500 to-purple-300' 
          : 'from-gray-600 to-gray-400'
      ]"
      class="w-1.5 min-h-[4px]"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  },
  audioData: {
    type: Array,
    default: () => new Array(14).fill(0)
  }
})

const bars = computed(() => {
  if (props.isPlaying) {
    return props.audioData.map(value => Math.max(10, value))
  }
  return new Array(14).fill(10) // 靜止狀態的最小高度
})
</script>