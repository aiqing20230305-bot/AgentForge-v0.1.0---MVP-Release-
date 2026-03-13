/**
 * API 适配器 - 支持不同的图片/视频生成服务
 *
 * 支持的服务：
 * - SeeDream 5.0
 * - SeeDance 1.5
 * - Midjourney (通过第三方API)
 * - Replicate
 * - 自定义API
 */

const https = require('https');
const http = require('http');

// ==================== 通用 HTTP 请求 ====================

function httpRequest(url, options) {
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
            resolve({ raw: data });
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

// ==================== SeeDream 5.0 适配器 ====================

class SeeDreamAdapter {
  constructor(apiKey, baseUrl = 'https://api.seedream.ai/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateImage(prompt, options = {}) {
    const requestData = {
      model: options.model || 'seedream-5.0',
      prompt: prompt,
      width: options.width || 768,
      height: options.height || 1344,
      num_inference_steps: options.steps || 50,
      guidance_scale: options.guidance || 7.5,
      negative_prompt: options.negative || 'blurry, low quality, distorted, ugly, watermark'
    };

    const response = await httpRequest(this.baseUrl + '/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    // 返回标准化格式
    return {
      url: response.image_url || response.url || null,
      base64: response.image_base64 || response.image || null,
      seed: response.seed,
      raw: response
    };
  }
}

// ==================== SeeDance 1.5 适配器 ====================

class SeeDanceAdapter {
  constructor(apiKey, baseUrl = 'https://api.seedance.ai/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateVideo(prompt, options = {}) {
    const requestData = {
      model: options.model || 'seedance-1.5',
      prompt: prompt,
      width: options.width || 576,
      height: options.height || 1024,
      num_frames: options.frames || 120,
      fps: options.fps || 30,
      guidance_scale: options.guidance || 7.5,
      negative_prompt: options.negative || 'blurry, low quality, static, watermark'
    };

    const response = await httpRequest(this.baseUrl + '/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    return {
      videoUrl: response.video_url || response.url || null,
      thumbnailUrl: response.thumbnail_url || response.thumbnail || null,
      duration: response.duration,
      raw: response
    };
  }
}

// ==================== Replicate 适配器（备选方案）====================

class ReplicateAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.replicate.com/v1';
  }

  async generateImage(prompt, options = {}) {
    // SDXL 或其他模型
    const model = options.model || 'stability-ai/sdxl:latest';

    const requestData = {
      version: model,
      input: {
        prompt: prompt,
        width: options.width || 768,
        height: options.height || 1344,
        num_inference_steps: options.steps || 50,
        guidance_scale: options.guidance || 7.5,
        negative_prompt: options.negative || 'blurry, low quality'
      }
    };

    const response = await httpRequest(this.baseUrl + '/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    // Replicate 是异步的，需要轮询
    const predictionId = response.id;
    return await this.waitForPrediction(predictionId);
  }

  async waitForPrediction(id, maxWait = 300000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const result = await httpRequest(`${this.baseUrl}/predictions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.apiKey}`
        }
      });

      if (result.status === 'succeeded') {
        return {
          url: result.output ? result.output[0] : null,
          raw: result
        };
      } else if (result.status === 'failed') {
        throw new Error('Generation failed');
      }

      // 等待 2 秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Generation timeout');
  }
}

// ==================== 自定义 API 适配器 ====================

class CustomAPIAdapter {
  constructor(config) {
    this.config = config;
  }

  async generateImage(prompt, options = {}) {
    const requestData = this.config.buildRequest(prompt, options);

    const response = await httpRequest(this.config.endpoint, {
      method: this.config.method || 'POST',
      headers: this.config.headers,
      body: JSON.stringify(requestData)
    });

    return this.config.parseResponse(response);
  }

  async generateVideo(prompt, options = {}) {
    return await this.generateImage(prompt, options);
  }
}

// ==================== 适配器工厂 ====================

class AdapterFactory {
  static create(type, config) {
    switch (type.toLowerCase()) {
      case 'seedream':
        return new SeeDreamAdapter(config.apiKey, config.baseUrl);

      case 'seedance':
        return new SeeDanceAdapter(config.apiKey, config.baseUrl);

      case 'replicate':
        return new ReplicateAdapter(config.apiKey);

      case 'custom':
        return new CustomAPIAdapter(config);

      default:
        throw new Error(`Unknown adapter type: ${type}`);
    }
  }
}

// ==================== 导出 ====================

module.exports = {
  SeeDreamAdapter,
  SeeDanceAdapter,
  ReplicateAdapter,
  CustomAPIAdapter,
  AdapterFactory
};
