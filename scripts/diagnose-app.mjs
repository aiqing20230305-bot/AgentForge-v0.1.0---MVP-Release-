#!/usr/bin/env node

import { chromium } from 'playwright'

async function diagnoseApp() {
  console.log('🔍 Diagnosing application loading issues...\n')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Capture console messages
  const consoleMessages = []
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
  })

  // Capture page errors
  const pageErrors = []
  page.on('pageerror', error => {
    pageErrors.push(error.toString())
  })

  // Capture failed requests
  const failedRequests = []
  page.on('requestfailed', request => {
    failedRequests.push(`${request.url()} - ${request.failure().errorText}`)
  })

  console.log('📍 Loading http://localhost:5173...')
  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    })
  } catch (error) {
    console.error('❌ Navigation failed:', error.message)
  }

  console.log('⏳ Waiting 10 seconds for React...\n')
  await page.waitForTimeout(10000)

  // Get page state
  const diagnostics = await page.evaluate(() => {
    const root = document.querySelector('#root')
    return {
      title: document.title,
      bodyLength: document.body.innerHTML.length,
      rootExists: !!root,
      rootLength: root ? root.innerHTML.length : 0,
      rootContent: root ? root.innerHTML.substring(0, 200) : 'NO ROOT',
      hasReact: !!window.React,
      hasReactDOM: !!window.ReactDOM,
      errors: window.__RUNTIME_ERRORS__ || []
    }
  })

  console.log('📊 Diagnostics Results:')
  console.log('========================')
  console.log('Title:', diagnostics.title)
  console.log('Body HTML length:', diagnostics.bodyLength)
  console.log('Root exists:', diagnostics.rootExists)
  console.log('Root innerHTML length:', diagnostics.rootLength)
  console.log('Root content preview:', diagnostics.rootContent)
  console.log('Has React:', diagnostics.hasReact)
  console.log('Has ReactDOM:', diagnostics.hasReactDOM)

  if (consoleMessages.length > 0) {
    console.log('\n📝 Console Messages:')
    consoleMessages.forEach(msg => console.log('  ', msg))
  }

  if (pageErrors.length > 0) {
    console.log('\n❌ Page Errors:')
    pageErrors.forEach(err => console.log('  ', err))
  }

  if (failedRequests.length > 0) {
    console.log('\n🚫 Failed Requests:')
    failedRequests.forEach(req => console.log('  ', req))
  }

  // Try screenshot anyway
  try {
    await page.screenshot({ path: '/tmp/diagnose-screenshot.png' })
    console.log('\n📸 Screenshot saved to /tmp/diagnose-screenshot.png')
  } catch (e) {
    console.log('\n❌ Screenshot failed:', e.message)
  }

  await browser.close()

  // Analysis
  console.log('\n🔬 Analysis:')
  if (diagnostics.rootLength === 0) {
    console.log('❌ React is NOT rendering')
    console.log('   Possible causes:')
    console.log('   - JavaScript errors preventing React from mounting')
    console.log('   - Missing dependencies')
    console.log('   - Environment variables not set')
    console.log('   - Vite HMR issues in headless mode')
  } else {
    console.log('✅ React is rendering')
    console.log('   Root has', diagnostics.rootLength, 'characters of content')
  }

  console.log('\n💡 Recommendations:')
  if (pageErrors.length > 0) {
    console.log('   1. Fix JavaScript errors above')
  }
  if (failedRequests.length > 0) {
    console.log('   2. Check failed network requests')
  }
  console.log('   3. Try accessing http://localhost:5173 manually')
  console.log('   4. Check: npm run dev is running without errors')
}

diagnoseApp().catch(console.error)
