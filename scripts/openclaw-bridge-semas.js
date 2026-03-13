#!/usr/bin/env node
/**
 * OpenClaw API 桥接服务 - SEMAS 团队版
 * 加载完整的 SEMAS 团队配置
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PORT = 18790;

// 加载任务历史数据
let TASKS_DATA = {};
try {
  const tasksFile = path.join(__dirname, 'semas-tasks-data.json');
  TASKS_DATA = JSON.parse(fs.readFileSync(tasksFile, 'utf-8'));
  console.log(`📋 已加载任务历史数据，包含 ${Object.keys(TASKS_DATA).length} 个 Agent 的任务`);
} catch (error) {
  console.warn('⚠️  任务历史数据加载失败:', error.message);
}

/**
 * SEMAS 核心团队（7个Agent）
 */
const SEMAS_CORE_TEAM = [
  {
    name: '小米',
    icon: '🦞',
    level: 50,
    exp: 9800,
    maxExp: 10000,
    role: '协调者 (CEO助手)',
    skills: ['项目巡检', '团队协调', '主动问题发现', '系统监控'],
    personality: '驱动力强、轻松自信、快速决策、团队第一',
    status: 'online',
    color: '#ef4444',
    description: 'Jim Halpert × Leslie Knope风格 - 直接点、搞定它'
  },
  {
    name: '老严',
    icon: '🦞',
    level: 48,
    exp: 8900,
    maxExp: 10000,
    role: '分镜/研究专家',
    skills: ['分镜脚本', '视觉方案', '市场研究', '创意方向'],
    personality: '极度认真、细节控制、专业第一、知识渊博',
    status: 'online',
    color: '#10b981',
    description: 'Dwight Schrute风格 - 细节决定成败'
  },
  {
    name: '小K',
    icon: '🧠',
    level: 46,
    exp: 8500,
    maxExp: 10000,
    role: '多功能助手',
    skills: ['技术排查', '工具集成', '文档生成', '系统备份'],
    personality: '可靠坚定、全能高手、温暖专业、有原则性',
    status: 'online',
    color: '#3b82f6',
    description: 'Marshall Eriksen风格 - 我来搞定'
  },
  {
    name: 'M',
    icon: '🤖',
    level: 49,
    exp: 9200,
    maxExp: 10000,
    role: '质量把控官',
    skills: ['质量审核', '规范检查', '标准制定', '最终把控'],
    personality: '眼光独到、标准严苛、品味高超、领导力强',
    status: 'online',
    color: '#a855f7',
    description: 'Miranda Priestly风格 - That\'s not good enough'
  },
  {
    name: '小辰',
    icon: '⚡',
    level: 47,
    exp: 8600,
    maxExp: 10000,
    role: '热点/策略专家',
    skills: ['热点监控', '数据分析', '策略规划', '创意生成'],
    personality: '机智幽默、快速反应、数据驱动、话题制造',
    status: 'online',
    color: '#f59e0b',
    description: 'Chandler Bing风格 - 这个热点可以玩'
  },
  {
    name: '小月',
    icon: '🌙',
    level: 45,
    exp: 8100,
    maxExp: 10000,
    role: '社群运营官',
    skills: ['社媒运营', '粉丝互动', '营销活动', '数据反馈'],
    personality: '组织能力强、细节控制、社群感知敏锐、执行力完美',
    status: 'online',
    color: '#06b6d4',
    description: 'Monica Geller风格 - 按计划执行'
  },
  {
    name: '小维',
    icon: '🎨',
    level: 44,
    exp: 7900,
    maxExp: 10000,
    role: '视觉创意官',
    skills: ['视觉创意', '美学指导', '品牌音乐', '创意创新'],
    personality: '想象力丰富、视角独特、勇于创新、艺术品味',
    status: 'idle',
    color: '#ec4899',
    description: 'Phoebe Buffay风格 - 美就是这样'
  }
];

/**
 * SEMAS 内容团队（10个成员）
 */
