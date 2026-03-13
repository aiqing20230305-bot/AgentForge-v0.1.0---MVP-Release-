#!/usr/bin/env node
/**
 * 豆包 API 测试脚本
 * 测试 SeeDream 5.0 和 SeeDance 1.5 Pro 是否正常工作
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { DoubaoSeeDreamAdapter, DoubaoSeeDanceAdapter } = require('./doubao-adapter');

// ==================== 配置 ====================

const CONFIG = {
  seedream: {
    apiKey: 'a25c18a5-9ea0-4532-9a97-fe088e786115',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
  },
  seedance: {
    apiKey: '365ec8a4-7095-40b2-be19-53244b2d442d',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks'
  }
};

// ==================== 工具函数 ====================

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

// ==================== 测试图片生成 ====================

async function testImageGeneration() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   测试豆包 SeeDream 5.0 图片生成         ║');
  console.log('╚══════════════════════════════════════════╝\n');

  try {
    const adapter = new DoubaoSeeDreamAdapter(CONFIG.seedream.apiKey, CONFIG.seedream.endpoint);

    const testPrompt = 'Guan Yu, legendary Chinese warrior from Three Kingdoms era, ' +
                      'red face, long black beard, green robe armor, majestic presence, ' +
                      'portrait, 9:16 vertical format, cinematic lighting, highly detailed';

    console.log('📝 测试 Prompt:', testPrompt.substring(0, 80) + '...');
    console.log('⏳ 生成中...\n');

    const result = await adapter.generateImage(testPrompt, {
      size: '1440x2560'
    });

    if (result.url) {
      console.log('\n✅ 生成成功！');
      console.log('🔗 图片URL:', result.url);

      // 下载测试图片
      const testFile = path.join(__dirname, '../public/portraits/test-doubao-image.png');
      console.log('\n⏳ 下载测试图片...');
      await downloadFile(result.url, testFile);
      console.log('✅ 已保存:', testFile);

      return { success: true, imageUrl: result.url, imagePath: testFile };
    } else if (result.base64) {
      console.log('\n✅ 生成成功（Base64格式）！');
      const testFile = path.join(__dirname, '../public/portraits/test-doubao-image.png');
      fs.writeFileSync(testFile, Buffer.from(result.base64, 'base64'));
      console.log('✅ 已保存:', testFile);
      return { success: true, imagePath: testFile };
    } else {
      console.error('\n❌ 生成失败：无效的响应格式');
      console.log('响应内容:', JSON.stringify(result.raw, null, 2));
      return { success: false };
    }
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.stack) {
      console.error('堆栈:', error.stack);
    }
    return { success: false };
  }
}

// ==================== 测试视频生成 ====================

async function testVideoGeneration(imageUrl) {
  console.log('\n\n╔══════════════════════════════════════════╗');
  console.log('║   测试豆包 SeeDance 1.5 Pro 视频生成     ║');
  console.log('╚══════════════════════════════════════════╝\n');

  if (!imageUrl) {
    console.log('⚠️  跳过视频测试：需要输入图片URL');
    console.log('💡 提示: 将图片上传到可访问的URL后再测试视频生成\n');
    return { success: false, skipped: true };
  }

  try {
    const adapter = new DoubaoSeeDanceAdapter(CONFIG.seedance.apiKey, CONFIG.seedance.endpoint);

    const testPrompt = 'A majestic Chinese warrior in flowing robes, ' +
                      'gentle wind movement, cinematic animation, smooth motion';

    console.log('📝 测试 Prompt:', testPrompt.substring(0, 80) + '...');
    console.log('🖼️  输入图片:', imageUrl.substring(0, 60) + '...');
    console.log('⏳ 生成中（预计1-2分钟）...\n');

    const result = await adapter.generateVideo(testPrompt, imageUrl, {
      duration: 4,
      motion: 5
    });

    if (result.videoUrl) {
      console.log('\n✅ 生成成功！');
      console.log('🎬 视频URL:', result.videoUrl);
      if (result.thumbnailUrl) {
        console.log('🖼️  缩略图URL:', result.thumbnailUrl);
      }

      // 下载测试视频
      const testFile = path.join(__dirname, '../public/portraits/test-doubao-video.mp4');
      console.log('\n⏳ 下载测试视频...');
      await downloadFile(result.videoUrl, testFile);
      console.log('✅ 已保存:', testFile);

      return { success: true };
    } else {
      console.error('\n❌ 生成失败：无效的响应格式');
      console.log('响应内容:', JSON.stringify(result.raw, null, 2));
      return { success: false };
    }
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    return { success: false };
  }
}

// ==================== 主流程 ====================

async function main() {
  console.log('\n🧪 豆包 API 测试工具\n');

  // 测试图片生成
  const imageResult = await testImageGeneration();

  // 测试视频生成（如果图片生成成功）
  let videoResult = { success: false, skipped: true };
  if (imageResult.success && imageResult.imageUrl) {
    videoResult = await testVideoGeneration(imageResult.imageUrl);
  }

  // 输出测试结果
  console.log('\n\n╔══════════════════════════════════════════╗');
  console.log('║            测试结果汇总                  ║');
  console.log('╚══════════════════════════════════════════╝\n');

  console.log(`图片生成: ${imageResult.success ? '✅ 通过' : '❌ 失败'}`);
  console.log(`视频生成: ${videoResult.skipped ? '⏭️  跳过' : videoResult.success ? '✅ 通过' : '❌ 失败'}`);

  if (imageResult.success) {
    console.log('\n🎉 图片生成测试通过！可以运行完整生成脚本：');
    console.log('   node scripts/generate-with-doubao.js\n');

    if (videoResult.skipped) {
      console.log('💡 视频生成说明：');
      console.log('   SeeDance 需要输入图片的URL');
      console.log('   可以将生成的图片上传到CDN后测试视频生成\n');
    }
  } else {
    console.log('\n💡 请检查：');
    console.log('   1. API Key 是否正确');
    console.log('   2. 网络连接是否正常');
    console.log('   3. 账户余额是否充足');
    console.log('   4. API 端点地址是否正确\n');
    console.log('🔗 豆包火山引擎控制台: https://console.volcengine.com/\n');
  }
}

main().catch(error => {
  console.error('\n❌ 程序异常:', error);
  process.exit(1);
});
