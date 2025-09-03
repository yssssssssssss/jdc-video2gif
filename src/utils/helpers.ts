import { SUPPORTED_VIDEO_FORMATS, VideoInfo, GifConversionOptions } from '../types'

/**
 * 验证文件是否为支持的视频格式
 */
export function validateVideoFile(file: File): boolean {
  return SUPPORTED_VIDEO_FORMATS.includes(file.type as any)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时间（秒转换为 mm:ss 格式）
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 解析时间字符串（mm:ss 格式转换为秒）
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':')
  if (parts.length !== 2) return 0
  
  const mins = parseInt(parts[0], 10) || 0
  const secs = parseInt(parts[1], 10) || 0
  
  return mins * 60 + secs
}

/**
 * 估算GIF文件大小（粗略估算）
 */
export function estimateGifSize(
  videoInfo: VideoInfo,
  options: GifConversionOptions
): number {
  const duration = options.endTime - options.startTime
  const width = options.width || videoInfo.width
  const height = options.height || videoInfo.height
  const fps = options.fps
  const quality = options.quality / 100
  
  // 粗略估算：像素数 × 帧数 × 质量系数 × 颜色深度系数
  const pixelCount = width * height
  const frameCount = duration * fps
  const colorDepthFactor = options.colorDepth / 24
  const compressionFactor = 0.1 + (quality * 0.4) // 0.1-0.5
  
  return Math.round(pixelCount * frameCount * colorDepthFactor * compressionFactor)
}

/**
 * 计算保持宽高比的新尺寸
 */
export function calculateAspectRatioSize(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight
  
  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio)
    }
  }
  
  if (!targetWidth && targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight
    }
  }
  
  if (targetWidth && targetHeight) {
    return { width: targetWidth, height: targetHeight }
  }
  
  return { width: originalWidth, height: originalHeight }
}

/**
 * 创建下载链接
 */
export function createDownloadUrl(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob)
  return url
}

/**
 * 释放下载链接
 */
export function revokeDownloadUrl(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * 下载文件
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = createDownloadUrl(blob, filename)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  revokeDownloadUrl(url)
}

/**
 * 获取视频文件信息
 */
export function getVideoInfo(file: File): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      const info: VideoInfo = {
        name: file.name,
        size: file.size,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        format: file.type
      }
      resolve(info)
    }
    
    video.onerror = () => {
      reject(new Error('无法读取视频文件信息'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}