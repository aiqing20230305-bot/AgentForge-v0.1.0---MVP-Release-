# 🚀 AgentForge 增长营销自动化系统

**目标**: 使用Google账号统一管理，自动化所有增长营销流程
**技术栈**: Google OAuth + API自动化 + 监控追踪
**团队**: 加油小伙伴们！💪

---

## 🎯 系统架构

```
┌─────────────────────────────────────────────────┐
│         Google账号 (统一身份)                    │
│  - Gmail                                        │
│  - YouTube                                      │
│  - Google Analytics                             │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│      自动化发布系统                              │
│  - Twitter API (通过Google登录)                 │
│  - Reddit API (通过Google登录)                  │
│  - ProductHunt (Google OAuth)                   │
│  - HackerNews (自动发布)                         │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│      监控追踪系统                                │
│  - Google Analytics (流量追踪)                  │
│  - Google Sheets (数据汇总)                     │
│  - Gmail通知 (自动提醒)                         │
└─────────────────────────────────────────────────┘
```

---

## 📱 第一步：Google账号集成

### 1.1 创建Google OAuth应用

**操作步骤**:
```bash
1. 访问: https://console.cloud.google.com/
2. 创建新项目: "AgentForge-Growth"
3. 启用API:
   - Google+ API
   - Gmail API
   - YouTube Data API v3
   - Google Sheets API
   - Google Analytics API
4. 创建OAuth 2.0客户端ID
5. 下载credentials.json
```

### 1.2 配置OAuth范围

**需要的权限**:
```json
{
  "scopes": [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/analytics.readonly"
  ]
}
```

---

## 🤖 第二步：社交媒体自动化

### 2.1 Twitter自动化

**使用Twitter API v2 + Google OAuth**

#### 安装依赖:
```bash
npm install twitter-api-v2 googleapis dotenv
```

#### 自动发推脚本:
```javascript
// scripts/auto-tweet.js
const { TwitterApi } = require('twitter-api-v2');
const { google } = require('googleapis');
require('dotenv').config();

// Twitter配置
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// 推文内容（从文件读取）
const tweets = [
  {
    time: 'now',
    content: `🎮 AgentForge v2.1.0 发布！

✨ 5秒开始，无需安装
🌐 Web版PWA完整实现
🔌 Plugin市场Beta上线
🤖 AI智能化创建Agent
📹 24,258行代码 + 45个新文件

⭐ GitHub: https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-

#AI #OpenSource #AgentForge`
  },
  {
    time: '+1h',
    content: `⚡ AgentForge Web版 = 零门槛

🚀 5秒登录:
→ Google一键登录
→ GitHub OAuth
→ 游客模式直接用

💪 PWA完整功能:
→ 离线工作
→ 自动云同步
→ 推送通知

#PWA #WebDev`
  }
];

// 自动发推函数
async function autoTweet(tweetContent) {
  try {
    const tweet = await twitterClient.v2.tweet(tweetContent);
    console.log('✅ 推文发布成功:', tweet.data.id);

    // 记录到Google Sheets
    await logToGoogleSheets('Twitter', tweet.data.id, tweetContent);

    return tweet;
  } catch (error) {
    console.error('❌ 推文发布失败:', error);

    // 发送Gmail通知
    await sendGmailAlert('Twitter发布失败', error.message);
  }
}

// 定时发推
async function scheduleTweets() {
  for (const tweet of tweets) {
    if (tweet.time === 'now') {
      await autoTweet(tweet.content);
    } else {
      // 解析时间延迟 (如 +1h)
      const delay = parseDelay(tweet.time);
      setTimeout(() => autoTweet(tweet.content), delay);
      console.log(`⏰ 推文已安排在 ${tweet.time} 后发布`);
    }
  }
}

