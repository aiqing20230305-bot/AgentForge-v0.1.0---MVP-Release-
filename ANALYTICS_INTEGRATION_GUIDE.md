# Analytics Dashboard Integration Guide

## Quick Start

The Analytics Dashboard is ready to use! Here's how to integrate it into your application.

## Method 1: Add to Navigation Tabs

If you have a tab-based navigation system (like the existing MainNavigationTabs):

```tsx
import { AnalyticsDashboard } from './components/AnalyticsDashboard'

// In your main component or routing
<MainNavigationTabs>
  <Tab name="Dashboard">
    <AnalyticsDashboard />
  </Tab>
  {/* ... other tabs */}
</MainNavigationTabs>
```

## Method 2: Add as a Route

If using React Router or similar:

```tsx
import { AnalyticsDashboard } from './components/AnalyticsDashboard'

<Route path="/analytics" element={<AnalyticsDashboard />} />
```

## Method 3: Add to Existing Panel

If you want to add it to an existing container:

```tsx
import { AnalyticsDashboard } from './components/AnalyticsDashboard'

function App() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
```

## Important: Container Requirements

The AnalyticsDashboard needs a container with:
- **Fixed height** (h-screen, h-full, or specific pixel height)
- **Overflow handling** (the dashboard handles its own internal scrolling)

### Good Examples:
```tsx
// Full screen
<div className="h-screen">
  <AnalyticsDashboard />
</div>

// Within a flex container
<div className="flex-1 overflow-hidden">
  <AnalyticsDashboard />
</div>

// Fixed height
<div className="h-[800px]">
  <AnalyticsDashboard />
</div>
```

### Bad Examples (will not scroll properly):
```tsx
// No height constraint
<div>
  <AnalyticsDashboard />
</div>

// Height: auto
<div className="h-auto">
  <AnalyticsDashboard />
</div>
```

## Data Source

The dashboard automatically connects to `useTaskStore()` and displays:
- All tasks from the store
- Real-time updates when tasks change
- Aggregated statistics across all agents

### Using Custom Data

If you need to pass custom task data:

```tsx
// Option 1: Update the store
const { addTask, updateTask } = useTaskStore()
addTask(newTask)

// Option 2: Modify the component to accept props
// (requires editing AnalyticsDashboard.tsx)
interface AnalyticsDashboardProps {
  tasks?: Task[]
}
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  tasks: propTasks
}) => {
  const { tasks: storeTasks } = useTaskStore()
  const tasks = propTasks || storeTasks
  // ... rest of component
}
```

## Customization

### Change Time Ranges

Edit the time range options in `AnalyticsDashboard.tsx`:

```tsx
type TimeRange = '7days' | '30days' | '90days' | 'all'

// Add new button
<button onClick={() => setTimeRange('90days')}>
  90天
</button>
```

Then update the `days` calculation:

```tsx
const days = timeRange === '7days' ? 7
  : timeRange === '30days' ? 30
  : timeRange === '90days' ? 90
  : 365 // all
```

### Change Color Scheme

Modify the gradient colors in the component:

```tsx
// For completion trend (currently green)
<stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} /> // Change to blue

// For summary cards
className="from-blue-900/30 to-blue-800/20" // Change gradients
```

### Add New Charts

1. Add data processing function to `analyticsProcessor.ts`:

```typescript
export function calculateNewMetric(tasks: Task[]) {
  // Your calculation logic
  return processedData
}
```

2. Import and use in `AnalyticsDashboard.tsx`:

```tsx
import { calculateNewMetric } from '../utils/analyticsProcessor'

const analyticsData = useMemo(() => ({
  // ... existing data
  newMetric: calculateNewMetric(tasks)
}), [tasks, timeRange])

// Add chart JSX
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={analyticsData.newMetric}>
    {/* Chart configuration */}
  </BarChart>
</ResponsiveContainer>
```

### Modify Export

Change export behavior in the `handleExport` function:

```tsx
const handleExport = async (format: ExportFormat) => {
  if (format === 'csv') {
    // Add more CSV exports
    exportToCSV(
      analyticsData.newData,
      `new-data-${Date.now()}.csv`
    )
  }
}
```

## Styling

The dashboard uses Tailwind CSS classes. To match your theme:

