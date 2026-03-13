#!/usr/bin/env node
/**
 * Agent 5秒动态视频生成脚本
 * 使用豆舞 Seedance 1.5 Pro API 将图片转换为动态视频
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// API 配置
const API_CONFIG = {
  endpoint: 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks',
  apiKey: '365ec8a4-7095-40b2-be19-53244b2d442d',
  model: 'doubao-seedance-1-5-pro-251215'
};

// Agent 配置（选择最合适的图片作为视频源）
const AGENT_VIDEOS = {
  ATLAS: {
    sourceImage: 'atlas_male_realistic.png',
    prompt: 'Subtle breathing animation, glowing blue energy particles floating around, professional leader stance, confident gaze with slight head tilt, blue gradient background with pulsing light effects',
    filename: 'atlas.mp4'
  },
  CLIP: {
    sourceImage: 'clip_male_anime.png',
    prompt: 'Gentle breathing animation, green digital particles and code streams flowing, tech glasses with subtle holographic reflections, focused programmer expression, green matrix background with data flow effects',
    filename: 'clip.mp4'
  },
  ORACLE: {
    sourceImage: 'oracle_female_cyberpunk.png',
    prompt: 'Mystical breathing animation, purple magical particles and glowing runes orbiting, wise and serene expression with subtle eye glow, purple nebula background with starlight sparkles',
    filename: 'oracle.mp4'
  },
  SENTINEL: {
    sourceImage: 'sentinel_male_realistic.png',
    prompt: 'Strong breathing animation, red energy shield pulsing with protective aura, vigilant warrior stance, determined gaze with red combat lighting, red alert grid background with firewall effects',
    filename: 'sentinel.mp4'
  }
};

// 目录配置
const IMAGES_DIR = path.join(__dirname, '../public/images/agents/gallery');
const VIDEOS_DIR = path.join(__dirname, '../public/videos/agents');

/**
 * 读取图片并转换为 Base64
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).substring(1);
  return `data:image/${ext};base64,${base64}`;
}

/**
 * 创建视频生成任务
 */