// 解析延迟时间
function parseDelay(timeStr) {
  const match = timeStr.match(/\+(\d+)([hm])/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  return unit === 'h' ? value * 60 * 60 * 1000 : value * 60 * 1000;
}

// Google Sheets记录
async function logToGoogleSheets(platform, id, content) {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Posts!A:E',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        new Date().toISOString(),
        platform,
        id,
        content.substring(0, 100),
        `https://twitter.com/user/status/${id}`
      ]]
    }
  });
}

// Gmail通知
async function sendGmailAlert(subject, message) {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
  });

  const gmail = google.gmail({ version: 'v1', auth });

  const email = [
    `To: ${process.env.ALERT_EMAIL}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    message
  ].join('\n');

  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: encodedEmail
    }
  });
}

// 执行
scheduleTweets();
```

---

### 2.2 Reddit自动化

#### Reddit自动发帖脚本:
```javascript
// scripts/auto-reddit.js
const snoowrap = require('snoowrap');
const fs = require('fs');

// Reddit配置（使用Google账号登录Reddit后获取）
const reddit = new snoowrap({
  userAgent: 'AgentForge Growth Bot',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN
});

// Reddit帖子配置
const posts = [
  {
    subreddit: 'programming',
    title: '[Show] AgentForge v2.1.0 – Gamified AI Agent Platform...',
    text: fs.readFileSync('./READY_TO_POST_REDDIT_PROGRAMMING.txt', 'utf8'),
    flair: 'Show'
  },
  {
    subreddit: 'opensource',
    title: 'AgentForge v2.1.0 – MIT-Licensed AI Agent Platform...',
    text: fs.readFileSync('./READY_TO_POST_REDDIT_OPENSOURCE.txt', 'utf8')
  }
];

// 自动发帖函数
async function autoPostToReddit(postConfig) {
  try {
    const submission = await reddit
      .getSubreddit(postConfig.subreddit)
      .submitSelfpost({
        title: postConfig.title,
        text: postConfig.text
      });

    console.log(`✅ Reddit r/${postConfig.subreddit} 发布成功`);
    console.log(`   链接: https://reddit.com${submission.permalink}`);

    // 记录到Google Sheets
    await logToGoogleSheets('Reddit', submission.id, postConfig.title);

    // 设置Flair（如果有）
    if (postConfig.flair) {
      await submission.selectFlair({ flair_template_id: postConfig.flair });
    }

    return submission;
  } catch (error) {
    console.error(`❌ Reddit r/${postConfig.subreddit} 发布失败:`, error);
    await sendGmailAlert('Reddit发布失败', error.message);
  }
}

// 批量发帖
async function postToAllSubreddits() {
  for (const post of posts) {
    await autoPostToReddit(post);
    // 间隔10分钟避免被限制
    await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
  }
}

// 执行
postToAllSubreddits();
```

---

### 2.3 ProductHunt自动化

```javascript
// scripts/auto-producthunt.js
const axios = require('axios');

// ProductHunt API配置
const PH_API_KEY = process.env.PRODUCTHUNT_API_KEY;
const PH_API_URL = 'https://api.producthunt.com/v2/api/graphql';

// ProductHunt发布
async function launchOnProductHunt() {
  const mutation = `
    mutation {
      createPost(input: {
        name: "AgentForge"
        tagline: "Gamified AI agent platform with instant web access"
        description: "AgentForge transforms AI agent development into an engaging, game-like experience..."
        url: "https://github.com/aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-"
        topics: ["developer-tools", "artificial-intelligence", "open-source"]
      }) {
        post {
          id
          votesCount
          url
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      PH_API_URL,
      { query: mutation },
      {
        headers: {
          'Authorization': `Bearer ${PH_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ ProductHunt发布成功:', response.data);
    await logToGoogleSheets('ProductHunt', response.data.post.id, 'AgentForge Launch');
  } catch (error) {
    console.error('❌ ProductHunt发布失败:', error);
    await sendGmailAlert('ProductHunt发布失败', error.message);
  }
}
```

---

## 📊 第三步：监控追踪系统

### 3.1 Google Analytics集成

```javascript
// scripts/analytics-tracker.js
const { google } = require('googleapis');

