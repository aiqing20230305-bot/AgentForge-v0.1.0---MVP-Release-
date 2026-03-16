// Prophet Analyze Script
// This script analyzes code for FIXME comments

const fs = require('fs');
const path = require('path');

// Function to count FIXME comments in content
function countFixme(content) {
  const fixmeCount = (typeof content === 'string' && content.match(/FIXME/g)?.length) || 0;
  return fixmeCount;
}

// Function to analyze a single file
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixmeCount = countFixme(content);
    
    if (fixmeCount > 0) {
      console.log(`${filePath}: Found ${fixmeCount} FIXME comment(s)`);
    }
    
    return fixmeCount;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
    return 0;
  }
}

// Function to analyze directory recursively
function analyzeDirectory(dirPath) {
  let totalFixme = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          totalFixme += analyzeDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        // Only analyze relevant file types
        if (/\.(js|jsx|ts|tsx|css|scss|html)$/.test(item)) {
          totalFixme += analyzeFile(fullPath);
        }
      }
    });
  } catch (error) {
    console.error(`Error analyzing directory ${dirPath}:`, error.message);
  }
  
  return totalFixme;
}

// Main execution
const targetPath = process.argv[2] || '.';
const totalFixme = analyzeDirectory(targetPath);

console.log(`\nTotal FIXME comments found: ${totalFixme}`);

module.exports = { countFixme, analyzeFile, analyzeDirectory };