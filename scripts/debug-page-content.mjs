#!/usr/bin/env node

import { chromium } from 'playwright'

async function debugPage() {
  console.log('🔍 Debugging page content...\n')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  })

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  })

  console.log('📍 Navigating to http://localhost:5173...')
  await page.goto('http://localhost:5173', {
    waitUntil: 'networkidle',
    timeout: 60000
  })

  console.log('⏳ Waiting 10 seconds...')
  await page.waitForTimeout(10000)

  console.log('\n📊 Page Analysis:')

  const rootHTML = await page.evaluate(() => {
    const root = document.querySelector('#root')
    return root ? root.innerHTML.substring(0, 500) : 'NOT FOUND'
  })

  const bodyHTML = await page.evaluate(() => document.body.innerHTML.length)

  const title = await page.title()

  console.log('Title:', title)
  console.log('Body HTML length:', bodyHTML)
  console.log('Root content (first 500 chars):\n', rootHTML)

  // Take a test screenshot
  await page.screenshot({ path: '/tmp/debug-screenshot.png' })
  console.log('\n✅ Debug screenshot saved to: /tmp/debug-screenshot.png')

  console.log('\n⏸️  Browser will stay open for 5 seconds...')
  await page.waitForTimeout(5000)

  await browser.close()
}

debugPage().catch(console.error)