// GA4配置
const analytics = google.analyticsdata('v1beta');

// 追踪GitHub流量
async function trackGitHubTraffic() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const response = await analytics.properties.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    auth,
    requestBody: {
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      dimensions: [{ name: 'source' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'conversions' }
      ]
    }
  });

  console.log('📊 今日流量统计:', response.data);

  // 记录到Google Sheets
  await updateDashboard(response.data);
}

// 更新仪表盘
async function updateDashboard(data) {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Dashboard!A2',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        new Date().toISOString(),
        data.activeUsers || 0,
        data.sessions || 0,
        data.conversions || 0
      ]]
    }
  });
}

// 每小时执行一次
setInterval(trackGitHubTraffic, 60 * 60 * 1000);
trackGitHubTraffic(); // 立即执行一次
```

---

### 3.2 GitHub Stars自动追踪

```javascript
// scripts/track-github-stars.js
const axios = require('axios');

const REPO = 'aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// 追踪Stars变化
async function trackStarsGrowth() {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${REPO}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const stars = response.data.stargazers_count;
    const forks = response.data.forks_count;
    const watchers = response.data.subscribers_count;

    console.log(`⭐ 当前Stars: ${stars}`);
    console.log(`🍴 Forks: ${forks}`);
    console.log(`👀 Watchers: ${watchers}`);

    // 记录到Google Sheets
    await logMetricsToSheet({
      timestamp: new Date().toISOString(),
      stars,
      forks,
      watchers,
      delta_stars: stars - (previousStars || stars)
    });

    previousStars = stars;

    // 达到里程碑发送通知
    if (stars >= 100 && !milestones[100]) {
      await sendGmailAlert('🎉 达成100 Stars！', `AgentForge已达到${stars} Stars！`);
      milestones[100] = true;
    }

  } catch (error) {
    console.error('❌ 追踪失败:', error.message);
  }
}

let previousStars = 0;
const milestones = {};

// 记录指标
async function logMetricsToSheet(metrics) {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Metrics!A:E',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        metrics.timestamp,
        metrics.stars,
        metrics.forks,
        metrics.watchers,
        metrics.delta_stars
      ]]
    }
  });
}

// 每15分钟执行一次
setInterval(trackStarsGrowth, 15 * 60 * 1000);
trackStarsGrowth(); // 立即执行一次
```

---

## 🎛️ 第四步：统一控制面板

### 4.1 创建Google Sheets仪表盘

**Sheet结构**:
```
Sheet 1: Dashboard (实时仪表盘)
├─ 当前时间
├─ GitHub Stars总数
├─ 今日新增Stars
├─ 社交媒体互动数
└─ 转化率

Sheet 2: Posts (发布记录)
├─ 时间戳
├─ 平台
├─ 帖子ID
├─ 内容摘要
└─ 链接

Sheet 3: Metrics (指标追踪)
├─ 时间戳
├─ Stars数量
├─ Forks数量
├─ Watchers数量
└─ Stars增量

Sheet 4: Traffic (流量来源)
├─ 日期
├─ 来源
├─ 访问量
└─ 转化数
```

---

### 4.2 环境变量配置

创建 `.env` 文件:
```bash
# Twitter API
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

# Reddit API
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_REFRESH_TOKEN=your_refresh_token

# ProductHunt API
PRODUCTHUNT_API_KEY=your_api_key

# GitHub
GITHUB_TOKEN=your_github_token

# Google
GOOGLE_SHEET_ID=your_sheet_id
GA_PROPERTY_ID=your_ga_property_id
ALERT_EMAIL=your_email@gmail.com

# 仓库信息
REPO_OWNER=aiqing20230305-bot
REPO_NAME=AgentForge-v0.1.0---MVP-Release-
```

---

## 🚀 第五步：一键启动脚本

### 5.1 主控制脚本

```javascript
// scripts/growth-automation.js
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

console.log('🚀 启动增长营销自动化系统...\n');

