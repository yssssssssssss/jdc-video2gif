const fs = require('fs');
const path = require('path');
const https = require('https');

// 确保目录存在
const ffmpegDir = path.join(__dirname, '..', 'public', 'ffmpeg');
if (!fs.existsSync(ffmpegDir)) {
  fs.mkdirSync(ffmpegDir, { recursive: true });
}

// FFmpeg文件列表
const files = [
  {
    name: 'ffmpeg-core.js',
    url: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js'
  },
  {
    name: 'ffmpeg-core.wasm',
    url: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'
  },
  {
    name: 'ffmpeg-core.worker.js',
    url: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.worker.js'
  }
];

// 下载文件函数
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`正在下载: ${path.basename(filePath)}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ 下载完成: ${path.basename(filePath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // 删除不完整的文件
      reject(err);
    });
  });
}

// 主函数
async function downloadFFmpegFiles() {
  console.log('开始下载FFmpeg核心文件...');
  
  try {
    for (const file of files) {
      const filePath = path.join(ffmpegDir, file.name);
      
      // 检查文件是否已存在
      if (fs.existsSync(filePath)) {
        console.log(`⚠ 文件已存在，跳过: ${file.name}`);
        continue;
      }
      
      await downloadFile(file.url, filePath);
    }
    
    console.log('\n🎉 所有FFmpeg文件下载完成！');
    console.log('现在应用将使用本地文件，避免每次启动时下载。');
    
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
    process.exit(1);
  }
}

// 运行下载
downloadFFmpegFiles();