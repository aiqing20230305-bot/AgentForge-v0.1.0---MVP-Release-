#!/usr/bin/env node

/**
 * API配置向导
 * 交互式配置Twitter和Reddit API
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔧 AgentForge API配置向导');
  console.log('='.repeat(50));
  console.log('');

  // 检查是否存在.env文件
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env文件已存在');
    const overwrite = await question('是否覆盖? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('已取消');
      rl.close();
      return;
    }
  }

  console.log('');
  console.log('请选择配置方式:');
  console.log('  1. 完整配置 (Twitter + Reddit + GitHub)');
  console.log('  2. 快速配置 (仅GitHub - 用于追踪Stars)');
  console.log('  3. 手动配置 (我自己编辑.env文件)');
  console.log('');

  const choice = await question('请选择 (1-3): ');
  console.log('');

  let config = {};

  if (choice === '1') {
    // 完整配置
    console.log('📱 Twitter API配置');
    console.log('获取方式: https://developer.twitter.com/en/portal/dashboard');
    console.log('');

    config.TWITTER_API_KEY = await question('Twitter API Key: ');
    config.TWITTER_API_SECRET = await question('Twitter API Secret: ');
    config.TWITTER_ACCESS_TOKEN = await question('Twitter Access Token: ');
    config.TWITTER_ACCESS_SECRET = await question('Twitter Access Secret: ');

    console.log('');
    console.log('📝 Reddit API配置');
    console.log('获取方式: https://www.reddit.com/prefs/apps');
    console.log('');

    config.REDDIT_CLIENT_ID = await question('Reddit Client ID: ');
    config.REDDIT_CLIENT_SECRET = await question('Reddit Client Secret: ');
    config.REDDIT_USERNAME = await question('Reddit Username: ');
    config.REDDIT_PASSWORD = await question('Reddit Password: ');

    console.log('');
    console.log('🔐 GitHub Token');
    console.log('获取方式: https://github.com/settings/tokens');
    console.log('');

    config.GITHUB_TOKEN = await question('GitHub Token (可选，回车跳过): ');

  } else if (choice === '2') {
    // 快速配置
    console.log('🔐 GitHub Token (用于追踪Stars)');
    console.log('获取方式: https://github.com/settings/tokens');
    console.log('');

    config.GITHUB_TOKEN = await question('GitHub Token (可选，回车跳过): ');

    // 其他留空
    config.TWITTER_API_KEY = 'your_twitter_api_key_here';
    config.TWITTER_API_SECRET = 'your_twitter_api_secret_here';
    config.TWITTER_ACCESS_TOKEN = 'your_twitter_access_token_here';
    config.TWITTER_ACCESS_SECRET = 'your_twitter_access_secret_here';
    config.REDDIT_CLIENT_ID = 'your_reddit_client_id_here';
    config.REDDIT_CLIENT_SECRET = 'your_reddit_client_secret_here';
    config.REDDIT_USERNAME = 'your_reddit_username';
    config.REDDIT_PASSWORD = 'your_reddit_password';

    console.log('');
    console.log('✅ 快速配置完成！');
    console.log('   Twitter和Reddit API需要后续手动配置');
    console.log('   现在可以使用Stars追踪功能');

  } else {
    // 手动配置
    console.log('📝 手动配置模式');
    console.log('');
    console.log('步骤:');
    console.log('1. 复制.env.example为.env');
    console.log('2. 用文本编辑器打开.env');
    console.log('3. 填入您的API密钥');
    console.log('');

    const copy = await question('现在复制.env.example吗? (y/n): ');
    if (copy.toLowerCase() === 'y') {
      fs.copyFileSync(
        path.join(__dirname, '..', '.env.example'),
        envPath
      );
      console.log('✅ 已复制.env.example到.env');
      console.log('');
      console.log('现在用编辑器打开.env文件进行配置');
    }

    rl.close();
    return;
  }

  // 写入.env文件
  const envContent = `# AgentForge 增长营销自动化 - 环境变量
# 自动生成于 ${new Date().toISOString()}

# Twitter API
TWITTER_API_KEY=${config.TWITTER_API_KEY || 'your_twitter_api_key_here'}
TWITTER_API_SECRET=${config.TWITTER_API_SECRET || 'your_twitter_api_secret_here'}
TWITTER_ACCESS_TOKEN=${config.TWITTER_ACCESS_TOKEN || 'your_twitter_access_token_here'}
TWITTER_ACCESS_SECRET=${config.TWITTER_ACCESS_SECRET || 'your_twitter_access_secret_here'}

# Reddit API
REDDIT_CLIENT_ID=${config.REDDIT_CLIENT_ID || 'your_reddit_client_id_here'}
REDDIT_CLIENT_SECRET=${config.REDDIT_CLIENT_SECRET || 'your_reddit_client_secret_here'}
REDDIT_USERNAME=${config.REDDIT_USERNAME || 'your_reddit_username'}
REDDIT_PASSWORD=${config.REDDIT_PASSWORD || 'your_reddit_password'}

# GitHub
GITHUB_TOKEN=${config.GITHUB_TOKEN || 'your_github_token_here'}

# 仓库信息
REPO_OWNER=aiqing20230305-bot
REPO_NAME=AgentForge-v0.1.0---MVP-Release-
REPO_FULL_NAME=aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-
`;

  fs.writeFileSync(envPath, envContent);

  console.log('');
  console.log('✅ 配置已保存到.env文件');
  console.log('');
  console.log('🔍 配置验证:');

  // 验证配置
  const hasTwitter = !config.TWITTER_API_KEY?.includes('your_');
  const hasReddit = !config.REDDIT_CLIENT_ID?.includes('your_');
  const hasGitHub = config.GITHUB_TOKEN && !config.GITHUB_TOKEN.includes('your_');

  if (hasTwitter) {
    console.log('   ✅ Twitter API已配置');
  } else {
    console.log('   ⚠️  Twitter API未配置');
  }

  if (hasReddit) {
    console.log('   ✅ Reddit API已配置');
  } else {
    console.log('   ⚠️  Reddit API未配置');
  }

  if (hasGitHub) {
    console.log('   ✅ GitHub Token已配置');
  } else {
    console.log('   ⚠️  GitHub Token未配置');
  }

  console.log('');
  console.log('📦 下一步：安装依赖');
  console.log('   npm install twitter-api-v2 snoowrap dotenv');
  console.log('');
  console.log('🚀 然后运行自动发布:');
  console.log('   node scripts/auto-publish.js');
  console.log('');

  rl.close();
}

main().catch(error => {
  console.error('❌ 配置出错:', error.message);
  rl.close();
  process.exit(1);
});
