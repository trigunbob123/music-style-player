<template>
  <div class="relative">
    <!-- 選擇按鈕 -->
    <button
      @click="toggleDropdown"
      :class="[
        'flex items-center justify-between px-4 py-3 w-20 text-center rounded-xl transition-all duration-200',
        'border-2 border-transparent',
        selectedNumber > 0
          ? 'bg-white/20 text-white border-white/30' 
          : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
      ]"
    >
      <span class="font-bold text-lg mx-auto">
        {{ selectedNumber > 0 ? selectedNumber : '?' }}
      </span>
      <svg 
        :class="[
          'w-3 h-3 transition-transform duration-200 ml-1',
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
      class="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50"
    >
      <div class="py-2">
        <button
          v-for="number in numbers"
          :key="number"
          @click="selectNumber(number)"
          :class="[
            'w-full flex items-center justify-center px-4 py-3 text-center transition-colors duration-200',
            'hover:bg-gray-700',
            selectedNumber === number ? 'bg-purple-600 text-white' : 'text-gray-300'
          ]"
        >
          <span class="font-bold text-lg">{{ number }}</span>
          <span class="text-xs ml-1">{{ placeholder }}</span>
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
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  selectedNumber: {
    type: Number,
    default: 0
  },
  maxNumber: {
    type: Number,
    default: 5
  },
  placeholder: {
    type: String,
    default: '首'
  }
})

// 發送事件
const emit = defineEmits(['number-selected'])

// 響應式數據
const isOpen = ref(false)

// 計算屬性
const numbers = computed(() => {
  return Array.from({ length: props.maxNumber }, (_, i) => i + 1)
})

// 方法
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectNumber = (number) => {
  emit('number-selected', number)
  closeDropdown()
}
</script>
