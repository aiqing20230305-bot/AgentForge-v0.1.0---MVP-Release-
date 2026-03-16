const fs = require('fs');
const path = require('path');

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const todoCount = content.match(/TODO/g)?.length || 0;
  const fixmeCount = content.match(/FIXME/g)?.length || 0;
  const lines = content.split('\n').length;
  
  return {
    file: filePath,
    lines,
    todoCount,
    fixmeCount
  };
}

function analyzeProject(projectPath) {
  const results = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        }
      } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
        try {
          results.push(analyzeFile(filePath));
        } catch (error) {
          console.error(`Error analyzing ${filePath}:`, error.message);
        }
      }
    });
  }
  
  walkDir(projectPath);
  
  const summary = {
    totalFiles: results.length,
    totalLines: results.reduce((sum, r) => sum + r.lines, 0),
    totalTodos: results.reduce((sum, r) => sum + r.todoCount, 0),
    totalFixmes: results.reduce((sum, r) => sum + r.fixmeCount, 0),
    files: results.filter(r => r.todoCount > 0 || r.fixmeCount > 0)
  };
  
  return summary;
}

const projectPath = process.argv[2] || '.';
const analysis = analyzeProject(projectPath);

console.log('\n=== Project Analysis ===');
console.log(`Total Files: ${analysis.totalFiles}`);
console.log(`Total Lines: ${analysis.totalLines}`);
console.log(`Total TODOs: ${analysis.totalTodos}`);
console.log(`Total FIXMEs: ${analysis.totalFixmes}`);

if (analysis.files.length > 0) {
  console.log('\n=== Files with TODOs/FIXMEs ===');
  analysis.files.forEach(f => {
    console.log(`${f.file}: ${f.todoCount} TODOs, ${f.fixmeCount} FIXMEs`);
  });
}

module.exports = { analyzeFile, analyzeProject };