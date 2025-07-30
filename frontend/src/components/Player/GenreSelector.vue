<template>
  <div class="relative">
    <!-- 選擇按鈕 -->
    <button
      @click="toggleDropdown"
      :class="[
        'w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200',
        'border-2 border-transparent',
        selectedGenre 
          ? 'bg-white/20 text-white border-white/30' 
          : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
      ]"
    >
      <span class="font-medium">
        {{ selectedGenre || placeholder }}
      </span>
      <svg 
        :class="[
          'w-4 h-4 transition-transform duration-200',
          isOpen ? 'transform rotate-180' : ''
        ]"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- 下拉選單 -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto"
    >
      <div class="py-2">
        <button
          v-for="genre in availableGenres"
          :key="genre"
          @click="selectGenre(genre)"
          :class="[
            'w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200',
            'hover:bg-gray-700',
            selectedGenre === genre ? 'bg-purple-600 text-white' : 'text-gray-300'
          ]"
        >
          <span class="font-medium">{{ genre }}</span>
          <svg 
            v-if="selectedGenre === genre"
            class="w-4 h-4 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 點擊外部關閉選單的遮罩 -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  selectedGenre: {
    type: String,
    default: ''
  },
  availableGenres: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: '選擇曲風'
  }
})

// 發送事件
const emit = defineEmits(['genre-selected'])

// 響應式數據
const isOpen = ref(false)

// 方法
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectGenre = (genre) => {
  emit('genre-selected', genre)
  closeDropdown()
}
</script>
