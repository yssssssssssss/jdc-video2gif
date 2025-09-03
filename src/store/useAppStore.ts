import { create } from 'zustand'
import { AppState, GifConversionOptions, VideoInfo, ConversionResult, ConversionProgress } from '../types'

interface AppStore extends AppState {
  // Actions
  setVideoFile: (file: File | null) => void
  setVideoInfo: (info: VideoInfo | null) => void
  setConversionOptions: (options: Partial<GifConversionOptions>) => void
  setIsConverting: (converting: boolean) => void
  setConversionProgress: (progress: ConversionProgress | null) => void
  setConversionResult: (result: ConversionResult | null) => void
  setError: (error: string | null) => void
  resetState: () => void
}

const defaultConversionOptions: GifConversionOptions = {
  quality: 60,
  fps: 15,
  startTime: 0,
  endTime: 0,
  colorDepth: 16
}

const initialState: AppState = {
  videoFile: null,
  videoInfo: null,
  conversionOptions: defaultConversionOptions,
  isConverting: false,
  conversionProgress: null,
  conversionResult: null,
  error: null
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setVideoFile: (file) => {
    set({ videoFile: file })
    if (!file) {
      set({ videoInfo: null, conversionResult: null, error: null })
    }
  },

  setVideoInfo: (info) => {
    set({ videoInfo: info })
    if (info) {
      // 自动设置结束时间为视频时长
      const currentOptions = get().conversionOptions
      set({
        conversionOptions: {
          ...currentOptions,
          endTime: info.duration,
          width: info.width,
          height: info.height
        }
      })
    }
  },

  setConversionOptions: (options) => {
    const currentOptions = get().conversionOptions
    set({
      conversionOptions: { ...currentOptions, ...options }
    })
  },

  setIsConverting: (converting) => {
    set({ isConverting: converting })
    if (converting) {
      set({ conversionProgress: null, conversionResult: null, error: null })
    }
  },

  setConversionProgress: (progress) => {
    set({ conversionProgress: progress })
  },

  setConversionResult: (result) => {
    set({ conversionResult: result, isConverting: false })
  },

  setError: (error) => {
    set({ error, isConverting: false })
  },

  resetState: () => {
    set(initialState)
  }
}))