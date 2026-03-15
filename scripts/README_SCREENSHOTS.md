# Screenshot Automation Guide

This guide explains how to use the automated screenshot system for AgentForge releases.

## Quick Start

```bash
# 1. Install Playwright (if not already installed)
npm install -D playwright
npx playwright install chromium

# 2. Start the development server in the background
npm run dev &

# 3. Wait for server to start (about 15 seconds)
sleep 15

# 4. Run the screenshot script
node scripts/take-screenshots.mjs

# 5. Stop the dev server (optional)
# Press Ctrl+C or: killall node
```

## One-Line Command

```bash
npm run dev & sleep 15 && node scripts/take-screenshots.mjs
```

## Output

Screenshots are saved to: `screenshots/v1.1.0/`

### Generated Screenshots:
1. `01-main-dashboard.png` - Main dashboard with task management
2. `02-vitality-dashboard.png` - Agent vitality dashboard
3. `03-evolution-timeline.png` - Evolution timeline
4. `04-heartbeat-monitor.png` - Heartbeat monitoring
5. `05-settings-panel.png` - Settings with cloud sync
6. `06-task-list-view.png` - Virtualized task list
7. `07-agent-display.png` - Agent display panel

## Configuration

Edit `scripts/take-screenshots.mjs` to customize:
- Screenshot list and paths
- Viewport size (default: 1920x1080)
- Wait times
- Custom actions (clicks, scrolls, etc.)

## Troubleshooting

### Server not running
```
❌ Failed to load app. Make sure dev server is running on port 5173
```
**Solution:** Start dev server: `npm run dev`

### Port in use
```
❌ Port 5173 is already in use
```
**Solution:** Kill existing process: `killall node` or `lsof -ti:5173 | xargs kill`

### Screenshots are blank
**Solution:** Increase wait times in the script configuration

### Playwright not installed
```
❌ Cannot find module 'playwright'
```
**Solution:** Install Playwright: `npm install -D playwright && npx playwright install chromium`

## Manual Screenshot Taking

If automation fails, take screenshots manually:

1. Start dev server: `npm run dev`
2. Open browser: http://localhost:5173
3. Navigate to each feature
4. Use browser screenshot tools or OS screenshot shortcuts:
   - macOS: `Cmd + Shift + 4`
   - Windows: `Win + Shift + S`
   - Linux: `Shift + Print Screen`

## Adding New Screenshots

Edit `scripts/take-screenshots.mjs` and add to the `screenshots` array:

```javascript
{
  name: '08-new-feature',
  action: async (page) => {
    // Custom navigation/interaction
    await page.click('.feature-button')
    await page.waitForTimeout(2000)
  },
  description: 'New feature description'
}
```

## Screenshot Best Practices

- **Resolution:** 1920x1080 (Full HD) for desktop, scale down if needed
- **Retina:** Script uses 2x device scale factor for crisp images
- **Timing:** Allow UI animations to complete before capturing
- **Content:** Show features in action, not empty states
- **Consistency:** Use same viewport size for all screenshots
- **File size:** Optimize with tools like ImageOptim or TinyPNG before release

## Post-Processing (Optional)

After taking screenshots, you may want to:

1. **Resize for web:**
   ```bash
   # Using ImageMagick
   mogrify -resize 1280x720 screenshots/v1.1.0/*.png
   ```

2. **Optimize file size:**
   ```bash
   # Using pngquant
   pngquant --quality=80-90 screenshots/v1.1.0/*.png
   ```

3. **Add annotations:**
   Use tools like Figma, Sketch, or Photoshop to highlight features

## Release Checklist

- [ ] All screenshots generated successfully
- [ ] Images are clear and show key features
- [ ] File names match README references
- [ ] Screenshots added to git
- [ ] README.md updated with correct paths
- [ ] Release notes include screenshot references
- [ ] Screenshots optimized for web (file size < 500KB each)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Playwright documentation: https://playwright.dev
3. Open an issue on GitHub
