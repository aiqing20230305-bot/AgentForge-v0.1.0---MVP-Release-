/**
 * Mobile Optimization Showcase Component
 * 展示移动端优化功能
 *
 * Task #75: Mobile Experience Optimization
 */

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone,
  Touch,
  Maximize2,
  Trash2,
  Archive,
  Star,
  RefreshCw,
  CheckCircle,
  Zap
} from 'lucide-react'
import { useBreakpoint, useScreenSize, useTouchGestures } from '../hooks'
import {
  MobileBottomTabBar,
  SwipeableItem,
  MobileOptimizedLayout,
  MobileCard,
  MobileSection,
  TouchOptimizedButton,
  TouchOptimizedIconButton,
  TouchOptimizedChip,
  TouchOptimizedToggle,
  SWIPE_ACTIONS,
  type TabItem
} from './mobile'

export const MobileOptimizationShowcase: React.FC = () => {
  const isMobile = useBreakpoint('mobile')
  const screenSize = useScreenSize()
  const [activeTab, setActiveTab] = useState('demo')
  const [isToggled, setIsToggled] = useState(false)
  const [pinchScale, setPinchScale] = useState(1)
  const gestureRef = useRef<HTMLDivElement>(null)

  // Touch gestures demo
  useTouchGestures(gestureRef, {
    onSwipe: (direction) => {
      console.log('Swipe detected:', direction)
      alert(`Swiped ${direction.direction}!`)
    },
    onLongPress: (position) => {
      console.log('Long press at:', position)
      alert('Long press detected!')
    },
    onDoubleTap: (position) => {
      console.log('Double tap at:', position)
      alert('Double tap detected!')
    },
    onPinch: (state) => {
      setPinchScale(state.scale)
    }
  })

  const tabs: TabItem[] = [
    { id: 'demo', label: '演示', icon: Smartphone },
    { id: 'gestures', label: '手势', icon: Touch },
    { id: 'components', label: '组件', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <MobileSection
        title="📱 移动端优化展示"
        subtitle="Task #75: Touch Gesture Support & Mobile UX"
      >
        {/* Device Info */}
        <MobileCard
          title="设备信息"
          icon={<Smartphone className="w-6 h-6 text-cyan-400" />}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">设备类型:</span>
              <span className="font-medium">{isMobile ? '移动设备' : '桌面设备'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">屏幕尺寸:</span>
              <span className="font-medium">{screenSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">触摸目标:</span>
              <span className="font-medium">48x48px (WCAG AA)</span>
            </div>
          </div>
        </MobileCard>

        {/* Touch Gestures Demo */}
        <MobileSection title="✋ 触摸手势演示" className="mt-6">
          <div
            ref={gestureRef}
            className="relative bg-gradient-to-br from-cyan-500/20 to-purple-500/20
                     border-2 border-cyan-500/50 rounded-xl p-8 text-center
                     min-h-[200px] flex flex-col items-center justify-center"
            style={{ transform: `scale(${pinchScale})`, transition: 'transform 0.1s' }}
          >
            <Touch className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">触摸测试区域</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>👆 单击滑动 - 左/右/上/下</p>
              <p>👆👆 双击 - 快速点击两次</p>
              <p>👆⏱ 长按 - 按住500ms</p>
              <p>👆👆 捏合 - 双指缩放</p>
            </div>
            {pinchScale !== 1 && (
              <div className="mt-4 text-cyan-400 font-bold">
                缩放: {(pinchScale * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </MobileSection>

        {/* Swipeable Items */}
        <MobileSection title="👈 滑动删除" className="mt-6">
          <div className="space-y-2">
            <SwipeableItem
              rightActions={[
                {
                  ...SWIPE_ACTIONS.delete,
                  onClick: () => alert('删除操作')
                }
              ]}
            >
              <div className="p-4 bg-gray-800 flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <div>
                  <h4 className="font-medium">向左滑动删除</h4>
                  <p className="text-xs text-gray-400">iOS 风格滑动操作</p>
                </div>
              </div>
            </SwipeableItem>

            <SwipeableItem
              leftActions={[
                {
                  ...SWIPE_ACTIONS.archive,
                  onClick: () => alert('归档操作')
                },
                {
                  ...SWIPE_ACTIONS.favorite,
                  onClick: () => alert('收藏操作')
                }
              ]}
            >
              <div className="p-4 bg-gray-800 flex items-center gap-3">
                <Archive className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="font-medium">向右滑动操作</h4>
                  <p className="text-xs text-gray-400">多个操作按钮</p>
                </div>
              </div>
            </SwipeableItem>
          </div>
        </MobileSection>

        {/* Touch Optimized Buttons */}
        <MobileSection title="🎯 触摸优化按钮" className="mt-6">
          <div className="space-y-3">
            <TouchOptimizedButton variant="primary" size="lg" icon={Zap} fullWidth>
              主要按钮 (48px 高度)
            </TouchOptimizedButton>

            <TouchOptimizedButton variant="secondary" size="md" icon={RefreshCw}>
              次要按钮
            </TouchOptimizedButton>

            <TouchOptimizedButton variant="danger" size="sm" icon={Trash2}>
              危险按钮
            </TouchOptimizedButton>

            <div className="flex gap-3">
              <TouchOptimizedIconButton
                icon={Star}
                variant="primary"
                size="md"
                badge={5}
                aria-label="收藏"
              />
              <TouchOptimizedIconButton
                icon={Archive}
                variant="secondary"
                size="md"
                aria-label="归档"
              />
              <TouchOptimizedIconButton
                icon={Trash2}
                variant="danger"
                size="md"
                aria-label="删除"
              />
            </div>
          </div>
        </MobileSection>

        {/* Touch Optimized Form Controls */}
        <MobileSection title="🎛 表单控件" className="mt-6">
          <div className="space-y-4">
            <TouchOptimizedToggle
              checked={isToggled}
              onChange={setIsToggled}
              label="启用功能"
              size="lg"
            />

            <div className="flex flex-wrap gap-2">
              <TouchOptimizedChip variant="primary" icon={Zap}>
                主要标签
              </TouchOptimizedChip>
              <TouchOptimizedChip variant="success" icon={CheckCircle}>
                成功标签
              </TouchOptimizedChip>
              <TouchOptimizedChip
                variant="warning"
                onRemove={() => alert('移除标签')}
              >
                可移除
              </TouchOptimizedChip>
            </div>
          </div>
        </MobileSection>

        {/* Responsive Design Info */}
        <MobileSection title="📐 响应式断点" className="mt-6">
          <MobileCard>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${screenSize === 'xs' ? 'bg-green-400' : 'bg-gray-600'}`} />
                <span>xs: &lt; 480px</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${screenSize === 'sm' ? 'bg-green-400' : 'bg-gray-600'}`} />
                <span>sm: 480px - 640px</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${screenSize === 'md' ? 'bg-green-400' : 'bg-gray-600'}`} />
                <span>md: 640px - 768px</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${screenSize === 'lg' ? 'bg-green-400' : 'bg-gray-600'}`} />
                <span>lg: 768px - 1024px</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${screenSize === 'xl' ? 'bg-green-400' : 'bg-gray-600'}`} />
                <span>xl: 1024px - 1280px</span>
              </div>
            </div>
          </MobileCard>
        </MobileSection>

        {/* Feature Checklist */}
        <MobileSection title="✅ 功能清单" className="mt-6">
          <MobileCard>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>响应式设计 (xs, sm, md, lg, xl)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>滑动删除手势</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>双击放大</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>长按菜单</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>捏合缩放</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>底部Tab导航</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>48x48px 触摸目标</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>iOS Safe Area 支持</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>下拉刷新</span>
              </li>
            </ul>
          </MobileCard>
        </MobileSection>

        {/* Spacer for bottom navigation */}
        {isMobile && <div className="h-20" />}
      </MobileSection>

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && (
        <MobileBottomTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  )
}
