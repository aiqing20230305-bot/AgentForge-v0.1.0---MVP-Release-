# 🎨 如何使用 SEEDREAM 5.0 生成 Agent 角色立绘

## 🚀 快速开始（3分钟完成）

### 步骤 1: 准备生图工具

访问以下任一 AI 生图平台：

1. **SEEDREAM 5.0** (推荐) - https://seedream.ai
2. **Midjourney** - https://discord.com/invite/midjourney
3. **Stable Diffusion** - 本地部署
4. **Leonardo.AI** - https://leonardo.ai
5. **NovelAI** - https://novelai.net

### 步骤 2: 选择提示词

打开文件：`Agent角色生图提示词.md`

选择一个 Agent 的提示词（推荐从 ATLAS 开始）：

#### ATLAS - 团队统帅 提示词

**中文版**（直接复制）：
```
一个成熟的男性团队领袖角色，穿着深蓝色的现代商务西装，
胸前有金色徽章，背景是蓝色科技感渐变，
散发出强大的领导气场，目光坚定自信，
头顶有金色王冠光效，周围环绕蓝色能量粒子，
半身像，正面视角，
游戏角色立绘风格，高清4K，细节丰富，专业打光，
类似三国志战略版的武将立绘风格
```

**英文版**（国际平台推荐）：
```
A mature male team leader character, wearing a dark blue modern business suit,
with a golden badge on the chest, blue tech-gradient background,
exuding a strong leadership aura, determined and confident gaze,
golden crown light effect above the head, surrounded by blue energy particles,
half-body portrait, front view,
game character illustration style, high quality 4K, rich details, professional lighting,
similar to Romance of the Three Kingdoms Strategy Edition general portrait style
```

### 步骤 3: 生成图片

#### 使用 SEEDREAM 5.0

1. 访问 https://seedream.ai
2. 注册/登录账号
3. 点击 "New Generation"
4. 粘贴提示词
5. 设置参数：
   - **Aspect Ratio**: 2:3 (竖版)
   - **Quality**: High
   - **Style**: Game Art / Illustration
6. 点击 "Generate"
7. 等待 30-60 秒
8. 下载图片

#### 使用其他平台

- **Midjourney**: `/imagine` + 提示词
- **Leonardo.AI**: 选择 "Image Generation" → 粘贴提示词
- **Stable Diffusion**: txt2img → 粘贴提示词

### 步骤 4: 下载和处理图片

1. **下载原图** - 选择最满意的一张
2. **重命名**：
   - `atlas.png` (ATLAS)
   - `clip.png` (CLIP)
   - `oracle.png` (ORACLE)
   - `sentinel.png` (SENTINEL)
3. **（可选）去除背景**：
   - 使用 https://remove.bg
   - 或 Photoshop
   - 或保持原背景（卡片已有渐变背景）

### 步骤 5: 放置图片

将下载的图片移动到：

```bash
~/world-of-claudecraft/public/images/agents/

目录结构：
public/
  └── images/
      └── agents/
          ├── atlas.png      ← 放这里
          ├── clip.png       ← 放这里
          ├── oracle.png     ← 放这里
          └── sentinel.png   ← 放这里
```

使用终端命令：

```bash
# 方法 1: 使用 Finder
open ~/world-of-claudecraft/public/images/agents/

# 方法 2: 使用终端复制
cp ~/Downloads/atlas.png ~/world-of-claudecraft/public/images/agents/
cp ~/Downloads/clip.png ~/world-of-claudecraft/public/images/agents/
cp ~/Downloads/oracle.png ~/world-of-claudecraft/public/images/agents/
cp ~/Downloads/sentinel.png ~/world-of-claudecraft/public/images/agents/
```

### 步骤 6: 刷新浏览器

```
http://localhost:5175/
```

按 `Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + R` (Windows) 强制刷新

✨ **完成！你应该能看到 AI 生成的角色立绘了！**

---

## 🎨 批量生成（推荐流程）

### 方案 A: 一次生成全部（推荐）

1. 打开 SEEDREAM 5.0
2. 创建 4 个独立任务：
   - ATLAS (蓝色主题)
   - CLIP (绿色主题)
   - ORACLE (紫色主题)
   - SENTINEL (红色主题)
3. 每个生成 3-5 张备选
4. 选择最佳的 4 张
5. 批量下载和重命名

### 方案 B: 逐个生成

1. 先生成 ATLAS（测试效果）
2. 满意后继续生成其他 3 个
3. 保持风格一致性

---

## 🎯 生成技巧

### 提高质量

