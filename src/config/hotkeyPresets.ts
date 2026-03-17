/**
 * 快捷键预设方案
 * Hotkey Presets - VSCode, Vim, and Default styles
 */

import { HotkeyDefinition, HotkeyCategory } from '../services/hotkeyManager'

// 预设方案类型
export type PresetName = 'default' | 'vscode' | 'vim'

// 预设方案接口
export interface HotkeyPreset {
  name: PresetName
  displayName: string
  description: string
  hotkeys: Record<string, Omit<HotkeyDefinition, 'action'>>
}

// 默认快捷键方案
export const defaultPreset: HotkeyPreset = {
  name: 'default',
  displayName: 'Default',
  description: 'AgentForge default hotkeys',
  hotkeys: {
    'global-search': {
      key: 'cmd+k,ctrl+k',
      description: 'Open global search',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 10,
    },
    'create-agent': {
      key: 'cmd+n,ctrl+n',
      description: 'Create new agent',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 9,
    },
    'create-task': {
      key: 'cmd+t,ctrl+t',
      description: 'Create new task',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 9,
    },
    'save-settings': {
      key: 'cmd+s,ctrl+s',
      description: 'Save settings',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 8,
    },
    'open-settings': {
      key: 'cmd+,,ctrl+,',
      description: 'Open settings',
      category: HotkeyCategory.SYSTEM,
      enabled: true,
      priority: 7,
    },
    'show-hotkeys': {
      key: 'cmd+/,ctrl+/',
      description: 'Show hotkey help',
      category: HotkeyCategory.SYSTEM,
      enabled: true,
      priority: 10,
    },
    'close-modal': {
      key: 'esc',
      description: 'Close current modal/dialog',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 10,
    },
    'refresh-agents': {
      key: 'cmd+r,ctrl+r',
      description: 'Refresh agent list',
      category: HotkeyCategory.VIEW,
      enabled: true,
      priority: 6,
    },
    'toggle-theme': {
      key: 'cmd+shift+d,ctrl+shift+d',
      description: 'Toggle dark mode',
      category: HotkeyCategory.VIEW,
      enabled: true,
      priority: 5,
    },
    'focus-search': {
      key: 'cmd+f,ctrl+f',
      description: 'Focus search input',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 8,
    },
    'next-tab': {
      key: 'cmd+],ctrl+]',
      description: 'Next tab',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 6,
    },
    'prev-tab': {
      key: 'cmd+[,ctrl+[',
      description: 'Previous tab',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 6,
    },
    'select-all': {
      key: 'cmd+a,ctrl+a',
      description: 'Select all items',
      category: HotkeyCategory.EDITING,
      enabled: false, // 默认禁用，避免冲突
      priority: 4,
    },
    'undo': {
      key: 'cmd+z,ctrl+z',
      description: 'Undo last action',
      category: HotkeyCategory.EDITING,
      enabled: false, // 默认禁用
      priority: 7,
    },
    'redo': {
      key: 'cmd+shift+z,ctrl+shift+z',
      description: 'Redo last action',
      category: HotkeyCategory.EDITING,
      enabled: false, // 默认禁用
      priority: 7,
    },
  },
}