async function createVideoTask(agentName, config) {
  const imagePath = path.join(IMAGES_DIR, config.sourceImage);

  console.log(`\n🎬 开始生成 ${agentName} 的动态视频...`);
  console.log(`📸 源图片: ${config.sourceImage}`);
  console.log(`📝 动画提示: ${config.prompt.substring(0, 80)}...`);

  // 读取图片并转换为 base64
  const imageBase64 = imageToBase64(imagePath);
  console.log(`📦 图片已编码为 base64 (${Math.round(imageBase64.length / 1024)}KB)`);

  const payload = {
    model: API_CONFIG.model,
    image: imageBase64,       // 根级别的 image 字段（用户建议）
    content: [
      {
        type: 'text',
        text: config.prompt
      }
    ],
    duration: 5,              // 5秒视频
    width: 1080,              // 标准分辨率
    height: 1080,             // 正方形
    loop: true                // 循环播放
  };

  return new Promise((resolve, reject) => {
    const url = new URL(API_CONFIG.endpoint);
    const postData = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const result = JSON.parse(data);
            console.log(`✅ 任务创建成功！Task ID: ${result.task_id || result.id}`);
            resolve(result);
          } catch (err) {
            reject(new Error(`解析响应失败: ${err.message}`));
          }
        } else {
          reject(new Error(`API 请求失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * 查询任务状态
 */
async function checkTaskStatus(taskId) {
  return new Promise((resolve, reject) => {
    const url = `${API_CONFIG.endpoint}/${taskId}`;
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`解析响应失败: ${err.message}`));
          }
        } else {
          reject(new Error(`查询失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * 下载视频
 */
async function downloadVideo(videoUrl, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 开始下载视频...`);

    const url = new URL(videoUrl);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`下载失败 (${res.statusCode})`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      let downloadedBytes = 0;
      const totalBytes = parseInt(res.headers['content-length'] || '0', 10);

      res.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (totalBytes > 0) {
          const progress = ((downloadedBytes / totalBytes) * 100).toFixed(1);
          process.stdout.write(`\r⏬ 下载进度: ${progress}%`);
        }
      });

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        process.stdout.write('\n');
        const fileSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
        console.log(`✅ 下载完成！文件大小: ${fileSize} MB`);
        resolve(outputPath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * 等待任务完成
 */
async function waitForCompletion(taskId, maxWaitTime = 600000) {
  const startTime = Date.now();
  const checkInterval = 5000; // 每5秒检查一次

  console.log(`⏳ 等待视频生成完成...`);

  while (Date.now() - startTime < maxWaitTime) {
    const status = await checkTaskStatus(taskId);
    const currentStatus = status.status || status.state;

    console.log(`📊 当前状态: ${currentStatus}`);

    if (currentStatus === 'completed' || currentStatus === 'success' || currentStatus === 'succeeded') {
      return status;
    } else if (currentStatus === 'failed' || currentStatus === 'error') {
      throw new Error(`视频生成失败: ${status.error_message || '未知错误'}`);
    }

    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }

  throw new Error('视频生成超时');
}

/**
 * 生成单个 Agent 的视频
 */
async function generateAgentVideo(agentName, config) {
  try {
    const outputPath = path.join(VIDEOS_DIR, config.filename);

    // 检查是否已存在
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  视频已存在，跳过`);
      return {
        agent: agentName,
        status: 'skipped',
        path: outputPath
      };
    }

    // 1. 创建任务
    const taskResult = await createVideoTask(agentName, config);
    const taskId = taskResult.task_id || taskResult.id;

    // 2. 等待完成
    const completedTask = await waitForCompletion(taskId);

    // 3. 下载视频
    const videoUrl = completedTask.content?.video_url || completedTask.video_url || completedTask.data?.video_url;
    if (!videoUrl) {
      console.error('完整响应:', JSON.stringify(completedTask, null, 2));
      throw new Error('响应中没有视频 URL');
    }

    await downloadVideo(videoUrl, outputPath);

    return {
      agent: agentName,
      status: 'success',
      path: outputPath,
      taskId: taskId
    };

  } catch (err) {
    console.error(`❌ ${agentName} 视频生成失败: ${err.message}`);
    return {
      agent: agentName,
      status: 'failed',
      error: err.message
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🎬 开始生成 Agent 5秒动态视频...\n');
  console.log(`📁 源图片目录: ${IMAGES_DIR}`);
  console.log(`📁 输出视频目录: ${VIDEOS_DIR}\n`);

  // 确保输出目录存在
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
    console.log(`✅ 已创建输出目录\n`);
  }

  const results = [];
  const agents = Object.keys(AGENT_VIDEOS);

  for (const agentName of agents) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎨 ${agentName}`);
    console.log('='.repeat(60));

    const config = AGENT_VIDEOS[agentName];
    const result = await generateAgentVideo(agentName, config);
    results.push(result);

    // 延迟避免频率限制（如果成功的话）
    if (result.status === 'success') {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 生成索引文件
  const indexPath = path.join(VIDEOS_DIR, 'index.json');
  const videoIndex = {};

  results.forEach(result => {
    if (result.status === 'success' || result.status === 'skipped') {
      videoIndex[result.agent] = {
        path: `/videos/agents/${AGENT_VIDEOS[result.agent].filename}`,
        sourceImage: AGENT_VIDEOS[result.agent].sourceImage
      };
    }
  });

  fs.writeFileSync(indexPath, JSON.stringify(videoIndex, null, 2));
  console.log(`\n📋 视频索引已生成: ${indexPath}`);

  // 输出结果汇总
  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 生成结果汇总:');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failedCount} 个`);
  console.log(`⏭️  跳过: ${skippedCount} 个（已存在）`);
  console.log(`📦 总计: ${results.length} 个`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n🎉 完成！视频已保存到 public/videos/agents/');
    console.log('\n💡 提示: 视频索引已保存到 videos/index.json');
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((err) => {
    console.error('\n❌ 程序执行出错:', err.message);
    process.exit(1);
  });
}

module.exports = { createVideoTask, checkTaskStatus, downloadVideo };
