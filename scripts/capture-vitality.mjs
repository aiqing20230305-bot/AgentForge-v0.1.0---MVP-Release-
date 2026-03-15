#!/usr/bin/env node

import { chromium } from 'playwright'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function captureVitality() {
  console.log('📸 Capturing vitality dashboard...')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  })
  const page = await context.newPage()

  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Wait for page to be fully loaded
    await page.waitForTimeout(3000)

    // Take screenshot of the main view (which should show vitality info)
    const outputPath = join(__dirname, '..', 'screenshots', 'v1.1.0', '02-vitality-dashboard.png')
    await page.screenshot({
      path: outputPath,
      fullPage: false,
      type: 'png'
    })

    console.log('✅ Saved: 02-vitality-dashboard.png')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await browser.close()
  }
}

captureVitality()