// VSCode 风格快捷键方案
export const vscodePreset: HotkeyPreset = {
  name: 'vscode',
  displayName: 'VSCode Style',
  description: 'Visual Studio Code inspired hotkeys',
  hotkeys: {
    'global-search': {
      key: 'cmd+p,ctrl+p',
      description: 'Quick open (Command Palette)',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 10,
    },
    'create-agent': {
      key: 'cmd+shift+n,ctrl+shift+n',
      description: 'New agent',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 9,
    },
    'create-task': {
      key: 'cmd+shift+t,ctrl+shift+t',
      description: 'New task',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 9,
    },
    'save-settings': {
      key: 'cmd+s,ctrl+s',
      description: 'Save',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 8,
    },
    'open-settings': {
      key: 'cmd+,,ctrl+,',
      description: 'Settings',
      category: HotkeyCategory.SYSTEM,
      enabled: true,
      priority: 7,
    },
    'show-hotkeys': {
      key: 'cmd+k cmd+s,ctrl+k ctrl+s',
      description: 'Keyboard shortcuts',
      category: HotkeyCategory.SYSTEM,
      enabled: true,
      priority: 10,
    },
    'close-modal': {
      key: 'esc',
      description: 'Close',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 10,
    },
    'refresh-agents': {
      key: 'cmd+r,ctrl+r',
      description: 'Reload',
      category: HotkeyCategory.VIEW,
      enabled: true,
      priority: 6,
    },
    'toggle-theme': {
      key: 'cmd+k cmd+t,ctrl+k ctrl+t',
      description: 'Change theme',
      category: HotkeyCategory.VIEW,
      enabled: true,
      priority: 5,
    },
    'focus-search': {
      key: 'cmd+shift+f,ctrl+shift+f',
      description: 'Search in files',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 8,
    },
    'next-tab': {
      key: 'cmd+option+right,ctrl+pagedown',
      description: 'Next editor',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 6,
    },
    'prev-tab': {
      key: 'cmd+option+left,ctrl+pageup',
      description: 'Previous editor',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 6,
    },
  },
}

// Vim 风格快捷键方案
export const vimPreset: HotkeyPreset = {
  name: 'vim',
  displayName: 'Vim Style',
  description: 'Vim-inspired hotkeys (limited)',
  hotkeys: {
    'global-search': {
      key: 'cmd+shift+p,ctrl+shift+p',
      description: 'Command mode',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 10,
    },
    'create-agent': {
      key: 'cmd+shift+a,ctrl+shift+a',
      description: 'Add agent',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 9,
    },
    'create-task': {
      key: 'cmd+shift+t,ctrl+shift+t',
      description: 'Add task',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 9,
    },
    'save-settings': {
      key: 'cmd+w,ctrl+w',
      description: 'Write (save)',
      category: HotkeyCategory.EDITING,
      enabled: true,
      priority: 8,
    },
    'open-settings': {
      key: 'cmd+shift+;,ctrl+shift+;',
      description: 'Command mode settings',
      category: HotkeyCategory.SYSTEM,
      enabled: true,
      priority: 7,
    },
    'show-hotkeys': {
      key: '?',
      description: 'Help',
      category: HotkeyCategory.SYSTEM,
      enabled: true,
      priority: 10,
    },
    'close-modal': {
      key: 'esc',
      description: 'Exit mode',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 10,
    },
    'refresh-agents': {
      key: 'cmd+shift+r,ctrl+shift+r',
      description: 'Reload',
      category: HotkeyCategory.VIEW,
      enabled: true,
      priority: 6,
    },
    'toggle-theme': {
      key: 'cmd+shift+d,ctrl+shift+d',
      description: 'Toggle dark',
      category: HotkeyCategory.VIEW,
      enabled: true,
      priority: 5,
    },
    'focus-search': {
      key: '/',
      description: 'Search forward',
      category: HotkeyCategory.NAVIGATION,
      enabled: true,
      priority: 8,
    },
    'next-tab': {
      key: 'cmd+gt,ctrl+gt',
      description: 'Go to next tab',
      category: HotkeyCategory.NAVIGATION,
      enabled: false, // gt 不太容易触发，默认禁用
      priority: 6,
    },
    'prev-tab': {
      key: 'cmd+gT,ctrl+gT',
      description: 'Go to previous tab',
      category: HotkeyCategory.NAVIGATION,
      enabled: false,
      priority: 6,
    },
  },
}

// 所有预设方案
export const allPresets: HotkeyPreset[] = [defaultPreset, vscodePreset, vimPreset]

// 根据名称获取预设方案
export function getPresetByName(name: PresetName): HotkeyPreset | undefined {
  return allPresets.find((preset) => preset.name === name)
}

// 获取当前使用的预设方案名称
export function getCurrentPresetName(): PresetName {
  const saved = localStorage.getItem('agentforge_hotkey_preset')
  return (saved as PresetName) || 'default'
}

// 保存预设方案选择
export function savePresetSelection(name: PresetName): void {
  localStorage.setItem('agentforge_hotkey_preset', name)
}
