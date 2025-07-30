// src/composables/useAudioVisualizer.js
import { ref, reactive, onUnmounted } from 'vue'

export function useAudioVisualizer(audioElement) {
  const audioContext = ref(null)
  const analyser = ref(null)
  const dataArray = ref(null)
  const source = ref(null)
  const animationId = ref(null)
  
  // 14條音頻條的數據
  const audioData = reactive(new Array(14).fill(0))
  const isInitialized = ref(false)

  // 初始化音頻分析器
  const initAnalyser = () => {
    if (!audioElement.value || isInitialized.value) return

    try {
      // 創建音頻上下文
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      
      // 創建分析器節點
      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 512 // 512 個頻率數據點
      analyser.value.smoothingTimeConstant = 0.8
      
      // 創建音頻源節點
      source.value = audioContext.value.createMediaElementSource(audioElement.value)
      
      // 連接節點
      source.value.connect(analyser.value)
      analyser.value.connect(audioContext.value.destination)
      
      // 創建數據陣列
      const bufferLength = analyser.value.frequencyBinCount
      dataArray.value = new Uint8Array(bufferLength)
      
      isInitialized.value = true
      
      // 開始分析
      startAnalysis()
    } catch (error) {
      console.error('音頻分析器初始化失敗:', error)
    }
  }

  // 開始音頻分析
  const startAnalysis = () => {
    if (!analyser.value || !dataArray.value) return

    const analyze = () => {
      // 獲取頻率數據
      analyser.value.getByteFrequencyData(dataArray.value)
      
      // 將 256 個頻率數據點映射到 14 個音頻條
      const barsCount = 14
      const dataPointsPerBar = Math.floor(dataArray.value.length / barsCount)
      
      for (let i = 0; i < barsCount; i++) {
        let sum = 0
        const startIndex = i * dataPointsPerBar
        const endIndex = startIndex + dataPointsPerBar
        
        // 計算每個音頻條的平均值
        for (let j = startIndex; j < endIndex; j++) {
          sum += dataArray.value[j]
        }
        
        const average = sum / dataPointsPerBar
        // 轉換為百分比 (0-100)
        audioData[i] = Math.max(10, (average / 255) * 100)
      }
      
      animationId.value = requestAnimationFrame(analyze)
    }
    
    analyze()
  }

  // 停止分析
  const stopAnalysis = () => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
      animationId.value = null
    }
    
    // 重置音頻數據
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = 10
    }
  }

  // 恢復音頻上下文 (某些瀏覽器需要用戶互動後才能啟動)
  const resumeAudioContext = async () => {
    if (audioContext.value && audioContext.value.state === 'suspended') {
      try {
        await audioContext.value.resume()
      } catch (error) {
        console.error('恢復音頻上下文失敗:', error)
      }
    }
  }

  // 清理資源
  const cleanup = () => {
    stopAnalysis()
    
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    
    analyser.value = null
    source.value = null
    dataArray.value = null
    isInitialized.value = false
  }

  // 監聽音頻元素變化
  const watchAudioElement = (newAudioElement) => {
    if (newAudioElement && !isInitialized.value) {
      audioElement.value = newAudioElement
      initAnalyser()
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    audioData,
    isInitialized,
    initAnalyser,
    startAnalysis,
    stopAnalysis,
    resumeAudioContext,
    cleanup,
    watchAudioElement
  }
}