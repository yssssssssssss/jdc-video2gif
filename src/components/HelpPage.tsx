import React from 'react'
import { QuestionMarkCircleIcon, PlayIcon, CogIcon, EyeIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <QuestionMarkCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">使用帮助</h1>
        <p className="text-lg text-gray-600">了解如何使用视频转GIF工具</p>
      </div>

      {/* 快速开始 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <PlayIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-900">1. 上传视频</h3>
            <p className="text-sm text-blue-700 mt-1">拖拽或点击上传视频文件</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CogIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-900">2. 设置参数</h3>
            <p className="text-sm text-green-700 mt-1">调整质量、尺寸和时间</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <EyeIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-purple-900">3. 实时预览</h3>
            <p className="text-sm text-purple-700 mt-1">查看转换效果预览</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <ArrowDownTrayIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-medium text-orange-900">4. 下载GIF</h3>
            <p className="text-sm text-orange-700 mt-1">转换完成后下载文件</p>
          </div>
        </div>
      </div>

      {/* 支持的格式 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">支持的视频格式</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.mp4</div>
            <div className="text-xs text-gray-600 mt-1">MP4视频</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.avi</div>
            <div className="text-xs text-gray-600 mt-1">AVI视频</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.mov</div>
            <div className="text-xs text-gray-600 mt-1">QuickTime</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.webm</div>
            <div className="text-xs text-gray-600 mt-1">WebM视频</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.mkv</div>
            <div className="text-xs text-gray-600 mt-1">Matroska</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.wmv</div>
            <div className="text-xs text-gray-600 mt-1">Windows Media</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.flv</div>
            <div className="text-xs text-gray-600 mt-1">Flash视频</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="font-mono text-sm font-medium text-gray-900">.3gp</div>
            <div className="text-xs text-gray-600 mt-1">3GPP视频</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>文件大小限制：</strong>最大支持100MB的视频文件
          </p>
        </div>
      </div>

      {/* 参数设置说明 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">参数设置说明</h2>
        <div className="space-y-6">
          {/* 质量设置 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">质量设置</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-medium text-green-700">高质量 (80-100%)</div>
                  <div className="text-sm text-gray-600 mt-1">画质清晰，文件较大</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-700">中等质量 (50-79%)</div>
                  <div className="text-sm text-gray-600 mt-1">平衡画质和文件大小</div>
                </div>
                <div>
                  <div className="font-medium text-red-700">低质量 (20-49%)</div>
                  <div className="text-sm text-gray-600 mt-1">文件小，画质一般</div>
                </div>
              </div>
            </div>
          </div>

          {/* 尺寸设置 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">尺寸设置</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-blue-700">预设尺寸</div>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• 小尺寸: 320×240</li>
                    <li>• 中等尺寸: 640×480</li>
                    <li>• 大尺寸: 1280×720</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-blue-700">自定义尺寸</div>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• 支持1×1到1920×1080</li>
                    <li>• 保持宽高比选项</li>
                    <li>• 自动计算最佳尺寸</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 时间设置 */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">时间设置</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-purple-700">时间裁剪</div>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• 设置开始和结束时间</li>
                    <li>• 支持精确到0.1秒</li>
                    <li>• 建议时长不超过10秒</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-purple-700">帧率设置</div>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• 5-30 FPS可选</li>
                    <li>• 高帧率更流畅</li>
                    <li>• 低帧率文件更小</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">优化建议</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-green-700 mb-3">减小文件大小</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                降低质量设置到50-70%
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                使用较小的输出尺寸
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                减少帧率到10-15 FPS
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                缩短视频片段时长
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-700 mb-3">提高画质</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                使用80%以上的质量设置
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                保持原始视频尺寸
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                使用较高的帧率(20-30 FPS)
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                选择画面变化较少的片段
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">常见问题</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium text-gray-900">Q: 为什么转换速度很慢？</h3>
            <p className="text-sm text-gray-600 mt-1">
              A: 转换速度取决于视频长度、质量设置和设备性能。建议使用较短的视频片段和适中的质量设置。
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium text-gray-900">Q: 生成的GIF文件太大怎么办？</h3>
            <p className="text-sm text-gray-600 mt-1">
              A: 可以降低质量设置、减小输出尺寸、降低帧率或缩短视频时长来减小文件大小。
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-medium text-gray-900">Q: 支持哪些浏览器？</h3>
            <p className="text-sm text-gray-600 mt-1">
              A: 支持现代浏览器，包括Chrome、Firefox、Safari和Edge的最新版本。
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-medium text-gray-900">Q: 转换失败怎么办？</h3>
            <p className="text-sm text-gray-600 mt-1">
              A: 请检查视频格式是否支持、文件大小是否超限，或尝试刷新页面重新上传。
            </p>
          </div>
        </div>
      </div>

      {/* 技术说明 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">技术说明</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">隐私保护</h3>
              <p className="text-sm text-gray-600 mt-1">
                所有视频处理都在您的浏览器本地完成，不会上传到服务器，确保您的隐私安全。
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>技术栈：</strong>React + TypeScript + FFmpeg.wasm + Tailwind CSS</p>
          <p><strong>处理引擎：</strong>FFmpeg WebAssembly版本，支持在浏览器中进行视频处理</p>
        </div>
      </div>
    </div>
  )
}