import React, { useCallback, useState } from 'react'
import { CloudArrowUpIcon, VideoCameraIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/useAppStore'
import { validateVideoFile, formatFileSize, getVideoInfo } from '../utils/helpers'
import { SUPPORTED_VIDEO_FORMATS } from '../types'

interface VideoUploadProps {
  className?: string
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ className = '' }) => {
  const { setVideoFile, setVideoInfo, setError } = useAppStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      // 验证文件类型
      if (!validateVideoFile(file)) {
        throw new Error(`不支持的文件格式。支持的格式：${SUPPORTED_VIDEO_FORMATS.join(', ')}`)
      }

      // 验证文件大小（限制为100MB）
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        throw new Error(`文件过大。最大支持 ${formatFileSize(maxSize)}`)
      }

      // 设置视频文件
      setVideoFile(file)

      // 获取视频信息
      const videoInfo = await getVideoInfo(file)
      setVideoInfo(videoInfo)

    } catch (error) {
      console.error('File upload error:', error)
      setError(error instanceof Error ? error.message : '文件上传失败')
      setVideoFile(null)
      setVideoInfo(null)
    } finally {
      setIsUploading(false)
    }
  }, [setVideoFile, setVideoInfo, setError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = ''
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    const input = document.getElementById('video-file-input') as HTMLInputElement
    input?.click()
  }, [])

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          id="video-file-input"
          type="file"
          accept={SUPPORTED_VIDEO_FORMATS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-600">正在处理文件...</p>
            </>
          ) : (
            <>
              <div className={`
                p-3 rounded-full transition-colors duration-200
                ${isDragOver ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}
              `}>
                {isDragOver ? (
                  <CloudArrowUpIcon className="h-8 w-8" />
                ) : (
                  <VideoCameraIcon className="h-8 w-8" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isDragOver ? '释放文件以上传' : '选择或拖拽视频文件'}
                </p>
                <p className="text-sm text-gray-500">
                  支持格式：MP4, AVI, MOV, MKV, WebM
                </p>
                <p className="text-xs text-gray-400">
                  最大文件大小：100MB
                </p>
              </div>

              <button
                type="button"
                className="
                  inline-flex items-center px-4 py-2 border border-transparent
                  text-sm font-medium rounded-md text-white bg-blue-600
                  hover:bg-blue-700 focus:outline-none focus:ring-2
                  focus:ring-offset-2 focus:ring-blue-500
                  transition-colors duration-200
                "
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                选择文件
              </button>
            </>
          )}
        </div>

        {/* 拖拽覆盖层 */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* 支持格式说明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">支持的视频格式：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>MP4 - 推荐格式，兼容性最好</li>
              <li>AVI - 传统格式，文件较大</li>
              <li>MOV - Apple格式，质量较高</li>
              <li>MKV - 开源格式，支持多轨道</li>
              <li>WebM - 网络优化格式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}