# ✅ v0.3.6 发布检查清单

**状态：** 本地准备完成，等待推送和截图 🚀

---

## ✅ 已完成项目

### 1. 代码开发 ✅
- [x] Phase 1: 核心集成（任务搜索、复制功能）
- [x] Phase 2: ComponentShowcase（开发者参考库）
- [x] TypeScript检查通过（0错误）
- [x] 所有功能手动测试通过

**统计：**
- 41个文件变更
- 11,532行代码新增
- 0 TypeScript错误
- 3小时开发时间

---

### 2. 版本管理 ✅
- [x] 更新`package.json`版本号：0.3.3 → 0.3.6
- [x] 更新`CHANGELOG.md`
- [x] 创建发布说明：`RELEASE_v0.3.6.md`
- [x] 创建集成报告：`docs/v0.3.6_COMPONENT_INTEGRATION_REPORT.md`

---

### 3. Git操作 ✅
- [x] Git commit创建：`5e3c539`
- [x] Git tag创建：`v0.3.6`
- [x] 提交信息完整（功能描述、影响、技术细节）

**提交详情：**
```bash
Commit: 5e3c539
Message: release: v0.3.6 - Component Integration & Developer Tools
Files: 41 changed, 11532 insertions(+)
```

---

### 4. 文档准备 ✅
- [x] `RELEASE_v0.3.6.md` - 完整发布说明
- [x] `SCREENSHOT_GUIDE_v0.3.6.md` - 截图拍摄指南
- [x] `CHANGELOG.md` - 更新日志
- [x] `docs/v0.3.6_COMPONENT_INTEGRATION_REPORT.md` - 技术报告
- [x] `release.sh` - 自动化发布脚本

---

## ⏳ 待完成项目

### 5. Git推送 🔴
**状态：** 需要手动执行

由于SSH密钥问题，需要手动推送：

```bash
# 方式1: 配置SSH密钥后推送
git push origin main --tags

# 方式2: 使用HTTPS (需要输入GitHub凭证)
git remote set-url origin https://github.com/yourusername/agentforge.git
git push origin main --tags

# 方式3: 仅查看当前状态
git log --oneline -1
git tag -l v0.3.6
```

**推送前确认：**
- [ ] 检查远程仓库URL：`git remote -v`
- [ ] 确保有推送权限
- [ ] 检查分支名称是否正确（main/master）

---

### 6. 产品截图 🔴
**状态：** 需要手动拍摄

**参考文档：** `SCREENSHOT_GUIDE_v0.3.6.md`

**需要的6张截图：**
1. ⭐⭐⭐ `v0.3.6-task-search.png` - 任务搜索系统
   - 显示搜索栏、历史下拉、过滤结果

2. ⭐⭐ `v0.3.6-copy-config.png` - OpenClaw配置复制
   - 显示遮罩API Key、复制按钮

3. ⭐ `v0.3.6-log-copy.png` - 日志复制功能
   - 显示黑客风格日志、复制按钮

4. ⭐⭐⭐ `v0.3.6-showcase-search.png` - ComponentShowcase搜索标签
   - 显示4个标签、TaskSearchBar演示、代码示例

5. ⭐⭐ `v0.3.6-showcase-copy.png` - ComponentShowcase复制标签
   - 显示复制组件演示

6. ⭐ `v0.3.6-showcase-loading.png` - ComponentShowcase加载标签
   - 显示加载组件演示

**拍摄步骤：**
```bash
# 1. 启动应用
npm run dev

# 2. 打开浏览器
open http://localhost:5173

# 3. 按指南拍摄6张截图
# 详见: SCREENSHOT_GUIDE_v0.3.6.md

# 4. 保存到目录
mkdir -p docs/screenshots/v0.3.6
mv ~/Desktop/v0.3.6-*.png docs/screenshots/v0.3.6/

# 5. 提交截图
git add docs/screenshots/v0.3.6/
git commit -m "docs: Add v0.3.6 product screenshots"
git push origin main
```

---

### 7. GitHub Release创建 🔴
**状态：** 待推送完成后执行

**步骤：**
1. 推送代码和标签到GitHub
2. 访问：`https://github.com/yourusername/agentforge/releases/new`
3. 选择tag：`v0.3.6`
4. 发布标题：`v0.3.6 - Component Integration & Developer Tools`
5. 复制`RELEASE_v0.3.6.md`内容到描述
6. 上传截图（如果已拍摄）
7. 可选：上传构建产物（`npm run build`后的安装包）
8. 点击"Publish release"

---

### 8. 构建安装包（可选） 🟡
**状态：** 可选步骤

```bash
# 构建生产版本
npm run build

# 构建产物位置：
# - dist/           # Web版本
# - dist-electron/  # Electron应用
```

**上传到GitHub Release：**
- macOS: `AgentForge-0.3.6.dmg`
- Windows: `AgentForge-0.3.6.exe`
- Linux: `AgentForge-0.3.6.AppImage`

---

## 📋 发布后操作

### 9. 更新文档和宣传 🟡
- [ ] 更新项目README.md（如需要）
- [ ] 更新`docs/SCREENSHOTS.md`添加新截图
- [ ] 在社交媒体宣布发布
- [ ] 更新项目网站（如有）

### 10. 监控和反馈 🟡
- [ ] 监控GitHub Issues
- [ ] 收集用户反馈
- [ ] 记录bug报告
- [ ] 规划v0.3.7功能

---

## 🚀 快速执行命令

### 推送到GitHub
```bash
# 检查状态
git status
git log --oneline -3
git tag -l | grep v0.3.6

# 推送（需要配置SSH或使用HTTPS）
git push origin main --tags
```

### 拍摄截图
```bash
# 启动应用
npm run dev

# 然后按SCREENSHOT_GUIDE_v0.3.6.md操作
# macOS截图: Cmd+Shift+5
# Windows截图: Win+Shift+S
```

### 验证发布
```bash
# 验证版本号
cat package.json | grep version

# 验证TypeScript
npm run typecheck

# 查看提交
git show --stat v0.3.6
```

---

## 📞 遇到问题？

### SSH密钥问题
```bash
# 生成新的SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 复制公钥并添加到GitHub
cat ~/.ssh/id_ed25519.pub
# 访问: https://github.com/settings/keys
```

### 使用HTTPS替代SSH
```bash
# 切换到HTTPS
git remote set-url origin https://github.com/yourusername/agentforge.git
git push origin main --tags
# 输入GitHub用户名和Personal Access Token
```

---

## ✅ 最终确认

发布前最后检查：
- [ ] 版本号正确：0.3.6
- [ ] TypeScript无错误
- [ ] Git commit已创建
- [ ] Git tag已创建
- [ ] 所有文档准备完毕
- [ ] 准备好推送到GitHub
- [ ] 准备好拍摄截图

---

**当前状态：**
- ✅ 代码开发完成
- ✅ 本地Git操作完成
- ⏳ 等待推送到远程
- ⏳ 等待产品截图
- ⏳ 等待GitHub Release创建

**预计剩余时间：**
- Git推送：1分钟
- 截图拍摄：10-15分钟
- GitHub Release：5分钟
- **总计：** ~20分钟

---

🎉 **v0.3.6准备就绪，即将发布！**
