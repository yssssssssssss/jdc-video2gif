# FFmpeg 本地缓存设置

## 问题说明

默认情况下，应用每次启动都会从CDN下载FFmpeg核心文件（约10MB），这会导致：
- 启动时间较长
- 网络流量消耗
- 在网络不稳定时可能失败

## 解决方案

### 方法1：下载本地文件（推荐）

运行以下命令将FFmpeg文件下载到本地：

```bash
npm run download-ffmpeg
```

或者：

```bash
npm run setup
```

这将下载以下文件到 `public/ffmpeg/` 目录：
- `ffmpeg-core.js`
- `ffmpeg-core.wasm` 
- `ffmpeg-core.worker.js`

### 方法2：手动下载

如果自动下载失败，可以手动下载文件：

1. 创建目录：`public/ffmpeg/`
2. 下载以下文件到该目录：
   - https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js
   - https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm
   - https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.worker.js

## 工作原理

应用会按以下顺序尝试加载FFmpeg：

1. **本地文件** (`/ffmpeg/`) - 最快，无网络请求
2. **jsDelivr CDN** - 备选方案1
3. **unpkg CDN** - 备选方案2

## 优势

✅ **快速启动** - 本地文件加载速度更快  
✅ **离线支持** - 无需网络连接即可使用  
✅ **稳定性** - 避免CDN不可用的问题  
✅ **节省流量** - 减少重复下载  

## 注意事项

- 本地文件总大小约10MB
- 文件会被浏览器缓存，进一步提升性能
- 如果本地文件损坏，应用会自动回退到CDN
- 升级FFmpeg版本时需要重新下载文件

## 故障排除

如果遇到问题：

1. 删除 `public/ffmpeg/` 目录
2. 重新运行 `npm run download-ffmpeg`
3. 检查网络连接
4. 尝试手动下载文件