/**
 * VirtualizedTaskList - High-performance task list with virtual scrolling
 * Supports 1000+ tasks without performance degradation
 */

import React, { useMemo } from 'react'
import { List } from 'react-window'
import { TaskListItem } from './TaskListItem'
import type { Task } from '../types/task'
import { useTaskStore } from '../stores/taskStore'
import { useChatStore } from '../store/useChatStore'
import { useTaskAutoExecution } from '../hooks/useTaskAutoExecution'

interface VirtualizedTaskListProps {
  tasks: Task[]
  height: number
  onTaskChat: (task: Task) => void
  onTaskDetail: (taskId: string) => void
}

const ITEM_HEIGHT = 180 // Approximate height of each task card
const GAP = 12 // Gap between items

export const VirtualizedTaskList: React.FC<VirtualizedTaskListProps> = ({
  tasks,
  height,
  onTaskChat,
  onTaskDetail
}) => {
  const { selectedTask, setSelectedTask } = useTaskStore()
  const { getUnreadCount } = useChatStore()
  const { executeTask, cancelExecution } = useTaskAutoExecution()

  // Memoize row renderer for performance
  const Row = useMemo(
    () =>
      ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const task = tasks[index]
        if (!task) return null

        return (
          <TaskListItem
            task={task}
            isSelected={selectedTask?.id === task.id}
            onSelect={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
            onChat={() => onTaskChat(task)}
            onViewDetail={() => onTaskDetail(task.id)}
            onExecute={
              task.autoExecution && task.status === 'pending'
                ? () => executeTask(task.id)
                : undefined
            }
            onCancel={
              task.status === 'in_progress' ? () => cancelExecution(task.id) : undefined
            }
            unreadCount={getUnreadCount(task.id)}
            style={{
              ...style,
              top: (style.top as number) + GAP,
              height: (style.height as number) - GAP
            }}
          />
        )
      },
    [tasks, selectedTask, onTaskChat, onTaskDetail, getUnreadCount, setSelectedTask, executeTask, cancelExecution]
  )

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/60">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-lg">暂无任务</div>
        </div>
      </div>
    )
  }

  return (
    <List
      height={height}
      itemCount={tasks.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
      className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
    >
      {Row}
    </List>
  )
}
