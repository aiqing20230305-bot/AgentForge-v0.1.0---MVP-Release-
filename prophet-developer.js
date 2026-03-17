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
