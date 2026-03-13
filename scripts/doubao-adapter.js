/**
 * 豆包（火山引擎）API 适配器
 * - SeeDream 5.0: 图生图
 * - SeeDance 1.5 Pro: 图生视频
 */

const https = require('https');

// ==================== 豆包 SeeDream 5.0 适配器 ====================

class DoubaoSeeDreamAdapter {
  constructor(apiKey, endpoint = 'https://ark.cn-beijing.volces.com/api/v3/images/generations') {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.model = 'doubao-seedream-5-0-260128';
  }

  async generateImage(prompt, options = {}) {
    console.log(`   🔑 使用 API Key: ${this.apiKey.substring(0, 8)}...`);
    console.log(`   🌐 端点: ${this.endpoint}`);

    const requestData = {
      model: this.model,
      prompt: prompt,
      n: 1,
      size: options.size || '1440x2560',  // 9:16 比例，至少3686400像素
      quality: 'high',
      response_format: 'url'
    };

    try {
      const response = await this.makeRequest(this.endpoint, requestData);

      // 豆包返回格式
      if (response.data && response.data.length > 0) {
        const image = response.data[0];
        return {
          url: image.url || null,
          base64: image.b64_json || null,
          revised_prompt: image.revised_prompt,
          raw: response
        };
      } else {
        throw new Error('无效的响应格式: ' + JSON.stringify(response));
      }
    } catch (error) {
      console.error(`   ❌ 生成失败: ${error.message}`);
      throw error;
    }
  }

  makeRequest(url, data) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = JSON.stringify(data);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch (e) {
              reject(new Error('JSON 解析失败: ' + responseData));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

// ==================== 豆包 SeeDance 1.5 Pro 适配器 ====================

class DoubaoSeeDanceAdapter {
  constructor(apiKey, endpoint = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks') {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.model = 'doubao-seedance-1-5-pro-251215';
  }

  async generateVideo(prompt, imagePathOrUrl, options = {}) {
    console.log(`   🔑 使用 API Key: ${this.apiKey.substring(0, 8)}...`);
    console.log(`   🌐 端点: ${this.endpoint}`);

    // SeeDance 需要输入图片
    if (!imagePathOrUrl) {
      throw new Error('SeeDance 需要输入图片 URL 或路径');
    }

    const fs = require('fs');
    let imageBase64;

    // 判断是本地文件还是URL
    if (imagePathOrUrl.startsWith('http://') || imagePathOrUrl.startsWith('https://')) {
      throw new Error('暂不支持URL，请使用本地文件路径');
    } else {
      // 读取本地文件并转为base64
      const imageBuffer = fs.readFileSync(imagePathOrUrl);
      imageBase64 = imageBuffer.toString('base64');
      console.log(`   📤 已加载图片: ${imagePathOrUrl} (${(imageBuffer.length / 1024).toFixed(1)}KB)`);
    }

    const requestData = {
      model: this.model,
      prompt: prompt,
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${imageBase64}`  // 使用 data URI 格式
          }
        }
      ],
      aspect_ratio: '9:16',
      duration: options.duration || 4,  // 视频时长（秒）
      motion_strength: options.motion || 5  // 运动强度 1-10
    };

    try {
      // 1. 创建任务
      const taskResponse = await this.makeRequest(this.endpoint, requestData);

      if (!taskResponse.id && !taskResponse.task_id) {
        throw new Error('无法创建任务: ' + JSON.stringify(taskResponse));
      }

      const taskId = taskResponse.id || taskResponse.task_id;
      console.log(`   📋 任务ID: ${taskId}`);
      console.log(`   ⏳ 等待视频生成...`);

      // 2. 轮询任务状态
      const result = await this.pollTask(taskId, options.maxWaitTime || 180000);

      return {
        videoUrl: result.content?.video_url || result.video_url,
        thumbnailUrl: result.content?.thumbnail_url || result.thumbnail_url,
        duration: result.duration,
        raw: result
      };
    } catch (error) {
      console.error(`   ❌ 生成失败: ${error.message}`);
      throw error;
    }
  }

  async pollTask(taskId, maxWaitTime = 180000) {
    const startTime = Date.now();
    const pollInterval = 3000; // 3秒轮询一次

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const queryUrl = `${this.endpoint}/${taskId}`;
        const result = await this.makeRequest(queryUrl, null, 'GET');

        console.log(`   📊 状态: ${result.status || 'unknown'}`);

        if (result.status === 'succeeded' || result.status === 'completed') {
          console.log(`   ✅ 视频生成完成！`);
          return result;
        } else if (result.status === 'failed') {
          throw new Error('视频生成失败: ' + (result.error || '未知错误'));
        }

        // 等待后继续轮询
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        if (error.message.includes('404')) {
          // 任务可能还未就绪，继续等待
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }
        throw error;
      }
    }

    throw new Error('视频生成超时');
  }

  makeRequest(url, data, method = 'POST') {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const postData = data ? JSON.stringify(data) : null;

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      };

      if (postData) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch (e) {
              reject(new Error('JSON 解析失败: ' + responseData));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }
}

// ==================== 导出 ====================

module.exports = {
  DoubaoSeeDreamAdapter,
  DoubaoSeeDanceAdapter
};
