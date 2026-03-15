#!/usr/bin/env node

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const screenshots = [
  { name: '01-main-dashboard', description: 'Main dashboard', scroll: 0 },
  { name: '02-vitality-dashboard', description: 'Vitality dashboard', scroll: 300 },
  { name: '03-evolution-timeline', description: 'Evolution timeline', scroll: 600 },
  { name: '04-heartbeat-monitor', description: 'Heartbeat monitor', scroll: 0 },
  { name: '05-settings-panel', description: 'Settings panel', scroll: 0 },
  { name: '06-task-list-view', description: 'Task list view', scroll: 0 },
  { name: '07-agent-display', description: 'Agent display', scroll: 0 }
]

async function takeScreenshots() {
  console.log('🚀 Starting FIXED screenshot automation...\n')

  const outputDir = join(__dirname, '..', 'screenshots', 'v1.1.0')
  await mkdir(outputDir, { recursive: true })
  console.log(`📁 Output directory: ${outputDir}\n`)

  console.log('🌐 Launching browser (headless mode)...')
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled'
    ]
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    hasTouch: false,
    isMobile: false,
    // Important: Set permissions
    permissions: []
  })

  const page = await context.newPage()

  // Set shorter timeouts
  page.setDefaultTimeout(30000)

  console.log('📍 Navigating to http://localhost:5173...')
  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded', // Changed from 'networkidle'
      timeout: 30000
    })

    console.log('⏳ Waiting for app to render...')
    await page.waitForTimeout(5000)

    // Check if page loaded
    const bodyHTML = await page.evaluate(() => document.body.innerHTML)
    if (bodyHTML.length < 100) {
      throw new Error('Page appears to be empty')
    }

    console.log('✅ App loaded successfully')

  } catch (error) {
    console.error('❌ Failed to load app:', error.message)
    await browser.close()
    process.exit(1)
  }

  console.log('📸 Taking screenshots...\n')

  let successCount = 0

  for (let i = 0; i < screenshots.length; i++) {
    const shot = screenshots[i]
    console.log(`📸 [${i + 1}/${screenshots.length}] ${shot.name}`)
    console.log(`   ${shot.description}`)

    try {
      // Scroll to position
      if (shot.scroll) {
        await page.evaluate((y) => window.scrollTo(0, y), shot.scroll)
        await page.waitForTimeout(1000)
      }

      // Use CDP (Chrome DevTools Protocol) to capture screenshot
      // This bypasses Playwright's font-loading wait
      const client = await context.newCDPSession(page)

      const screenshot = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true
      })

      // Save screenshot
      const outputPath = join(outputDir, `${shot.name}.png`)
      await writeFile(outputPath, Buffer.from(screenshot.data, 'base64'))

      // Check file size
      const fs = await import('fs/promises')
      const stats = await fs.stat(outputPath)
      const sizeKB = Math.round(stats.size / 1024)

      if (stats.size < 5000) {
        console.log(`   ⚠️  Warning: Small file (${sizeKB}KB) - likely black\n`)
      } else {
        console.log(`   ✅ Saved: ${shot.name}.png (${sizeKB}KB)\n`)
        successCount++
      }

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`)
    }
  }

  await browser.close()

  console.log('='.repeat(60))
  console.log('🎉 Screenshot automation complete!')
  console.log('='.repeat(60))
  console.log(`📊 Success: ${successCount}/${screenshots.length}`)
  console.log(`📁 Location: ${outputDir}`)
  console.log('='.repeat(60))

  if (successCount < screenshots.length) {
    console.log('\n💡 Tips:')
    console.log('   - Check if app loaded properly: open http://localhost:5173')
    console.log('   - Verify screenshots: open screenshots/v1.1.0/')
    console.log('   - If still black, try manual screenshot guide')
  }
}

takeScreenshots().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  process.exit(1)
})