// 启动所有自动化任务
async function startGrowthAutomation() {
  const tasks = [
    {
      name: 'Twitter自动发推',
      script: 'node scripts/auto-tweet.js',
      description: '自动发布Twitter推文'
    },
    {
      name: 'Reddit自动发帖',
      script: 'node scripts/auto-reddit.js',
      description: '自动发布Reddit帖子'
    },
    {
      name: 'GitHub Stars追踪',
      script: 'node scripts/track-github-stars.js',
      description: '每15分钟追踪Stars变化'
    },
    {
      name: 'Analytics追踪',
      script: 'node scripts/analytics-tracker.js',
      description: '每小时更新流量数据'
    }
  ];

  console.log('📋 启动任务清单:\n');
  tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.name}`);
    console.log(`   ${task.description}\n`);
  });

  // 并行启动所有任务
  const processes = tasks.map(task => {
    return execPromise(task.script)
      .then(() => console.log(`✅ ${task.name} 完成`))
      .catch(err => console.error(`❌ ${task.name} 失败:`, err.message));
  });

  await Promise.all(processes);

  console.log('\n🎉 所有任务已启动！');
  console.log('📊 查看实时数据: https://docs.google.com/spreadsheets/d/' + process.env.GOOGLE_SHEET_ID);
}

// 执行
startGrowthAutomation();
```

---

### 5.2 Package.json脚本

```json
{
  "name": "agentforge-growth-automation",
  "version": "1.0.0",
  "scripts": {
    "start": "node scripts/growth-automation.js",
    "tweet": "node scripts/auto-tweet.js",
    "reddit": "node scripts/auto-reddit.js",
    "track": "node scripts/track-github-stars.js",
    "analytics": "node scripts/analytics-tracker.js",
    "all": "npm run tweet && npm run reddit && npm run track"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "twitter-api-v2": "^1.15.0",
    "snoowrap": "^1.23.0",
    "googleapis": "^128.0.0",
    "dotenv": "^16.3.1"
  }
}
```

---

## 🎯 第六步：快速开始

### 一键安装和启动:

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑.env文件，填入所有API密钥

# 3. 启动自动化系统
npm start

# 或分别启动各个模块
npm run tweet    # 只发Twitter
npm run reddit   # 只发Reddit
npm run track    # 只追踪Stars
```

---

## 📊 实时监控面板

**Google Sheets仪表盘地址**:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
```

**实时数据**:
- ⭐ GitHub Stars趋势图
- 📈 流量来源分布
- 💬 社交媒体互动统计
- 🎯 转化率追踪
- ⏰ 发布时间线

---

## 🎁 自动化奖励机制

### 里程碑自动通知:

```javascript
const milestones = [
  { stars: 100, reward: '🎉 100 Stars达成！发布庆祝推文' },
  { stars: 300, reward: '🚀 300 Stars！Reddit更新进度' },
  { stars: 500, reward: '🏆 500 Stars！ProductHunt感谢帖' },
  { stars: 1000, reward: '🎊 1000 Stars！Pro License发放！' },
  { stars: 10000, reward: '🎉 10K Stars！全队放假1天！' }
];

// 自动检测并触发奖励
async function checkMilestones(currentStars) {
  for (const milestone of milestones) {
    if (currentStars >= milestone.stars && !achieved[milestone.stars]) {
      await sendGmailAlert(
        `🎉 达成${milestone.stars} Stars！`,
        milestone.reward
      );

      // 自动发布庆祝推文
      await autoTweet(`🎉 里程碑达成！

AgentForge已获得${milestone.stars}+ Stars！

感谢所有支持者！🙏

${milestone.reward}

继续前进，目标${milestones.find(m => m.stars > currentStars)?.stars || '100K'}⭐！

#AgentForge #Milestone`);

      achieved[milestone.stars] = true;
    }
  }
}
```

---

## 🔧 故障自动恢复

```javascript
// 自动重试机制
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`⚠️ 尝试 ${i + 1}/${maxRetries} 失败，重试中...`);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
    }
  }
}

