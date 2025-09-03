// 视频信息接口
export interface VideoInfo {
  name: string
  size: number
  duration: number
  width: number
  height: number
  format: string
}

// GIF转换参数接口
export interface GifConversionOptions {
  quality: number // 1-100
  fps: number // 1-30
  width?: number
  height?: number
  startTime: number // seconds
  endTime: number // seconds
  colorDepth: 8 | 16 | 24
}

// 转换结果接口
export interface ConversionResult {
  blob: Blob
  size: number
  url: string
  filename: string
}

// 转换进度信息接口
export interface ConversionProgress {
  percentage: number // 0-100
  stage: 'initializing' | 'processing' | 'generating' | 'finalizing'
  stageText: string
  estimatedTimeRemaining?: number // seconds
  currentFrame?: number
  totalFrames?: number
}

// 转换进度回调类型
export type ProgressCallback = (progress: ConversionProgress | number) => void

// 文件上传处理接口
export interface FileUploadHandler {
  handleFileSelect: (file: File) => Promise<VideoInfo>
  validateFile: (file: File) => boolean
}

// 用户偏好设置接口
export interface UserPreferences {
  defaultQuality: number
  defaultFps: number
  preferredFormat: string
  lastUsedSettings: GifConversionOptions
}

// 转换历史记录接口
export interface ConversionHistory {
  id: string
  timestamp: number
  originalFileName: string
  settings: GifConversionOptions
  outputSize: number
}

// 应用状态接口
export interface AppState {
  videoFile: File | null
  videoInfo: VideoInfo | null
  conversionOptions: GifConversionOptions
  isConverting: boolean
  conversionProgress: ConversionProgress | null
  conversionResult: ConversionResult | null
  error: string | null
}

// 支持的视频格式
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'video/webm',
  'video/mkv'
] as const

// 预设尺寸选项
export const PRESET_SIZES = [
  { label: '原始尺寸', width: 0, height: 0 },
  { label: '480p', width: 854, height: 480 },
  { label: '720p', width: 1280, height: 720 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: '自定义', width: -1, height: -1 }
] as const

// 质量预设选项
export const QUALITY_PRESETS = [
  { name: 'low', label: '低质量', quality: 30, fps: 10, colorDepth: 8 as const },
  { name: 'medium', label: '中等质量', quality: 60, fps: 15, colorDepth: 16 as const },
  { name: 'high', label: '高质量', quality: 85, fps: 24, colorDepth: 24 as const }
] as const