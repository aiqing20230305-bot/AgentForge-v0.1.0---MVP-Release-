/**
 * AI 图像生成服务
 * 使用 Tezign LiteLLM API
 */

interface ImageGenerationOptions {
  prompt: string
  style?: 'realistic' | 'anime' | 'cyberpunk' | 'fantasy' | '3kingdoms' | 'robot'
  size?: '512x512' | '1024x1024'
}

interface ImageGenerationResult {
  success: boolean
  imageUrl?: string
  imageData?: string // base64
  error?: string
}

const API_BASE = 'https://cloudnative.tezign.com/litellm/api/v1'
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''

/**
 * 生成Agent形象图片
 */
export async function generateAgentPortrait(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const { prompt, style = 'realistic', size = '1024x1024' } = options

  try {
    // 构建增强的prompt（添加风格描述）
    const stylePrompts = {
      realistic: 'photorealistic, high quality, detailed',
      anime: 'anime style, manga art, vibrant colors',
      cyberpunk: 'cyberpunk style, neon lights, futuristic, sci-fi',
      fantasy: 'fantasy art style, magical, epic',
      '3kingdoms': 'Three Kingdoms style, ancient China, warrior, traditional Chinese art',
      robot: 'robot, mechanical, AI, sci-fi technology'
    }

    const fullPrompt = `${prompt}, ${stylePrompts[style]}, professional portrait, centered composition, clean background`

    // 调用 LiteLLM 图像生成 API
    // 注意：实际的endpoint可能需要根据LiteLLM配置调整
    const response = await fetch(`${API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3', // 或其他支持的模型
        prompt: fullPrompt,
        n: 1,
        size: size
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()

    // 处理返回的图片
    if (data.data && data.data[0]) {
      const imageUrl = data.data[0].url

      // 如果返回的是URL，需要下载并转换为base64
      if (imageUrl) {
        const imageResponse = await fetch(imageUrl)
        const blob = await imageResponse.blob()
        const base64 = await blobToBase64(blob)

        return {
          success: true,
          imageData: base64,
          imageUrl
        }
      }
    }

    throw new Error('No image data in response')
  } catch (error) {
    console.error('Image generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片生成失败'
    }
  }
}

/**
 * Blob转Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 生成三国风格的Agent形象
 */
export async function generateThreeKingdomsPortrait(
  character: string,
  gender: 'male' | 'female'
): Promise<ImageGenerationResult> {
  const genderDesc = gender === 'male' ? 'male warrior' : 'female warrior'
  const prompt = `${character}, Three Kingdoms period ${genderDesc}, ancient Chinese armor, heroic pose, traditional Chinese painting style`

  return generateAgentPortrait({
    prompt,
    style: '3kingdoms',
    size: '1024x1024'
  })
}

/**
 * 生成机器人风格的Agent形象
 */
export async function generateRobotPortrait(robotType: string): Promise<ImageGenerationResult> {
  const prompt = `${robotType} robot, AI agent, sleek design, modern technology, futuristic`

  return generateAgentPortrait({
    prompt,
    style: 'robot',
    size: '1024x1024'
  })
}
