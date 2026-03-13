#!/usr/bin/env node
/**
 * 使用 SeeDream 5.0 和 SeeDance 1.5 生成形象库
 * - SeeDream 5.0: 生成 30 张三国主题图片（9:16）
 * - SeeDance 1.5: 生成 30 个科幻主题视频（9:16）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ==================== 配置区域 ====================

// 🔑 API 配置（需要填入你的密钥）
const CONFIG = {
  seedream: {
    apiKey: process.env.SEEDREAM_API_KEY || 'YOUR_SEEDREAM_API_KEY',
    baseUrl: 'https://api.seedream.ai/v1',  // 替换为实际API地址
    model: 'seedream-5.0'
  },
  seedance: {
    apiKey: process.env.SEEDANCE_API_KEY || 'YOUR_SEEDANCE_API_KEY',
    baseUrl: 'https://api.seedance.ai/v1',  // 替换为实际API地址
    model: 'seedance-1.5'
  }
};

// 输出目录
const OUTPUT_DIR = {
  images: path.join(__dirname, '../public/portraits/3kingdoms'),
  videos: path.join(__dirname, '../public/portraits/scifi')
};

// 确保目录存在
Object.values(OUTPUT_DIR).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ==================== 加载 Prompt 配置 ====================

const promptsFile = path.join(__dirname, '../public/portraits/generation-prompts.json');
let PROMPTS;

try {
  PROMPTS = JSON.parse(fs.readFileSync(promptsFile, 'utf-8'));
  console.log('✅ 已加载 Prompt 配置');
} catch (error) {
  console.error('❌ 无法加载 Prompt 配置:', error.message);
  process.exit(1);
}

// ==================== SeeDream API 调用 ====================

/**
 * 调用 SeeDream 5.0 生成图片
 */
