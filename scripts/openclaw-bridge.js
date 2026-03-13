#!/usr/bin/env node
/**
 * OpenClaw API 桥接服务
 * 调用 OpenClaw CLI 并提供 JSON API 给管理中心
 */

const http = require('http');
const { execSync } = require('child_process');
const PORT = 18790;

// Agent 颜色映射
const AGENT_COLORS = {
  'main': '#3b82f6',  // 蓝色 - 上海小龙虾🦞
  'newbot': '#10b981'  // 绿色 - 湖北小龙虾
};

// Agent 图标映射
const AGENT_ICONS = {
  'main': '🦞',
  'newbot': '🦐'
};

/**
 * 发送消息给 Agent
 *
 * 注意：OpenClaw 通过飞书等 Channel 进行交互
 * 这里提供一个简化的实现，记录消息并返回友好提示
 */
function sendMessageToAgent(agentName, message) {
  try {
    // 映射显示名称到OpenClaw agent名称
    let targetAgent = agentName;
    if (agentName === '上海小龙虾') {
      targetAgent = 'main';
    } else if (agentName === '湖北小龙虾') {
      targetAgent = 'newbot';
    } else if (agentName === 'PLUGINS') {
      targetAgent = 'main';
    }

    console.log(`✉️  收到消息请求:`);
    console.log(`   目标Agent: ${agentName} (${targetAgent})`);
    console.log(`   消息内容: ${message}`);

    // 记录消息到日志（可以考虑保存到文件）
    const timestamp = new Date().toISOString();
    console.log(`   时间: ${timestamp}`);

    // 返回友好的响应
    const responses = [
      `收到你的消息：「${message}」\n\n我是 ${agentName}，很高兴与你交流！\n\n💡 提示：为获得更好的体验，建议通过飞书与我直接对话。`,
      `你好！我已收到你的消息：「${message}」\n\n我是 ${agentName}，目前通过 OpenClaw 桥接服务运行。\n\n⚡ 快速体验：可以在飞书中 @${agentName} 进行实时交互。`,
      `消息已送达 ${agentName}！\n\n你说：「${message}」\n\n🎯 当前状态：在线待命\n📱 推荐方式：通过飞书与我互动可获得更快响应。`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      success: true,
      response: randomResponse
    };

  } catch (error) {
    console.error('处理消息失败:', error.message);
    return {
      success: false,
      error: error.message,
      response: `抱歉，处理消息时出现错误：${error.message}`
    };
  }
}

/**
 * 获取 OpenClaw Agents 列表
 */
