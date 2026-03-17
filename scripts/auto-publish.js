#!/usr/bin/env node

/**
 * AgentForge 自动发布系统
 * 自动发布到Twitter和Reddit
 */

const fs = require('fs');
const path = require('path');

// 检查.env文件
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ 未找到.env文件！');
    console.log('');
    console.log('请先配置API密钥：');
    console.log('1. 复制.env.example为.env');
    console.log('2. 填入您的API密钥');
    console.log('3. 运行: node scripts/setup-api.js');
    console.log('');
    process.exit(1);
  }

  require('dotenv').config({ path: envPath });

  // 检查必需的环境变量
  const required = [
    'TWITTER_API_KEY',
    'REDDIT_CLIENT_ID',
    'REPO_FULL_NAME'
  ];

  const missing = required.filter(key => !process.env[key] || process.env[key].includes('your_'));

  if (missing.length > 0) {
    console.log('❌ 缺少必需的环境变量：');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('');
    console.log('请运行: node scripts/setup-api.js 进行配置');
    console.log('');
    process.exit(1);
  }

  return true;
}

// 读取发布内容
function readContent(filename) {
  const filepath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`文件不存在: ${filename}`);
  }
  return fs.readFileSync(filepath, 'utf8');
}

// 发布到Twitter (需要twitter-api-v2包)
async function publishToTwitter() {
  console.log('🐦 正在发布到Twitter...');

  try {
    const { TwitterApi } = require('twitter-api-v2');

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const content = readContent('READY_TO_POST_TWITTER_1.txt');
    const tweet = await client.v2.tweet(content);

    console.log('✅ Twitter发布成功！');
    console.log(`   链接: https://twitter.com/user/status/${tweet.data.id}`);

    return tweet;
  } catch (error) {
    console.error('❌ Twitter发布失败:', error.message);
    if (error.message.includes('Cannot find module')) {
      console.log('');
      console.log('请先安装依赖: npm install twitter-api-v2');
    }
    throw error;
  }
}

// 发布到Reddit (需要snoowrap包)
async function publishToReddit(subreddit, titleFile, contentFile) {
  console.log(`📝 正在发布到Reddit r/${subreddit}...`);

  try {
    const snoowrap = require('snoowrap');

    const reddit = new snoowrap({
      userAgent: 'AgentForge Growth Bot v1.0',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    });

    const fullContent = readContent(contentFile);
    const lines = fullContent.split('\n');
    const title = lines[0].replace('标题：', '').trim();

    // 找到正文部分
    const bodyStartIndex = lines.findIndex(line => line.includes('正文：'));
    const body = lines.slice(bodyStartIndex + 2).join('\n').trim();

    const submission = await reddit
      .getSubreddit(subreddit)
      .submitSelfpost({
        title: title,
        text: body
      });

    console.log(`✅ Reddit r/${subreddit} 发布成功！`);
    console.log(`   链接: https://reddit.com${submission.permalink}`);

    return submission;
  } catch (error) {
    console.error(`❌ Reddit r/${subreddit} 发布失败:`, error.message);
    if (error.message.includes('Cannot find module')) {
      console.log('');
      console.log('请先安装依赖: npm install snoowrap');
    }
    throw error;
  }
}

// 主函数
async function main() {
  console.log('🚀 AgentForge 自动发布系统');
  console.log('='.repeat(50));
  console.log('');

  // 检查环境配置
  try {
    checkEnvFile();
  } catch (error) {
    return;
  }

  console.log('📋 发布计划:');
  console.log('   1. Twitter推文');
  console.log('   2. Reddit r/programming');
  console.log('   3. Reddit r/opensource');
  console.log('');

  const results = {
    twitter: null,
    reddit_programming: null,
    reddit_opensource: null
  };

  // 1. 发布到Twitter
  try {
    results.twitter = await publishToTwitter();
    console.log('');
  } catch (error) {
    console.log('   跳过Twitter发布');
    console.log('');
  }

  // 等待10分钟后发布Reddit (避免被限制)
  console.log('⏰ 等待10分钟后发布Reddit...');
  await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));

  // 2. 发布到Reddit r/programming
  try {
    results.reddit_programming = await publishToReddit(
      'programming',
      'READY_TO_POST_REDDIT_PROGRAMMING.txt',
      'READY_TO_POST_REDDIT_PROGRAMMING.txt'
    );
    console.log('');
  } catch (error) {
    console.log('   跳过Reddit r/programming发布');
    console.log('');
  }

  // 等待10分钟
  console.log('⏰ 等待10分钟后发布下一个Reddit...');
  await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));

  // 3. 发布到Reddit r/opensource
  try {
    results.reddit_opensource = await publishToReddit(
      'opensource',
      'READY_TO_POST_REDDIT_OPENSOURCE.txt',
      'READY_TO_POST_REDDIT_OPENSOURCE.txt'
    );
    console.log('');
  } catch (error) {
    console.log('   跳过Reddit r/opensource发布');
    console.log('');
  }

  // 总结
  console.log('');
  console.log('='.repeat(50));
  console.log('📊 发布完成总结:');
  console.log('');

  if (results.twitter) {
    console.log('✅ Twitter: 已发布');
  } else {
    console.log('❌ Twitter: 未发布');
  }

  if (results.reddit_programming) {
    console.log('✅ Reddit r/programming: 已发布');
  } else {
    console.log('❌ Reddit r/programming: 未发布');
  }

  if (results.reddit_opensource) {
    console.log('✅ Reddit r/opensource: 已发布');
  } else {
    console.log('❌ Reddit r/opensource: 未发布');
  }

  console.log('');
  console.log('🎉 发布流程完成！');
  console.log('');
  console.log('💡 提示:');
  console.log('   - 追踪系统会自动监控Stars增长');
  console.log('   - 记得回复评论和互动');
  console.log('   - 查看进度: cat growth-history.csv');
  console.log('');
}

// 执行
if (require.main === module) {
  main().catch(error => {
    console.error('');
    console.error('💥 发布过程出错:', error.message);
    console.error('');
    process.exit(1);
  });
}

module.exports = { publishToTwitter, publishToReddit };