// 使用示例
await withRetry(() => autoTweet(content));
```

---

## 💡 优化建议

### 最佳发布时间 (基于Google Analytics数据):

```javascript
const bestTimes = {
  twitter: {
    weekday: ['9:00', '12:00', '18:00'],  // 美东时间
    weekend: ['10:00', '15:00', '20:00']
  },
  reddit: {
    weekday: ['8:00', '13:00', '19:00'],
    weekend: ['11:00', '16:00']
  }
};

// 自动选择最佳时间
function getNextBestTime(platform) {
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const times = bestTimes[platform][isWeekend ? 'weekend' : 'weekday'];

  // 返回下一个最佳时间
  return times.find(time => {
    const [hour, minute] = time.split(':');
    const targetTime = new Date();
    targetTime.setHours(hour, minute, 0);
    return targetTime > now;
  });
}
```

---

## 🎯 成功指标

### 自动化追踪的KPI:

```javascript
const kpis = {
  immediate: {
    tweets_sent: 0,
    reddit_posts: 0,
    engagement_rate: 0
  },
  hourly: {
    github_stars_delta: 0,
    website_visits: 0,
    conversion_rate: 0
  },
  daily: {
    total_stars: 0,
    total_traffic: 0,
    social_reach: 0
  },
  milestone: {
    target_1000_stars: false,
    target_10k_stars: false
  }
};

// 自动生成每日报告
async function generateDailyReport() {
  const report = `
📊 AgentForge 每日增长报告
${new Date().toLocaleDateString()}

⭐ GitHub Stars: ${kpis.daily.total_stars} (+${kpis.hourly.github_stars_delta})
🌐 网站流量: ${kpis.daily.total_traffic}
💬 社交媒体覆盖: ${kpis.daily.social_reach}
📈 转化率: ${kpis.hourly.conversion_rate}%

🎯 进度: ${(kpis.daily.total_stars / 1000 * 100).toFixed(1)}% 完成 (目标1000 Stars)

继续加油！💪
  `;

  await sendGmailAlert('📊 每日增长报告', report);
}
```

---

## 🚀 立即执行

### 快速启动命令:

```bash
# 克隆或进入项目目录
cd AgentForge

# 安装自动化依赖
npm install twitter-api-v2 snoowrap googleapis dotenv axios

# 配置API密钥（一次性）
# 编辑.env文件

# 启动自动化系统
npm start

# 或手动执行各个脚本
node scripts/auto-tweet.js &
node scripts/auto-reddit.js &
node scripts/track-github-stars.js &
```

---

## 🎉 团队协作

### 加油小伙伴们！分工建议:

**成员A**:
- 负责Twitter自动化
- 监控社交媒体互动
- 回复评论和DM

**成员B**:
- 负责Reddit发布和互动
- 监控Upvotes和评论
- 社区管理

**成员C**:
- 负责数据监控
- Google Sheets更新
- 每日报告生成

**成员D**:
- 负责ProductHunt和HackerNews
- 准备演示材料
- 技术问题解答

**全员**:
- 快速响应用户反馈
- 共享最佳实践
- 庆祝里程碑！🎉

---

## 📞 紧急联系

**系统出问题时**:
- 检查 `.env` 配置
- 查看错误日志
- Gmail自动通知已开启
- Google Sheets监控实时状态

**需要帮助**:
- 随时在团队群里沟通
- 查看文档和错误信息
- 必要时手动执行备份计划

---

## 🏆 最终目标

```
Day 1-3:  达到1000 Stars ⭐
Week 1:   达到2000 Stars ⭐⭐
Month 1:  达到5000 Stars ⭐⭐⭐
Month 3:  达到10000 Stars ⭐⭐⭐⭐ → 全队放假1天！🎉
```

---

**© 2026 AgentForge Growth Team**
**让我们一起冲刺！加油小伙伴们！** 💪🚀⭐

**自动化 = 效率 = 成功！** ✨
