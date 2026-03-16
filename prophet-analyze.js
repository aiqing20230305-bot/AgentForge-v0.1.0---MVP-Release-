// 代码质量分析工具
const fs = require('fs');
const path = require('path');

function analyzeCodeQuality(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 确保content是字符串类型，并使用更严格的空值合并
    const fixmeCount = (typeof content === 'string' && content.match(/FIXME/g)?.length) ?? 0;
    const todoCount = (typeof content === 'string' && content.match(/TODO/g)?.length) ?? 0;
    const hackCount = (typeof content === 'string' && content.match(/HACK/g)?.length) ?? 0;
    
    return {
      filePath,
      fixmeCount,
      todoCount,
      hackCount,
      totalIssues: fixmeCount + todoCount + hackCount
    };
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
    return {
      filePath,
      fixmeCount: 0,
      todoCount: 0,
      hackCount: 0,
      totalIssues: 0,
      error: error.message
    };
  }
}

module.exports = { analyzeCodeQuality };