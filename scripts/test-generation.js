#!/usr/bin/env node
/**
 * API 生成测试脚本
 * 用于测试 SeeDream 和 SeeDance API 是否正常工作
 */

const { AdapterFactory } = require('./api-adapters');
const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================

const CONFIG = {
  seedream: {
    apiKey: process.env.SEEDREAM_API_KEY || 'YOUR_API_KEY',
    baseUrl: process.env.SEEDREAM_BASE_URL || 'https://api.seedream.ai/v1'
  },
  seedance: {
    apiKey: process.env.SEEDANCE_API_KEY || 'YOUR_API_KEY',
    baseUrl: process.env.SEEDANCE_BASE_URL || 'https://api.seedance.ai/v1'
  }
};

// ==================== 测试图片生成 ====================

async function testImageGeneration() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   测试 SeeDream 5.0 图片生成             ║');
  console.log('╚══════════════════════════════════════════╝\n');

  if (CONFIG.seedream.apiKey === 'YOUR_API_KEY') {
    console.error('❌ 请先设置 SEEDREAM_API_KEY 环境变量\n');
    console.log('使用方法:');
    console.log('  export SEEDREAM_API_KEY=your_key_here');
    console.log('  node scripts/test-generation.js\n');
    return false;
  }

  try {
    const adapter = AdapterFactory.create('seedream', CONFIG.seedream);

    const testPrompt = 'Guan Yu, legendary Chinese warrior from Three Kingdoms era, ' +
                      'red face, long black beard, green robe armor, majestic presence, ' +
                      'portrait, 9:16 vertical format, cinematic lighting, highly detailed';

    console.log('📝 测试 Prompt:', testPrompt.substring(0, 80) + '...');
    console.log('⏳ 生成中...\n');

    const result = await adapter.generateImage(testPrompt, {
      width: 768,
      height: 1344
    });

    if (result.url) {
      console.log('✅ 生成成功！');
      console.log('🔗 图片URL:', result.url);
      console.log('🌱 Seed:', result.seed || 'N/A');

      // 尝试下载测试图片
      const testFile = path.join(__dirname, '../public/portraits/test-image.png');
      console.log('\n⏳ 下载测试图片...');
      await downloadFile(result.url, testFile);
      console.log('✅ 已保存:', testFile);

      return true;
    } else if (result.base64) {
      console.log('✅ 生成成功（Base64格式）！');
      const testFile = path.join(__dirname, '../public/portraits/test-image.png');
      fs.writeFileSync(testFile, Buffer.from(result.base64, 'base64'));
      console.log('✅ 已保存:', testFile);
      return true;
    } else {
      console.error('❌ 生成失败：无效的响应格式');
      console.log('响应内容:', JSON.stringify(result.raw, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('API 响应:', error.response);
    }
    return false;
  }
}

// ==================== 测试视频生成 ====================

async function testVideoGeneration() {
  console.log('\n\n╔══════════════════════════════════════════╗');
  console.log('║   测试 SeeDance 1.5 视频生成             ║');
  console.log('╚══════════════════════════════════════════╝\n');

  if (CONFIG.seedance.apiKey === 'YOUR_API_KEY') {
    console.error('❌ 请先设置 SEEDANCE_API_KEY 环境变量\n');
    return false;
  }

  try {
    const adapter = AdapterFactory.create('seedance', CONFIG.seedance);

    const testPrompt = 'Futuristic warrior robot Atlas, massive build, battle armor, ' +
                      'glowing blue eyes, sci-fi, 9:16 vertical format, cinematic, ' +
                      'smooth motion, high quality animation';

    console.log('📝 测试 Prompt:', testPrompt.substring(0, 80) + '...');
    console.log('⏳ 生成中（预计1-2分钟）...\n');

    const result = await adapter.generateVideo(testPrompt, {
      width: 576,
      height: 1024,
      frames: 120,
      fps: 30
    });

    if (result.videoUrl) {
      console.log('✅ 生成成功！');
      console.log('🎬 视频URL:', result.videoUrl);
      if (result.thumbnailUrl) {
        console.log('🖼️  缩略图URL:', result.thumbnailUrl);
      }
      console.log('⏱️  时长:', result.duration || 'N/A', '秒');

      // 下载测试视频
      const testFile = path.join(__dirname, '../public/portraits/test-video.mp4');
      console.log('\n⏳ 下载测试视频...');
      await downloadFile(result.videoUrl, testFile);
      console.log('✅ 已保存:', testFile);

      if (result.thumbnailUrl) {
        const thumbFile = path.join(__dirname, '../public/portraits/test-video-thumb.jpg');
        await downloadFile(result.thumbnailUrl, thumbFile);
        console.log('✅ 已保存缩略图:', thumbFile);
      }

      return true;
    } else {
      console.error('❌ 生成失败：无效的响应格式');
      console.log('响应内容:', JSON.stringify(result.raw, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
}

// ==================== 下载文件工具 ====================

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const fs = require('fs');
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
  console.log('\n🧪 SeeDream + SeeDance API 测试工具\n');

  const imageSuccess = await testImageGeneration();
  const videoSuccess = await testVideoGeneration();

  console.log('\n\n╔══════════════════════════════════════════╗');
  console.log('║            测试结果汇总                  ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log(`图片生成: ${imageSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`视频生成: ${videoSuccess ? '✅ 通过' : '❌ 失败'}`);

  if (imageSuccess && videoSuccess) {
    console.log('\n🎉 所有测试通过！可以运行完整生成脚本了：');
    console.log('   node scripts/generate-with-seedream.js\n');
  } else {
    console.log('\n💡 请检查：');
    console.log('   1. API 密钥是否正确');
    console.log('   2. API 地址是否正确');
    console.log('   3. 账户余额是否充足');
    console.log('   4. 查看详细错误信息调整代码\n');
  }
}

main().catch(error => {
  console.error('\n❌ 程序异常:', error);
  process.exit(1);
});
