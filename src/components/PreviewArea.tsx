import React, { useEffect, useRef, useState, useCallback } from 'react'
import { PlayIcon, PauseIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/useAppStore'
import { formatTime, formatFileSize } from '../utils/helpers'

interface PreviewAreaProps {
  className?: string
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ className = '' }) => {
  const { 
    videoFile, 
    videoInfo, 
    conversionOptions, 
    conversionResult 
  } = useAppStore()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'video' | 'gif'>('video')

  // 创建视频URL
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile)
      setVideoUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setVideoUrl(null)
    }
  }, [videoFile])

  // 监听视频时间更新
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [videoUrl])

  // 自动跳转到开始时间
  useEffect(() => {
    const video = videoRef.current
    if (video && conversionOptions.startTime !== video.currentTime) {
      video.currentTime = conversionOptions.startTime
    }
  }, [conversionOptions.startTime])

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }, [isPlaying])

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = time
    setCurrentTime(time)
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoInfo) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * videoInfo.duration
    
    handleSeek(newTime)
  }, [videoInfo, handleSeek])

  const jumpToStart = useCallback(() => {
    handleSeek(conversionOptions.startTime)
  }, [conversionOptions.startTime, handleSeek])

  const jumpToEnd = useCallback(() => {
    handleSeek(conversionOptions.endTime)
  }, [conversionOptions.endTime, handleSeek])

  if (!videoFile || !videoInfo) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <EyeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>请先上传视频文件以预览</p>
        </div>
      </div>
    )
  }

  const progressPercentage = videoInfo.duration > 0 ? (currentTime / videoInfo.duration) * 100 : 0
  const startPercentage = videoInfo.duration > 0 ? (conversionOptions.startTime / videoInfo.duration) * 100 : 0
  const endPercentage = videoInfo.duration > 0 ? (conversionOptions.endTime / videoInfo.duration) * 100 : 100

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 标签页 */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('video')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
            ${activeTab === 'video' 
              ? 'border-blue-500 text-blue-600 bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <PlayIcon className="h-4 w-4 inline mr-2" />
          视频预览
        </button>
        <button
          onClick={() => setActiveTab('gif')}
          disabled={!conversionResult}
          className={`
            flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
            ${activeTab === 'gif' 
              ? 'border-blue-500 text-blue-600 bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }
            ${!conversionResult ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <ArrowPathIcon className="h-4 w-4 inline mr-2" />
          GIF预览
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'video' && (
          <div className="space-y-4">
            {/* 视频播放器 */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl || undefined}
                className="w-full h-auto max-h-96 object-contain"
                onLoadedMetadata={() => {
                  const video = videoRef.current
                  if (video) {
                    video.currentTime = conversionOptions.startTime
                  }
                }}
              />
              
              {/* 播放控制覆盖层 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                <button
                  onClick={handlePlayPause}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-8 w-8 text-gray-800" />
                  ) : (
                    <PlayIcon className="h-8 w-8 text-gray-800 ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* 进度条和控制 */}
            <div className="space-y-3">
              {/* 时间显示 */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(videoInfo.duration)}</span>
              </div>

              {/* 进度条 */}
              <div 
                className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                {/* 总进度背景 */}
                <div className="absolute inset-0 bg-gray-200 rounded-full" />
                
                {/* 选择范围 */}
                <div 
                  className="absolute h-full bg-blue-200 rounded-full"
                  style={{
                    left: `${startPercentage}%`,
                    width: `${endPercentage - startPercentage}%`
                  }}
                />
                
                {/* 当前播放进度 */}
                <div 
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
                
                {/* 开始时间标记 */}
                <div 
                  className="absolute w-3 h-3 bg-green-500 rounded-full transform -translate-y-0.5 -translate-x-1.5 border-2 border-white shadow"
                  style={{ left: `${startPercentage}%` }}
                />
                
                {/* 结束时间标记 */}
                <div 
                  className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-y-0.5 -translate-x-1.5 border-2 border-white shadow"
                  style={{ left: `${endPercentage}%` }}
                />
              </div>

              {/* 快速跳转按钮 */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={jumpToStart}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  跳转到开始 ({formatTime(conversionOptions.startTime)})
                </button>
                <button
                  onClick={handlePlayPause}
                  className="px-4 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  {isPlaying ? '暂停' : '播放'}
                </button>
                <button
                  onClick={jumpToEnd}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  跳转到结束 ({formatTime(conversionOptions.endTime)})
                </button>
              </div>
            </div>

            {/* 视频信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">视频信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>文件名: {videoInfo.name}</div>
                <div>文件大小: {formatFileSize(videoInfo.size)}</div>
                <div>分辨率: {videoInfo.width} × {videoInfo.height}</div>
                <div>时长: {formatTime(videoInfo.duration)}</div>
                <div>格式: {videoInfo.format}</div>
                <div>选择时长: {formatTime(conversionOptions.endTime - conversionOptions.startTime)}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gif' && (
          <div className="space-y-4">
            {conversionResult ? (
              <>
                {/* GIF预览 */}
                <div className="flex justify-center bg-gray-100 rounded-lg p-4">
                  <img
                    src={conversionResult.url}
                    alt="GIF预览"
                    className="max-w-full max-h-96 object-contain rounded"
                  />
                </div>

                {/* GIF信息 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">GIF信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>文件名: {conversionResult.filename}</div>
                    <div>文件大小: {formatFileSize(conversionResult.size)}</div>
                    <div>尺寸: {conversionOptions.width || videoInfo.width} × {conversionOptions.height || videoInfo.height}</div>
                    <div>帧率: {conversionOptions.fps} FPS</div>
                    <div>质量: {conversionOptions.quality}%</div>
                    <div>颜色深度: {conversionOptions.colorDepth} 色</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <ArrowPathIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>请先转换视频为GIF</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}