#!/usr/bin/env node
/**
 * Agent 角色立绘生成脚本
 * 使用豆包 Seedream 5.0 API 批量生成 4 个 Agent 的角色立绘
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// API 配置（从 API_DOCUMENTATION.md 获取）
const API_CONFIG = {
  endpoint: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  apiKey: 'a25c18a5-9ea0-4532-9a97-fe088e786115',
  model: 'doubao-seedream-5-0-260128'
};

// Agent 提示词配置
const AGENT_PROMPTS = {
  ATLAS: {
    filename: 'atlas.png',
    prompt: `A mature male team leader character, wearing a dark blue modern business suit,
with a golden badge on the chest, blue tech-gradient background,
exuding a strong leadership aura, determined and confident gaze,
golden crown light effect above the head, surrounded by blue energy particles,
half-body portrait, front view,
game character illustration style, high quality 4K, rich details, professional lighting,
similar to Romance of the Three Kingdoms Strategy Edition general portrait style,
masterpiece, best quality, ultra detailed`
  },
  CLIP: {
    filename: 'clip.png',
    prompt: `A young programmer character, wearing tech-style glasses,
in a green hoodie with code symbol patterns on the chest,
holding a glowing holographic screen displaying code streams,
green matrix digital rain background, cyberpunk style,
focused and intelligent gaze, surrounded by green data flow particles,
half-body portrait, 3/4 side view,
game character illustration style, high quality 4K, rich details, neon lighting effects,
with Matrix-like tech atmosphere,
masterpiece, best quality, ultra detailed`
  },
  ORACLE: {
    filename: 'oracle.png',
    prompt: `A mysterious sage character, wearing a deep purple robe,
with a glowing crystal pendant on the chest, holding floating ancient scrolls,
surrounded by purple magic halos and knowledge runes,
starry sky and purple nebula gradient background, fantasy style,
profound and wise gaze, mystical purple third-eye mark on forehead,
half-body portrait, front view,
game character illustration style, high quality 4K, rich details, magical lighting effects,
similar to fantasy card game mage imagery,
masterpiece, best quality, ultra detailed`
  },
  SENTINEL: {
    filename: 'sentinel.png',
    prompt: `A strong guardian character, wearing red and black tactical armor,
left arm equipped with energy shield, shield with red halo protection,
right hand holding an energy sword emitting red glow,
red alert grid and digital firewall background,
determined and vigilant gaze, body radiating red protective energy field,
half-body portrait, side view, combat stance,
game character illustration style, high quality 4K, rich details, red combat lighting effects,
similar to Overwatch hero imagery,
masterpiece, best quality, ultra detailed`
  }
};

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../public/images/agents');

/**
 * 调用 Seedream 5.0 API 生成图片
 */
async function generateImage(agentName, config) {
  console.log(`\n🎨 正在生成 ${agentName} 的角色立绘...`);
  console.log(`📝 提示词: ${config.prompt.substring(0, 100)}...`);

  const payload = {
    model: API_CONFIG.model,
    prompt: config.prompt,
    size: '1920x1920', // 正方形，满足最小像素要求 (3,686,400)
    quality: 'hd',
    n: 1,
    style: 'illustration'
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

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            console.log(`✅ ${agentName} 图片生成成功！`);
            resolve(result);
          } catch (err) {
            reject(new Error(`解析响应失败: ${err.message}`));
          }
        } else {
          reject(new Error(`API 请求失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`网络请求失败: ${err.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * 下载图片并保存到本地
 */
async function downloadImage(imageUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(imageUrl);

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`下载失败 (${res.statusCode})`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`💾 已保存到: ${outputPath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * 将 Base64 图片保存到本地
 */
function saveBase64Image(base64Data, outputPath) {
  // 移除 data:image/png;base64, 前缀
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Image, 'base64');

  fs.writeFileSync(outputPath, buffer);
  console.log(`💾 已保存到: ${outputPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生成 OpenClaw Agent 角色立绘...\n');
  console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ 已创建输出目录\n`);
  }

  // 批量生成
  const agents = Object.keys(AGENT_PROMPTS);
  const results = [];

  for (const agentName of agents) {
    try {
      const config = AGENT_PROMPTS[agentName];
      const result = await generateImage(agentName, config);

      // 获取图片 URL 或 Base64
      const imageData = result.data[0];
      const outputPath = path.join(OUTPUT_DIR, config.filename);

      if (imageData.url) {
        // 从 URL 下载
        await downloadImage(imageData.url, outputPath);
      } else if (imageData.b64_json) {
        // 保存 Base64
        saveBase64Image(imageData.b64_json, outputPath);
      } else {
        throw new Error('响应中没有图片数据');
      }

      results.push({
        agent: agentName,
        status: 'success',
        path: outputPath
      });

      // 延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err) {
      console.error(`❌ ${agentName} 生成失败: ${err.message}`);
      results.push({
        agent: agentName,
        status: 'failed',
        error: err.message
      });
    }
  }

  // 输出结果汇总
  console.log('\n' + '='.repeat(60));
  console.log('📊 生成结果汇总:');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  results.forEach((result) => {
    const icon = result.status === 'success' ? '✅' : '❌';
    const info = result.status === 'success'
      ? `保存至 ${result.path}`
      : `失败: ${result.error}`;
    console.log(`${icon} ${result.agent}: ${info}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 成功: ${successCount} 个`);
  console.log(`❌ 失败: ${failedCount} 个`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n🎉 完成！刷新浏览器查看效果: http://localhost:5175/');
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((err) => {
    console.error('\n❌ 程序执行出错:', err.message);
    process.exit(1);
  });
}

module.exports = { generateImage, downloadImage };
