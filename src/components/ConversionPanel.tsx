import React, { useCallback, useState } from 'react'
import { ArrowPathIcon, ArrowDownTrayIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useAppStore } from '../store/useAppStore'
import { ffmpegService } from '../services/ffmpegService'
import { fileService, localStorageService } from '../services/fileService'
import { formatFileSize, estimateGifSize } from '../utils/helpers'

interface ConversionPanelProps {
  className?: string
}

export const ConversionPanel: React.FC<ConversionPanelProps> = ({ className = '' }) => {
  const {
    videoFile,
    videoInfo,
    conversionOptions,
    isConverting,
    conversionProgress,
    conversionResult,
    error,
    setIsConverting,
    setConversionProgress,
    setConversionResult,
    setError
  } = useAppStore()

  const [isDownloading, setIsDownloading] = useState(false)

  const handleConvert = useCallback(async () => {
    if (!videoFile || !videoInfo) {
      setError('请先上传视频文件')
      return
    }

    // 验证时间范围
    if (conversionOptions.startTime >= conversionOptions.endTime) {
      setError('开始时间必须小于结束时间')
      return
    }

    if (conversionOptions.endTime > videoInfo.duration) {
      setError('结束时间不能超过视频总时长')
      return
    }

    // 验证尺寸
    const width = conversionOptions.width || videoInfo.width
    const height = conversionOptions.height || videoInfo.height
    if (width < 1 || height < 1 || width > 1920 || height > 1080) {
      setError('输出尺寸必须在 1×1 到 1920×1080 之间')
      return
    }

    try {
      setIsConverting(true)
      setError(null)
      setConversionResult(null)

      // 开始转换
      const result = await ffmpegService.convertToGif(
        videoFile,
        conversionOptions,
        (progress) => {
          if (typeof progress === 'number') {
            // 兼容旧的数字进度
            setConversionProgress({
              percentage: progress,
              stage: 'processing',
              stageText: '正在转换...',
            })
          } else {
            setConversionProgress(progress)
          }
        }
      )

      setConversionResult(result)

      // 保存转换历史
      localStorageService.addConversionHistory({
        videoName: videoInfo.name,
        videoSize: videoInfo.size,
        gifSize: result.size,
        options: conversionOptions,
        duration: conversionOptions.endTime - conversionOptions.startTime
      })

    } catch (error) {
      console.error('Conversion failed:', error)
      setError(error instanceof Error ? error.message : '转换失败')
    } finally {
      setIsConverting(false)
      setConversionProgress(null)
    }
  }, [videoFile, videoInfo, conversionOptions, setIsConverting, setConversionProgress, setConversionResult, setError])

  const handleDownload = useCallback(async () => {
    if (!conversionResult) return

    try {
      setIsDownloading(true)
      fileService.downloadFile(conversionResult.blob, conversionResult.filename)
    } catch (error) {
      console.error('Download failed:', error)
      setError('下载失败')
    } finally {
      setIsDownloading(false)
    }
  }, [conversionResult, setError])

  const canConvert = videoFile && videoInfo && !isConverting
  const estimatedSize = videoInfo ? estimateGifSize(videoInfo, conversionOptions) : 0
  const duration = conversionOptions.endTime - conversionOptions.startTime

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <ArrowPathIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">转换控制</h3>
      </div>

      {/* 转换信息 */}
      {videoInfo && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">转换预览</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
            <div>输入: {videoInfo.width}×{videoInfo.height}</div>
            <div>输出: {conversionOptions.width || videoInfo.width}×{conversionOptions.height || videoInfo.height}</div>
            <div>时长: {duration.toFixed(1)}秒</div>
            <div>帧率: {conversionOptions.fps} FPS</div>
            <div>质量: {conversionOptions.quality}%</div>
            <div>预估大小: {formatFileSize(estimatedSize)}</div>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">转换错误</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              
              {/* 网络错误的特殊提示 */}
              {(error.includes('CORS') || error.includes('网络') || error.includes('CDN') || error.includes('加载')) && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h5 className="text-sm font-medium text-yellow-800 mb-2">💡 解决方案：</h5>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• 刷新页面重试</li>
                    <li>• 检查网络连接是否正常</li>
                    <li>• 尝试使用其他浏览器（推荐Chrome或Edge）</li>
                    <li>• 如果问题持续，可能是网络防火墙或代理设置导致</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 转换进度 */}
      {isConverting && conversionProgress && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">转换进度</span>
            <span className="text-sm text-gray-500">{conversionProgress.percentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${conversionProgress.percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">{conversionProgress.stageText}</span>
              {conversionProgress.estimatedTimeRemaining && (
                <span className="text-xs text-blue-600">
                  预计剩余: {Math.ceil(conversionProgress.estimatedTimeRemaining)}秒
                </span>
              )}
            </div>
            
            {conversionProgress.currentFrame && conversionProgress.totalFrames && (
              <div className="flex items-center justify-between text-xs text-blue-700">
                <span>帧进度: {conversionProgress.currentFrame} / {conversionProgress.totalFrames}</span>
                <span className="capitalize px-2 py-1 bg-blue-100 rounded-full">
                  {conversionProgress.stage === 'initializing' && '初始化'}
                  {conversionProgress.stage === 'processing' && '处理中'}
                  {conversionProgress.stage === 'generating' && '生成中'}
                  {conversionProgress.stage === 'finalizing' && '完成中'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 转换成功 */}
      {conversionResult && !isConverting && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900">转换完成</h4>
              <p className="text-sm text-green-700 mt-1">
                GIF文件已生成，大小: {formatFileSize(conversionResult.size)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-4">
        <button
          onClick={handleConvert}
          disabled={!canConvert}
          className={`
            flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all
            ${canConvert
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isConverting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              转换中...
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              开始转换
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={!conversionResult || isDownloading}
          className={`
            flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all
            ${conversionResult && !isDownloading
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              下载中...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              下载GIF
            </>
          )}
        </button>
      </div>

      {/* 使用提示 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">使用提示</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 较长的视频片段会产生较大的GIF文件</li>
          <li>• 降低帧率和质量可以减小文件大小</li>
          <li>• 建议GIF时长控制在10秒以内</li>
          <li>• 转换过程可能需要几分钟，请耐心等待</li>
        </ul>
      </div>

      {/* 快捷操作 */}
      {videoInfo && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">快捷设置</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                // 设置为高质量
                // 这里需要调用store的方法来更新设置
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              高质量设置
            </button>
            <button
              onClick={() => {
                // 设置为小文件
                // 这里需要调用store的方法来更新设置
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              小文件设置
            </button>
          </div>
        </div>
      )}
    </div>
  )
}