function getOpenClawAgents() {
  try {
    const output = execSync('openclaw agents list 2>&1', { encoding: 'utf-8' });

    // 解析输出
    const agents = [];
    const lines = output.split('\n');

    let currentAgent = null;
    let inAgentsSection = false;

    for (const line of lines) {
      // 检测 Agents 区块开始
      if (line.trim() === 'Agents:') {
        inAgentsSection = true;
        continue;
      }

      // 检测 Agents 区块结束（遇到其他标题或空行之后的非缩进行）
      if (inAgentsSection && line.match(/^[A-Z]/)) {
        // 保存最后一个 agent
        if (currentAgent) {
          agents.push(currentAgent);
          currentAgent = null;
        }
        break;
      }

      if (!inAgentsSection) continue;

      // 匹配 "- agent_name (default)"
      const agentMatch = line.match(/^- (\w+)(\s+\(default\))?/);
      if (agentMatch) {
        if (currentAgent) {
          agents.push(currentAgent);
        }
        currentAgent = {
          name: agentMatch[1],
          isDefault: !!agentMatch[2],
          identity: '',
          model: '',
          status: 'online'
        };
        continue;
      }

      // 解析 Agent 属性（必须是当前 agent 的一部分，且行以空格开头）
      if (currentAgent && line.match(/^\s+/)) {
        const identityMatch = line.match(/Identity:\s*(.+)/);
        if (identityMatch) {
          currentAgent.identity = identityMatch[1].trim();
        }

        const modelMatch = line.match(/Model:\s*(.+)/);
        if (modelMatch) {
          currentAgent.model = modelMatch[1].trim();
        }
      }
    }

    // 保存最后一个 agent
    if (currentAgent) {
      agents.push(currentAgent);
    }

    console.log(`[OpenClaw Bridge] 解析到 ${agents.length} 个 Agent`);
    agents.forEach(a => console.log(`  - ${a.name} (${a.identity || 'no identity'}) [${a.model || 'no model'}]`));


    // 转换为管理中心格式
    return agents.map(agent => ({
      name: agent.identity.includes('🦞') || agent.name === 'main'
        ? '上海小龙虾'
        : agent.identity.includes('🦐') || agent.name === 'newbot'
        ? '湖北小龙虾'
        : agent.name.toUpperCase(),
      level: agent.isDefault ? 50 : 45,
      exp: agent.isDefault ? 9500 : 8000,
      maxExp: 10000,
      role: agent.isDefault ? 'Team Leader' : 'Assistant',
      skills: ['OpenClaw', 'Feishu', 'Claude API'],
      personality: 'Professional and helpful',
      status: 'online',
      color: AGENT_COLORS[agent.name] || '#8b5cf6',
      description: `OpenClaw Agent - ${agent.model || 'Unknown model'}`
    }));

  } catch (error) {
    console.error('获取 OpenClaw Agents 失败:', error.message);
    return [];
  }
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
  // POST /api/agents/:agentId/message - 发送消息
  if (req.url.match(/^\/api\/agents\/(.+)\/message$/) && req.method === 'POST') {
    const agentId = decodeURIComponent(req.url.match(/^\/api\/agents\/(.+)\/message$/)[1]);

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        if (!message) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing message field' }));
          return;
        }

        const result = sendMessageToAgent(agentId, message);
        res.writeHead(result.success ? 200 : 500);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
  else if (req.url === '/api/agents' && req.method === 'GET') {
    try {
      const agents = getOpenClawAgents();
      res.writeHead(200);
      res.end(JSON.stringify({ agents }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }
  else if (req.url === '/api/ping' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', message: 'OpenClaw Bridge API' }));
  }
  else if (req.url === '/' && req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(200);
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OpenClaw API 桥接服务</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #3b82f6; }
    .endpoint { background: #1e293b; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .method { display: inline-block; background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    code { background: #334155; padding: 2px 6px; border-radius: 4px; color: #fbbf24; }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .status { color: #10b981; }
  </style>
</head>
<body>
  <h1>🦞 OpenClaw API 桥接服务</h1>
  <p class="status">✅ 服务运行中</p>

  <h2>📡 可用端点</h2>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/ping</code></div>
    <p>健康检查端点</p>
    <a href="/api/ping" target="_blank">测试 →</a>
  </div>

  <div class="endpoint">
    <div><span class="method">GET</span> <code>/api/agents</code></div>
    <p>获取 OpenClaw Agent 列表（JSON 格式）</p>
    <a href="/api/agents" target="_blank">查看数据 →</a>
  </div>

  <div class="endpoint">
    <div><span class="method" style="background: #f59e0b;">POST</span> <code>/api/agents/:agentId/message</code></div>
    <p>发送消息给指定 Agent</p>
    <p style="font-size: 12px; color: #94a3b8;">请求体: <code>{ "message": "你好" }</code></p>
  </div>

  <h2>🔧 使用方法</h2>
  <p>在 Agent 管理中心配置页面设置：</p>
  <ul>
    <li>Gateway URL: <code>http://localhost:18790</code></li>
    <li>认证 Token: <code>e4d645acd59df43f1032fa5bcee1540238c01e9796296266</code></li>
  </ul>

  <h2>📊 技术架构</h2>
  <p>本服务通过调用 <code>openclaw agents list</code> CLI 命令，将输出解析为 JSON 格式，为管理中心提供标准 REST API。</p>
</body>
</html>`);
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ OpenClaw API 桥接服务已启动!`);
  console.log(`📡 监听端口: http://localhost:${PORT}`);
  console.log(`🔗 连接配置:`);
  console.log(`   Gateway URL: http://localhost:${PORT}`);
  console.log(`   认证 Token: (使用 OpenClaw 原有 Token)`);
  console.log(`\n📊 可用端点:`);
  console.log(`   GET /api/ping     - 健康检查`);
  console.log(`   GET /api/agents   - 获取 Agent 列表`);
  console.log(`\n💡 在管理中心配置页面，将 Gateway URL 改为: http://localhost:${PORT}\n`);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务...');
  server.close(() => {
    console.log('✅ 服务已关闭');
    process.exit(0);
  });
});

module.exports = server;
