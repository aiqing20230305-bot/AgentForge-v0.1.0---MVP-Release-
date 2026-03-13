#!/usr/bin/env node
/**
 * 创建占位图片（SVG格式）
 * 用于开发测试，后续可替换为真实AI生成的图片
 */

const fs = require('fs');
const path = require('path');

// 生成SVG占位图
function generatePlaceholderSVG(name, theme, index) {
  const colors = theme === '三国'
    ? ['#8B4513', '#CD853F', '#DEB887', '#D2691E', '#A0522D']
    : ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

  const bgColor = colors[index % colors.length];
  const emoji = theme === '三国' ? '⚔️' : '🤖';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1600">
  <defs>
    <linearGradient id="grad${index}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <rect width="900" height="1600" fill="url(#grad${index})"/>
  <text x="450" y="700" font-size="200" text-anchor="middle" fill="white" opacity="0.9">${emoji}</text>
  <text x="450" y="900" font-size="48" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">${name}</text>
  <text x="450" y="950" font-size="32" text-anchor="middle" fill="white" opacity="0.7" font-family="Arial">${theme}主题</text>
  <text x="450" y="1500" font-size="24" text-anchor="middle" fill="white" opacity="0.5" font-family="monospace">9:16 占位图</text>
</svg>`;
}

// 三国人物
const threeKingdomsChars = [
  '关羽', '张飞', '赵云', '马超', '黄忠',
  '诸葛亮', '庞统', '法正', '曹操', '司马懿',
  '郭嘉', '典韦', '许褚', '张辽', '夏侯惇',
  '孙权', '周瑜', '陆逊', '甘宁', '太史慈',
  '貂蝉', '大乔', '小乔', '孙尚香', '吕布',
  '董卓', '袁绍', '刘备', '姜维', '魏延'
];

// 科幻角色
const scifiChars = [
  'Atlas', 'Titan', 'Sentinel', 'Striker', 'Phantom',
  'Oracle', 'Nexus', 'Cortex', 'Cipher', 'Matrix',
  'Medic', 'Engineer', 'Scout', 'Carrier', 'Reaper',
  'Neon', 'Chrome', 'Ghost', 'Blade', 'Pulse',
  'Nova', 'Vanguard', 'Spectre', 'Aurora', 'Apex',
  'Zephyr', 'Xenon', 'Void', 'Aether', 'Quantum'
];

const threeKingdomsFiles = [
  'guanyu', 'zhangfei', 'zhaoyun', 'machao', 'huangzhong',
  'zhugeliang', 'pangtong', 'fazheng', 'caocao', 'simayi',
  'guojia', 'dianwei', 'xuchu', 'zhangliao', 'xiahoudun',
  'sunquan', 'zhouyu', 'luxun', 'ganning', 'taishici',
  'diaochan', 'daqiao', 'xiaoqiao', 'sunshangxiang', 'lvbu',
  'dongzhuo', 'yuanshao', 'liubei', 'jiangwei', 'weiyan'
];

const scifiFiles = [
  'atlas-warrior', 'titan-giant', 'sentinel-guard', 'striker-assault', 'phantom-stealth',
  'oracle-ai', 'nexus-network', 'cortex-brain', 'cipher-code', 'matrix-core',
  'medic-robot', 'engineer-bot', 'scout-drone', 'carrier-transport', 'reaper-destroyer',
  'neon-hacker', 'chrome-cyborg', 'ghost-shell', 'blade-runner', 'pulse-tech',
  'nova-soldier', 'vanguard-elite', 'spectre-ops', 'aurora-pilot', 'apex-hunter',
  'zephyr-alien', 'xenon-being', 'void-entity', 'aether-spirit', 'quantum-being'
];

const outputDir3k = path.join(__dirname, '../public/portraits/3kingdoms');
const outputDirSF = path.join(__dirname, '../public/portraits/scifi');

// 确保目录存在
if (!fs.existsSync(outputDir3k)) fs.mkdirSync(outputDir3k, { recursive: true });
if (!fs.existsSync(outputDirSF)) fs.mkdirSync(outputDirSF, { recursive: true });

console.log('🎨 生成占位图片...\n');

// 生成三国图片
console.log('📜 生成三国主题图片...');
threeKingdomsChars.forEach((name, index) => {
  const svg = generatePlaceholderSVG(name, '三国', index);
  const filename = `${threeKingdomsFiles[index]}.svg`;
  fs.writeFileSync(path.join(outputDir3k, filename), svg);
  console.log(`   ✅ ${filename}`);
});

// 生成科幻图片（作为视频缩略图）
console.log('\n🤖 生成科幻主题图片...');
scifiChars.forEach((name, index) => {
  const svg = generatePlaceholderSVG(name, '科幻', index);
  const filename = `${scifiFiles[index]}-thumb.svg`;
  fs.writeFileSync(path.join(outputDirSF, filename), svg);
  console.log(`   ✅ ${filename}`);
});

console.log('\n✅ 完成！生成了 60 个占位图片');
console.log('📁 位置: public/portraits/');
console.log('\n💡 这些是SVG占位图，可以：');
console.log('   1. 直接使用（轻量级，无需加载）');
console.log('   2. 或替换为AI生成的真实图片');
