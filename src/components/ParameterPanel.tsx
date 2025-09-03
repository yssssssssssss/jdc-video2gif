import React, { useCallback, useEffect, useState } from 'react'
import { Cog6ToothIcon, ClockIcon, PhotoIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/useAppStore'
import { QUALITY_PRESETS } from '../types'
import { formatTime, parseTime, calculateAspectRatioSize, estimateGifSize } from '../utils/helpers'

interface ParameterPanelProps {
  className?: string
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ className = '' }) => {
  const { 
    videoInfo, 
    conversionOptions, 
    setConversionOptions 
  } = useAppStore()
  
  const [startTimeInput, setStartTimeInput] = useState('00:00')
  const [endTimeInput, setEndTimeInput] = useState('00:00')
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)

  // 同步时间输入框
  useEffect(() => {
    setStartTimeInput(formatTime(conversionOptions.startTime))
    setEndTimeInput(formatTime(conversionOptions.endTime))
  }, [conversionOptions.startTime, conversionOptions.endTime])

  // 同步尺寸输入框
  useEffect(() => {
    if (conversionOptions.width) {
      setCustomWidth(conversionOptions.width.toString())
    }
    if (conversionOptions.height) {
      setCustomHeight(conversionOptions.height.toString())
    }
  }, [conversionOptions.width, conversionOptions.height])

  const handleQualityChange = useCallback((quality: number) => {
    setConversionOptions({ quality })
  }, [setConversionOptions])

  const handleFpsChange = useCallback((fps: number) => {
    setConversionOptions({ fps })
  }, [setConversionOptions])

  const handleColorDepthChange = useCallback((colorDepth: number) => {
    // 确保colorDepth是8、16或24之一
    const validColorDepth = (colorDepth === 8 || colorDepth === 16 || colorDepth === 24) ? 
      colorDepth as 8 | 16 | 24 : 16 as 8 | 16 | 24
    setConversionOptions({ colorDepth: validColorDepth })
  }, [setConversionOptions])

  const handleStartTimeChange = useCallback((timeString: string) => {
    setStartTimeInput(timeString)
    const startTime = parseTime(timeString)
    if (startTime >= 0 && (!videoInfo || startTime <= videoInfo.duration)) {
      setConversionOptions({ startTime })
    }
  }, [setConversionOptions, videoInfo])

  const handleEndTimeChange = useCallback((timeString: string) => {
    setEndTimeInput(timeString)
    const endTime = parseTime(timeString)
    if (endTime >= 0 && (!videoInfo || endTime <= videoInfo.duration)) {
      setConversionOptions({ endTime })
    }
  }, [setConversionOptions, videoInfo])



  const handleCustomWidthChange = useCallback((width: string) => {
    setCustomWidth(width)
    const widthNum = parseInt(width, 10)
    if (widthNum > 0 && videoInfo) {
      if (maintainAspectRatio) {
        const { height } = calculateAspectRatioSize(
          videoInfo.width,
          videoInfo.height,
          widthNum
        )
        setConversionOptions({ width: widthNum, height })
        setCustomHeight(height.toString())
      } else {
        setConversionOptions({ width: widthNum })
      }
    }
  }, [setConversionOptions, videoInfo, maintainAspectRatio])

  const handleCustomHeightChange = useCallback((height: string) => {
    setCustomHeight(height)
    const heightNum = parseInt(height, 10)
    if (heightNum > 0 && videoInfo) {
      if (maintainAspectRatio) {
        const { width } = calculateAspectRatioSize(
          videoInfo.width,
          videoInfo.height,
          undefined,
          heightNum
        )
        setConversionOptions({ width, height: heightNum })
        setCustomWidth(width.toString())
      } else {
        setConversionOptions({ height: heightNum })
      }
    }
  }, [setConversionOptions, videoInfo, maintainAspectRatio])

  const estimatedSize = videoInfo ? estimateGifSize(videoInfo, conversionOptions) : 0
  const duration = conversionOptions.endTime - conversionOptions.startTime

  if (!videoInfo) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Cog6ToothIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>请先上传视频文件</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 space-y-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">转换参数</h3>
      </div>

      {/* 时间范围设置 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-4 w-4 text-gray-500" />
          <h4 className="font-medium text-gray-900">时间范围</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始时间
            </label>
            <input
              type="text"
              value={startTimeInput}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              placeholder="00:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束时间
            </label>
            <input
              type="text"
              value={endTimeInput}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              placeholder={formatTime(videoInfo.duration)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          视频总时长：{formatTime(videoInfo.duration)} | 选择时长：{formatTime(duration)}
        </div>
      </div>

      {/* 尺寸设置 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <PhotoIcon className="h-4 w-4 text-gray-500" />
          <h4 className="font-medium text-gray-900">输出尺寸</h4>
        </div>
        

        
        {/* 自定义尺寸 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              自定义尺寸
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">保持宽高比</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => handleCustomWidthChange(e.target.value)}
                placeholder="宽度"
                min="1"
                max="1920"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => handleCustomHeightChange(e.target.value)}
                placeholder="高度"
                min="1"
                max="1080"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 质量设置 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">质量设置</h4>
        
        {/* 质量预设 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            质量预设
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUALITY_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  handleQualityChange(preset.quality)
                  handleFpsChange(preset.fps)
                  handleColorDepthChange(preset.colorDepth)
                }}
                className={`
                  px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${conversionOptions.quality === preset.quality 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 详细设置 */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图像质量: {conversionOptions.quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={conversionOptions.quality}
              onChange={(e) => handleQualityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              帧率: {conversionOptions.fps} FPS
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={conversionOptions.fps}
              onChange={(e) => handleFpsChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              颜色深度: {conversionOptions.colorDepth} 色
            </label>
            <select
              value={conversionOptions.colorDepth}
              onChange={(e) => handleColorDepthChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={8}>8色 (最小)</option>
              <option value={16}>16色 (低)</option>
              <option value={32}>32色 (中)</option>
              <option value={64}>64色 (高)</option>
              <option value={128}>128色 (很高)</option>
              <option value={256}>256色 (最高)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 预估信息 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">预估信息</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>输出尺寸: {conversionOptions.width || videoInfo.width} × {conversionOptions.height || videoInfo.height}</div>
          <div>时长: {formatTime(duration)}</div>
          <div>帧数: {Math.round(duration * conversionOptions.fps)} 帧</div>
          <div>预估大小: {(estimatedSize / 1024 / 1024).toFixed(1)} MB</div>
        </div>
      </div>
    </div>
  )
}