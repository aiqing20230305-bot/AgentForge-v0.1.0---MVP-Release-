#!/usr/bin/env node

/**
 * 🔥 自动化GitHub互动脚本 - 剑走偏锋版
 *
 * 策略：主动出击，建立联系，获得回流
 */

const { execSync } = require('child_process');
const fs = require('fs');

const REPO = 'aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-';

// 相关的热门开源项目（AI/Agent领域）
const TARGET_REPOS = [
  'langchain-ai/langchain',
  'Significant-Gravitas/AutoGPT',
  'run-llama/llama_index',
  'microsoft/autogen',
  'TransformerOptimus/SuperAGI',
  'e2b-dev/awesome-ai-agents',
  'AGI-Edgerunners/LLM-Agents-Papers',
  'wangrongding/awesome-ai-tools',
  'yoheinakajima/babyagi',
  'reworkd/AgentGPT',
  'joaomdmoura/crewAI',
  'geekan/MetaGPT',
  'cpacker/MemGPT',
  'OpenBMB/AgentVerse',
  'ShishirPatil/gorilla'
];

// 自动化操作日志
const logFile = 'auto-interactions.log';

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

// 1. 自动Star相关项目
async function autoStarRelatedProjects() {
  log('🌟 开始自动Star相关项目...');

  let starredCount = 0;

  for (const repo of TARGET_REPOS) {
    try {
      // 检查是否已经Star
      const isStarred = execSync(`gh api user/starred/${repo}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();

      if (isStarred) {
        log(`  ✓ ${repo} 已经Star过`);
        continue;
      }
    } catch (error) {
      // 未Star，现在Star
      try {
        execSync(`gh api --method PUT user/starred/${repo}`, {
          stdio: 'pipe'
        });
        starredCount++;
        log(`  ⭐ 已Star: ${repo}`);

        // 避免被限流，间隔2秒
        await sleep(2000);
      } catch (starError) {
        log(`  ❌ Star失败: ${repo} - ${starError.message}`);
      }
    }
  }

  log(`✅ 完成！共Star了 ${starredCount} 个项目`);
  log(`💡 策略：这些项目的开发者可能会看到你的活动，回访你的Profile，发现AgentForge`);

  return starredCount;
}

// 2. 在相关项目的Discussions中留下有价值的评论
async function commentOnRelatedDiscussions() {
  log('💬 自动在相关Discussions留言...');

  const message = `
Hey! Just wanted to share that I've been working on a gamified AI agent platform called AgentForge.

It might be interesting for this community because:
- 5-second start (PWA, no installation)
- Visual interface (game-like UI)
- AI-powered agent creation

Would love to get feedback from this community!

GitHub: https://github.com/${REPO}
Live Demo: https://app.agentforge.dev

(Mods: If this isn't appropriate, feel free to remove. Just thought it might be relevant!)
  `.trim();

  // 这部分需要手动执行，因为自动spam不好
  log('⚠️  自动评论需谨慎，建议手动在相关Discussions中有价值地参与');
  log('📝 准备好的评论模板已生成');

  fs.writeFileSync('/tmp/discussion-comment-template.txt', message);
  log('✅ 模板保存在: /tmp/discussion-comment-template.txt');
}

// 3. 自动在GitHub搜索相关主题并关注用户
async function followRelatedDevelopers() {
  log('👥 搜索并关注相关开发者...');

  const searchQueries = [
    'ai agent',
    'langchain',
    'autogpt',
    'llm agent'
  ];

  for (const query of searchQueries) {
    try {
      // 搜索repositories
      const searchResult = execSync(
        `gh search repos "${query}" --sort stars --limit 10 --json owner,name`,
        { encoding: 'utf8' }
      );

      const repos = JSON.parse(searchResult);

      for (const repo of repos) {
        const owner = repo.owner.login;

        try {
          // 关注owner
          execSync(`gh api --method PUT user/following/${owner}`, {
            stdio: 'pipe'
          });
          log(`  ✅ 已关注: ${owner}`);

          await sleep(1000);
        } catch (error) {
          // 可能已经关注或其他错误
          log(`  ⚠️  ${owner}: ${error.message}`);
        }
      }
    } catch (error) {
      log(`  ❌ 搜索失败: ${query}`);
    }
  }

  log('✅ 关注完成！');
  log('💡 策略：被关注的开发者会收到通知，可能会查看你的Profile');
}

// 4. 自动在我们的repo创建有趣的Issues来吸引关注
async function createEngagingIssues() {
  log('📝 创建吸引性Issues...');

  const issues = [
    {
      title: '🗳️ Community Vote: Which Feature Should We Build Next?',
      body: `
## Vote for v2.2.0 Features!

We want to build what YOU need! Vote by reacting:

👍 Mobile App (React Native)
❤️ Advanced Analytics Dashboard
🎉 Team Collaboration Features
🚀 Multi-language Support (i18n)

Or comment with your own ideas!

**Most popular feature will be built first!**
      `
    },
    {
      title: '💡 Share Your Use Case: How Would You Use AgentForge?',
      body: `
## We Want to Hear Your Ideas!

Tell us:
1. What problem would you solve with AgentForge?
2. What industry are you in?
3. What features would make it perfect for you?

**Best use cases will be featured in our showcase!**
**Top 3 get free Pro License!**
      `
    },
    {
      title: '🎨 Design Challenge: Submit Your Agent Avatar!',
      body: `
## Agent Avatar Design Contest

Submit your agent avatar designs!

**Prize:**
- 🥇 Best design: Pro License + Featured in default avatars
- 🥈 Runner-ups: Pro License

**How to participate:**
1. Create an emoji-based avatar design
2. Comment with your design + description
3. Community votes (react with 👍)

**Deadline:** 7 days
      `
    }
  ];

  for (const issue of issues) {
    try {
      const result = execSync(
        `gh issue create --repo ${REPO} --title "${issue.title}" --body "${issue.body}"`,
        { encoding: 'utf8' }
      );
      log(`  ✅ 创建Issue: ${issue.title}`);
      log(`  🔗 ${result.trim()}`);

      await sleep(2000);
    } catch (error) {
      log(`  ❌ 创建失败: ${issue.title}`);
    }
  }

  log('✅ Issues创建完成！');
  log('💡 策略：有趣的Issues会在GitHub动态中显示，吸引关注');
}

// 5. 自动更新README添加实时统计
async function updateREADMEWithStats() {
  log('📊 更新README实时统计...');

  try {
    const stats = execSync(
      `gh repo view ${REPO} --json stargazerCount,forkCount,watchers --jq '{stars:.stargazerCount,forks:.forkCount,watchers:.watchers.totalCount}'`,
      { encoding: 'utf8' }
    );

    const { stars, forks, watchers } = JSON.parse(stats);

    log(`  当前: ⭐${stars} 🍴${forks} 👀${watchers}`);
    log('✅ 统计获取成功');

    // 这里可以用GitHub Actions定时更新
    log('💡 建议：设置GitHub Actions每小时自动更新统计');

    return { stars, forks, watchers };
  } catch (error) {
    log(`  ❌ 获取统计失败: ${error.message}`);
    return null;
  }
}

// 6. 自动在Awesome Lists中提PR
async function submitToAwesomeLists() {
  log('📚 准备提交到Awesome Lists...');

  const awesomeLists = [
    'e2b-dev/awesome-ai-agents',
    'wangrongding/awesome-ai-tools',
    'AGI-Edgerunners/LLM-Agents-Papers'
  ];

  const prTemplate = `
## Add AgentForge - Gamified AI Agent Platform

**Project:** AgentForge
**URL:** https://github.com/${REPO}
**Description:** Gamified AI agent development platform with 5-second PWA start

**Why add it:**
- Open source (MIT License)
- 24K+ lines TypeScript
- PWA with offline support
- Active development
- Growing community

**Category suggestion:** Developer Tools / AI Agents

Let me know if you need any changes!
  `.trim();

  fs.writeFileSync('/tmp/awesome-list-pr-template.txt', prTemplate);

  log('📝 PR模板已保存: /tmp/awesome-list-pr-template.txt');
  log('');
  log('⚠️  提交到Awesome Lists需要手动操作：');
  awesomeLists.forEach(list => {
    log(`  1. Fork ${list}`);
    log(`  2. 添加AgentForge到适当分类`);
    log(`  3. 提交PR使用上面的模板`);
    log('');
  });

  log('💡 策略：被Awesome Lists收录后会获得长期持续流量');
}

// 工具函数：延迟
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主执行函数
async function main() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔥 AgentForge 自动化增长脚本
  剑走偏锋 - 主动出击版
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  log('🚀 开始执行自动化增长策略...');
  log('');

  try {
    // 执行所有策略
    await autoStarRelatedProjects();
    log('');

    await followRelatedDevelopers();
    log('');

    await createEngagingIssues();
    log('');

    await updateREADMEWithStats();
    log('');

    await commentOnRelatedDiscussions();
    log('');

    await submitToAwesomeLists();
    log('');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('✅ 自动化增长脚本执行完成！');
    log('');
    log('📊 预期效果（24-72小时）：');
    log('  - 被Star的项目开发者看到你的活动');
    log('  - 被关注的开发者收到通知');
    log('  - 有趣的Issues吸引社区参与');
    log('  - Awesome Lists PR带来长期流量');
    log('');
    log('🎯 下一步：');
    log('  1. 监控 auto-interactions.log 查看进度');
    log('  2. 回复任何Issues/Discussions评论');
    log('  3. 手动执行Awesome Lists PR');
    log('  4. 持续互动保持活跃度');
    log('');
    log('💪 永不停止！继续冲刺！');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    log(`❌ 执行出错: ${error.message}`);
    log(error.stack);
    process.exit(1);
  }
}

// 如果直接运行
if (require.main === module) {
  main().catch(error => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  autoStarRelatedProjects,
  followRelatedDevelopers,
  createEngagingIssues,
  updateREADMEWithStats
};
