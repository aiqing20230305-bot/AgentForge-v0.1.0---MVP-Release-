/**
 * 生成形象占位图
 * 使用 Canvas 生成简单的占位图片
 */

const fs = require('fs')
const path = require('path')

const OUTPUT_DIR = path.join(__dirname, '../public/images/portraits')

// 确保目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const portraits = [
  // 男性 - 写实风格
  { id: 'male_realistic_1', name: '商务精英', icon: '👔', bg: '#1e3a8a' },
  { id: 'male_realistic_2', name: '科技极客', icon: '💻', bg: '#0891b2' },
  { id: 'male_realistic_3', name: '战术指挥', icon: '⚔️', bg: '#991b1b' },

  // 女性 - 写实风格
  { id: 'female_realistic_1', name: '职场女性', icon: '👩‍💼', bg: '#7c3aed' },
  { id: 'female_realistic_2', name: '科研学者', icon: '👩‍🔬', bg: '#0e7490' },
  { id: 'female_realistic_3', name: '安全专家', icon: '🛡️', bg: '#be123c' },

  // 男性 - 动漫风格
  { id: 'male_anime_1', name: '热血少年', icon: '⚡', bg: '#ea580c' },
  { id: 'male_anime_2', name: '冷静智者', icon: '🧊', bg: '#0284c7' },
  { id: 'male_anime_3', name: '神秘黑客', icon: '🌐', bg: '#4c1d95' },

  // 女性 - 动漫风格
  { id: 'female_anime_1', name: '元气少女', icon: '🌸', bg: '#ec4899' },
  { id: 'female_anime_2', name: '冰山女王', icon: '❄️', bg: '#06b6d4' },
  { id: 'female_anime_3', name: '机械师', icon: '⚙️', bg: '#78716c' },

  // 赛博朋克风格
  { id: 'cyber_male_1', name: '赛博战士', icon: '🤖', bg: '#6366f1' },
  { id: 'cyber_female_1', name: '网络游侠', icon: '🌐', bg: '#8b5cf6' },
  { id: 'cyber_neutral_1', name: 'AI实体', icon: '🔮', bg: '#3b82f6' },

  // 奇幻风格
  { id: 'fantasy_male_1', name: '魔法师', icon: '🧙', bg: '#7c3aed' },
  { id: 'fantasy_female_1', name: '精灵游侠', icon: '🏹', bg: '#10b981' },
  { id: 'fantasy_neutral_1', name: '神秘预言家', icon: '🔮', bg: '#8b5cf6' },
]

// 生成SVG占位图
portraits.forEach(p => {
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${p.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)"/>
  <text x="200" y="200" font-size="120" text-anchor="middle" dy=".3em">${p.icon}</text>
  <text x="200" y="320" font-size="24" fill="white" text-anchor="middle" font-family="Arial, sans-serif">${p.name}</text>
</svg>`

  const outputPath = path.join(OUTPUT_DIR, `${p.id}.svg`)
  fs.writeFileSync(outputPath, svg)
  console.log(`✓ Generated ${p.id}.svg`)
})

console.log(`\n✅ Generated ${portraits.length} portrait placeholders in ${OUTPUT_DIR}`)
console.log('\n💡 提示: 这些是SVG占位图，可以在浏览器中正常显示。')
console.log('   后续可以用 AI 生成的真实图片替换它们。')
