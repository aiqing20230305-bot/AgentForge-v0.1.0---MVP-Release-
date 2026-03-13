#!/usr/bin/env node
/**
 * Agent 图片库批量生成脚本
 * 为每个 Agent 生成多种风格和性别的角色立绘
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// API 配置
const API_CONFIG = {
  endpoint: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  apiKey: 'a25c18a5-9ea0-4532-9a97-fe088e786115',
  model: 'doubao-seedream-5-0-260128'
};

// Agent 基础配置
const AGENT_BASE = {
  ATLAS: {
    role: 'Team Leader',
    color: 'blue',
    title: '团队统帅'
  },
  CLIP: {
    role: 'Full Stack Developer',
    color: 'green',
    title: '技术大师'
  },
  ORACLE: {
    role: 'Knowledge Keeper',
    color: 'purple',
    title: '智慧贤者'
  },
  SENTINEL: {
    role: 'Security Chief',
    color: 'red',
    title: '守护战士'
  }
};

// 风格模板
const STYLE_TEMPLATES = {
  realistic: {
    name: '写实风格',
    suffix: 'photorealistic, cinematic lighting, detailed face, professional photography, 8K resolution',
    background: 'studio lighting, gradient background'
  },
  anime: {
    name: '动漫风格',
    suffix: 'anime style, manga art, cel shading, vibrant colors, detailed eyes',
    background: 'anime background, colorful gradient'
  },
  cyberpunk: {
    name: '赛博朋克',
    suffix: 'cyberpunk style, neon lights, holographic effects, futuristic, digital art',
    background: 'cyberpunk cityscape, neon background'
  },
  fantasy: {
    name: '奇幻风格',
    suffix: 'fantasy art, magical aura, ethereal effects, mystical, concept art',
    background: 'fantasy background, magical atmosphere'
  }
};

// 性别特征
const GENDER_TRAITS = {
  male: {
    name: '男性',
    traits: 'mature male character, masculine features, strong build'
  },
  female: {
    name: '女性',
    traits: 'elegant female character, feminine features, graceful posture'
  }
};

// 角色特定提示词
const ROLE_PROMPTS = {
  ATLAS: {
    male: {
      realistic: 'wearing a dark blue business suit with golden badge',
      anime: 'wearing blue military uniform with gold accents',
      cyberpunk: 'wearing blue cyber armor with holographic interface',
      fantasy: 'wearing blue royal robes with golden crown'
    },
    female: {
      realistic: 'wearing elegant blue blazer with golden brooch',
      anime: 'wearing blue commander outfit with gold decorations',
      cyberpunk: 'wearing blue tech suit with neon accents',
      fantasy: 'wearing blue royal dress with golden tiara'
    }
  },
  CLIP: {
    male: {
      realistic: 'wearing green hoodie with tech gadgets',
      anime: 'wearing green hacker outfit with digital effects',
      cyberpunk: 'wearing green cyber jacket with LED patterns',
      fantasy: 'wearing green tech-inspired outfit with circuit patterns'
    },
    female: {
      realistic: 'wearing green tech vest with smart glasses',
      anime: 'wearing green programming outfit with cute accessories',
      cyberpunk: 'wearing green netrunner suit with data streams',
      fantasy: 'wearing green techno-mage dress with circuits'
    }
  },
  ORACLE: {
    male: {
      realistic: 'wearing purple scholar robes with ancient books',
      anime: 'wearing purple wizard outfit with mystical staff',
      cyberpunk: 'wearing purple data analyst suit with AI interface',
      fantasy: 'wearing purple archmage robes with crystal orb'
    },
    female: {
      realistic: 'wearing elegant purple dress with crystal jewelry',
      anime: 'wearing purple magical girl outfit with star staff',
      cyberpunk: 'wearing purple AI suit with holographic data',
      fantasy: 'wearing purple sorceress robes with glowing gems'
    }
  },
  SENTINEL: {
    male: {
      realistic: 'wearing red tactical armor with shield',
      anime: 'wearing red warrior armor with energy sword',
      cyberpunk: 'wearing red combat suit with plasma shield',
      fantasy: 'wearing red knight armor with blazing sword'
    },
    female: {
      realistic: 'wearing red tactical vest with protective gear',
      anime: 'wearing red guardian outfit with energy blade',
      cyberpunk: 'wearing red security suit with force field',
      fantasy: 'wearing red paladin armor with holy shield'
    }
  }
};

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../public/images/agents/gallery');

/**
 * 生成提示词
 */