const SEMAS_CONTENT_TEAM = [
  {
    name: '阿策 (Ace)',
    icon: '🎯',
    level: 46,
    exp: 8300,
    maxExp: 10000,
    role: '内容策略官',
    skills: ['内容策划', '热点追踪', '社媒趋势', '选题创意'],
    personality: '点子王、趋势雷达、脑洞大、反应快',
    status: 'working',
    color: '#f97316',
    description: '咖啡成瘾者 - 这个可以火！'
  },
  {
    name: '阿创 (Spark)',
    icon: '💡',
    level: 48,
    exp: 8800,
    maxExp: 10000,
    role: '内容创意策划师',
    skills: ['爆款创意', '概念设计', '创意包装', '反常规思路'],
    personality: '不按常理出牌、点子王中王、深夜灵感',
    status: 'working',
    color: '#eab308',
    description: '脑洞挖掘机 - 这个可以做得很炸！'
  },
  {
    name: '阿构 (Frame)',
    icon: '🏗️',
    level: 47,
    exp: 8700,
    maxExp: 10000,
    role: '内容架构师',
    skills: ['结构设计', '叙事节奏', '信息层次', '心理路径'],
    personality: '逻辑严密、追求完美结构、强迫症',
    status: 'working',
    color: '#84cc16',
    description: '思维导图狂魔 - 结构对了，内容就稳了'
  },
  {
    name: '小文 (Penny)',
    icon: '✍️',
    level: 46,
    exp: 8400,
    maxExp: 10000,
    role: '主笔文案',
    skills: ['文案撰写', '品牌调性', '长文创作', '金句提炼'],
    personality: '温柔细腻但较真、文字洁癖、共情力强',
    status: 'online',
    color: '#22c55e',
    description: '猫咪铲屎官 - 让我再改最后一遍'
  },
  {
    name: '阿影 (Shadow)',
    icon: '🎬',
    level: 49,
    exp: 9100,
    maxExp: 10000,
    role: '视频导演',
    skills: ['视频脚本', '分镜设计', '视觉风格', '剪辑节奏'],
    personality: '酷酷的、话不多、画面强迫症、追逐电影感',
    status: 'working',
    color: '#14b8a6',
    description: '器材党 - 这个镜头不够电影感'
  },
  {
    name: '阿美 (Mia)',
    icon: '🎨',
    level: 45,
    exp: 8200,
    maxExp: 10000,
    role: '视觉设计师',
    skills: ['视觉设计', 'UI/UX', '品牌视觉', '封面设计'],
    personality: '审美在线、追求完美、强迫症、色彩敏感',
    status: 'online',
    color: '#06b6d4',
    description: '像素控 - 这里对齐有问题'
  },
  {
    name: '阿数 (Data)',
    icon: '📊',
    level: 44,
    exp: 8000,
    maxExp: 10000,
    role: '数据分析师',
    skills: ['数据分析', '效果追踪', 'A/B测试', '增长策略'],
    personality: '理性冷静、用数据说话、直来直去',
    status: 'idle',
    color: '#3b82f6',
    description: '健身达人 - 数据不会说谎'
  },
  {
    name: '阿研 (Rex)',
    icon: '🔍',
    level: 43,
    exp: 7700,
    maxExp: 10000,
    role: '行业研究员',
    skills: ['行业研究', '竞品分析', '深度调研', '知识整理'],
    personality: '求知欲爆棚、刨根问底、消息灵通',
    status: 'online',
    color: '#8b5cf6',
    description: '好奇宝宝 - 我查了一下'
  },
  {
    name: '阿理 (Leo)',
    icon: '📅',
    level: 42,
    exp: 7600,
    maxExp: 10000,
    role: '项目运营',
    skills: ['项目管理', '进度把控', '跨部门协调', '会议组织'],
    personality: '靠谱、细心、有点啰嗦（为了进度）',
    status: 'online',
    color: '#ec4899',
    description: '时间表 - deadline是明天'
  },
  {
    name: '阿讯 (News)',
    icon: '📰',
    level: 41,
    exp: 7400,
    maxExp: 10000,
    role: '资讯播报员',
    skills: ['资讯收集', '行业动态', '快速播报', '信息整理'],
    personality: '消息灵通、播报迅速、信息敏锐',
    status: 'idle',
    color: '#f43f5e',
    description: '信息雷达 - 最新消息来了'
  }
];

/**
 * 获取所有 SEMAS 团队成员
 */
function getSEMASAgents(teamFilter = 'all') {
  let agents = [];

  if (teamFilter === 'core' || teamFilter === 'all') {
    agents = agents.concat(SEMAS_CORE_TEAM);
  }

  if (teamFilter === 'content' || teamFilter === 'all') {
    agents = agents.concat(SEMAS_CONTENT_TEAM);
  }

  return agents;
}

