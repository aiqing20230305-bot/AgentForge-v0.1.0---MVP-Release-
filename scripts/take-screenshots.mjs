#!/usr/bin/env node

import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Screenshot configurations
const screenshots = [
  {
    name: '01-main-dashboard',
    path: '/',
    wait: 3000,
    description: 'Main dashboard with task management'
  },
  {
    name: '02-vitality-dashboard',
    action: async (page) => {
      // Wait for page to be fully loaded
      await page.waitForTimeout(2000)
      // Try multiple selectors to find vitality/heartbeat components
      const selectors = [
        '[class*="vitality"]',
        '[class*="heartbeat"]',
        '[class*="Vitality"]',
        '[class*="Heartbeat"]',
        'div[class*="glass"]'
      ]

      for (const selector of selectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            await element.scrollIntoViewIfNeeded()
            break
          }
        } catch (e) {
          // Try next selector
        }
      }
      await page.waitForTimeout(2000)
    },
    description: 'Agent vitality dashboard with health metrics'
  },
  {
    name: '03-evolution-timeline',
    action: async (page) => {
      // Look for evolution timeline component
      const evolutionTab = await page.$('text=/evolution/i')
      if (evolutionTab) {
        await evolutionTab.click()
        await page.waitForTimeout(2000)
      }
    },
    description: 'Evolution timeline showing agent growth'
  },
  {
    name: '04-heartbeat-monitor',
    action: async (page) => {
      // Look for heartbeat or vitality indicators
      const heartbeat = await page.$('[class*="heartbeat"]')
      if (heartbeat) {
        await heartbeat.scrollIntoViewIfNeeded()
        await page.waitForTimeout(1500)
      }
    },
    description: 'Real-time heartbeat monitoring'
  },
  {
    name: '05-settings-panel',
    action: async (page) => {
      // Click settings button
      const settingsBtn = await page.$('[title*="Settings"], [aria-label*="Settings"]')
      if (settingsBtn) {
        await settingsBtn.click()
        await page.waitForTimeout(2000)
      }
    },
    description: 'Settings panel with cloud sync options'
  },
  {
    name: '06-task-list-view',
    action: async (page) => {
      // Scroll to task list
      const taskList = await page.$('[class*="task"]')
      if (taskList) {
        await taskList.scrollIntoViewIfNeeded()
        await page.waitForTimeout(1500)
      }
    },
    description: 'Virtualized task list with performance optimization'
  },
  {
    name: '07-agent-display',
    path: '/',
    wait: 2000,
    viewport: { width: 1920, height: 1080 },
    description: 'Agent display panel'
  }
]

async function takeScreenshots() {
  console.log('🚀 Starting screenshot automation...\n')

  // Create output directory
  const outputDir = join(__dirname, '..', 'screenshots', 'v1.1.0')
  await mkdir(outputDir, { recursive: true })
  console.log(`📁 Output directory: ${outputDir}\n`)

  // Launch browser
  console.log('🌐 Launching browser...')
  const browser = await chromium.launch({
    headless: true
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2 // Retina display
  })

  const page = await context.newPage()

  // Navigate to app
  console.log('📍 Navigating to http://localhost:5173...')
  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    })
  } catch (error) {
    console.error('❌ Failed to load app. Make sure dev server is running on port 5173')
    console.error('   Run: npm run dev')
    await browser.close()
    process.exit(1)
  }

  console.log('✅ App loaded successfully\n')

  // Take screenshots
  for (const shot of screenshots) {
    console.log(`📸 Capturing: ${shot.name}`)
    console.log(`   ${shot.description}`)

    try {
      // Navigate to path if specified
      if (shot.path) {
        await page.goto(`http://localhost:5173${shot.path}`, {
          waitUntil: 'networkidle'
        })
      }

      // Execute custom action if specified
      if (shot.action) {
        await shot.action(page)
      }

      // Wait if specified
      if (shot.wait) {
        await page.waitForTimeout(shot.wait)
      }

      // Take screenshot
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

  await browser.close()

  console.log('\n🎉 Screenshot automation complete!')
  console.log(`📦 Total screenshots: ${screenshots.length}`)
  console.log(`📁 Location: ${outputDir}`)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  takeScreenshots().catch((error) => {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  })
}

export { takeScreenshots }
