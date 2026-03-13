#!/usr/bin/env node
/**
 * 简单的静态文件服务器
 * 用于临时提供图片访问给视频生成 API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 18788;
const IMAGES_DIR = path.join(__dirname, '../public/images/agents/gallery');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const filePath = path.join(IMAGES_DIR, path.basename(req.url));

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ 静态文件服务器已启动: http://localhost:${PORT}/`);
  console.log(`📁 提供目录: ${IMAGES_DIR}`);
});

module.exports = server;
