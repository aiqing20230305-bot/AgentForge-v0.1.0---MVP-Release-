#!/usr/bin/env node
// This script analyzes code for FIXME comments and generates a report
// Usage: node prophet-analyze.js [directory]

const fs = require('fs');
const path = require('path');

// Configuration
const COMMENT_PATTERNS = [
  /\/\/\s*(FIXME|TODO|BUG|HACK):?\s*(.+)/gi,
  /\/\*\s*(FIXME|TODO|BUG|HACK):?\s*([\s\S]*?)\*\//gi
];

const EXCLUDED_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage'];
const INCLUDED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json'];

/**
 * Recursively scans directory for files
 * @param {string} dir - Directory path
 * @param {Array} fileList - Accumulated file list
 * @returns {Array} List of file paths
 */
function scanDirectory(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!EXCLUDED_DIRS.includes(file)) {
            scanDirectory(filePath, fileList);
          }
        } else if (INCLUDED_EXTENSIONS.includes(path.extname(file))) {
          fileList.push(filePath);
        }
      } catch (err) {
        console.warn(`Warning: Cannot access ${filePath}:`, err.message);
      }
    });
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err.message);
  }
  
  return fileList;
}

/**
 * Analyzes file content for FIXME and TODO comments
 * @param {string} filePath - File path
 * @returns {Array} List of found comments
 */
function analyzeFile(filePath) {
  const findings = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      COMMENT_PATTERNS.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        
        matches.forEach(match => {
          findings.push({
            file: filePath,
            line: index + 1,
            type: match[1].toUpperCase(),
            message: match[2].trim(),
            code: line.trim()
          });
        });
      });
    });
  } catch (err) {
    console.error(`Error analyzing file ${filePath}:`, err.message);
  }
  
  return findings;
}

/**
 * Main execution function
 */
function main() {
  const targetDir = process.argv[2] || process.cwd();
  
  console.log(`🔍 Analyzing directory: ${targetDir}\n`);
  
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${targetDir} does not exist`);
    process.exit(1);
  }
  
  const files = scanDirectory(targetDir);
  console.log(`Found ${files.length} files to analyze\n`);
  
  const allFindings = [];
  
  files.forEach(file => {
    const findings = analyzeFile(file);
    allFindings.push(...findings);
  });
  
  // Generate report
  if (allFindings.length === 0) {
    console.log('✅ No FIXME/TODO comments found!');
    return;
  }
  
  console.log(`📋 Found ${allFindings.length} items:\n`);
  
  // Group by type
  const grouped = allFindings.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});
  
  // Display results
  Object.keys(grouped).sort().forEach(type => {
    console.log(`\n${type} (${grouped[type].length}):`);
    console.log('─'.repeat(50));
    
    grouped[type].forEach(item => {
      console.log(`📍 ${item.file}:${item.line}`);
      console.log(`   ${item.message}`);
      console.log(`   Code: ${item.code}`);
      console.log();
    });
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Summary:');
  Object.keys(grouped).forEach(type => {
    console.log(`  ${type}: ${grouped[type].length}`);
  });
  console.log('='.repeat(50));
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, analyzeFile };