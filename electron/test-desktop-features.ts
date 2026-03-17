/**
 * Desktop Features Test Script
 * 桌面功能测试脚本
 *
 * Usage: Run this in the Electron main process to test all desktop features
 */

import { app, BrowserWindow } from 'electron'
import { TrayManager } from './tray'
import { ShortcutManager } from './shortcut'
import { WindowManager } from './windowManager'

export async function testDesktopFeatures() {
  console.log('\n=== Desktop Features Test Suite ===\n')

  const results: { [key: string]: boolean } = {}

  try {
    // Create a test window
    const testWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
    })

    // Test 1: Tray Manager
    console.log('Testing Tray Manager...')
    try {
      const trayManager = new TrayManager(testWindow)
      trayManager.create()
      trayManager.updateTooltip('Test Tooltip')
      trayManager.updateContextMenu([
        { label: 'Test Item', click: () => console.log('Test clicked') },
      ])
      results['Tray Manager'] = true
      console.log('✅ Tray Manager: PASS')
    } catch (error) {
      results['Tray Manager'] = false
      console.error('❌ Tray Manager: FAIL', error)
    }

    // Test 2: Shortcut Manager
    console.log('\nTesting Shortcut Manager...')
    try {
      const shortcutManager = new ShortcutManager(testWindow)
      const shortcuts = shortcutManager.getShortcuts()
      console.log(`Found ${shortcuts.length} shortcuts`)

      // Test registering a custom shortcut
      const testKey = 'CommandOrControl+Shift+T'
      const registered = shortcutManager.register(testKey, 'test-action')
      console.log(`Register ${testKey}: ${registered}`)

      // Test unregistering
      shortcutManager.unregister(testKey)

      results['Shortcut Manager'] = true
      console.log('✅ Shortcut Manager: PASS')
    } catch (error) {
      results['Shortcut Manager'] = false
      console.error('❌ Shortcut Manager: FAIL', error)
    }

    // Test 3: Window Manager
    console.log('\nTesting Window Manager...')
    try {
      const windowManager = new WindowManager()
      windowManager.setMainWindow(testWindow)

      const windowCount = windowManager.getWindowCount()
      console.log(`Window count: ${windowCount}`)

      results['Window Manager'] = true
      console.log('✅ Window Manager: PASS')
    } catch (error) {
      results['Window Manager'] = false
      console.error('❌ Window Manager: FAIL', error)
    }

    // Test 4: Auto Launch
    console.log('\nTesting Auto Launch...')
    try {
      const loginSettings = app.getLoginItemSettings()
      console.log(`Auto launch enabled: ${loginSettings.openAtLogin}`)
      results['Auto Launch'] = true
      console.log('✅ Auto Launch: PASS')
    } catch (error) {
      results['Auto Launch'] = false
      console.error('❌ Auto Launch: FAIL', error)
    }

    // Test 5: System Info
    console.log('\nTesting System Info...')
    try {
      const info = {
        platform: process.platform,
        arch: process.arch,
        version: app.getVersion(),
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        chromiumVersion: process.versions.chrome,
      }
      console.log('System Info:', JSON.stringify(info, null, 2))
      results['System Info'] = true
      console.log('✅ System Info: PASS')
    } catch (error) {
      results['System Info'] = false
      console.error('❌ System Info: FAIL', error)
    }

    // Summary
    console.log('\n=== Test Results Summary ===\n')
    const passed = Object.values(results).filter(Boolean).length
    const total = Object.keys(results).length

    Object.entries(results).forEach(([name, pass]) => {
      console.log(`${pass ? '✅' : '❌'} ${name}`)
    })

    console.log(`\nPassed: ${passed}/${total}`)

    if (passed === total) {
      console.log('\n🎉 All tests passed!\n')
    } else {
      console.log(`\n⚠️  ${total - passed} test(s) failed\n`)
    }

    // Cleanup
    testWindow.close()

    return results
  } catch (error) {
    console.error('Test suite error:', error)
    return results
  }
}

// Run tests if executed directly
if (require.main === module) {
  app.whenReady().then(() => {
    testDesktopFeatures().then(() => {
      console.log('Tests completed')
      app.quit()
    })
  })
}
