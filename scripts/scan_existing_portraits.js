/**
 * 扫描已有的形象资源并生成配置
 */

const fs = require('fs')
const path = require('path')

const GALLERY_DIR = path.join(__dirname, '../public/images/agents/gallery')
const VIDEO_DIR = path.join(__dirname, '../public/videos/agents')

// 读取所有图片
const images = fs.existsSync(GALLERY_DIR)
  ? fs.readdirSync(GALLERY_DIR).filter(f => f.match(/\.(png|jpg|jpeg)$/i))
  : []

// 读取所有视频
const videos = fs.existsSync(VIDEO_DIR)
  ? fs.readdirSync(VIDEO_DIR).filter(f => f.match(/\.(mp4|webm)$/i))
  : []

console.log(`Found ${images.length} images and ${videos.length} videos\n`)

// 生成图片配置
const imagePortraits = images.map((filename, idx) => {
  const name = filename.replace(/\.(png|jpg|jpeg)$/i, '')
  const parts = name.split('_')

  // 尝试解析文件名格式: agent_gender_style 或 agent
  const agentName = parts[0] || 'unknown'
  const gender = parts[1] || 'neutral'
  const style = parts[2] || 'realistic'

  return {
    id: `gallery_${name}`,
    name: `${agentName} - ${gender} ${style}`,
    type: 'preset',
    mediaType: 'image',
    path: `/images/agents/gallery/${filename}`,
    tags: [agentName, gender, style, 'gallery']
  }
})

// 生成视频配置
const videoPortraits = videos.map((filename, idx) => {
  const name = filename.replace(/\.(mp4|webm)$/i, '')

  return {
    id: `video_${name}`,
    name: `${name} 视频`,
    type: 'preset',
    mediaType: 'video',
    path: `/videos/agents/${filename}`,
    tags: [name, 'video', 'animated']
  }
})

// 输出TypeScript代码
console.log('=== 将以下代码添加到 usePortraitStore.ts ===\n')
console.log('// 已有的Gallery图片')
imagePortraits.slice(0, 10).forEach(p => {
  console.log(`  ${JSON.stringify(p)},`)
})
console.log(`  // ... 共 ${imagePortraits.length} 张图片\n`)

console.log('// 已有的视频')
videoPortraits.forEach(p => {
  console.log(`  ${JSON.stringify(p)},`)
})

// 保存为JSON文件供参考
const outputPath = path.join(__dirname, 'existing_portraits.json')
fs.writeFileSync(outputPath, JSON.stringify({
  images: imagePortraits,
  videos: videoPortraits
}, null, 2))

console.log(`\n✅ Configuration saved to ${outputPath}`)
