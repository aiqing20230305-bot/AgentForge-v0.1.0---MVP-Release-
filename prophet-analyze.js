// 代码分析工具

/**
 * 分析代码质量指标
 * @param {Object} analysis - 分析结果对象
 * @param {string} content - 文件内容
 */
function analyzeCodeQuality(analysis, content) {
  // 确保 analysis 对象存在
  if (!analysis || typeof analysis !== 'object') {
    console.error('Invalid analysis object');
    return;
  }

  // 初始化 quality 对象（如果不存在）
  if (!analysis.quality || typeof analysis.quality !== 'object') {
    analysis.quality = {};
  }

  // 确保 content 是有效的字符串
  if (typeof content !== 'string') {
    console.warn('Invalid content type, expected string');
    content = '';
  }

  // 统计 FIXME 注释数量（不区分大小写）
  const fixmeMatches = content.match(/FIXME/gi) || [];
  analysis.quality.fixmeCount = (analysis.quality.fixmeCount || 0) + fixmeMatches.length;

  // 统计 TODO 注释数量（不区分大小写）
  const todoMatches = content.match(/TODO/gi) || [];
  analysis.quality.todoCount = (analysis.quality.todoCount || 0) + todoMatches.length;

  // 统计 HACK 注释数量（不区分大小写）
  const hackMatches = content.match(/HACK/gi) || [];
  analysis.quality.hackCount = (analysis.quality.hackCount || 0) + hackMatches.length;
}

module.exports = {
  analyzeCodeQuality
};