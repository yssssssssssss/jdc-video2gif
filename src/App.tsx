import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { HomeIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { VideoUpload } from './components/VideoUpload'
import { ParameterPanel } from './components/ParameterPanel'
import { PreviewArea } from './components/PreviewArea'
import { ConversionPanel } from './components/ConversionPanel'
import { HelpPage } from './components/HelpPage'
import { useAppStore } from './store/useAppStore'

// 主页面组件
const HomePage: React.FC = () => {
  const { videoFile } = useAppStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            视频转GIF工具
          </h1>
          <p className="text-lg text-gray-600">
            快速将视频转换为高质量GIF动图
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto">
          {!videoFile ? (
            /* 未上传视频时显示上传区域 */
            <div className="max-w-2xl mx-auto">
              <VideoUpload className="mb-8" />
              
              {/* 功能介绍 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">功能特点</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">多格式支持</h3>
                      <p className="text-sm text-gray-600">支持MP4、AVI、MOV等主流视频格式</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">质量控制</h3>
                      <p className="text-sm text-gray-600">灵活调整GIF质量和文件大小</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">尺寸自定义</h3>
                      <p className="text-sm text-gray-600">支持预设和自定义输出尺寸</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">时间裁剪</h3>
                      <p className="text-sm text-gray-600">精确选择视频片段进行转换</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 已上传视频时显示完整界面 */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：上传和参数设置 */}
              <div className="space-y-6">
                <VideoUpload />
                <ParameterPanel />
              </div>
              
              {/* 中间：预览区域 */}
              <div>
                <PreviewArea />
              </div>
              
              {/* 右侧：转换控制 */}
              <div>
                <ConversionPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 导航组件
const Navigation: React.FC = () => {
  const location = useLocation()
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Video2GIF
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                首页
              </Link>
              <Link
                to="/help"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/help'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                帮助
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

// 主应用组件
const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
        
        {/* 页脚 */}
        <footer className="bg-white border-t mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600">
              <p>
                © 2024 Video2GIF Tool. 基于 FFmpeg.wasm 技术，所有处理均在本地完成。
              </p>
              <p className="mt-1">
                <Link to="/help" className="text-blue-600 hover:text-blue-800">
                  查看使用帮助
                </Link>
                {' | '}
                <a 
                  href="https://github.com/ffmpegwasm/ffmpeg.wasm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  FFmpeg.wasm
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
