#!/usr/bin/env node

// Code analysis script for detecting FIXME, TODO, and HACK comments
// Generates comprehensive reports with file locations and priorities

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  patterns: [
    { type: 'FIXME', priority: 'high', regex: /\/\/\s*FIXME:?\s*(.+)|#\s*FIXME:?\s*(.+)|<!--\s*FIXME:?\s*(.+)\s*-->/gi },
    { type: 'TODO', priority: 'medium', regex: /\/\/\s*TODO:?\s*(.+)|#\s*TODO:?\s*(.+)|<!--\s*TODO:?\s*(.+)\s*-->/gi },
    { type: 'HACK', priority: 'high', regex: /\/\/\s*HACK:?\s*(.+)|#\s*HACK:?\s*(.+)|<!--\s*HACK:?\s*(.+)\s*-->/gi },
    { type: 'BUG', priority: 'critical', regex: /\/\/\s*BUG:?\s*(.+)|#\s*BUG:?\s*(.+)|<!--\s*BUG:?\s*(.+)\s*-->/gi }
  ],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.html', '.md'],
  excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out'],
  maxFileSize: 5 * 1024 * 1024 // 5MB
};

/**
 * Recursively scan directory for files
 * @param {string} dir - Directory to scan
 * @param {string[]} fileList - Accumulated file list
 * @returns {Promise<string[]>} List of file paths
 */
async function getFiles(dir, fileList = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!CONFIG.excludeDirs.includes(entry.name)) {
          await getFiles(fullPath, fileList);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (CONFIG.extensions.includes(ext)) {
          fileList.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Cannot access ${dir}: ${error.message}`);
  }
  
  return fileList;
}

/**
 * Analyze a single file for comments
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object[]>} Array of found comments
 */
async function analyzeFile(filePath) {
  const results = [];
  
  try {
    const stats = await fs.stat(filePath);
    
    // Skip large files
    if (stats.size > CONFIG.maxFileSize) {
      console.warn(`Skipping large file: ${filePath}`);
      return results;
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      CONFIG.patterns.forEach(({ type, priority, regex }) => {
        const matches = [...line.matchAll(regex)];
        
        matches.forEach(match => {
          const description = (match[1] || match[2] || match[3] || '').trim();
          
          results.push({
            file: filePath,
            line: index + 1,
            type,
            priority,
            description,
            snippet: line.trim()
          });
        });
      });
    });
  } catch (error) {
    console.warn(`Warning: Cannot read ${filePath}: ${error.message}`);
  }
  
  return results;
}

/**
 * Generate report from analysis results
 * @param {Object[]} results - Analysis results
 * @returns {string} Formatted report
 */
function generateReport(results) {
  if (results.length === 0) {
    return '✅ No issues found! Code is clean.\n';
  }
  
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = results.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  
  let report = '\n📊 Code Analysis Report\n';
  report += '='.repeat(60) + '\n\n';
  
  // Summary
  const summary = results.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  
  report += '📈 Summary:\n';
  Object.entries(summary).forEach(([type, count]) => {
    report += `  ${type}: ${count}\n`;
  });
  report += `\n  Total Issues: ${results.length}\n\n`;
  report += '='.repeat(60) + '\n\n';
  
  // Detailed issues
  sorted.forEach((item, idx) => {
    const emoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    }[item.priority] || '⚪';
    
    report += `${idx + 1}. ${emoji} [${item.type}] ${item.priority.toUpperCase()}\n`;
    report += `   📁 File: ${item.file}:${item.line}\n`;
    report += `   💬 Description: ${item.description || 'No description'}\n`;
    report += `   📝 Code: ${item.snippet}\n\n`;
  });
  
  return report;
}

/**
 * Main execution function
 */
async function main() {
  try {
    const startTime = Date.now();
    const rootDir = process.argv[2] || process.cwd();
    
    console.log(`🔍 Analyzing code in: ${rootDir}\n`);
    console.log('Scanning files...');
    
    const files = await getFiles(rootDir);
    console.log(`Found ${files.length} files to analyze\n`);
    
    const allResults = [];
    
    // Analyze files with progress indication
    for (let i = 0; i < files.length; i++) {
      const results = await analyzeFile(files[i]);
      allResults.push(...results);
      
      if ((i + 1) % 50 === 0) {
        console.log(`Progress: ${i + 1}/${files.length} files`);
      }
    }
    
    const report = generateReport(allResults);
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(rootDir, 'code-analysis-report.txt');
    await fs.writeFile(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Analysis completed in ${elapsed}s`);
    
    // Exit with error code if critical/high priority issues found
    const hasCriticalIssues = allResults.some(r => 
      ['critical', 'high'].includes(r.priority)
    );
    
    process.exit(hasCriticalIssues ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, getFiles, generateReport };