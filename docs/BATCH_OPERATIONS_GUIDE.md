# Batch Operations Guide

## Overview

The Batch Operations system provides powerful tools for managing multiple agents, tasks, and users simultaneously. This guide covers all features and best practices.

## Features

### 1. Batch Selection
- **Multi-select**: Click individual items or use Ctrl/Cmd+Click
- **Select All**: Select all items in the current view
- **Invert Selection**: Swap selected and unselected items
- **Conditional Selection**: Select items based on field criteria
- **Range Selection**: Click and drag to select a range

### 2. Batch Operations

#### Agent Operations
- `agent_create`: Create multiple agents at once
- `agent_update`: Update multiple agents simultaneously
- `agent_delete`: Delete multiple agents
- `agent_activate`: Activate selected agents
- `agent_deactivate`: Deactivate selected agents
- `agent_export`: Export agents to CSV/Excel

#### Task Operations
- `task_create`: Create multiple tasks at once
- `task_update`: Update multiple tasks simultaneously
- `task_delete`: Delete multiple tasks
- `task_assign`: Assign tasks to agents
- `task_complete`: Mark tasks as completed
- `task_export`: Export tasks to CSV/Excel

#### User Operations
- `user_create`: Create multiple users at once
- `user_update`: Update multiple users simultaneously
- `user_delete`: Delete multiple users
- `user_activate`: Activate selected users
- `user_deactivate`: Deactivate selected users
- `user_export`: Export users to CSV/Excel

### 3. Import/Export

#### Import from CSV
1. Download the template for your entity type
2. Fill in the data following the template format
3. Upload the CSV file
4. Preview and validate the data
5. Start the import operation
6. Monitor progress in real-time

#### Export to CSV/Excel
1. Select the items you want to export
2. Choose export format (CSV or JSON)
3. Select fields to include
4. Download the exported file

#### Supported Formats
- **CSV**: Comma-separated values (compatible with Excel, Google Sheets)
- **JSON**: JavaScript Object Notation (for programmatic use)

### 4. Batch Editor

The spreadsheet-like editor allows you to:
- Edit multiple rows inline
- Copy and paste between cells
- Fill down values to multiple rows
- Add/delete rows
- Reorder rows
- Keyboard navigation (Arrow keys, Tab, Enter)

#### Keyboard Shortcuts
- `Tab`: Move to next cell
- `Shift + Tab`: Move to previous cell
- `Enter`: Move down
- `Shift + Enter`: Move up
- `Ctrl/Cmd + C`: Copy cell
- `Ctrl/Cmd + V`: Paste cell
- `Ctrl/Cmd + D`: Fill down

### 5. Progress Tracking

Monitor batch operations in real-time:
- **Progress bar**: Visual progress indicator
- **Success/Fail counts**: Track successful and failed operations
- **Error log**: View detailed error messages
- **Duration**: See how long operations take
- **Auto-refresh**: Automatic status updates

### 6. Operation History

View and manage past batch operations:
- Filter by status (pending, processing, completed, failed, partial)
- Filter by operation type
- View detailed results
- Download operation logs
- Delete old operations

## API Reference

### Batch Operation Service

```typescript
import { batchOperationService } from '@/services/batch'

// Create a batch operation
const operation = await batchOperationService.createBatchOperation({
  operationType: 'agent_update',
  targetIds: ['agent1', 'agent2', 'agent3'],
  operationData: { status: 'active' }
})

// Execute the operation
await batchOperationService.executeBatchOperation(operation.id)

// Poll for progress
await batchOperationService.pollBatchOperation(
  operation.id,
  (op) => console.log(`Progress: ${op.progress}%`)
)

// Import from CSV
const importOp = await batchOperationService.batchImport({
  entityType: 'agent',
  data: parsedCsvData,
  fileName: 'agents.csv',
  fileType: 'csv'
})

// Export to CSV
const exportResult = await batchOperationService.batchExport({
  entityType: 'agent',
  ids: selectedIds,
  format: 'csv',
  fields: ['id', 'name', 'status']
})
```

### Batch Selection Service

```typescript
import { batchSelectionService } from '@/services/batch'

// Create selection state
const state = batchSelectionService.createSelectionState(items)

// Select all items
const newState = batchSelectionService.selectAll(state)

// Select by condition
const filteredState = batchSelectionService.selectByCondition(state, [
  { field: 'status', operator: 'eq', value: 'active' },
  { field: 'level', operator: 'gte', value: 5 }
])

// Get selected items
const selectedItems = batchSelectionService.getSelectedItems(state)
```

### CSV Parser

```typescript
import { csvParser } from '@/services/batch'

// Parse CSV file
const data = await csvParser.parseFile(file, {
  delimiter: ',',
  skipEmptyLines: true,
  headers: true
})

// Generate CSV
const csv = csvParser.generate(data, {
  delimiter: ',',
  includeHeaders: true,
  fields: ['id', 'name', 'email']
})

// Download CSV
csvParser.downloadCsv(data, 'export.csv', {
  includeHeaders: true,
  fields: ['id', 'name', 'email']
})
```

