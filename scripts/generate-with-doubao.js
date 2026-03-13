#!/usr/bin/env node
/**
 * 使用豆包 API 生成形象库
 * - SeeDream 5.0: 生成 30 张三国主题图片（9:16）
 * - SeeDance 1.5 Pro: 将图片转换为视频（9:16）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { DoubaoSeeDreamAdapter, DoubaoSeeDanceAdapter } = require('./doubao-adapter');

// ==================== 配置 ====================

const CONFIG = {
  seedream: {
    apiKey: process.env.DOUBAO_SEEDREAM_KEY || 'a25c18a5-9ea0-4532-9a97-fe088e786115',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
  },
  seedance: {
    apiKey: process.env.DOUBAO_SEEDANCE_KEY || '365ec8a4-7095-40b2-be19-53244b2d442d',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks'
  },
  delay: {
    image: parseInt(process.env.IMAGE_DELAY_MS || '5000'),  // 图片生成间隔
    video: parseInt(process.env.VIDEO_DELAY_MS || '10000')  // 视频生成间隔
  }
};

// 输出目录
const OUTPUT_DIR = {
  images: path.join(__dirname, '../public/portraits/3kingdoms'),
  videos: path.join(__dirname, '../public/portraits/scifi'),
  temp: path.join(__dirname, '../public/portraits/temp')  // 临时目录存放科幻角色图片
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

// ==================== 工具函数 ====================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
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

// ==================== 主流程 ====================

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║      豆包 SeeDream 5.0 + SeeDance 1.5 生成器        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const stats = {
    images: { success: 0, failed: 0, skipped: 0 },
    videos: { success: 0, failed: 0, skipped: 0 }
  };

  const seedreamAdapter = new DoubaoSeeDreamAdapter(CONFIG.seedream.apiKey, CONFIG.seedream.endpoint);
  const seedanceAdapter = new DoubaoSeeDanceAdapter(CONFIG.seedance.apiKey, CONFIG.seedance.endpoint);

  // ==================== 第一阶段：生成三国图片 ====================
  console.log('📜 第一阶段：生成三国主题图片（30张）\n');
  console.log('━'.repeat(60));

  for (let i = 0; i < PROMPTS.threeKingdoms.length; i++) {
    const char = PROMPTS.threeKingdoms[i];
    const filename = char.file.replace('.jpg', '.png');
    const outputPath = path.join(OUTPUT_DIR.images, filename);

    // 跳过已存在的文件
    if (fs.existsSync(outputPath)) {
      console.log(`\n⏭️  [${i + 1}/${PROMPTS.threeKingdoms.length}] 跳过: ${filename} (已存在)`);
      stats.images.skipped++;
      continue;
    }

    console.log(`\n🎨 [${i + 1}/${PROMPTS.threeKingdoms.length}] 生成: ${char.name} (${filename})`);
    console.log(`   Prompt: ${char.prompt.substring(0, 70)}...`);

    try {
      const result = await seedreamAdapter.generateImage(
        char.prompt + ', 9:16 vertical portrait, highly detailed, cinematic lighting',
        { size: '1440x2560' }
      );

      if (result.url) {
        console.log(`   📥 下载图片...`);
        await downloadFile(result.url, outputPath);
        console.log(`   ✅ 已保存: ${filename}`);
        stats.images.success++;
      } else if (result.base64) {
        fs.writeFileSync(outputPath, Buffer.from(result.base64, 'base64'));
        console.log(`   ✅ 已保存: ${filename}`);
        stats.images.success++;
      } else {
        throw new Error('无效的响应格式');
      }

      // 延迟避免限流
      if (i < PROMPTS.threeKingdoms.length - 1) {
        console.log(`   ⏳ 等待 ${CONFIG.delay.image / 1000} 秒...`);
        await delay(CONFIG.delay.image);
      }
    } catch (error) {
      console.error(`   ❌ 失败: ${error.message}`);
      stats.images.failed++;
    }
  }

  // ==================== 第二阶段：生成科幻角色图片 ====================
  console.log('\n\n🤖 第二阶段：生成科幻角色图片（30张，用于转视频）\n');
  console.log('━'.repeat(60));

  for (let i = 0; i < PROMPTS.scifi.length; i++) {
    const char = PROMPTS.scifi[i];
    const filename = char.file.replace('.jpg', '.png');
    const outputPath = path.join(OUTPUT_DIR.temp, filename);

    // 跳过已存在的文件
    if (fs.existsSync(outputPath)) {
      console.log(`\n⏭️  [${i + 1}/${PROMPTS.scifi.length}] 跳过: ${filename} (已存在)`);
      continue;
    }

    console.log(`\n🎨 [${i + 1}/${PROMPTS.scifi.length}] 生成: ${char.name} (${filename})`);
    console.log(`   Prompt: ${char.prompt.substring(0, 70)}...`);

    try {
      const result = await seedreamAdapter.generateImage(
        char.prompt + ', 9:16 vertical portrait, cinematic, high quality',
        { size: '1440x2560' }
      );

      if (result.url) {
        console.log(`   📥 下载图片...`);
        await downloadFile(result.url, outputPath);
        console.log(`   ✅ 已保存: ${filename}`);
      } else if (result.base64) {
        fs.writeFileSync(outputPath, Buffer.from(result.base64, 'base64'));
        console.log(`   ✅ 已保存: ${filename}`);
      } else {
        throw new Error('无效的响应格式');
      }

      // 延迟避免限流
      if (i < PROMPTS.scifi.length - 1) {
        console.log(`   ⏳ 等待 ${CONFIG.delay.image / 1000} 秒...`);
        await delay(CONFIG.delay.image);
      }
    } catch (error) {
      console.error(`   ❌ 失败: ${error.message}`);
    }
  }

  // ==================== 第三阶段：图片转视频 ====================
  console.log('\n\n🎬 第三阶段：将科幻图片转换为视频（30个）\n');
  console.log('━'.repeat(60));

  for (let i = 0; i < PROMPTS.scifi.length; i++) {
    const char = PROMPTS.scifi[i];
    const imagePath = path.join(OUTPUT_DIR.temp, char.file.replace('.jpg', '.png'));
    const videoFilename = char.file.replace('.jpg', '.mp4');
    const thumbFilename = char.file.replace('.jpg', '-thumb.png');
    const videoPath = path.join(OUTPUT_DIR.videos, videoFilename);
    const thumbPath = path.join(OUTPUT_DIR.videos, thumbFilename);

    // 跳过已存在的文件
    if (fs.existsSync(videoPath)) {
      console.log(`\n⏭️  [${i + 1}/${PROMPTS.scifi.length}] 跳过: ${videoFilename} (已存在)`);
      stats.videos.skipped++;
      continue;
    }

    // 检查输入图片是否存在
    if (!fs.existsSync(imagePath)) {
      console.error(`\n❌ [${i + 1}/${PROMPTS.scifi.length}] 输入图片不存在: ${imagePath}`);
      stats.videos.failed++;
      continue;
    }

    console.log(`\n🎬 [${i + 1}/${PROMPTS.scifi.length}] 生成视频: ${char.name} (${videoFilename})`);
    console.log(`   Prompt: ${char.prompt.substring(0, 70)}...`);

    try {
      // 使用本地图片生成视频
      const result = await seedanceAdapter.generateVideo(
        char.prompt + ', cinematic animation, smooth motion, 9:16 vertical format',
        imagePath,  // 直接使用本地文件路径
        { duration: 4, motion: 5, maxWaitTime: 180000 }
      );

      if (result.videoUrl) {
        console.log(`   📥 下载视频...`);
        await downloadFile(result.videoUrl, videoPath);
        console.log(`   ✅ 已保存: ${videoFilename}`);
        stats.videos.success++;

        // 下载缩略图（如果有）
        if (result.thumbnailUrl && !fs.existsSync(thumbPath)) {
          await downloadFile(result.thumbnailUrl, thumbPath);
          console.log(`   ✅ 已保存缩略图: ${thumbFilename}`);
        }
      } else {
        throw new Error('无效的响应格式');
      }

      // 延迟避免限流
      if (i < PROMPTS.scifi.length - 1) {
        console.log(`   ⏳ 等待 ${CONFIG.delay.video / 1000} 秒...`);
        await delay(CONFIG.delay.video);
      }
    } catch (error) {
      console.error(`   ❌ 失败: ${error.message}`);
      stats.videos.failed++;

      // 如果视频生成失败，复制图片作为缩略图
      if (!fs.existsSync(thumbPath) && fs.existsSync(imagePath)) {
        fs.copyFileSync(imagePath, thumbPath);
        console.log(`   ⚠️  使用静态图片作为缩略图`);
      }
    }
  }

  // ==================== 生成报告 ====================
  console.log('\n\n╔══════════════════════════════════════════════════════╗');
  console.log('║                  生成完成统计                        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  console.log(`📜 三国图片:`);
  console.log(`   ✅ 成功: ${stats.images.success} 张`);
  console.log(`   ⏭️  跳过: ${stats.images.skipped} 张`);
  console.log(`   ❌ 失败: ${stats.images.failed} 张`);

  console.log(`\n🤖 科幻视频:`);
  console.log(`   ✅ 成功: ${stats.videos.success} 个`);
  console.log(`   ⏭️  跳过: ${stats.videos.skipped} 个`);
  console.log(`   ❌ 失败: ${stats.videos.failed} 个`);

  console.log(`\n📊 总计:`);
  console.log(`   ✅ 成功: ${stats.images.success + stats.videos.success}`);
  console.log(`   ⏭️  跳过: ${stats.images.skipped + stats.videos.skipped}`);
  console.log(`   ❌ 失败: ${stats.images.failed + stats.videos.failed}`);

  if (stats.images.success > 0) {
    console.log('\n💡 提示: 刷新页面查看新生成的三国形象！');
    console.log('   http://localhost:5174/\n');
  }

  if (stats.videos.skipped > 0) {
    console.log('⚠️  视频生成需要图片URL，请：');
    console.log('   1. 将 temp/ 目录的图片上传到 CDN');
    console.log('   2. 修改脚本使用图片 URL');
    console.log('   3. 重新运行视频生成\n');
  }
}

// 运行主流程
main().catch(error => {
  console.error('\n❌ 发生错误:', error);
  process.exit(1);
});
