# 🚀 豆包 API 快速开始指南

使用豆包（火山引擎）SeeDream 5.0 和 SeeDance 1.5 Pro 生成形象库。

---

## ✅ API 配置信息

### SeeDream 5.0（图生图）
- **API Key**: `a25c18a5-9ea0-4532-9a97-fe088e786115`
- **端点**: `https://ark.cn-beijing.volces.com/api/v3/images/generations`
- **模型**: `doubao-seedream-5-0-260128`
- **状态**: ✅ 已验证可用

### SeeDance 1.5 Pro（图生视频）
- **API Key**: `365ec8a4-7095-40b2-be19-53244b2d442d`
- **端点**: `https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`
- **模型**: `doubao-seedance-1-5-pro-251215`
- **状态**: ✅ 已验证可用

---

## 🎯 三步开始

### 1️⃣ 测试 API 连接

```bash
# 运行测试脚本
node scripts/test-doubao.js
```

**预期输出：**
```
🧪 豆包 API 测试工具

╔══════════════════════════════════════════╗
║   测试豆包 SeeDream 5.0 图片生成         ║
╚══════════════════════════════════════════╝

✅ 生成成功！
🔗 图片URL: https://...
✅ 已保存: test-doubao-image.png
```

### 2️⃣ 生成三国主题图片（30张）

```bash
# 运行完整生成脚本
node scripts/generate-with-doubao.js
```

**生成过程：**
- 📜 第一阶段：生成 30 张三国人物图片（9:16竖版）
- 🤖 第二阶段：生成 30 张科幻角色图片（用于视频）
- 🎬 第三阶段：将科幻图片转换为视频（需图片URL）

**预计耗时：**
- 图片生成：30秒/张 × 60 = 30分钟
- 视频生成：2分钟/个 × 30 = 60分钟
- **总计：~90分钟**

### 3️⃣ 查看生成结果

```bash
# 查看三国图片
ls -lh public/portraits/3kingdoms/*.png

# 查看科幻图片（临时）
ls -lh public/portraits/temp/*.png

# 刷新页面查看
open http://localhost:5174/
```

---

## 📁 生成的文件

### 三国主题图片
```
public/portraits/3kingdoms/
├── guanyu.png         # 关羽
├── zhangfei.png       # 张飞
├── zhaoyun.png        # 赵云
└── ...                # 共30张
```

### 科幻主题图片（中间产物）
```
public/portraits/temp/
├── atlas-warrior.png
├── titan-giant.png
└── ...                # 共30张
```

### 科幻主题视频（最终产物）
```
public/portraits/scifi/
├── atlas-warrior.mp4
├── atlas-warrior-thumb.png
└── ...                # 共30个视频
```

---

## 🎨 生成清单

### 第一阶段：三国人物（30张图片）

**蜀汉阵营 (8人)**
1. 关羽 - 义薄云天
2. 张飞 - 虎威将军
3. 赵云 - 常胜将军
4. 马超 - 锦马超
5. 黄忠 - 老当益壮
6. 诸葛亮 - 卧龙
7. 庞统 - 凤雏
8. 法正 - 蜀汉谋主

**曹魏阵营 (7人)**
9. 曹操 - 魏武帝
10. 司马懿 - 冢虎
11. 郭嘉 - 鬼才
12. 典韦 - 恶来
13. 许褚 - 虎痴
14. 张辽 - 威震逍遥津
15. 夏侯惇 - 独眼将军

**东吴阵营 (5人)**
16. 孙权 - 碧眼紫髯
17. 周瑜 - 美周郎
18. 陆逊 - 火烧连营
19. 甘宁 - 锦帆贼
20. 太史慈 - 神射手

**女性角色 (4人)**
21. 貂蝉 - 闭月
22. 大乔 - 国色天香
23. 小乔 - 倾国倾城
24. 孙尚香 - 弓腰姬

**其他知名 (6人)**
25. 吕布 - 飞将
26. 董卓 - 暴君
27. 袁绍 - 四世三公
28. 刘备 - 仁德君主
29. 姜维 - 龙的传人
30. 魏延 - 骁勇善战

### 第二阶段：科幻角色（30个视频）

**战斗型 (5个)**
1. Atlas - 战神
2. Titan - 巨神
3. Sentinel - 哨兵
4. Striker - 突击者
5. Phantom - 幽灵

