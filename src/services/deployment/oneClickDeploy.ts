/**
 * 一键部署服务
 * One-Click Deploy Service - Generate embed codes, share links, API endpoints, and QR codes
 */

import QRCode from 'qrcode'

// 部署配置
export interface DeploymentConfig {
  agentId: string
  agentName: string
  theme?: 'light' | 'dark' | 'auto'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  primaryColor?: string
  enableWelcomeMessage?: boolean
  welcomeMessage?: string
  apiKey?: string
}

// 部署结果
export interface DeploymentResult {
  embedCode: string
  shareLink: string
  apiEndpoint: string
  qrCodeDataUrl: string
  widgetPreviewUrl: string
  apiDocUrl: string
}

// 嵌入代码模板
const EMBED_TEMPLATE = (config: DeploymentConfig) => `
<!-- AgentForge Chat Widget -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['AgentForgeWidget'] = o;
    w[o] = w[o] || function() {
      (w[o].q = w[o].q || []).push(arguments)
    };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'afWidget', 'https://cdn.agentforge.ai/widget.js'));

  afWidget('init', {
    agentId: '${config.agentId}',
    theme: '${config.theme || 'auto'}',
    position: '${config.position || 'bottom-right'}',
    primaryColor: '${config.primaryColor || '#8B5CF6'}',
    welcomeMessage: ${config.enableWelcomeMessage ? `'${config.welcomeMessage}'` : 'null'}
  });
</script>
<!-- End AgentForge Chat Widget -->
`

// React 组件代码
const REACT_COMPONENT = (config: DeploymentConfig) => `
import React, { useEffect } from 'react';

export const AgentForgeWidget: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.agentforge.ai/widget.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.afWidget('init', {
        agentId: '${config.agentId}',
        theme: '${config.theme || 'auto'}',
        position: '${config.position || 'bottom-right'}',
        primaryColor: '${config.primaryColor || '#8B5CF6'}',
        welcomeMessage: ${config.enableWelcomeMessage ? `'${config.welcomeMessage}'` : 'null'}
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};
`

// API 使用示例
const API_EXAMPLE = (config: DeploymentConfig) => `
// JavaScript/Node.js Example
const response = await fetch('https://api.agentforge.ai/v1/agents/${config.agentId}/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${config.apiKey || 'YOUR_API_KEY'}'
  },
  body: JSON.stringify({
    message: 'Hello, how can you help me?',
    sessionId: 'user-session-123'
  })
});

const data = await response.json();
console.log(data.reply);

// Python Example
import requests

response = requests.post(
    'https://api.agentforge.ai/v1/agents/${config.agentId}/chat',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${config.apiKey || 'YOUR_API_KEY'}'
    },
    json={
        'message': 'Hello, how can you help me?',
        'sessionId': 'user-session-123'
    }
)

data = response.json()
print(data['reply'])

// cURL Example
curl -X POST https://api.agentforge.ai/v1/agents/${config.agentId}/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${config.apiKey || 'YOUR_API_KEY'}" \\
  -d '{
    "message": "Hello, how can you help me?",
    "sessionId": "user-session-123"
  }'
`

/**
 * 一键部署服务类
 */
export class OneClickDeployService {
  private baseUrl: string
  private cdnUrl: string

  constructor() {
    this.baseUrl = 'https://api.agentforge.ai'
    this.cdnUrl = 'https://cdn.agentforge.ai'
  }

  /**
   * 生成嵌入代码
   */
  generateEmbedCode(config: DeploymentConfig): string {
    return EMBED_TEMPLATE(config).trim()
  }

  /**
   * 生成 React 组件代码
   */
  generateReactComponent(config: DeploymentConfig): string {
    return REACT_COMPONENT(config).trim()
  }

  /**
   * 生成分享链接
   */
  generateShareLink(config: DeploymentConfig): string {
    const params = new URLSearchParams({
      id: config.agentId,
      name: config.agentName,
      theme: config.theme || 'auto',
    })
    return `https://share.agentforge.ai/chat?${params.toString()}`
  }

  /**
   * 生成 API 端点
   */
  generateApiEndpoint(config: DeploymentConfig): string {
    return `${this.baseUrl}/v1/agents/${config.agentId}/chat`
  }

  /**
   * 生成 Widget 预览 URL
   */
  generateWidgetPreviewUrl(config: DeploymentConfig): string {
    const params = new URLSearchParams({
      agentId: config.agentId,
      theme: config.theme || 'auto',
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#8B5CF6',
    })
    return `https://preview.agentforge.ai/widget?${params.toString()}`
  }

