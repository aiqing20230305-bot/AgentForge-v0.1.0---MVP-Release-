// 代码质量分析工具

/**
 * 分析代码中的 FIXME 注释数量
 * @param {Object} analysis - 分析结果对象
 * @param {string} content - 要分析的代码内容
 */
function analyzeFixmeCount(analysis, content) {
  try {
    // 确保 analysis.quality 对象存在
    if (!analysis) {
      console.warn('Analysis object is missing');
      return;
    }
    
    if (!analysis.quality) {
      analysis.quality = {};
    }
    
    // 安全处理 content，确保是字符串类型
    const contentStr = content ?? '';
    const fixmeMatches = String(contentStr).match(/FIXME/gi) || [];
    
    // 使用空值合并运算符和安全的累加
    analysis.quality.fixmeCount = (analysis.quality.fixmeCount || 0) + fixmeMatches.length;
  } catch (error) {
    console.error('Error analyzing FIXME count:', error);
    // 确保即使出错也有默认值
    if (analysis?.quality) {
      analysis.quality.fixmeCount = analysis.quality.fixmeCount || 0;
    }
  }
}

module.exports = { analyzeFixmeCount };