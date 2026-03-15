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
  { name: '04-heartbeat-monitor', description: 'Heartbeat monitor', scroll: 900 },
  { name: '05-settings-panel', description: 'Settings panel', scroll: 0 },
  { name: '06-task-list-view', description: 'Task list view', scroll: 400 },
  { name: '07-agent-display', description: 'Agent display', scroll: 200 }
]

async function takeScreenshots() {
  console.log('🚀 Starting FINAL screenshot automation (React-aware)...\n')

  const outputDir = join(__dirname, '..', 'screenshots', 'v1.1.0')
  await mkdir(outputDir, { recursive: true })
  console.log(`📁 Output directory: ${outputDir}\n`)

  console.log('🌐 Launching browser...')
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-web-security']
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    colorScheme: 'dark'
  })

  const page = await context.newPage()

  console.log('📍 Navigating to http://localhost:5173...')
  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    console.log('⏳ Waiting for React to render...')

    // Wait for React root to have content
    await page.waitForFunction(
      () => {
        const root = document.querySelector('#root')
        return root && root.innerHTML.length > 500
      },
      { timeout: 30000 }
    )

    console.log('✓ React app detected')

    // Additional wait for animations and data loading
    await page.waitForTimeout(3000)

    console.log('✅ App fully loaded')

  } catch (error) {
    console.error('❌ Failed to load app:', error.message)
    console.error('   Make sure: npm run dev is running')
    await browser.close()
    process.exit(1)
  }

  console.log('📸 Taking screenshots using CDP...\n')

  let successCount = 0
  const client = await context.newCDPSession(page)

  for (let i = 0; i < screenshots.length; i++) {
    const shot = screenshots[i]
    console.log(`📸 [${i + 1}/${screenshots.length}] ${shot.name}`)
    console.log(`   ${shot.description}`)

    try {
      // Scroll to position
      await page.evaluate((y) => {
        window.scrollTo({ top: y, behavior: 'instant' })
      }, shot.scroll)

      // Wait for scroll to complete
      await page.waitForTimeout(1500)

      // Take screenshot using CDP (bypasses font loading wait)
      const screenshot = await client.send('Page.captureScreenshot', {
        format: 'png',
        quality: 100,
        captureBeyondViewport: false
      })

      // Save screenshot
      const outputPath = join(outputDir, `${shot.name}.png`)
      await writeFile(outputPath, Buffer.from(screenshot.data, 'base64'))

      // Verify file size
      const fs = await import('fs/promises')
      const stats = await fs.stat(outputPath)
      const sizeKB = Math.round(stats.size / 1024)

      if (stats.size < 10000) {
        console.log(`   ⚠️  Warning: Small file (${sizeKB}KB) - might be black\n`)
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

  if (successCount === screenshots.length) {
    console.log('\n✨ All screenshots captured successfully!')
    console.log('📖 Next: Review screenshots with: open screenshots/v1.1.0/')
  } else {
    console.log('\n💡 Some screenshots failed. Next steps:')
    console.log('   1. Check screenshots: open screenshots/v1.1.0/')
    console.log('   2. Verify app loads: open http://localhost:5173')
    console.log('   3. If needed, use manual guide: scripts/MANUAL_SCREENSHOT_GUIDE.md')
  }

  process.exit(successCount === screenshots.length ? 0 : 1)
}

takeScreenshots().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  console.error(error.stack)
  process.exit(1)
})
