# 🚀 AgentForge - 发布到 GitHub 指南

## ✅ 代码已 100% 准备就绪！

所有文件已提交到本地 Git，只需要推送到 GitHub。

---

## 🔑 方法 1：使用 Personal Access Token（推荐）

### 步骤 1：生成 Token

1. 访问：https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 填写信息：
   - **Note**: `AgentForge Publishing`
   - **Expiration**: 90 days（或 No expiration）
   - **权限**：勾选 `repo`（全部子权限）
4. 点击 **Generate token**
5. **复制 Token**（只显示一次！）

### 步骤 2：设置 Token 并推送

在终端执行：

```bash
cd ~/Downloads/world-of-claudecraft

# 设置环境变量（本次会话有效）
export GITHUB_TOKEN=你的_token_这里

# 或者配置到 Git（永久保存）
git config credential.helper store
echo "https://你的用户名:你的token@github.com" >> ~/.git-credentials

# 推送代码
git push origin main

# 推送标签
git push origin v0.1.0 --force
```

### 步骤 3：创建 Release

```bash
# 使用自动化脚本
GITHUB_TOKEN=你的_token node scripts/auto-publish.js

# 或手动创建（见方法 3）
```

---

## 🔑 方法 2：配置 SSH Key（一劳永逸）

### 步骤 1：生成 SSH Key

```bash
# 检查是否已有 SSH key
ls -la ~/.ssh/id_*.pub

# 如果没有，生成新的
ssh-keygen -t ed25519 -C "your_email@example.com"
# 按 Enter 使用默认路径
# 设置密码（可选）

# 启动 ssh-agent
eval "$(ssh-agent -s)"

# 添加 key
ssh-add ~/.ssh/id_ed25519
```

### 步骤 2：添加到 GitHub

```bash
# 复制公钥
cat ~/.ssh/id_ed25519.pub | pbcopy

# 访问：https://github.com/settings/keys
# 点击 New SSH key
# 粘贴公钥，点击 Add SSH key
```

### 步骤 3：更改 Remote 并推送

```bash
cd ~/Downloads/world-of-claudecraft

# 改为 SSH URL
git remote set-url origin git@github.com:Summonair/world-of-claudecraft.git

# 推送
git push origin main
git push origin v0.1.0 --force
```

---

## 🌐 方法 3：手动推送+创建 Release（最简单）

### 步骤 1：在 GitHub Desktop 推送（如果安装了）

或使用 Xcode 的 Git 功能，或任何 Git GUI 工具

### 步骤 2：网页手动创建 Release

1. **推送完成后**，访问：
   https://github.com/Summonair/world-of-claudecraft/releases/new

2. 填写信息：
   - **Tag**: 选择 `v0.1.0`
   - **Title**: `AgentForge v0.1.0 - MVP Release 🎉`
   - **Description**:
     ```bash
     # 在终端中执行，复制内容：
     cat ~/Downloads/world-of-claudecraft/GITHUB_RELEASE_COPY.txt | pbcopy
     # 然后在网页上粘贴
     ```

3. 点击 **Publish release**

---

## 🎯 快速方法对比

| 方法 | 时间 | 难度 | 推荐度 |
|------|------|------|--------|
| Personal Access Token | 3 分钟 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| SSH Key | 5 分钟 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 手动操作 | 5 分钟 | ⭐ | ⭐⭐⭐ |

---

## 🔍 验证推送成功

推送完成后，访问：
https://github.com/Summonair/world-of-claudecraft

应该看到：
- ✅ 最新提交（436dcdf）
- ✅ 4 commits ahead 消失
- ✅ Tag v0.1.0 出现在 Tags 页面

---

## 📞 如果遇到问题

### "Permission denied" 或 "403 Forbidden"
→ Token 权限不足，重新生成并勾选 `repo` 权限

### "Repository not found"
→ 检查仓库名是否正确，是否有访问权限

### 网络超时
→ 检查网络连接，尝试使用代理或 VPN

### "Authentication failed"
→ Token 过期或无效，重新生成

---

## 🎊 推送成功后

执行：

```bash
cd ~/Downloads/world-of-claudecraft
./publish.sh
```

或使用自动化脚本：

```bash
export GITHUB_TOKEN=你的token
node scripts/auto-publish.js
```

---

## ✅ 发布检查清单

- [ ] 代码已推送（`git push origin main`）
- [ ] 标签已推送（`git push origin v0.1.0`）
- [ ] Release 已创建（网页或脚本）
- [ ] 仓库名称已更新为 `agentforge`（可选）
- [ ] 仓库描述已更新
- [ ] Topics 已添加

---

**全部完成后，AgentForge 就正式开源了！** 🎉⚔️
