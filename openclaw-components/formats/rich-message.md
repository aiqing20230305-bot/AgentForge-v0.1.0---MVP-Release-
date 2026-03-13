# 富文本消息格式 📱

飞书富文本和交互式卡片消息格式。

## 消息类型

### 1. 文本消息
```json
{
  "msg_type": "text",
  "content": {
    "text": "这是一条文本消息"
  }
}
```

### 2. 富文本消息
```json
{
  "msg_type": "post",
  "content": {
    "post": {
      "zh_cn": {
        "title": "标题",
        "content": [
          [
            {"tag": "text", "text": "普通文本 "},
            {"tag": "a", "text": "链接", "href": "https://example.com"},
            {"tag": "at", "user_id": "all"}
          ]
        ]
      }
    }
  }
}
```

### 3. 图片消息
```json
{
  "msg_type": "image",
  "content": {
    "image_key": "img_xxx"
  }
}
```

### 4. 交互式卡片
```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "卡片标题"
      },
      "template": "blue"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**粗体** *斜体* ~~删除线~~"
        }
      },
      {
        "tag": "action",
        "actions": [
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "按钮"
            },
            "type": "primary",
            "value": {"key": "value"}
          }
        ]
      }
    ]
  }
}
```

## 卡片模板

### 信息展示卡片
```javascript
function createInfoCard(title, items) {
  return {
    header: {
      title: { tag: "plain_text", content: title },
      template: "blue"
    },
    elements: items.map(item => ({
      tag: "div",
      fields: [
        { is_short: true, text: { tag: "lark_md", content: `**${item.label}**` }},
        { is_short: true, text: { tag: "lark_md", content: item.value }}
      ]
    }))
  }
}
```

### 确认卡片
```javascript
function createConfirmCard(message, data) {
  return {
    header: {
      title: { tag: "plain_text", content: "⚠️ 确认操作" },
      template: "orange"
    },
    elements: [
      {
        tag: "div",
        text: { tag: "plain_text", content: message }
      },
      {
        tag: "action",
        actions: [
          {
            tag: "button",
            text: { tag: "plain_text", content: "确认" },
            type: "primary",
            value: { action: "confirm", data }
          },
          {
            tag: "button",
            text: { tag: "plain_text", content: "取消" },
            type: "default",
            value: { action: "cancel" }
          }
        ]
      }
    ]
  }
}
```

### 进度卡片
```javascript
function createProgressCard(title, progress, total) {
  const percentage = Math.round((progress / total) * 100)
  return {
    header: {
      title: { tag: "plain_text", content: title },
      template: "blue"
    },
    elements: [
      {
        tag: "div",
        text: {
          tag: "lark_md",
          content: `进度: ${progress}/${total} (${percentage}%)`
        }
      },
      {
        tag: "div",
        text: {
          tag: "plain_text",
          content: "█".repeat(percentage / 5) + "░".repeat(20 - percentage / 5)
        }
      }
    ]
  }
}
```

### 结果卡片
```javascript
function createResultCard(success, title, message) {
  return {
    header: {
      title: {
        tag: "plain_text",
        content: success ? "✅ " + title : "❌ " + title
      },
      template: success ? "green" : "red"
    },
    elements: [
      {
        tag: "div",
        text: { tag: "lark_md", content: message }
      }
    ]
  }
}
```

## Markdown 语法

飞书支持的 Markdown：
- **粗体**: `**text**`
- *斜体*: `*text*`
- ~~删除线~~: `~~text~~`
- [链接](url): `[text](url)`
- `代码`: `` `code` ``
- @用户: `<at id=user_id></at>`

## 最佳实践

1. **卡片优先**: 复杂信息用卡片展示
2. **交互按钮**: 提供快捷操作按钮
3. **进度反馈**: 长时间操作显示进度
4. **颜色语义**:
   - 蓝色: 信息
   - 绿色: 成功
   - 橙色: 警告
   - 红色: 错误
5. **图文并茂**: 适当使用 emoji 和图片