在提示词末尾添加：

```
, masterpiece, best quality, ultra detailed, 8K resolution,
professional artwork, trending on ArtStation
```

### 调整风格

**更写实**：
```
photorealistic, cinematic lighting, detailed face
```

**更动漫**：
```
anime style, manga art, cel shading
```

**更游戏化**：
```
game character design, concept art, RPG style
```

### 常见问题修复

**问题**: 图片太暗
**解决**: 添加 `bright lighting, well-lit`

**问题**: 构图不好
**解决**: 强调 `centered composition, professional framing`

**问题**: 细节不足
**解决**: 添加 `highly detailed, intricate details`

---

## 📐 图片规格建议

### 理想尺寸
- **原始生成**: 1024×1536 或 1536×2048
- **使用尺寸**:
  - 小图（切换器）: 256×320px
  - 大图（展示）: 保持原图

### 文件格式
- **PNG** (推荐) - 支持透明背景
- **WEBP** - 体积更小
- **JPG** - 如果不需要透明

### 文件大小
- 目标：每张 < 500KB
- 压缩工具：https://tinypng.com

---

## 🔄 图片加载逻辑

系统已实现智能图片加载：

1. **优先加载图片** - 如果图片存在，显示 AI 生成的立绘
2. **回退到 Emoji** - 如果图片不存在或加载失败，显示 emoji
3. **平滑过渡** - 图片加载时有淡入效果

```typescript
// 代码实现（已完成）
<AgentImage
  src="/images/agents/atlas.png"   // AI 生成的图片
  fallback="👑"                      // 图片加载失败时显示 emoji
  alt="ATLAS"
  className="..."
/>
```

---

## 💡 创意提示

### 定制化方向

#### 1. 科技风格
```
cyberpunk style, holographic effects, digital interface,
neon lights, futuristic armor
```

#### 2. 中国风
```
ancient Chinese style, traditional costume, ink painting style,
flowing robes, Chinese calligraphy elements
```

#### 3. 奇幻风格
```
fantasy art, magical aura, mystical powers,
glowing runes, ethereal effects
```

#### 4. 写实风格
```
photorealistic portrait, realistic lighting,
professional photography, studio portrait
```

### 混合风格示例

**科技 + 中国风** (ATLAS):
```
A team leader in futuristic Chinese armor,
combining traditional dragon patterns with LED lights,
blue holographic effects, ancient meets future,
game character illustration, 4K
```

---

## 📝 生成记录模板

记录你的生成结果：

```markdown
## ATLAS 生成记录

### 尝试 1
- 提示词: [原始提示词]
- 平台: SEEDREAM 5.0
- 参数: 2:3, High Quality
- 结果: ⭐⭐⭐⭐ (满意)
- 备注: 光效很好，但表情可以更严肃

### 尝试 2
- 提示词: [修改后提示词]
- 平台: SEEDREAM 5.0
- 参数: 同上
- 结果: ⭐⭐⭐⭐⭐ (完美！)
- 备注: 采用此张

最终选择: 尝试 2
```

---

## 🎮 效果预览

### 当前状态（Emoji）
```
👑  💻  🔮  🛡️
```

### 生成后效果
```
[精美的游戏角色立绘]
- 高清 4K 画质
- 专业打光和氛围
- 符合角色定位
- 统一游戏风格
```

---

## ❓ 常见问题

### Q: 生成的图片尺寸不对怎么办？
A: 可以生成后使用图片编辑工具调整，或者在提示词中指定 `portrait orientation, vertical composition`

### Q: 4个角色风格不统一怎么办？
A: 在每个提示词中加入统一的风格描述，如 `consistent art style, same artist`

### Q: 图片加载很慢？
A: 使用图片压缩工具（TinyPNG）将文件大小控制在 500KB 以内

### Q: 可以使用其他 AI 工具吗？
A: 完全可以！任何能生成高质量角色立绘的工具都可以

### Q: 图片不满意怎么办？
A: 删除图片文件，系统会自动回退显示 emoji，然后重新生成

---

## 🚀 下一步

完成 4 个角色立绘后，可以考虑：

1. **生成不同姿态** - 为每个 Agent 生成多个姿态
2. **生成表情包** - 创建不同情绪的表情
3. **生成背景图** - 为整个界面生成主题背景
4. **生成图标** - 为技能和属性生成小图标

---

✨ **开始创造你的 AI Agent 角色立绘吧！**

参考文档：
- `Agent角色生图提示词.md` - 详细的提示词
- `Agent形象设计说明.md` - 设计理念和技术实现
