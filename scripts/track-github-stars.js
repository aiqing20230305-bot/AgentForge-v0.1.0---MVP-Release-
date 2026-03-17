#!/usr/bin/env node

/**
 * GitHub Stars自动追踪脚本
 * 每15分钟自动检查Stars数量并记录
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const REPO = 'aiqing20230305-bot/AgentForge-v0.1.0---MVP-Release-';
let previousStars = 0;
const milestones = {};

// 获取GitHub Stars
async function getGitHubStars() {
  try {
    const { stdout } = await execPromise(
      `gh repo view ${REPO} --json stargazerCount --jq '.stargazerCount'`
    );
    return parseInt(stdout.trim());
  } catch (error) {
    console.error('❌ 获取Stars失败:', error.message);
    return null;
  }
}

// 获取其他指标
async function getGitHubMetrics() {
  try {
    const { stdout } = await execPromise(
      `gh repo view ${REPO} --json forkCount,watchers --jq '{forks:.forkCount,watchers:.watchers.totalCount}'`
    );
    return JSON.parse(stdout);
  } catch (error) {
    console.error('❌ 获取指标失败:', error.message);
    return { forks: 0, watchers: 0 };
  }
}

// 追踪Stars变化
async function trackStarsGrowth() {
  const now = new Date();
  const timestamp = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const stars = await getGitHubStars();
  if (stars === null) return;

  const metrics = await getGitHubMetrics();
  const delta = stars - previousStars;

  console.log('\n' + '='.repeat(50));
  console.log(`⏰ 检查时间: ${timestamp}`);
  console.log(`⭐ 当前Stars: ${stars} ${delta > 0 ? `(+${delta})` : ''}`);
  console.log(`🍴 Forks: ${metrics.forks}`);
  console.log(`👀 Watchers: ${metrics.watchers}`);
  console.log('='.repeat(50));

  // 检查里程碑
  checkMilestones(stars);

  // 记录历史
  logToHistory(timestamp, stars, metrics.forks, metrics.watchers, delta);

  previousStars = stars;
}

// 检查里程碑
function checkMilestones(stars) {
  const milestonesList = [
    { value: 10, message: '🎉 恭喜！达到10 Stars！' },
    { value: 50, message: '🚀 太棒了！50 Stars达成！' },
    { value: 100, message: '💯 百星成就解锁！' },
    { value: 300, message: '🌟 300 Stars！持续增长中！' },
    { value: 500, message: '🏆 500 Stars里程碑！' },
    { value: 1000, message: '🎊 1000 Stars！目标达成！Pro License发放！' },
    { value: 10000, message: '🎉 10K Stars！全队放假1天！' }
  ];

  for (const milestone of milestonesList) {
    if (stars >= milestone.value && !milestones[milestone.value]) {
      console.log('\n' + '🎉'.repeat(20));
      console.log(`   ${milestone.message}`);
      console.log('🎉'.repeat(20) + '\n');
      milestones[milestone.value] = true;
    }
  }
}

// 记录到历史文件
function logToHistory(timestamp, stars, forks, watchers, delta) {
  const fs = require('fs');
  const logFile = './growth-history.csv';

  // 如果文件不存在，创建并写入表头
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, 'Timestamp,Stars,Forks,Watchers,Delta\n');
  }

  // 追加记录
  fs.appendFileSync(logFile, `${timestamp},${stars},${forks},${watchers},${delta}\n`);
}

// 显示增长趋势
async function showGrowthTrend() {
  const fs = require('fs');
  const logFile = './growth-history.csv';

  if (!fs.existsSync(logFile)) {
    console.log('📊 还没有历史数据');
    return;
  }

  const data = fs.readFileSync(logFile, 'utf8').split('\n').slice(1, -1);
  if (data.length < 2) {
    console.log('📊 数据不足，需要更多记录');
    return;
  }

  const latest = data[data.length - 1].split(',');
  const oldest = data[0].split(',');

  const totalGrowth = parseInt(latest[1]) - parseInt(oldest[1]);
  const hours = (new Date(latest[0]) - new Date(oldest[0])) / (1000 * 60 * 60);
  const growthRate = totalGrowth / hours;

  console.log('\n📊 增长趋势分析:');
  console.log(`   总增长: ${totalGrowth} Stars`);
  console.log(`   时间跨度: ${hours.toFixed(1)} 小时`);
  console.log(`   平均增速: ${growthRate.toFixed(2)} Stars/小时`);

  // 预测
  const currentStars = parseInt(latest[1]);
  const target = 1000;
  if (currentStars < target && growthRate > 0) {
    const hoursToTarget = (target - currentStars) / growthRate;
    console.log(`   预计达到1000 Stars: ${hoursToTarget.toFixed(1)} 小时后`);
  }
}

// 主函数
async function main() {
  console.log('🚀 启动GitHub Stars自动追踪系统...');
  console.log(`📦 仓库: ${REPO}`);
  console.log('⏱️  每15分钟检查一次\n');

  // 立即执行一次
  await trackStarsGrowth();
  await showGrowthTrend();

  // 每15分钟执行一次
  setInterval(async () => {
    await trackStarsGrowth();
    await showGrowthTrend();
  }, 15 * 60 * 1000);

  console.log('\n✅ 追踪系统已启动！按Ctrl+C停止');
}

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n👋 停止追踪系统...');
  console.log('📊 查看完整历史: cat growth-history.csv\n');
  process.exit(0);
});

// 执行
main();