function generatePrompt(agentName, gender, style) {
  const agent = AGENT_BASE[agentName];
  const genderTrait = GENDER_TRAITS[gender];
  const styleTemplate = STYLE_TEMPLATES[style];
  const rolePrompt = ROLE_PROMPTS[agentName][gender][style];

  const colorMap = {
    blue: 'blue energy particles, blue gradient background',
    green: 'green digital effects, green gradient background',
    purple: 'purple magical aura, purple gradient background',
    red: 'red energy field, red gradient background'
  };

  return `${genderTrait.traits}, ${rolePrompt},
${colorMap[agent.color]},
determined gaze, professional pose, ${styleTemplate.background},
half-body portrait, front view,
game character illustration style, high quality 4K, rich details,
${styleTemplate.suffix},
masterpiece, best quality, ultra detailed`.replace(/\n/g, ' ').replace(/\s+/g, ' ');
}

/**
 * 调用 API 生成图片
 */
async function generateImage(prompt, outputPath) {
  console.log(`📝 提示词: ${prompt.substring(0, 100)}...`);

  const payload = {
    model: API_CONFIG.model,
    prompt: prompt,
    size: '1920x1920',
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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            const imageData = result.data[0];

            if (imageData.b64_json) {
              const base64Image = imageData.b64_json.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Image, 'base64');
              fs.writeFileSync(outputPath, buffer);
              console.log(`✅ 已保存到: ${outputPath}`);
              resolve(outputPath);
            } else if (imageData.url) {
              // 下载图片
              downloadImage(imageData.url, outputPath).then(resolve).catch(reject);
            }
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
 * 下载图片
 */
function downloadImage(imageUrl, outputPath) {
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
        resolve(outputPath);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * 生成图片库索引
 */
function generateGalleryIndex(results) {
  const gallery = {};

  Object.keys(AGENT_BASE).forEach(agentName => {
    gallery[agentName] = {
      name: agentName,
      title: AGENT_BASE[agentName].title,
      images: {}
    };

    Object.keys(GENDER_TRAITS).forEach(gender => {
      gallery[agentName].images[gender] = {};

      Object.keys(STYLE_TEMPLATES).forEach(style => {
        const filename = `${agentName.toLowerCase()}_${gender}_${style}.png`;
        const result = results.find(r => r.filename === filename && (r.status === 'success' || r.status === 'skipped'));

        if (result) {
          gallery[agentName].images[gender][style] = {
            path: `/images/agents/gallery/${filename}`,
            style: STYLE_TEMPLATES[style].name,
            gender: GENDER_TRAITS[gender].name
          };
        }
      });
    });
  });

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(gallery, null, 2));
  console.log(`\n📋 图片库索引已生成: ${indexPath}`);

  return gallery;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生成 Agent 图片库...\n');
  console.log(`📁 输出目录: ${OUTPUT_DIR}\n`);

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ 已创建输出目录\n`);
  }

  const results = [];
  let successCount = 0;
  let failedCount = 0;

  // 批量生成
  for (const agentName of Object.keys(AGENT_BASE)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎨 生成 ${agentName} (${AGENT_BASE[agentName].title}) 的图片库`);
    console.log('='.repeat(60));

    for (const gender of Object.keys(GENDER_TRAITS)) {
      for (const style of Object.keys(STYLE_TEMPLATES)) {
        const filename = `${agentName.toLowerCase()}_${gender}_${style}.png`;
        const outputPath = path.join(OUTPUT_DIR, filename);

        console.log(`\n📸 ${GENDER_TRAITS[gender].name} - ${STYLE_TEMPLATES[style].name}`);

        // 跳过已存在的图片
        if (fs.existsSync(outputPath)) {
          console.log(`⏭️  已存在，跳过`);
          results.push({
            agent: agentName,
            gender,
            style,
            filename,
            status: 'skipped',
            path: outputPath
          });
          continue;
        }

        try {
          const prompt = generatePrompt(agentName, gender, style);
          await generateImage(prompt, outputPath);

          results.push({
            agent: agentName,
            gender,
            style,
            filename,
            status: 'success',
            path: outputPath
          });
          successCount++;

          // 延迟避免频率限制
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (err) {
          console.error(`❌ 生成失败: ${err.message}`);
          results.push({
            agent: agentName,
            gender,
            style,
            filename,
            status: 'failed',
            error: err.message
          });
          failedCount++;
        }
      }
    }
  }

  // 生成索引文件
  const gallery = generateGalleryIndex(results);

  // 输出结果汇总
  const skippedCount = results.filter(r => r.status === 'skipped').length;
  console.log('\n' + '='.repeat(60));
  console.log('📊 生成结果汇总:');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 张`);
  console.log(`❌ 失败: ${failedCount} 张`);
  console.log(`⏭️  跳过: ${skippedCount} 张（已存在）`);
  console.log(`📦 总计: ${results.length} 张`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n🎉 完成！刷新浏览器查看效果: http://localhost:5175/');
    console.log('\n💡 提示: 图片库索引已保存到 gallery/index.json');
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((err) => {
    console.error('\n❌ 程序执行出错:', err.message);
    process.exit(1);
  });
}

module.exports = { generatePrompt, generateImage, generateGalleryIndex };
