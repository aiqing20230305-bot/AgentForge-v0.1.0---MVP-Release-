# AgentForge Plugin Development Guide

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Plugin Architecture](#plugin-architecture)
- [Manifest Specification](#manifest-specification)
- [Plugin API](#plugin-api)
- [Permissions System](#permissions-system)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Debugging](#debugging)
- [Publishing](#publishing)

## Introduction

AgentForge plugins extend the platform's capabilities by adding new features, integrations, and workflows. This guide covers everything you need to know to build, test, and publish plugins.

### What Can Plugins Do?

- Add new integrations (GitHub, Slack, etc.)
- Enhance Agent capabilities
- Add custom UI components
- Automate workflows
- Extend data analysis features
- Integrate with external services

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- TypeScript knowledge
- AgentForge 1.4.0+
- Code editor (VS Code recommended)

### Quick Start

```bash
# Install the plugin CLI
npm install -g @agentforge/plugin-cli

# Create a new plugin
agentforge-plugin create my-awesome-plugin

# Navigate to the plugin directory
cd my-awesome-plugin

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
my-plugin/
├── src/
│   ├── index.ts          # Main entry point
│   ├── api.ts            # API integrations
│   └── components/       # UI components (optional)
├── manifest.json         # Plugin metadata
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── README.md             # Documentation
└── examples/             # Usage examples
```

## Plugin Architecture

### Entry Point

Every plugin must export `activate` and `deactivate` functions:

```typescript
// src/index.ts
export async function activate(context: PluginContext) {
  console.log('Plugin activated!')

  // Register commands
  context.registerCommand('my-plugin.hello', () => {
    context.notifications.show('Hello from My Plugin!', 'info')
  })

  // Add UI components
  context.ui.registerPanel({
    id: 'my-panel',
    title: 'My Panel',
    icon: 'star',
    render: () => '<div>My Custom Panel</div>'
  })

  // Listen to events
  context.events.on('task.completed', (task) => {
    console.log('Task completed:', task.id)
  })
}

export async function deactivate() {
  console.log('Plugin deactivated!')
  // Clean up resources
}
```

### Plugin Context

The `PluginContext` object provides access to AgentForge APIs:

```typescript
interface PluginContext {
  // Plugin metadata
  manifest: PluginManifest

  // Storage API
  storage: StorageAPI

  // Notifications API
  notifications: NotificationsAPI

  // Events API
  events: EventsAPI

  // UI API
  ui: UIAPI

  // Network API (requires 'network' permission)
  network: NetworkAPI

  // Agent API (requires 'agents' permission)
  agents: AgentAPI

  // Task API (requires 'tasks' permission)
  tasks: TaskAPI

  // Commands API
  registerCommand: (id: string, handler: Function) => void

  // Utility functions
  utils: UtilsAPI
}
```

## Manifest Specification

The `manifest.json` file defines plugin metadata:

```json
{
  "id": "my-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "A plugin that does awesome things",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "homepage": "https://github.com/you/my-plugin",
  "repository": "https://github.com/you/my-plugin",
  "main": "dist/index.js",
  "icon": "assets/icon.png",
  "keywords": ["integration", "automation", "workflow"],
  "category": "integration",
  "dependencies": {
    "axios": "^1.0.0"
  },
  "permissions": [
    "storage",
    "network",
    "notifications",
    "agents",
    "tasks"
  ],
  "minVersion": "1.4.0",
  "maxVersion": "2.0.0",
  "compatibility": {
    "platforms": ["web", "desktop"]
  }
}
```

### Required Fields

- `id`: Unique identifier (lowercase, alphanumeric, hyphens)
- `name`: Display name (3-100 characters)
- `version`: Semantic version (e.g., 1.2.3)
- `description`: Short description (10-500 characters)
- `author`: Author name and email
- `license`: License type (MIT, Apache-2.0, etc.)
- `main`: Entry point file path
- `permissions`: Array of required permissions
- `minVersion`: Minimum AgentForge version

### Optional Fields

- `longDescription`: Detailed description (Markdown supported)
- `homepage`: Plugin homepage URL
- `repository`: Source code repository URL
- `icon`: Icon file path (PNG, 256x256px recommended)
- `keywords`: Search keywords
- `category`: Plugin category
- `dependencies`: npm dependencies
- `maxVersion`: Maximum AgentForge version
- `compatibility`: Platform compatibility

## Plugin API

### Storage API

Store and retrieve plugin data:

```typescript
// Save data
await context.storage.set('config', { apiKey: 'xxx' })

// Retrieve data
const config = await context.storage.get('config')

// Remove data
await context.storage.remove('config')

// Clear all plugin data
await context.storage.clear()

// Check if key exists
const exists = await context.storage.has('config')

// Get all keys
const keys = await context.storage.keys()
```

### Notifications API

Show notifications to users:

```typescript
// Info notification
context.notifications.show('Operation completed', 'info')

// Success notification
context.notifications.show('Saved successfully!', 'success')

// Warning notification
context.notifications.show('Please check your settings', 'warning')

// Error notification
context.notifications.show('Failed to connect', 'error')

// Custom notification with action
context.notifications.show('New update available', 'info', {
  actions: [
    { label: 'Update', onClick: () => updatePlugin() },
    { label: 'Dismiss', onClick: () => {} }
  ]
})
```

### Events API

Listen to AgentForge events:

```typescript
// Task events
context.events.on('task.created', (task) => {})
context.events.on('task.updated', (task) => {})
context.events.on('task.completed', (task) => {})
context.events.on('task.failed', (task) => {})

// Agent events
context.events.on('agent.created', (agent) => {})
context.events.on('agent.updated', (agent) => {})
context.events.on('agent.deleted', (agent) => {})

// Team events
context.events.on('team.created', (team) => {})
context.events.on('team.memberAdded', (data) => {})

// Plugin events
context.events.on('plugin.installed', (plugin) => {})
context.events.on('plugin.enabled', (plugin) => {})

// Emit custom events
context.events.emit('my-plugin.customEvent', { data: 'value' })
```

### Network API

Make HTTP requests (requires `network` permission):

```typescript
// GET request
const response = await context.network.get('https://api.example.com/data')

// POST request
const result = await context.network.post('https://api.example.com/create', {
  name: 'Example'
})

// PUT request
await context.network.put('https://api.example.com/update/123', {
  status: 'active'
})

// DELETE request
await context.network.delete('https://api.example.com/delete/123')

// Custom request with headers
const response = await context.network.request({
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  timeout: 5000
})
```

### Agent API

Access and manage agents (requires `agents` permission):

```typescript
// Get all agents
const agents = await context.agents.getAll()

// Get agent by ID
const agent = await context.agents.get('agent-id')

// Create agent
const newAgent = await context.agents.create({
  name: 'My Agent',
  type: 'code',
  config: {}
})

// Update agent
await context.agents.update('agent-id', {
  status: 'active'
})

// Delete agent
await context.agents.delete('agent-id')

// Execute agent task
const result = await context.agents.execute('agent-id', {
  prompt: 'Analyze this code',
  context: { code: '...' }
})
```

### Task API

Manage tasks (requires `tasks` permission):

```typescript
// Get all tasks
const tasks = await context.tasks.getAll()

// Get task by ID
const task = await context.tasks.get('task-id')

// Create task
const newTask = await context.tasks.create({
  agentId: 'agent-id',
  title: 'Process data',
  priority: 'high'
})

// Update task
await context.tasks.update('task-id', {
  status: 'completed',
  result: 'Success'
})

// Delete task
await context.tasks.delete('task-id')
```

### UI API

Add custom UI components (requires `ui` permission):

```typescript
// Register sidebar panel
context.ui.registerPanel({
  id: 'my-panel',
  title: 'My Panel',
  icon: 'star',
  position: 'left',
  render: () => '<div>Panel content</div>'
})

// Register toolbar button
context.ui.registerButton({
  id: 'my-button',
  label: 'My Action',
  icon: 'play',
  onClick: () => executeAction()
})

// Show modal dialog
const result = await context.ui.showModal({
  title: 'Confirm Action',
  content: 'Are you sure?',
  buttons: [
    { label: 'Yes', value: true, variant: 'primary' },
    { label: 'No', value: false, variant: 'secondary' }
  ]
})

// Show input dialog
const value = await context.ui.showInput({
  title: 'Enter API Key',
  placeholder: 'Your API key',
  type: 'password'
})
```

## Permissions System

Plugins must declare required permissions in `manifest.json`:

### Available Permissions

| Permission | Description | Required For |
|-----------|-------------|--------------|
| `storage` | Access plugin storage | Saving settings, cache |
| `network` | Make HTTP requests | API integrations |
| `notifications` | Show notifications | User alerts |
| `agents` | Access agent data | Agent management |
| `tasks` | Access task data | Task automation |
| `ui` | Modify UI | Custom panels, buttons |
| `filesystem` | Access files | File operations (desktop only) |
| `clipboard` | Access clipboard | Copy/paste operations |

### Permission Best Practices

1. Request only necessary permissions
2. Explain why permissions are needed in documentation
3. Handle permission denials gracefully
4. Use minimal permissions for security

## Lifecycle Hooks

### Activation

Called when plugin is enabled:

```typescript
export async function activate(context: PluginContext) {
  // Initialize plugin
  await loadConfig()
  registerCommands(context)
  startBackgroundTasks()

  // Return cleanup function (optional)
  return () => {
    stopBackgroundTasks()
  }
}
```

### Deactivation

Called when plugin is disabled:

```typescript
export async function deactivate() {
  // Clean up resources
  stopBackgroundTasks()
  closeConnections()
  saveState()
}
```

### Update

Handle plugin updates:

```typescript
export async function onUpdate(oldVersion: string, newVersion: string) {
  console.log(`Updated from ${oldVersion} to ${newVersion}`)

  // Migrate data if needed
  if (oldVersion === '1.0.0' && newVersion === '2.0.0') {
    await migrateData()
  }
}
```

## Best Practices

### Performance

- Lazy load heavy dependencies
- Use async/await for non-blocking operations
- Cache API responses
- Debounce event handlers
- Minimize bundle size

```typescript
// Good: Lazy loading
const heavyLib = async () => {
  const lib = await import('heavy-library')
  return lib.default
}

// Good: Caching
const cache = new Map()
async function fetchData(key: string) {
  if (cache.has(key)) return cache.get(key)
  const data = await api.get(key)
  cache.set(key, data)
  return data
}

// Good: Debouncing
import { debounce } from 'lodash'
const handleInput = debounce((value) => {
  processInput(value)
}, 300)
```

### Security

- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS for API calls
- Store sensitive data securely
- Avoid eval() and innerHTML

```typescript
// Bad: Security risk
const html = `<div>${userInput}</div>`
element.innerHTML = html

// Good: Safe rendering
import DOMPurify from 'dompurify'
const safeHtml = DOMPurify.sanitize(userInput)
element.innerHTML = safeHtml
```

### Error Handling

- Catch and handle errors gracefully
- Provide meaningful error messages
- Log errors for debugging
- Implement retry logic for network requests

```typescript
async function safeApiCall() {
  try {
    const response = await context.network.get('/api/data')
    return response.data
  } catch (error) {
    console.error('API call failed:', error)
    context.notifications.show(
      'Failed to fetch data. Please try again.',
      'error'
    )
    return null
  }
}
```

### User Experience

- Provide clear configuration UI
- Show loading states
- Handle offline scenarios
- Support keyboard shortcuts
- Follow AgentForge design guidelines

## Testing

### Unit Tests

```typescript
// tests/api.test.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchData } from '../src/api'

describe('API', () => {
  it('should fetch data successfully', async () => {
    const mockContext = {
      network: {
        get: vi.fn().mockResolvedValue({ data: { id: 1 } })
      }
    }

    const result = await fetchData(mockContext)
    expect(result).toEqual({ id: 1 })
  })
})
```

### Integration Tests

```typescript
// tests/integration.test.ts
import { describe, it, expect } from 'vitest'
import { activate, deactivate } from '../src/index'

describe('Plugin Integration', () => {
  it('should activate successfully', async () => {
    const context = createMockContext()
    await expect(activate(context)).resolves.not.toThrow()
  })

  it('should deactivate successfully', async () => {
    await expect(deactivate()).resolves.not.toThrow()
  })
})
```

### Run Tests

```bash
npm test
npm run test:coverage
```

## Debugging

### Development Mode

```bash
# Start with debugging enabled
PLUGIN_DEBUG=true npm run dev
```

### Debug Logging

```typescript
export async function activate(context: PluginContext) {
  const debug = context.utils.createDebugLogger('my-plugin')

  debug('Plugin activated')
  debug('Config:', await context.storage.get('config'))

  context.events.on('task.created', (task) => {
    debug('Task created:', task.id)
  })
}
```

### Chrome DevTools

For web plugins, use browser DevTools:
1. Open AgentForge in browser
2. Press F12 to open DevTools
3. Go to Sources tab
4. Find your plugin in the file tree
5. Set breakpoints and debug

## Publishing

### 1. Prepare for Release

```bash
# Build plugin
npm run build

# Run tests
npm test

# Generate package
npm run package
```

### 2. Submit to Marketplace

```bash
# Login to AgentForge
agentforge-plugin login

# Publish plugin
agentforge-plugin publish
```

### 3. Review Process

Your plugin will go through:
1. Automated security scan
2. Code review
3. Manual testing
4. Approval/Rejection

### 4. Update Plugin

```bash
# Update version in manifest.json
# Commit changes
# Build and publish
npm version patch
npm run build
agentforge-plugin publish
```

## Examples

### Example 1: GitHub Integration

```typescript
export async function activate(context: PluginContext) {
  const github = createGitHubClient(context)

  // Register command
  context.registerCommand('github.createIssue', async () => {
    const title = await context.ui.showInput({
      title: 'Issue Title',
      placeholder: 'Enter issue title'
    })

    if (title) {
      await github.createIssue({ title })
      context.notifications.show('Issue created!', 'success')
    }
  })

  // Listen to task events
  context.events.on('task.completed', async (task) => {
    // Auto-create GitHub issue for failed tasks
    if (task.status === 'failed') {
      await github.createIssue({
        title: `Task Failed: ${task.title}`,
        body: task.errorMessage
      })
    }
  })
}
```

### Example 2: Analytics Dashboard

```typescript
export async function activate(context: PluginContext) {
  // Register custom panel
  context.ui.registerPanel({
    id: 'analytics-dashboard',
    title: 'Analytics',
    icon: 'chart-bar',
    render: () => {
      const tasks = await context.tasks.getAll()
      const stats = calculateStats(tasks)

      return `
        <div class="analytics-panel">
          <h2>Task Analytics</h2>
          <div class="stats">
            <div>Total: ${stats.total}</div>
            <div>Completed: ${stats.completed}</div>
            <div>Success Rate: ${stats.successRate}%</div>
          </div>
          <canvas id="chart"></canvas>
        </div>
      `
    }
  })
}
```

## Resources

- [API Reference](https://docs.agentforge.dev/api)
- [Plugin Examples](https://github.com/agentforge/plugin-examples)
- [Community Forum](https://community.agentforge.dev)
- [Discord Server](https://discord.gg/agentforge)

## Support

- Documentation: https://docs.agentforge.dev
- GitHub Issues: https://github.com/agentforge/plugins/issues
- Email: plugins@agentforge.dev
- Discord: https://discord.gg/agentforge

---

Built with ❤️ by the AgentForge community