  /**
   * 生成 API 文档 URL
   */
  generateApiDocUrl(config: DeploymentConfig): string {
    return `https://docs.agentforge.ai/api/agents/${config.agentId}`
  }

  /**
   * 生成 API 使用示例
   */
  generateApiExample(config: DeploymentConfig): string {
    return API_EXAMPLE(config).trim()
  }

  /**
   * 生成 QR 码
   */
  async generateQRCode(url: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      return qrDataUrl
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      throw new Error('QR code generation failed')
    }
  }

  /**
   * 完整部署流程
   */
  async deploy(config: DeploymentConfig): Promise<DeploymentResult> {
    const shareLink = this.generateShareLink(config)
    const qrCodeDataUrl = await this.generateQRCode(shareLink)

    return {
      embedCode: this.generateEmbedCode(config),
      shareLink,
      apiEndpoint: this.generateApiEndpoint(config),
      qrCodeDataUrl,
      widgetPreviewUrl: this.generateWidgetPreviewUrl(config),
      apiDocUrl: this.generateApiDocUrl(config),
    }
  }

  /**
   * 生成 iframe 嵌入代码
   */
  generateIframeEmbed(config: DeploymentConfig): string {
    const shareLink = this.generateShareLink(config)
    return `<iframe
  src="${shareLink}"
  width="400"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"
  allow="microphone; camera"
></iframe>`
  }

  /**
   * 生成 WordPress 短代码
   */
  generateWordPressShortcode(config: DeploymentConfig): string {
    return `[agentforge id="${config.agentId}" theme="${config.theme || 'auto'}" position="${config.position || 'bottom-right'}"]`
  }

  /**
   * 生成 Shopify 嵌入代码
   */
  generateShopifyEmbed(config: DeploymentConfig): string {
    return `<!-- Add to theme.liquid before </body> -->
${this.generateEmbedCode(config)}`
  }

  /**
   * 生成 Webflow 嵌入代码
   */
  generateWebflowEmbed(config: DeploymentConfig): string {
    return `<!-- Add to Page Settings > Custom Code > Before </body> tag -->
${this.generateEmbedCode(config)}`
  }

  /**
   * 生成移动端深链接
   */
  generateDeepLink(config: DeploymentConfig): string {
    return `agentforge://chat/${config.agentId}`
  }

  /**
   * 生成 Webhook URL
   */
  generateWebhookUrl(config: DeploymentConfig, webhookId: string): string {
    return `${this.baseUrl}/v1/webhooks/${webhookId}/agents/${config.agentId}`
  }

  /**
   * 导出配置为 JSON
   */
  exportConfig(config: DeploymentConfig): string {
    return JSON.stringify(config, null, 2)
  }

  /**
   * 从 JSON 导入配置
   */
  importConfig(json: string): DeploymentConfig {
    return JSON.parse(json) as DeploymentConfig
  }

  /**
   * 验证配置
   */
  validateConfig(config: DeploymentConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.agentId || config.agentId.trim() === '') {
      errors.push('Agent ID is required')
    }

    if (!config.agentName || config.agentName.trim() === '') {
      errors.push('Agent name is required')
    }

    if (config.theme && !['light', 'dark', 'auto'].includes(config.theme)) {
      errors.push('Invalid theme value')
    }

    if (
      config.position &&
      !['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(config.position)
    ) {
      errors.push('Invalid position value')
    }

    if (config.primaryColor && !/^#[0-9A-F]{6}$/i.test(config.primaryColor)) {
      errors.push('Invalid primary color format (should be hex color)')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 测试连接
   */
  async testConnection(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.generateApiEndpoint(config), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey || ''}`,
        },
        body: JSON.stringify({
          message: 'Connection test',
          sessionId: 'test-session',
        }),
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Connection successful',
        }
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

// 单例实例
let instance: OneClickDeployService | null = null

/**
 * 获取部署服务实例
 */
export function getDeployService(): OneClickDeployService {
  if (!instance) {
    instance = new OneClickDeployService()
  }
  return instance
}

// 导出便捷函数
export async function quickDeploy(
  agentId: string,
  agentName: string
): Promise<DeploymentResult> {
  const service = getDeployService()
  return service.deploy({
    agentId,
    agentName,
    theme: 'auto',
    position: 'bottom-right',
    enableWelcomeMessage: true,
    welcomeMessage: `Hi! I'm ${agentName}. How can I help you today?`,
  })
}

export default getDeployService