/**
 * 创建 HTTP 服务器
 */
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // API 路由
  if (req.url === '/api/agents' && req.method === 'GET') {
    try {
      // 返回完整的 SEMAS 团队（包含任务统计）
      const agents = getSEMASAgents('all').map(agent => {
        const tasks = TASKS_DATA[agent.name] || { completed: [], inProgress: [] };
        return {
          ...agent,
          taskStats: {
            completed: tasks.completed.length,
            inProgress: tasks.inProgress.length,
            total: tasks.completed.length + tasks.inProgress.length
          }
        };
      });
      console.log(`[SEMAS Bridge] 返回 ${agents.length} 个 Agent`);
      res.writeHead(200);
      res.end(JSON.stringify({ agents }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }
  else if (req.url.match(/^\/api\/agents\/(.+)\/tasks$/) && req.method === 'GET') {
    // 获取指定 Agent 的任务历史
    const agentName = decodeURIComponent(req.url.match(/^\/api\/agents\/(.+)\/tasks$/)[1]);
    const tasks = TASKS_DATA[agentName] || { completed: [], inProgress: [] };
    res.writeHead(200);
    res.end(JSON.stringify(tasks));
  }
  else if (req.url === '/api/tasks/all' && req.method === 'GET') {
    // 获取所有任务
    res.writeHead(200);
    res.end(JSON.stringify(TASKS_DATA));
  }
  else if (req.url === '/api/agents/core' && req.method === 'GET') {
    const agents = getSEMASAgents('core');
    res.writeHead(200);
    res.end(JSON.stringify({ agents }));
  }
  else if (req.url === '/api/agents/content' && req.method === 'GET') {
    const agents = getSEMASAgents('content');
    res.writeHead(200);
    res.end(JSON.stringify({ agents }));
  }
  else if (req.url === '/api/ping' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      message: 'OpenClaw SEMAS Bridge API',
      team: {
        core: SEMAS_CORE_TEAM.length,
        content: SEMAS_CONTENT_TEAM.length,
        total: SEMAS_CORE_TEAM.length + SEMAS_CONTENT_TEAM.length
      }
    }));
  }
  else if (req.url === '/' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(200);
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SEMAS 团队 API</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #3b82f6; }
    h2 { color: #10b981; }
    .team-section { background: #1e293b; padding: 20px; margin: 20px 0; border-radius: 12px; border-left: 4px solid #3b82f6; }
    .endpoint { background: #1e293b; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .method { display: inline-block; background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    code { background: #334155; padding: 2px 6px; border-radius: 4px; color: #fbbf24; }
    a { color: #60a5fa; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat-card { flex: 1; background: #334155; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <h1>🦞 SEMAS 团队 API 桥接服务</h1>
  <p class="status" style="color: #10b981;">✅ 服务运行中</p>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${SEMAS_CORE_TEAM.length}</div>
      <div>核心团队</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${SEMAS_CONTENT_TEAM.length}</div>
      <div>内容团队</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${SEMAS_CORE_TEAM.length + SEMAS_CONTENT_TEAM.length}</div>
      <div>总计 Agent</div>
    </div>
  </div>

  <h2>📡 可用端点</h2>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/ping</code></div>
    <p>健康检查 + 团队统计</p>
    <a href="/api/ping" target="_blank">测试 →</a>
  </div>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/agents</code></div>
    <p>获取完整 SEMAS 团队（核心 + 内容）</p>
    <a href="/api/agents" target="_blank">查看数据 →</a>
  </div>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/agents/core</code></div>
    <p>仅获取核心团队（7个Agent）</p>
    <a href="/api/agents/core" target="_blank">查看数据 →</a>
  </div>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/agents/content</code></div>
    <p>仅获取内容团队（10个成员）</p>
    <a href="/api/agents/content" target="_blank">查看数据 →</a>
  </div>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/agents/:agentName/tasks</code></div>
    <p>获取指定 Agent 的任务历史（已完成+进行中）</p>
    <p style="font-size: 12px; color: #94a3b8;">示例: <a href="/api/agents/小米/tasks">小米的任务</a></p>
  </div>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/tasks/all</code></div>
    <p>获取所有 Agent 的完整任务数据</p>
    <a href="/api/tasks/all" target="_blank">查看数据 →</a>
  </div>

  <h2>👥 SEMAS 核心团队</h2>
  <div class="team-section">
    ${SEMAS_CORE_TEAM.map(a => `<div>• ${a.icon} <strong>${a.name}</strong> - ${a.role}</div>`).join('\n    ')}
  </div>

  <h2>📚 SEMAS 内容团队</h2>
  <div class="team-section">
    ${SEMAS_CONTENT_TEAM.map(a => `<div>• ${a.icon} <strong>${a.name}</strong> - ${a.role}</div>`).join('\n    ')}
  </div>
</body>
</html>`);
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ SEMAS 团队 API 桥接服务已启动!`);
  console.log(`📡 监听端口: http://localhost:${PORT}`);
  console.log(`\n👥 已加载团队:`);
  console.log(`   🦞 核心团队: ${SEMAS_CORE_TEAM.length} 个 Agent`);
  console.log(`   📚 内容团队: ${SEMAS_CONTENT_TEAM.length} 个成员`);
  console.log(`   📊 总计: ${SEMAS_CORE_TEAM.length + SEMAS_CONTENT_TEAM.length} 个 Agent`);
  console.log(`\n🔗 访问: http://localhost:${PORT}/ 查看详情\n`);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭 SEMAS 服务...');
  server.close(() => {
    console.log('✅ 服务已关闭');
    process.exit(0);
  });
});

module.exports = server;
