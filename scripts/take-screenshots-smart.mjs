#!/usr/bin/env node

import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const screenshots = [
  {
    name: '01-main-dashboard',
    description: 'Main dashboard with task management',
    waitFor: ['div', 'main', '[class*="glass"]'],
    action: null
  },
  {
    name: '02-vitality-dashboard',
    description: 'Agent vitality dashboard',
    waitFor: ['div', 'main'],
    action: async (page) => {
      // Try to scroll down to show more content
      await page.evaluate(() => window.scrollTo(0, 300))
      await page.waitForTimeout(1500)
    }
  },
  {
    name: '03-evolution-timeline',
    description: 'Evolution timeline',
    waitFor: ['div'],
    action: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 600))
      await page.waitForTimeout(1500)
    }
  },
  {
    name: '04-heartbeat-monitor',
    description: 'Heartbeat monitoring',
    waitFor: ['div'],
    action: async (page) => {
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(1500)
    }
  },
  {
    name: '05-settings-panel',
    description: 'Settings panel',
    waitFor: ['div'],
    action: async (page) => {
      // Try to click settings if visible
      try {
        const settingsBtn = await page.$('[title*="Settings"], [aria-label*="Settings"], button:has-text("Settings")')
        if (settingsBtn) {
          await settingsBtn.click()
          await page.waitForTimeout(2000)
        }
      } catch (e) {
        console.log('   ℹ️  Settings button not found, taking current view')
      }
    }
  },
  {
    name: '06-task-list-view',
    description: 'Task list view',
    waitFor: ['div'],
    action: async (page) => {
      // Close settings if open
      try {
        const closeBtn = await page.$('[aria-label*="Close"], button:has-text("×")')
        if (closeBtn) await closeBtn.click()
      } catch (e) {}
      await page.waitForTimeout(1500)
    }
  },
  {
    name: '07-agent-display',
    description: 'Agent display panel',
    waitFor: ['div'],
    action: null
  }
]

async function waitForContent(page, selectors, timeout = 10000) {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector)
        if (element) {
          const isVisible = await element.isVisible()
          if (isVisible) {
            console.log(`   ✓ Found content: ${selector}`)
            return true
          }
        }
      } catch (e) {
        // Continue trying
      }
    }
    await page.waitForTimeout(500)
  }

  return false
}

async function takeScreenshots() {
  console.log('🚀 Starting SMART screenshot automation...\n')

  const outputDir = join(__dirname, '..', 'screenshots', 'v1.1.0')
  await mkdir(outputDir, { recursive: true })
  console.log(`📁 Output directory: ${outputDir}\n`)

  console.log('🌐 Launching browser in non-headless mode...')
  const browser = await chromium.launch({
    headless: false, // Non-headless for better rendering
    args: ['--disable-blink-features=AutomationControlled']
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: 'dark' // Match app theme
  })

  const page = await context.newPage()

  // Increase default timeout
  page.setDefaultTimeout(60000)

  console.log('📍 Navigating to http://localhost:5173...')
  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 60000
    })

    console.log('⏳ Waiting for app to render...')

    // Wait for React to mount
    await page.waitForTimeout(3000)

    // Wait for any visible content
    const hasContent = await waitForContent(page, [
      'div[class*="glass"]',
      'main',
      'div[class*="App"]',
      'body > div > div'
    ])

    if (!hasContent) {
      console.warn('⚠️  Warning: No visible content detected, but proceeding anyway')
    } else {
      console.log('✅ App content detected')
    }

    // Additional wait for animations
    await page.waitForTimeout(2000)

  } catch (error) {
    console.error('❌ Failed to load app:', error.message)
    console.error('   Make sure dev server is running: npm run dev')
    await browser.close()
    process.exit(1)
  }

  console.log('✅ App loaded successfully\n')
  console.log('📸 Taking screenshots...\n')

  let successCount = 0
  let failCount = 0

  for (const shot of screenshots) {
    console.log(`📸 [${successCount + failCount + 1}/${screenshots.length}] ${shot.name}`)
    console.log(`   ${shot.description}`)

    try {
      // Wait for content
      await waitForContent(page, shot.waitFor, 5000)

      // Execute custom action if specified
      if (shot.action) {
        await shot.action(page)
      }

      // Additional stabilization wait
      await page.waitForTimeout(1500)

      // Take screenshot
      const outputPath = join(outputDir, `${shot.name}.png`)
      await page.screenshot({
        path: outputPath,
        fullPage: false,
        type: 'png',
        animations: 'disabled' // Disable animations for cleaner shots
      })

      // Verify file is not empty
      const fs = await import('fs/promises')
      const stats = await fs.stat(outputPath)

      if (stats.size < 10000) {
        console.log(`   ⚠️  Warning: File size is small (${Math.round(stats.size / 1024)}KB)`)
        console.log(`   Saved to: ${shot.name}.png (may be black)\n`)
        failCount++
      } else {
        console.log(`   ✅ Saved: ${shot.name}.png (${Math.round(stats.size / 1024)}KB)\n`)
        successCount++
      }

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`)
      failCount++
    }
  }

  console.log('\n⏸️  Keeping browser open for 3 seconds for verification...')
  await page.waitForTimeout(3000)

  await browser.close()

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Screenshot automation complete!')
  console.log('='.repeat(60))
  console.log(`📊 Results: ${successCount} success, ${failCount} failed/suspicious`)
  console.log(`📁 Location: ${outputDir}`)
  console.log('='.repeat(60))

  if (failCount > 0) {
    console.log('\n⚠️  Some screenshots may need manual retake.')
    console.log('💡 Check files with size < 10KB - they might be black.')
    console.log('📖 See: scripts/MANUAL_SCREENSHOT_GUIDE.md')
  }

  console.log('\n✨ Next steps:')
  console.log('   1. Review screenshots: open screenshots/v1.1.0/')
  console.log('   2. If black, try: npm run dev (ensure app loads properly)')
  console.log('   3. Or use manual screenshot guide')
}

takeScreenshots().catch((error) => {
  console.error('\n❌ Fatal error:', error.message)
  console.error('\n💡 Troubleshooting:')
  console.error('   1. Ensure dev server is running: npm run dev')
  console.error('   2. Wait for app to fully load (check http://localhost:5173)')
  console.error('   3. Try closing other browser windows')
  process.exit(1)
})
