/**
 * Prophet Developer Module
 * 用于开发环境的核心功能模块
 * @module prophet-developer
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class ProphetDeveloper extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // 配置初始化，添加默认值和验证
    this.config = {
      environment: options.environment || process.env.NODE_ENV || 'development',
      debug: options.debug ?? true,
      logLevel: options.logLevel || 'info',
      outputDir: options.outputDir || path.join(process.cwd(), 'output'),
      ...options
    };

    this.initialized = false;
    this.tasks = new Map();
  }

  /**
   * 初始化开发环境
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      if (this.initialized) {
        this.log('warn', 'Already initialized');
        return;
      }

      // 确保输出目录存在
      await this.ensureDirectory(this.config.outputDir);

      // 验证配置
      this.validateConfig();

      this.initialized = true;
      this.emit('initialized', this.config);
      this.log('info', 'Prophet Developer initialized successfully');
    } catch (error) {
      this.handleError('Initialization failed', error);
      throw error;
    }
  }

  /**
   * 验证配置有效性
   * @private
   */
  validateConfig() {
    const requiredFields = ['environment', 'outputDir'];
    const missing = requiredFields.filter(field => !this.config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required config fields: ${missing.join(', ')}`);
    }
  }

  /**
   * 确保目录存在
   * @param {string} dirPath - 目录路径
   * @private
   */
  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
        this.log('info', `Created directory: ${dirPath}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * 注册开发任务
   * @param {string} taskName - 任务名称
   * @param {Function} taskFn - 任务函数
   * @returns {this}
   */
  registerTask(taskName, taskFn) {
    if (!taskName || typeof taskName !== 'string') {
      throw new Error('Task name must be a non-empty string');
    }

    if (typeof taskFn !== 'function') {
      throw new Error('Task function must be a function');
    }

    if (this.tasks.has(taskName)) {
      this.log('warn', `Task "${taskName}" already exists, overwriting`);
    }

    this.tasks.set(taskName, taskFn);
    this.log('info', `Registered task: ${taskName}`);
    return this;
  }

  /**
   * 执行开发任务
   * @param {string} taskName - 任务名称
   * @param {...any} args - 任务参数
   * @returns {Promise<any>}
   */
  async runTask(taskName, ...args) {
    if (!this.initialized) {
      throw new Error('ProphetDeveloper not initialized. Call initialize() first.');
    }

    const task = this.tasks.get(taskName);
    if (!task) {
      throw new Error(`Task "${taskName}" not found`);
    }

    try {
      this.log('info', `Running task: ${taskName}`);
      const startTime = Date.now();
      
      const result = await Promise.resolve(task.apply(this, args));
      
      const duration = Date.now() - startTime;
      this.log('info', `Task "${taskName}" completed in ${duration}ms`);
      this.emit('taskCompleted', { taskName, duration, result });
      
      return result;
    } catch (error) {
      this.handleError(`Task "${taskName}" failed`, error);
      throw error;
    }
  }

  /**
   * 获取配置信息
   * @param {string} key - 配置键
   * @returns {any}
   */
  getConfig(key) {
    return key ? this.config[key] : { ...this.config };
  }

  /**
   * 更新配置
   * @param {Object} updates - 配置更新
   * @returns {this}
   */
  updateConfig(updates = {}) {
    if (typeof updates !== 'object' || updates === null) {
      throw new Error('Config updates must be an object');
    }

    this.config = { ...this.config, ...updates };
    this.emit('configUpdated', this.config);
    this.log('info', 'Configuration updated');
    return this;
  }

  /**
   * 日志记录
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {any} data - 附加数据
   * @private
   */
  log(level, message, data) {
    if (!this.config.debug && level === 'debug') {
      return;
    }

    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const configLevel = levels[this.config.logLevel] ?? 2;
    const currentLevel = levels[level] ?? 2;

    if (currentLevel <= configLevel) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        logMessage,
        data ? data : ''
      );

      this.emit('log', { level, message, data, timestamp });
    }
  }

  /**
   * 错误处理
   * @param {string} context - 错误上下文
   * @param {Error} error - 错误对象
   * @private
   */
  handleError(context, error) {
    const errorInfo = {
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    this.log('error', `${context}: ${error.message}`, errorInfo);
    this.emit('error', errorInfo);
  }

  /**
   * 扫描代码优化机会
   * @param {string} projectPath - 项目路径
   * @returns {Promise<Array>} 优化建议列表
   */
  async scanForOptimizations(projectPath = process.cwd()) {
    try {
      this.log('info', `Scanning for optimizations in: ${projectPath}`);
      const startTime = Date.now();

      const optimizations = [];

      // 1. 查找复杂函数
      const complexFunctions = await this.findComplexFunctions(projectPath);
      optimizations.push(...complexFunctions);

      // 2. 查找重复代码
      const duplicates = await this.findDuplicateCode(projectPath);
      optimizations.push(...duplicates);

      // 3. 查找低效循环
      const inefficientLoops = await this.findInefficientLoops(projectPath);
      optimizations.push(...inefficientLoops);

      // 4. 查找未使用的依赖
      const unusedDeps = await this.findUnusedDependencies(projectPath);
      optimizations.push(...unusedDeps);

      const duration = Date.now() - startTime;
      this.log('info', `Scan completed in ${duration}ms. Found ${optimizations.length} optimization opportunities.`);

      return optimizations;
    } catch (error) {
      this.handleError('Optimization scan failed', error);
      return [];
    }
  }

  /**
   * 查找复杂函数
   * @param {string} projectPath - 项目路径
   * @returns {Promise<Array>} 复杂函数列表
   */
  async findComplexFunctions(projectPath) {
    try {
      const results = [];
      const maxFiles = 200;
      let filesScanned = 0;

      // 动态发现源目录
      const sourceDirs = await this.discoverSourceDirs(projectPath);

      for (const dir of sourceDirs) {
        const files = await this.findFiles(dir, /\.(js|ts|jsx|tsx)$/);

        for (const file of files) {
          if (filesScanned >= maxFiles) break;

          try {
            const content = await fs.readFile(file, 'utf-8');
            const functions = this.extractFunctions(content);

            for (const func of functions) {
              const complexity = this.calculateComplexity(func.body);

              if (complexity > 10) {
                results.push({
                  type: 'complex_function',
                  severity: complexity > 20 ? 'high' : 'medium',
                  file: path.relative(projectPath, file),
                  function: func.name,
                  complexity,
                  line: func.line,
                  suggestion: 'Consider breaking down this function into smaller, more maintainable pieces'
                });
              }
            }

            filesScanned++;
          } catch (err) {
            this.log('debug', `Error processing file ${file}: ${err.message}`);
          }
        }

        if (filesScanned >= maxFiles) break;
      }

      return results;
    } catch (error) {
      this.log('error', 'Error finding complex functions:', error);
      return [];
    }
  }

  /**
   * 动态发现源代码目录
   * @param {string} projectPath - 项目路径
   * @returns {Promise<Array>} 源目录列表
   */
  async discoverSourceDirs(projectPath) {
    const commonDirs = ['src', 'lib', 'app', 'components', 'utils', 'services', 'api'];
    const dirs = [];

    for (const dir of commonDirs) {
      const fullPath = path.join(projectPath, dir);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          dirs.push(fullPath);
        }
      } catch (err) {
        // 目录不存在，跳过
      }
    }

    // 如果没有找到常见目录，使用项目根目录
    if (dirs.length === 0) {
      dirs.push(projectPath);
    }

    return dirs;
  }

  /**
   * 查找文件
   * @param {string} dir - 目录路径
   * @param {RegExp} pattern - 文件名模式
   * @returns {Promise<Array>} 文件列表
   */
  async findFiles(dir, pattern) {
    const results = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // 跳过常见的忽略目录
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
            const subFiles = await this.findFiles(fullPath, pattern);
            results.push(...subFiles);
          }
        } else if (pattern.test(entry.name)) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      this.log('debug', `Error reading directory ${dir}: ${err.message}`);
    }

    return results;
  }

  /**
   * 提取函数定义
   * @param {string} content - 文件内容
   * @returns {Array} 函数列表
   */
  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');

    // 支持多种函数定义模式
    const patterns = [
      // 传统函数: function name() {}
      /^\s*function\s+(\w+)\s*\(/,
      // 箭头函数赋值: const name = () => {}
      /^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/,
      // 箭头函数赋值（无参数）: const name = async () => {}
      /^\s*(?:const|let|var)\s+(\w+)\s*=\s*async\s*\(\)\s*=>/,
      // 方法定义: methodName() {}
      /^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/,
      // Class 方法: async methodName() {}
      /^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const funcName = match[1] || 'anonymous';
          const funcBody = this.extractFunctionBody(lines, i);

          functions.push({
            name: funcName,
            line: i + 1,
            body: funcBody
          });
          break;
        }
      }
    }

    return functions;
  }

  /**
   * 提取函数体
   * @param {Array} lines - 文件行数组
   * @param {number} startLine - 函数起始行
   * @returns {string} 函数体内容
   */
  extractFunctionBody(lines, startLine) {
    let braceCount = 0;
    let body = '';
    let started = false;

    for (let i = startLine; i < lines.length && i < startLine + 200; i++) {
      const line = lines[i];
      body += line + '\n';

      for (const char of line) {
        if (char === '{') {
          braceCount++;
          started = true;
        } else if (char === '}') {
          braceCount--;
        }
      }

      if (started && braceCount === 0) {
        break;
      }
    }

    return body;
  }

  /**
   * 计算圈复杂度
   * @param {string} code - 代码内容
   * @returns {number} 复杂度分数
   */
  calculateComplexity(code) {
    let complexity = 1;

    // 统计控制流语句
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\&\&/g,
      /\|\|/g,
      /\?/g
    ];

    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * 查找重复代码
   * @param {string} projectPath - 项目路径
   * @returns {Promise<Array>} 重复代码列表
   */
  async findDuplicateCode(projectPath) {
    try {
      const results = [];
      const codeBlocks = new Map();
      const sourceDirs = await this.discoverSourceDirs(projectPath);

      for (const dir of sourceDirs) {
        const files = await this.findFiles(dir, /\.(js|ts|jsx|tsx)$/);

        for (const file of files.slice(0, 100)) {
          try {
            const content = await fs.readFile(file, 'utf-8');
            const blocks = this.extractCodeBlocks(content);

            for (const block of blocks) {
              const hash = this.hashCode(block.code);

              if (!codeBlocks.has(hash)) {
                codeBlocks.set(hash, []);
              }

              codeBlocks.get(hash).push({
                file: path.relative(projectPath, file),
                line: block.line
              });
            }
          } catch (err) {
            this.log('debug', `Error processing file ${file}: ${err.message}`);
          }
        }
      }

      // 查找重复
      for (const [hash, locations] of codeBlocks.entries()) {
        if (locations.length > 1) {
          results.push({
            type: 'duplicate_code',
            severity: 'medium',
            locations,
            count: locations.length,
            suggestion: 'Extract this code into a reusable function or module'
          });
        }
      }

      return results;
    } catch (error) {
      this.log('error', 'Error finding duplicate code:', error);
      return [];
    }
  }

  /**
   * 提取代码块
   * @param {string} content - 文件内容
   * @returns {Array} 代码块列表
   */
  extractCodeBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');
    const minBlockSize = 5;

    for (let i = 0; i < lines.length - minBlockSize; i++) {
      const block = lines.slice(i, i + minBlockSize).join('\n').trim();

      if (block.length > 50 && !block.startsWith('//') && !block.startsWith('/*')) {
        blocks.push({
          code: block,
          line: i + 1
        });
      }
    }

    return blocks;
  }

  /**
   * 计算字符串哈希
   * @param {string} str - 字符串
   * @returns {number} 哈希值
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * 查找低效循环
   * @param {string} projectPath - 项目路径
   * @returns {Promise<Array>} 低效循环列表
   */
  async findInefficientLoops(projectPath) {
    try {
      const results = [];
      const sourceDirs = await this.discoverSourceDirs(projectPath);

      for (const dir of sourceDirs) {
        const files = await this.findFiles(dir, /\.(js|ts|jsx|tsx)$/);

        for (const file of files.slice(0, 100)) {
          try {
            const content = await fs.readFile(file, 'utf-8');
            const lines = content.split('\n');

            // 检测嵌套循环
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];

              // 嵌套循环模式
              if (/\bfor\s*\(/.test(line)) {
                const nextLines = lines.slice(i + 1, i + 20).join('\n');
                const nestedLoopCount = (nextLines.match(/\bfor\s*\(/g) || []).length;

                if (nestedLoopCount >= 2) {
                  results.push({
                    type: 'inefficient_loop',
                    severity: 'high',
                    file: path.relative(projectPath, file),
                    line: i + 1,
                    issue: `Deeply nested loops (${nestedLoopCount + 1} levels)`,
                    suggestion: 'Consider using more efficient data structures or algorithms'
                  });
                }
              }

              // 循环内的 DOM 操作
              if (/\bfor\s*\(/.test(line) || /\.forEach\s*\(/.test(line)) {
                const loopBody = this.extractFunctionBody(lines, i);

                if (/document\.|getElementById|querySelector/.test(loopBody)) {
                  results.push({
                    type: 'inefficient_loop',
                    severity: 'medium',
                    file: path.relative(projectPath, file),
                    line: i + 1,
                    issue: 'DOM manipulation inside loop',
                    suggestion: 'Move DOM operations outside the loop or use DocumentFragment'
                  });
                }
              }
            }
          } catch (err) {
            this.log('debug', `Error processing file ${file}: ${err.message}`);
          }
        }
      }

      return results;
    } catch (error) {
      this.log('error', 'Error finding inefficient loops:', error);
      return [];
    }
  }

  /**
   * 查找未使用的依赖
   * @param {string} projectPath - 项目路径
   * @returns {Promise<Array>} 未使用的依赖列表
   */
  async findUnusedDependencies(projectPath) {
    try {
      const results = [];
      const packageJsonPath = path.join(projectPath, 'package.json');

      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // 检查每个依赖是否被使用
        for (const [dep, version] of Object.entries(dependencies)) {
          const isUsed = await this.isDependencyUsed(projectPath, dep);

          if (!isUsed) {
            results.push({
              type: 'unused_dependency',
              severity: 'low',
              dependency: dep,
              version,
              suggestion: `Remove unused dependency: ${dep}`
            });
          }
        }
      } catch (err) {
        this.log('debug', `No package.json found or error reading it: ${err.message}`);
      }

      return results;
    } catch (error) {
      this.log('error', 'Error finding unused dependencies:', error);
      return [];
    }
  }

  /**
   * 检查依赖是否被使用
   * @param {string} projectPath - 项目路径
   * @param {string} dep - 依赖名称
   * @returns {Promise<boolean>} 是否被使用
   */
  async isDependencyUsed(projectPath, dep) {
    const sourceDirs = await this.discoverSourceDirs(projectPath);

    for (const dir of sourceDirs) {
      const files = await this.findFiles(dir, /\.(js|ts|jsx|tsx)$/);

      for (const file of files.slice(0, 50)) {
        try {
          const content = await fs.readFile(file, 'utf-8');

          // 检查 import 或 require 语句
          if (content.includes(`'${dep}'`) || content.includes(`"${dep}"`)) {
            return true;
          }
        } catch (err) {
          // 忽略错误
        }
      }
    }

    return false;
  }

  /**
   * 清理资源
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      this.log('info', 'Cleaning up resources');
      this.tasks.clear();
      this.removeAllListeners();
      this.initialized = false;
      this.log('info', 'Cleanup completed');
    } catch (error) {
      this.handleError('Cleanup failed', error);
    }
  }
}

// 创建单例实例
let instance = null;

/**
 * 获取 ProphetDeveloper 实例
 * @param {Object} options - 配置选项
 * @returns {ProphetDeveloper}
 */
function getInstance(options) {
  if (!instance) {
    instance = new ProphetDeveloper(options);
  }
  return instance;
}

// 导出模块
module.exports = ProphetDeveloper;
module.exports.getInstance = getInstance;
module.exports.default = ProphetDeveloper;
