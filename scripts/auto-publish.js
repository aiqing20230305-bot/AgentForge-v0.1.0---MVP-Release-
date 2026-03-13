#!/usr/bin/env node

/**
 * AgentForge - 自动发布到 GitHub
 *
 * 使用方法：
 * 1. 设置环境变量：export GITHUB_TOKEN=your_token_here
 * 2. 运行：node scripts/auto-publish.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const REPO_OWNER = 'Summonair';
const REPO_NAME = 'world-of-claudecraft';
const TAG = 'v0.1.0';

console.log('🚀 AgentForge - 自动发布脚本');
console.log('================================\n');

// 检查 GitHub Token
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('❌ 错误：未设置 GITHUB_TOKEN 环境变量');
  console.log('\n请执行：');
  console.log('  export GITHUB_TOKEN=your_personal_access_token\n');
  console.log('生成 Token：https://github.com/settings/tokens');
  console.log('权限需要：repo (全部)\n');
  process.exit(1);
}

console.log('✓ GitHub Token 已设置\n');

// Step 1: 推送代码
console.log('📤 步骤 1/3：推送代码到 GitHub...');
try {
  execSync('git push origin main', {
    stdio: 'inherit',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  });
  console.log('✓ 主分支推送成功\n');
} catch (error) {
  console.error('❌ 推送失败，请检查网络连接或权限');
  console.error('   可以手动执行：git push origin main\n');
  process.exit(1);
}

// Step 2: 推送标签
console.log('🏷️  步骤 2/3：推送标签...');
try {
  execSync(`git push origin ${TAG} --force`, {
    stdio: 'inherit',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  });
  console.log('✓ 标签推送成功\n');
} catch (error) {
  console.error('❌ 标签推送失败');
  console.error(`   可以手动执行：git push origin ${TAG} --force\n`);
  process.exit(1);
}

// Step 3: 创建 Release
console.log('📝 步骤 3/3：创建 GitHub Release...');

const releaseBody = fs.readFileSync('GITHUB_RELEASE_COPY.txt', 'utf8')
  .replace(/^# 复制以下内容到 GitHub Release[\s\S]*?={80,}\n/, '')
  .replace(/={80,}/, '')
  .trim();

const releaseData = JSON.stringify({
  tag_name: TAG,
  name: 'AgentForge v0.1.0 - MVP Release 🎉',
  body: releaseBody,
  draft: false,
  prerelease: false
});

const options = {
  hostname: 'api.github.com',
  path: `/repos/${REPO_OWNER}/${REPO_NAME}/releases`,
  method: 'POST',
  headers: {
    'User-Agent': 'AgentForge-Publisher',
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(releaseData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 201) {
      const release = JSON.parse(data);
      console.log('✓ Release 创建成功！\n');
      console.log('🎉 发布完成！');
      console.log(`\n📍 查看 Release：${release.html_url}\n`);

      console.log('🎊 AgentForge v0.1.0 已成功发布到 GitHub！');
      console.log('   项目地址：https://github.com/Summonair/world-of-claudecraft\n');
    } else {
      console.error(`❌ Release 创建失败 (状态码: ${res.statusCode})`);
      console.error(`   响应：${data}\n`);
      console.log('💡 可以手动创建 Release：');
      console.log(`   https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/new`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 网络错误：', error.message);
  console.log('\n请检查网络连接或手动创建 Release');
  process.exit(1);
});

req.write(releaseData);
req.end();