**智能型 (5个)**
6. Oracle - 预言者
7. Nexus - 网络核心
8. Cortex - 大脑
9. Cipher - 密码
10. Matrix - 矩阵

**辅助型 (5个)**
11. Medic - 医疗兵
12. Engineer - 工程师
13. Scout - 侦察兵
14. Carrier - 运输者
15. Reaper - 收割者

**赛博朋克 (5个)**
16. Neon - 霓虹黑客
17. Chrome - 镀铬战士
18. Ghost - 幽灵壳
19. Blade - 刀锋跑者
20. Pulse - 脉冲技师

**未来战士 (5个)**
21. Nova - 新星战士
22. Vanguard - 先锋
23. Spectre - 幽魂特工
24. Aurora - 极光飞行员
25. Apex - 顶点猎人

**外星种族 (5个)**
26. Zephyr - 微风使者
27. Xenon - 氙灯生命
28. Void - 虚空实体
29. Aether - 以太精灵
30. Quantum - 量子存在

---

## ⚙️ 配置选项

### 环境变量

```bash
# API 密钥（可选，已内置）
export DOUBAO_SEEDREAM_KEY=your_key
export DOUBAO_SEEDANCE_KEY=your_key

# 生成延迟（毫秒）
export IMAGE_DELAY_MS=5000   # 图片间隔 5秒
export VIDEO_DELAY_MS=10000  # 视频间隔 10秒
```

### 修改生成数量

编辑 `scripts/generate-with-doubao.js`：

```javascript
// 只生成前 5 个
for (let i = 0; i < Math.min(5, PROMPTS.threeKingdoms.length); i++) {
  // ...
}
```

---

## 🐛 常见问题

### Q1: 测试失败，显示 HTTP 401？

**A:** API Key 可能过期，请在火山引擎控制台重新获取：
- https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint

### Q2: 生成速度慢/超时？

**A:** 增加延迟时间：
```bash
export IMAGE_DELAY_MS=10000  # 增加到 10 秒
```

### Q3: 视频生成失败？

**A:** SeeDance 需要输入图片的公网URL：
1. 将 `temp/` 目录的图片上传到 CDN
2. 修改脚本使用图片 URL
3. 重新运行脚本

### Q4: 如何跳过已生成的文件？

**A:** 脚本会自动跳过已存在的文件，直接重新运行即可：
```bash
node scripts/generate-with-doubao.js
```

### Q5: 想更换模型？

**A:** 编辑 `scripts/doubao-adapter.js`：
```javascript
this.model = 'doubao-seedream-6-0-xxx';  // 新模型名称
```

---

## 📊 成本估算

**豆包定价**（示例，请以实际为准）：
- SeeDream 图片：¥0.05/张
- SeeDance 视频：¥0.50/个

**总成本**：
- 图片：60张 × ¥0.05 = ¥3.00
- 视频：30个 × ¥0.50 = ¥15.00
- **合计：~¥18.00**

---

## ✅ 生成后检查

```bash
# 检查图片数量
ls public/portraits/3kingdoms/*.png | wc -l
# 应该显示 30

ls public/portraits/temp/*.png | wc -l
# 应该显示 30

# 检查视频数量（如果已生成）
ls public/portraits/scifi/*.mp4 | wc -l
# 应该显示 30
```

---

## 🔄 更新形象数据

生成完成后，更新 `src/store/portraitData.ts`：

```bash
# 如果生成的是 PNG 格式
sed -i '' 's/\.svg/.png/g' src/store/portraitData.ts

# 如果视频已生成
sed -i '' 's/atlas-warrior\.svg/atlas-warrior.mp4/g' src/store/portraitData.ts
```

---

## 🎉 完成

刷新页面查看新生成的形象：

```
http://localhost:5174/
```

点击任意 Agent 头像 → 选择形象 → 查看 60 个真实生成的形象！

---

## 📞 帮助

- 🔗 [豆包火山引擎控制台](https://console.volcengine.com/)
- 📖 [SeeDream 文档](https://www.volcengine.com/docs/ark/seedream)
- 📖 [SeeDance 文档](https://www.volcengine.com/docs/ark/seedance)
- 💬 技术支持：控制台在线咨询

---

**预祝生成顺利！** 🚀

最后更新：2026-03-12
