# GitHub CLI 自动创建 Release 指南

如果你想要完全自动化创建 GitHub Release，可以使用 GitHub CLI。

## 选项 1：安装 GitHub CLI（推荐完全自动化）

### macOS 安装
```bash
brew install gh
```

### 认证
```bash
gh auth login
```
按提示选择：
- GitHub.com
- HTTPS
- 使用浏览器登录

### 自动创建 Release（一条命令）
```bash
gh release create v1.1.0 \
  screenshots/v1.1.0/*.png \
  --title "v1.1.0 - Core Evolution System 🫀" \
  --notes-file release/RELEASE_NOTES_v1.1.0.md \
  --repo aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-
```

✅ 这会自动：
- 创建 v1.1.0 Release
- 上传 7 张截图
- 使用完整的发布说明
- 标记为最新版本

### 验证 Release
```bash
gh release view v1.1.0
```

---

## 选项 2：手动在浏览器中创建（5分钟）

如果不想安装 CLI，按照 `QUICK_RELEASE_CHECKLIST.md` 手动创建。

### 快速步骤
1. 访问：https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-/releases/new
2. 选择标签：v1.1.0
3. 填写标题：v1.1.0 - Core Evolution System 🫀
4. 复制描述：`cat release/RELEASE_NOTES_v1.1.0.md`
5. 上传截图：从 `screenshots/v1.1.0/` 拖拽 7 张图片
6. 勾选 "Set as the latest release"
7. 点击 "Publish release"

---

## 选项 3：使用提供的脚本

我已经为你准备了完整的自动化脚本：

```bash
# 如果安装了 gh CLI，运行：
bash scripts/create-github-release.sh
```

---

## 推荐方案

**如果你经常需要发布版本：**
→ 安装 GitHub CLI（选项 1）- 一次设置，永久受益

**如果只是这次发布：**
→ 手动创建（选项 2）- 5分钟搞定，无需安装

---

## 验证 Release 已创建

访问以下链接查看：
```
https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-/releases/tag/v1.1.0
```

应该看到：
- ✅ 标题和描述完整
- ✅ 7 张截图可见可下载
- ✅ Source code (zip/tar.gz) 可下载
- ✅ 标记为 "Latest"

---

## 总结

**当前状态：** 所有开发工作已完成 ✅
**下一步：** 创建 GitHub Release（2种方式任选）
**预计时间：**
  - CLI 自动化：2分钟（含安装：10分钟）
  - 手动创建：5分钟