## Component Usage

### BatchOperationsDashboard

```tsx
import { BatchOperationsDashboard } from '@/components/batch'

<BatchOperationsDashboard
  entityType="agent"
  items={agents}
  onBatchUpdate={(ids, data) => {
    // Handle batch update
  }}
  onBatchDelete={(ids) => {
    // Handle batch delete
  }}
/>
```

### BatchSelectionToolbar

```tsx
import { BatchSelectionToolbar } from '@/components/batch'

<BatchSelectionToolbar
  selectedCount={5}
  totalCount={100}
  allSelected={false}
  someSelected={true}
  onSelectAll={() => {}}
  onDeselectAll={() => {}}
  onInvertSelection={() => {}}
  onExport={() => {}}
  onImport={() => {}}
  onDelete={() => {}}
  actions={[
    {
      id: 'activate',
      label: 'Activate',
      icon: CheckSquare,
      onClick: () => {}
    }
  ]}
/>
```

### BatchProgressTracker

```tsx
import { BatchProgressTracker } from '@/components/batch'

<BatchProgressTracker
  operation={batchOperation}
  onComplete={(op) => {
    console.log('Operation completed:', op)
  }}
  autoClose={true}
  autoCloseDelay={3000}
/>
```

### BatchTableEditor

```tsx
import { BatchTableEditor } from '@/components/batch'

<BatchTableEditor
  data={items}
  columns={[
    { key: 'name', label: 'Name', editable: true, type: 'text' },
    { key: 'status', label: 'Status', editable: true, type: 'select', options: ['active', 'inactive'] },
    { key: 'level', label: 'Level', editable: true, type: 'number' }
  ]}
  onSave={(data) => {
    console.log('Saving:', data)
  }}
  onCancel={() => {
    console.log('Cancelled')
  }}
  onAddRow={() => ({ name: '', status: 'active', level: 1 })}
/>
```

## Best Practices

### 1. Validation
- Always validate imported data before processing
- Use templates to ensure correct format
- Check for required fields
- Handle errors gracefully

### 2. Performance
- Limit batch size to 100-500 items
- Use pagination for large datasets
- Monitor memory usage
- Cancel operations that take too long

### 3. Error Handling
- Always provide clear error messages
- Log failed operations
- Allow retry for failed items
- Backup data before batch operations

### 4. User Experience
- Show progress indicators
- Provide undo/cancel options
- Confirm destructive operations
- Save operation history

### 5. Security
- Validate user permissions
- Sanitize input data
- Rate limit batch operations
- Audit batch operations

## Troubleshooting

### Import Fails
- Check CSV format matches template
- Verify all required fields are present
- Ensure data types are correct
- Check file encoding (UTF-8 recommended)

### Slow Performance
- Reduce batch size
- Check network connection
- Optimize database queries
- Use pagination

### Operation Stuck
- Check backend logs
- Verify operation status
- Cancel and retry
- Contact support if persists

## Examples

### Example 1: Import Agents from CSV

```typescript
// 1. Parse CSV file
const data = await csvParser.parseFile(file)

// 2. Validate data
const errors = csvParser.validate(data, ['name', 'aiModel'])
if (errors.length > 0) {
  console.error('Validation errors:', errors)
  return
}

// 3. Import
const operation = await batchOperationService.batchImport({
  entityType: 'agent',
  data,
  fileName: file.name,
  fileType: 'csv'
})

// 4. Monitor progress
await batchOperationService.pollBatchOperation(
  operation.id,
  (op) => {
    console.log(`Progress: ${op.progress}%`)
    console.log(`Success: ${op.successfulItems}, Failed: ${op.failedItems}`)
  }
)
```

### Example 2: Batch Update with Conditional Selection

```typescript
// 1. Select items by condition
const state = batchSelectionService.selectByCondition(initialState, [
  { field: 'level', operator: 'lt', value: 10 },
  { field: 'status', operator: 'eq', value: 'active' }
])

// 2. Get selected IDs
const selectedIds = batchSelectionService.getSelectedIds(state)

// 3. Create batch operation
const operation = await batchOperationService.createBatchOperation({
  operationType: 'agent_update',
  targetIds: selectedIds,
  operationData: { experience: 1000 }
})

// 4. Execute
await batchOperationService.executeBatchOperation(operation.id)
```

### Example 3: Export with Custom Fields

```typescript
// 1. Select items to export
const selectedIds = ['agent1', 'agent2', 'agent3']

// 2. Export with specific fields
const result = await batchOperationService.batchExport({
  entityType: 'agent',
  ids: selectedIds,
  format: 'csv',
  fields: ['id', 'name', 'level', 'experience', 'tasksCompleted']
})

// 3. Download
csvParser.downloadCsv(result.data, 'agents_export.csv', {
  fields: ['id', 'name', 'level', 'experience', 'tasksCompleted'],
  includeHeaders: true
})
```

## Support

For issues or questions:
- Check the documentation
- Search existing issues
- Create a new issue
- Contact support

---

**Version**: 1.0.0
**Last Updated**: 2026-03-17
