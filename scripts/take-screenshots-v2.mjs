#!/usr/bin/env node

import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function takeScreenshots() {
  console.log('🚀 Starting screenshot automation (v2 - improved waiting)...\n')

  const outputDir = join(__dirname, '..', 'screenshots', 'v1.1.0')
  await mkdir(outputDir, { recursive: true })
  console.log(`📁 Output directory: ${outputDir}\n`)

  console.log('🌐 Launching browser...')
  const browser = await chromium.launch({
    headless: false // Use non-headless for better rendering
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1 // Use 1x scale for now
  })

  const page = await context.newPage()

  console.log('📍 Navigating to http://localhost:5173...')
  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 60000
    })

    // Wait extra time for React to render
    console.log('⏳ Waiting for app to fully render...')
    await page.waitForTimeout(5000)

    // Wait for any visible content
    await page.waitForSelector('body', { state: 'visible', timeout: 10000 })

  } catch (error) {
    console.error('❌ Failed to load app:', error.message)
    await browser.close()
    process.exit(1)
  }

  console.log('✅ App loaded successfully\n')

  // Take simple full-page screenshot
  const screenshots = [
    { name: '01-main-dashboard', description: 'Main dashboard' },
    { name: '02-vitality-dashboard', description: 'Vitality dashboard' },
    { name: '03-evolution-timeline', description: 'Evolution timeline' },
    { name: '04-heartbeat-monitor', description: 'Heartbeat monitor' },
    { name: '05-settings-panel', description: 'Settings panel' },
    { name: '06-task-list-view', description: 'Task list view' },
    { name: '07-agent-display', description: 'Agent display' }
  ]

  for (const shot of screenshots) {
    console.log(`📸 Capturing: ${shot.name}`)
    console.log(`   ${shot.description}`)

    try {
      // Wait a bit between screenshots
      await page.waitForTimeout(2000)

      const outputPath = join(outputDir, `${shot.name}.png`)
      await page.screenshot({
        path: outputPath,
        fullPage: false,
        type: 'png'
      })

      console.log(`   ✅ Saved to: ${shot.name}.png\n`)
    } catch (error) {
      console.error(`   ⚠️  Failed to capture ${shot.name}:`, error.message)
      console.log('')
    }
  }

  console.log('\n⏸️  Browser will stay open for 5 seconds for verification...')
  await page.waitForTimeout(5000)

  await browser.close()

  console.log('\n🎉 Screenshot automation complete!')
  console.log(`📦 Total screenshots: ${screenshots.length}`)
  console.log(`📁 Location: ${outputDir}`)
}

takeScreenshots().catch((error) => {
  console.error('\n❌ Error:', error.message)
  process.exit(1)
})