### Dark Mode (default)
```tsx
className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
```

### Light Mode
Change to:
```tsx
className="bg-gradient-to-br from-gray-50 via-white to-gray-100"
```

And update text colors:
```tsx
className="text-gray-900" // instead of text-gray-100
```

### Custom Theme Colors

Create a theme object:

```tsx
const theme = {
  background: 'bg-your-bg-color',
  text: 'text-your-text-color',
  primary: 'bg-your-primary-color',
  // ... etc
}
```

## Performance Tips

### 1. Memoize Heavy Computations
The dashboard already uses `useMemo` for calculations. If adding more data processing:

```tsx
const expensiveData = useMemo(() => {
  return complexCalculation(tasks)
}, [tasks])
```

### 2. Virtualize Large Datasets
If displaying >1000 tasks, consider sampling:

```tsx
const sampledTasks = useMemo(() => {
  if (tasks.length > 1000) {
    // Sample every Nth task
    return tasks.filter((_, i) => i % 10 === 0)
  }
  return tasks
}, [tasks])
```

### 3. Lazy Load Charts
For better initial load time:

```tsx
import { lazy, Suspense } from 'react'

const AnalyticsDashboard = lazy(() =>
  import('./components/AnalyticsDashboard')
)

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <AnalyticsDashboard />
</Suspense>
```

## Troubleshooting

### Charts Not Rendering

**Issue:** White screen or empty charts

**Solution:** Ensure parent container has a defined height:
```tsx
<div className="h-screen"> {/* or h-full, h-[600px], etc */}
  <AnalyticsDashboard />
</div>
```

### Export Not Working

**Issue:** CSV/PNG export buttons do nothing

**Solutions:**
1. Check browser console for errors
2. Verify `html2canvas` is installed: `npm list html2canvas`
3. Check if element ID exists: `document.getElementById('analytics-dashboard')`

### Data Not Updating

**Issue:** Dashboard shows stale data

**Solution:** Ensure `useTaskStore` is properly updating:
```tsx
// Trigger re-render
const { tasks, updateTask } = useTaskStore()
updateTask(taskId, updates)
```

### TypeScript Errors

**Issue:** Type errors in imports

**Solution:** Ensure `@types` packages are installed:
```bash
npm install --save-dev @types/react @types/node
```

## Example: Full Integration

Here's a complete example integrating the dashboard into an app:

```tsx
// App.tsx
import { useState } from 'react'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { TaskManagementPanel } from './components/TaskManagementPanel'

export default function App() {
  const [activeView, setActiveView] = useState<'tasks' | 'analytics'>('tasks')

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="h-16 border-b border-gray-700 flex items-center px-4">
        <h1 className="text-xl font-bold text-white">AgentForge</h1>
        <nav className="ml-auto flex gap-2">
          <button
            onClick={() => setActiveView('tasks')}
            className={`px-4 py-2 rounded ${
              activeView === 'tasks'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-4 py-2 rounded ${
              activeView === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400'
            }`}
          >
            Analytics
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeView === 'tasks' && <TaskManagementPanel />}
        {activeView === 'analytics' && <AnalyticsDashboard />}
      </main>
    </div>
  )
}
```

## Next Steps

1. **Test the Integration**
   - Add the component to your app
   - Verify it renders correctly
   - Test the export functionality
   - Check responsive behavior

2. **Customize to Your Needs**
   - Adjust colors to match your brand
   - Add/remove charts as needed
   - Modify time ranges
   - Enhance export formats

3. **Monitor Performance**
   - Check initial render time
   - Verify smooth animations
   - Test with large datasets
   - Optimize if needed

4. **Gather Feedback**
   - Show to users
   - Collect improvement suggestions
   - Iterate on the design

## Support

For questions or issues:
1. Check the documentation files:
   - `ANALYTICS_DASHBOARD_README.md` - Usage guide
   - `TASK_50_COMPLETION_SUMMARY.md` - Implementation details
   - This file - Integration guide

2. Review the code:
   - Component: `src/components/AnalyticsDashboard.tsx`
   - Utilities: `src/utils/analyticsProcessor.ts`

3. Check TypeScript types:
   - All interfaces are exported from `analyticsProcessor.ts`
   - Task type is in `src/types/task.ts`

Happy analyzing! 📊
