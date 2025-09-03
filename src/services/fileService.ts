import { ConversionHistory, UserPreferences } from '../types'
import { downloadFile } from '../utils/helpers'

/**
 * 文件服务类
 */
class FileService {
  /**
   * 下载文件
   */
  downloadFile(blob: Blob, filename: string): void {
    downloadFile(blob, filename)
  }

  /**
   * 读取文件为ArrayBuffer
   */
  async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 读取文件为DataURL
   */
  async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * 创建对象URL
   */
  createObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob)
  }

  /**
   * 释放对象URL
   */
  revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url)
  }

  /**
   * 验证文件类型
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  /**
   * 验证文件大小
   */
  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }
}

/**
 * 本地存储服务类
 */
class LocalStorageService {
  private readonly STORAGE_KEYS = {
    USER_PREFERENCES: 'video2gif_user_preferences',
    CONVERSION_HISTORY: 'video2gif_conversion_history'
  }

  /**
   * 保存用户偏好设置
   */
  saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      )
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }

  /**
   * 获取用户偏好设置
   */
  getUserPreferences(): UserPreferences | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return null
    }
  }

  /**
   * 保存转换历史记录
   */
  saveConversionHistory(history: ConversionHistory[]): void {
    try {
      // 只保留最近50条记录
      const limitedHistory = history.slice(-50)
      localStorage.setItem(
        this.STORAGE_KEYS.CONVERSION_HISTORY,
        JSON.stringify(limitedHistory)
      )
    } catch (error) {
      console.error('Failed to save conversion history:', error)
    }
  }

  /**
   * 获取转换历史记录
   */
  getConversionHistory(): ConversionHistory[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CONVERSION_HISTORY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get conversion history:', error)
      return []
    }
  }

  /**
   * 添加转换历史记录
   */
  addConversionHistory(record: Omit<ConversionHistory, 'id' | 'timestamp'>): void {
    const history = this.getConversionHistory()
    const newRecord: ConversionHistory = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    
    history.push(newRecord)
    this.saveConversionHistory(history)
  }

  /**
   * 清除转换历史记录
   */
  clearConversionHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.CONVERSION_HISTORY)
    } catch (error) {
      console.error('Failed to clear conversion history:', error)
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData(): void {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Failed to clear all data:', error)
    }
  }

  /**
   * 获取存储使用情况
   */
  getStorageUsage(): { used: number; total: number } {
    try {
      let used = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }
      
      // 大多数浏览器的localStorage限制为5MB
      const total = 5 * 1024 * 1024
      
      return { used, total }
    } catch (error) {
      console.error('Failed to get storage usage:', error)
      return { used: 0, total: 5 * 1024 * 1024 }
    }
  }

  /**
   * 检查存储是否可用
   */
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }
}

// 创建单例实例
export const fileService = new FileService()
export const localStorageService = new LocalStorageService()