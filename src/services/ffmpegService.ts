import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { VideoInfo, GifConversionOptions, ConversionResult, ProgressCallback, ConversionProgress } from '../types'

class FFmpegService {
  private ffmpeg: FFmpeg | null = null
  private isLoaded = false
  private isLoading = false

  /**
   * 初始化FFmpeg
   */
  async initialize(): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return
    }

    this.isLoading = true

    try {
      this.ffmpeg = new FFmpeg()

      // 设置日志回调
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })

      // 加载FFmpeg核心文件 - 优先使用本地文件，CDN作为备选
      const loadSources = [
        // 本地文件（避免每次下载）
        {
          type: 'local',
          baseURL: '/ffmpeg',
          description: '本地文件'
        },
        // CDN备选
        {
          type: 'cdn',
          baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
          description: 'jsDelivr CDN'
        },
        {
          type: 'cdn',
          baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
          description: 'unpkg CDN'
        }
      ]
      
      let lastError: Error | null = null
      
      let loadSuccess = false
      
      for (const source of loadSources) {
        try {
          console.log(`尝试从${source.description}加载FFmpeg...`)
          
          await this.ffmpeg.load({
            coreURL: await toBlobURL(`${source.baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${source.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${source.baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
          })
          
          console.log(`成功从${source.description}加载FFmpeg`)
          loadSuccess = true
          break // 成功加载，跳出循环
        } catch (error) {
          console.warn(`从${source.description}加载FFmpeg失败:`, error)
          lastError = error as Error
          continue // 尝试下一个源
        }
      }
      
      // 如果所有源都失败了，抛出错误
      if (!loadSuccess && lastError) {
        throw new Error(`FFmpeg初始化失败: 无法从本地文件或CDN加载核心文件。\n\n解决方案：\n1. 运行 'npm run download-ffmpeg' 下载本地文件\n2. 检查网络连接\n3. 刷新页面重试\n\n详细错误: ${lastError.message}`)
      }

      this.isLoaded = true
      console.log('FFmpeg loaded successfully')
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      this.isLoaded = false
      
      // 提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          throw new Error('FFmpeg初始化失败: 网络访问被阻止，请检查网络设置或稍后重试')
        } else if (error.message.includes('fetch')) {
          throw new Error('FFmpeg初始化失败: 网络连接问题，请检查网络连接')
        } else {
          throw new Error(`FFmpeg初始化失败: ${error.message}`)
        }
      } else {
        throw new Error('FFmpeg初始化失败: 未知错误')
      }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 检查FFmpeg是否已加载
   */
  isReady(): boolean {
    return this.isLoaded && this.ffmpeg !== null
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(file: File): Promise<VideoInfo> {
    if (!this.isReady()) {
      await this.initialize()
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg未初始化')
    }

    try {
      const inputFileName = 'input.' + file.name.split('.').pop()
      const fileData = new Uint8Array(await file.arrayBuffer())
      
      // 写入文件到FFmpeg文件系统
      await this.ffmpeg.writeFile(inputFileName, fileData)

      // 使用ffprobe获取视频信息
      await this.ffmpeg.exec([
        '-i', inputFileName,
        '-f', 'null',
        '-'
      ])

      // 清理文件
      await this.ffmpeg.deleteFile(inputFileName)

      // 创建video元素获取基本信息
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          const info: VideoInfo = {
            name: file.name,
            size: file.size,
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            format: file.type
          }
          URL.revokeObjectURL(video.src)
          resolve(info)
        }
        
        video.onerror = () => {
          URL.revokeObjectURL(video.src)
          reject(new Error('无法读取视频信息'))
        }
        
        video.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.error('Failed to get video info:', error)
      throw new Error('获取视频信息失败')
    }
  }

  /**
   * 转换视频为GIF
   */
  async convertToGif(
    file: File,
    options: GifConversionOptions,
    onProgress?: ProgressCallback
  ): Promise<ConversionResult> {
    // 确保FFmpeg已经初始化
    if (!this.isReady()) {
      if (onProgress) {
        onProgress({
          percentage: 0,
          stage: 'initializing',
          stageText: '正在初始化FFmpeg...',
        })
      }
      
      try {
        await this.initialize()
      } catch (error) {
        throw new Error(`FFmpeg初始化失败: ${error instanceof Error ? error.message : '未知错误'}。请刷新页面重试。`)
      }
    }

    if (!this.ffmpeg || !this.isLoaded) {
      throw new Error('FFmpeg未能正确初始化，请刷新页面重试')
    }

    const startTime = Date.now()
    const duration = options.endTime - options.startTime
    const totalFrames = Math.ceil(duration * options.fps)

    try {
      const inputFileName = 'input.' + file.name.split('.').pop()
      const outputFileName = 'output.gif'
      const fileData = new Uint8Array(await file.arrayBuffer())
      
      // 阶段1: 初始化
      if (onProgress) {
        const progressInfo: ConversionProgress = {
          percentage: 0,
          stage: 'initializing',
          stageText: '正在初始化转换...',
          totalFrames
        }
        onProgress(progressInfo)
      }

      // 写入文件到FFmpeg文件系统
      await this.ffmpeg.writeFile(inputFileName, fileData)

      // 构建FFmpeg命令
      const args = this.buildFFmpegArgs(inputFileName, outputFileName, options)
      
      console.log('FFmpeg command:', args.join(' '))

      // 阶段2: 处理视频
      if (onProgress) {
        const progressInfo: ConversionProgress = {
          percentage: 10,
          stage: 'processing',
          stageText: '正在处理视频...',
          totalFrames
        }
        onProgress(progressInfo)
      }

      // 设置进度回调
      if (onProgress) {
        this.ffmpeg.on('progress', ({ progress }) => {
          const currentTime = Date.now()
          const elapsed = (currentTime - startTime) / 1000
          const estimatedTotal = elapsed / progress
          const estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed)
          
          const percentage = Math.round(progress * 100)
          let stage: ConversionProgress['stage'] = 'processing'
          let stageText = '正在处理视频...'
          
          if (percentage < 30) {
            stage = 'processing'
            stageText = '正在分析视频帧...'
          } else if (percentage < 80) {
            stage = 'generating'
            stageText = '正在生成GIF...'
          } else {
            stage = 'finalizing'
            stageText = '正在优化输出...'
          }
          
          const progressInfo: ConversionProgress = {
            percentage: Math.max(10, percentage),
            stage,
            stageText,
            estimatedTimeRemaining,
            currentFrame: Math.round((percentage / 100) * totalFrames),
            totalFrames
          }
          onProgress(progressInfo)
        })
      }

      // 执行转换
      await this.ffmpeg.exec(args)

      // 阶段3: 完成处理
      if (onProgress) {
        const progressInfo: ConversionProgress = {
          percentage: 95,
          stage: 'finalizing',
          stageText: '正在完成转换...',
          totalFrames,
          currentFrame: totalFrames
        }
        onProgress(progressInfo)
      }

      // 读取输出文件
      const outputData = await this.ffmpeg.readFile(outputFileName)
      const blob = new Blob([outputData], { type: 'image/gif' })

      // 清理文件
      await this.ffmpeg.deleteFile(inputFileName)
      await this.ffmpeg.deleteFile(outputFileName)

      // 最终完成
      if (onProgress) {
        const progressInfo: ConversionProgress = {
          percentage: 100,
          stage: 'finalizing',
          stageText: '转换完成！',
          totalFrames,
          currentFrame: totalFrames
        }
        onProgress(progressInfo)
      }

      const result: ConversionResult = {
        blob,
        size: blob.size,
        url: URL.createObjectURL(blob),
        filename: file.name.replace(/\.[^/.]+$/, '.gif')
      }

      return result
    } catch (error) {
      console.error('Failed to convert video to GIF:', error)
      throw new Error('视频转换失败')
    }
  }

  /**
   * 构建FFmpeg命令参数
   */
  private buildFFmpegArgs(
    inputFileName: string,
    outputFileName: string,
    options: GifConversionOptions
  ): string[] {
    const args = ['-i', inputFileName]

    // 设置时间范围
    if (options.startTime > 0) {
      args.push('-ss', options.startTime.toString())
    }
    
    if (options.endTime > options.startTime) {
      const duration = options.endTime - options.startTime
      args.push('-t', duration.toString())
    }

    // 设置帧率
    args.push('-r', options.fps.toString())

    // 设置尺寸
    if (options.width && options.height) {
      args.push('-s', `${options.width}x${options.height}`)
    }

    // 设置调色板和质量
    const paletteFilter = `palettegen=max_colors=${options.colorDepth}`
    const scaleFilter = options.width && options.height 
      ? `scale=${options.width}:${options.height}:flags=lanczos` 
      : 'scale=-1:-1:flags=lanczos'
    
    // 使用复杂滤镜链来优化GIF质量
    const filterComplex = `[0:v] ${scaleFilter},split [a][b];[a] ${paletteFilter} [p];[b][p] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`
    
    args.push('-filter_complex', filterComplex)
    
    // 设置循环
    args.push('-loop', '0')
    
    // 输出文件
    args.push(outputFileName)

    return args
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.ffmpeg) {
      // FFmpeg.wasm 没有显式的清理方法，但可以移除事件监听器
      this.ffmpeg.off('log')
      this.ffmpeg.off('progress')
    }
  }
}

// 创建单例实例
export const ffmpegService = new FFmpegService()