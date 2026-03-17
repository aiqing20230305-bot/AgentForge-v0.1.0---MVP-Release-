/**
 * Global Socket Event Handler
 * Handles real-time WebSocket events and updates UI accordingly
 */

import { useEffect } from 'react'
import { useSocketContext } from '../contexts/SocketContext'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { useTaskStore } from '../stores/taskStore'
import { notificationService } from '../services/notificationService'

export const GlobalSocketEventHandler = () => {
  const { socket, isConnected } = useSocketContext()
  const { agentsCache, updateAgentsCache } = useDataSourceStore()
  const { tasks, updateTask } = useTaskStore()

  useEffect(() => {
    if (!socket || !isConnected) return

    console.log('🔌 Setting up global socket event handlers')

    // Agent Level Up Event
    const handleAgentLevelUp = (data: { agentId: string; newLevel: number; timestamp: Date }) => {
      console.log('🎉 Agent level up received:', data)

      // Find agent by cloudId
      const agent = agentsCache.find(a => a.metadata?.cloudId === data.agentId)
      if (agent) {
        // Update agent level
        const updatedAgents = agentsCache.map(a => {
          if (a.id === agent.id) {
            return {
              ...a,
              level: data.newLevel,
              levelSystem: a.levelSystem
                ? {
                    ...a.levelSystem,
                    currentLevel: data.newLevel
                  }
                : undefined
            }
          }
          return a
        })
        updateAgentsCache(updatedAgents)

        // Show notification
        notificationService.show({
          type: 'level_up',
          title: `${agent.name} 升级了！`,
          message: `恭喜！${agent.name} 达到了 Lv.${data.newLevel}`,
          agentId: agent.id
        })
      }
    }

    // Agent Status Change Event
    const handleAgentStatus = (data: { agentId: string; status: string; timestamp: Date }) => {
      console.log('📊 Agent status changed:', data)

      const agent = agentsCache.find(a => a.metadata?.cloudId === data.agentId)
      if (agent) {
        const updatedAgents = agentsCache.map(a =>
          a.id === agent.id
            ? {
                ...a,
                status: data.status as any
              }
            : a
        )
        updateAgentsCache(updatedAgents)
      }
    }

    // Task Updated Event
    const handleTaskUpdated = (data: { taskId: string; updates: any; updatedBy: string; timestamp: Date }) => {
      console.log('🔄 Task updated:', data)

      // Find task by cloudId
      const task = tasks.find(t => t.cloudId === data.taskId)
      if (task) {
        updateTask(task.id, {
          ...task,
          ...data.updates,
          updatedAt: new Date(data.timestamp).toISOString()
        })
      }
    }

    // Task Completed Event
    const handleTaskCompleted = (data: { taskId: string; result: string; completedBy: string; timestamp: Date }) => {
      console.log('✅ Task completed:', data)

      const task = tasks.find(t => t.cloudId === data.taskId)
      if (task) {
        updateTask(task.id, {
          ...task,
          status: 'completed',
          completedAt: new Date(data.timestamp).toISOString(),
          result: data.result
        })

        // Show notification
        notificationService.show({
          type: 'task_complete',
          title: '任务完成',
          message: `"${task.title}" 已完成`,
          taskId: task.id
        })
      }
    }

    // Task Created Event (from other devices/users)
    const handleTaskCreated = (data: { task: any; createdBy: string; timestamp: Date }) => {
      console.log('✨ Task created:', data)
      // Add the task to local store for immediate visibility
      if (data.task) {
        const taskStore = useTaskStore.getState()
        taskStore.addTask(data.task)
      }
    }

    // Register event handlers
    socket.on({
      onAgentLevelUp: handleAgentLevelUp,
      onAgentStatus: handleAgentStatus,
      onTaskUpdated: handleTaskUpdated,
      onTaskCompleted: handleTaskCompleted,
      onTaskCreated: handleTaskCreated,
      onConnect: () => {
        console.log('✅ Socket connected - event handlers active')
      },
      onDisconnect: () => {
        console.log('❌ Socket disconnected - event handlers inactive')
      },
      onError: (error) => {
        console.error('❌ Socket error:', error)
      }
    })

    // Note: The socketClient's on() method merges callbacks, so no cleanup needed
    // But for clarity, we could add cleanup if the implementation changes

    return () => {
      // Cleanup if needed in the future
      console.log('🔌 Cleaning up global socket event handlers')
    }
  }, [socket, isConnected, agentsCache, tasks, updateAgentsCache, updateTask])

  // This component doesn't render anything
  return null
}
