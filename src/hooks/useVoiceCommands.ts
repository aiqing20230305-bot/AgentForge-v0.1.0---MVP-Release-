/**
 * Voice Commands Hook
 * 集成语音命令到应用逻辑
 */

import { useEffect } from 'react'
import { voiceService } from '../services/voiceService'
import { useTaskStore } from '../stores/taskStore'
import { audioSystem } from '../services/audioSystem'

interface VoiceCommandsOptions {
  onCreateTask?: () => void
  onPauseAll?: () => void
  onShowStats?: () => void
  onOpenSettings?: () => void
  onShowTasks?: () => void
}

/**
 * 使用语音命令
 */
export function useVoiceCommands(options: VoiceCommandsOptions = {}) {
  const taskStore = useTaskStore()

  useEffect(() => {
    // 注册：创建任务
    voiceService.registerCommand({
      command: '创建任务',
      patterns: [
        /创建任务/i,
        /新建任务/i,
        /添加任务/i,
        /create task/i,
        /new task/i,
        /add task/i
      ],
      handler: () => {
        console.log('[VoiceCommand] Create task')
        if (options.onCreateTask) {
          options.onCreateTask()
        }
        audioSystem.play('success')
      },
      description: '创建新任务'
    })

    // 注册：暂停所有
    voiceService.registerCommand({
      command: '暂停所有',
      patterns: [
        /暂停所有/i,
        /停止所有/i,
        /全部暂停/i,
        /pause all/i,
        /stop all/i
      ],
      handler: () => {
        console.log('[VoiceCommand] Pause all')

        // 获取所有进行中的任务
        const tasks = taskStore.tasks.filter(t => t.status === 'in_progress')

        // 暂停所有任务
        tasks.forEach(task => {
          taskStore.updateTask(task.id, { status: 'pending' })
        })

        voiceService.speak(`已暂停 ${tasks.length} 个任务`)
        audioSystem.play('success')

        if (options.onPauseAll) {
          options.onPauseAll()
        }
      },
      description: '暂停所有进行中的任务'
    })

    // 注册：显示统计
    voiceService.registerCommand({
      command: '显示统计',
      patterns: [
        /显示统计/i,
        /查看统计/i,
        /统计数据/i,
        /show stats/i,
        /view stats/i,
        /statistics/i
      ],
      handler: () => {
        console.log('[VoiceCommand] Show stats')

        const stats = taskStore.getTaskStats()
        voiceService.notifyStats({
          total: stats.total,
          completed: stats.completed,
          pending: stats.pending
        })
        audioSystem.play('success')

        if (options.onShowStats) {
          options.onShowStats()
        }
      },
      description: '播报任务统计数据'
    })

    // 注册：打开设置
    voiceService.registerCommand({
      command: '打开设置',
      patterns: [
        /打开设置/i,
        /设置/i,
        /配置/i,
        /open settings/i,
        /settings/i
      ],
      handler: () => {
        console.log('[VoiceCommand] Open settings')
        if (options.onOpenSettings) {
          options.onOpenSettings()
        }
        audioSystem.play('success')
      },
      description: '打开设置面板'
    })

    // 注册：查看任务
    voiceService.registerCommand({
      command: '查看任务',
      patterns: [
        /查看任务/i,
        /显示任务/i,
        /任务列表/i,
        /view tasks/i,
        /show tasks/i,
        /task list/i
      ],
      handler: () => {
        console.log('[VoiceCommand] View tasks')

        const tasks = taskStore.getFilteredTasks()
        const pendingCount = tasks.filter(t => t.status === 'pending').length
        const inProgressCount = tasks.filter(t => t.status === 'in_progress').length

        voiceService.speak(`共 ${tasks.length} 个任务，${inProgressCount} 个进行中，${pendingCount} 个待处理`)
        audioSystem.play('success')

        if (options.onShowTasks) {
          options.onShowTasks()
        }
      },
      description: '查看任务列表'
    })

    // 注册：开始任务
    voiceService.registerCommand({
      command: '开始任务',
      patterns: [
        /开始任务/i,
        /启动任务/i,
        /start task/i,
        /begin task/i
      ],
      handler: () => {
        console.log('[VoiceCommand] Start task')

        // 找到第一个待处理的任务
        const pendingTask = taskStore.tasks.find(t => t.status === 'pending')

        if (pendingTask) {
          taskStore.updateTask(pendingTask.id, {
            status: 'in_progress',
            startedAt: new Date().toISOString()
          })
          voiceService.speak(`已开始任务：${pendingTask.title}`)
          audioSystem.play('success')
        } else {
          voiceService.speak('没有待处理的任务')
          audioSystem.play('error')
        }
      },
      description: '开始第一个待处理任务'
    })

    // 注册：完成任务
    voiceService.registerCommand({
      command: '完成任务',
      patterns: [
        /完成任务/i,
        /任务完成/i,
        /complete task/i,
        /finish task/i,
        /done/i
      ],
      handler: () => {
        console.log('[VoiceCommand] Complete task')

        // 找到第一个进行中的任务
        const activeTask = taskStore.tasks.find(t => t.status === 'in_progress')

        if (activeTask) {
          taskStore.updateTask(activeTask.id, {
            status: 'completed',
            completedAt: new Date().toISOString()
          })
          voiceService.notifyTaskComplete(activeTask.title)
          audioSystem.playQuestCompleteSequence()
        } else {
          voiceService.speak('没有进行中的任务')
          audioSystem.play('error')
        }
      },
      description: '完成当前任务'
    })

    console.log('[VoiceCommands] Registered', voiceService.getRegisteredCommands().length, 'commands')

    // 清理
    return () => {
      voiceService.unregisterCommand('创建任务')
      voiceService.unregisterCommand('暂停所有')
      voiceService.unregisterCommand('显示统计')
      voiceService.unregisterCommand('打开设置')
      voiceService.unregisterCommand('查看任务')
      voiceService.unregisterCommand('开始任务')
      voiceService.unregisterCommand('完成任务')
    }
  }, [taskStore, options])

  return {
    isListening: voiceService.isCurrentlyListening(),
    startListening: () => voiceService.startListening(),
    stopListening: () => voiceService.stopListening(),
    testVoice: () => voiceService.testVoice()
  }
}