async function generateImageWithSeeDream(prompt, filename) {
  console.log(`\n🎨 [SeeDream] 生成图片: ${filename}`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

  const requestData = {
    model: CONFIG.seedream.model,
    prompt: prompt,
    width: 768,   // 9:16 比例
    height: 1344,
    num_inference_steps: 50,
    guidance_scale: 7.5,
    negative_prompt: 'blurry, low quality, distorted, ugly, watermark'
  };

  try {
    // 这里需要根据 SeeDream 的实际 API 文档调整
    const result = await callAPI(CONFIG.seedream.baseUrl + '/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.seedream.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    // 保存图片
    const outputPath = path.join(OUTPUT_DIR.images, filename);

    if (result.image_url) {
      await downloadFile(result.image_url, outputPath);
      console.log(`   ✅ 已保存: ${filename}`);
      return true;
    } else if (result.image_base64) {
      fs.writeFileSync(outputPath, Buffer.from(result.image_base64, 'base64'));
      console.log(`   ✅ 已保存: ${filename}`);
      return true;
    } else {
      console.error(`   ❌ 生成失败: 无效的响应格式`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ 生成失败: ${error.message}`);
    return false;
  }
}

/**
 * 调用 SeeDance 1.5 生成视频
 */
async function generateVideoWithSeeDance(prompt, filename, thumbnail) {
  console.log(`\n🎬 [SeeDance] 生成视频: ${filename}`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

  const requestData = {
    model: CONFIG.seedance.model,
    prompt: prompt,
    width: 576,   // 9:16 比例
    height: 1024,
    num_frames: 120, // 约4秒
    fps: 30,
    guidance_scale: 7.5,
    negative_prompt: 'blurry, low quality, static, watermark'
  };

  try {
    const result = await callAPI(CONFIG.seedance.baseUrl + '/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.seedance.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    // 保存视频
    const videoPath = path.join(OUTPUT_DIR.videos, filename);
    const thumbPath = path.join(OUTPUT_DIR.videos, thumbnail);

    if (result.video_url) {
      await downloadFile(result.video_url, videoPath);
      console.log(`   ✅ 已保存视频: ${filename}`);

      // 如果有缩略图
      if (result.thumbnail_url) {
        await downloadFile(result.thumbnail_url, thumbPath);
        console.log(`   ✅ 已保存缩略图: ${thumbnail}`);
      }
      return true;
    } else {
      console.error(`   ❌ 生成失败: 无效的响应格式`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ 生成失败: ${error.message}`);
    return false;
  }
}

// ==================== 工具函数 ====================

/**
 * 通用 API 调用
 */
function callAPI(url, options) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * 下载文件
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * 延迟函数（避免API限流）
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 主流程 ====================

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   SeeDream 5.0 + SeeDance 1.5 形象生成器            ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // 检查 API 密钥
  if (CONFIG.seedream.apiKey === 'YOUR_SEEDREAM_API_KEY') {
    console.error('❌ 请先配置 SEEDREAM_API_KEY 环境变量');
    console.log('\n使用方法:');
    console.log('  export SEEDREAM_API_KEY=your_key_here');
    console.log('  export SEEDANCE_API_KEY=your_key_here');
    console.log('  node scripts/generate-with-seedream.js\n');
    process.exit(1);
  }

  const stats = {
    images: { success: 0, failed: 0 },
    videos: { success: 0, failed: 0 }
  };

  // ==================== 生成三国图片 ====================
  console.log('\n📜 开始生成三国主题图片...\n');
  console.log('━'.repeat(60));

  for (let i = 0; i < PROMPTS.threeKingdoms.length; i++) {
    const char = PROMPTS.threeKingdoms[i];
    const success = await generateImageWithSeeDream(
      char.prompt + ', 9:16 vertical portrait, high quality',
      char.file.replace('.jpg', '.png')
    );

    if (success) {
      stats.images.success++;
    } else {
      stats.images.failed++;
    }

    // 延迟避免限流
    if (i < PROMPTS.threeKingdoms.length - 1) {
      console.log('   ⏳ 等待 3 秒...');
      await delay(3000);
    }
  }

  // ==================== 生成科幻视频 ====================
  console.log('\n\n🤖 开始生成科幻主题视频...\n');
  console.log('━'.repeat(60));

  for (let i = 0; i < PROMPTS.scifi.length; i++) {
    const char = PROMPTS.scifi[i];
    const filename = char.file.replace('.jpg', '.mp4');
    const thumbnail = char.file.replace('.jpg', '-thumb.png');

    const success = await generateVideoWithSeeDance(
      char.prompt + ', 9:16 vertical video, smooth motion, cinematic',
      filename,
      thumbnail
    );

    if (success) {
      stats.videos.success++;
    } else {
      stats.videos.failed++;
    }

    // 延迟避免限流
    if (i < PROMPTS.scifi.length - 1) {
      console.log('   ⏳ 等待 5 秒...');
      await delay(5000);
    }
  }

  // ==================== 生成报告 ====================
  console.log('\n\n╔══════════════════════════════════════════════════════╗');
  console.log('║                  生成完成统计                        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  console.log(`📜 三国图片:`);
  console.log(`   ✅ 成功: ${stats.images.success} 张`);
  console.log(`   ❌ 失败: ${stats.images.failed} 张`);
  console.log(`\n🤖 科幻视频:`);
  console.log(`   ✅ 成功: ${stats.videos.success} 个`);
  console.log(`   ❌ 失败: ${stats.videos.failed} 个`);
  console.log(`\n📊 总计:`);
  console.log(`   ✅ 成功: ${stats.images.success + stats.videos.success}`);
  console.log(`   ❌ 失败: ${stats.images.failed + stats.videos.failed}`);
  console.log('');

  // 更新数据文件以使用新生成的文件
  if (stats.images.success > 0 || stats.videos.success > 0) {
    console.log('💡 提示: 重新加载页面以查看新生成的形象！\n');
  }
}

// 运行主流程
main().catch(error => {
  console.error('\n❌ 发生错误:', error);
  process.exit(1);
});
