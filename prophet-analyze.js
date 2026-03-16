#!/usr/bin/env node

/**
 * Code Quality Analysis Script
 * 
 * Scans the codebase to detect and report special comment markers:
 * - FIXME: Issues that need to be fixed
 * - TODO: Features or improvements to be implemented
 * - HACK: Temporary workarounds that need proper solutions
 * 
 * Usage: node prophet-analyze.js [directory]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MARKERS = ['FIXME', 'TODO', 'HACK'];
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
const INCLUDED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

/**
 * Recursively scan directory for files
 */
const scanDirectory = (dir, results = []) => {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(file)) {
          scanDirectory(filePath, results);
        }
      } else {
        const ext = path.extname(file);
        if (INCLUDED_EXTENSIONS.includes(ext)) {
          results.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return results;
};

/**
 * Analyze file for marker comments
 */
const analyzeFile = (filePath) => {
  const findings = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      MARKERS.forEach(marker => {
        const regex = new RegExp(`\/\/\\s*${marker}[:\\s]`, 'i');
        if (regex.test(line)) {
          findings.push({
            file: filePath,
            line: index + 1,
            marker,
            content: line.trim()
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
  }
  
  return findings;
};

/**
 * Format and display results
 */
const displayResults = (findings) => {
  if (findings.length === 0) {
    console.log('✅ No issues found!');
    return;
  }
  
  console.log(`\n🔍 Found ${findings.length} marker(s):\n`);
  
  const grouped = findings.reduce((acc, finding) => {
    if (!acc[finding.marker]) {
      acc[finding.marker] = [];
    }
    acc[finding.marker].push(finding);
    return acc;
  }, {});
  
  Object.keys(grouped).forEach(marker => {
    console.log(`\n${marker} (${grouped[marker].length})`);
    console.log('='.repeat(50));
    grouped[marker].forEach(item => {
      console.log(`📍 ${item.file}:${item.line}`);
      console.log(`   ${item.content}\n`);
    });
  });
};

/**
 * Main execution
 */
const main = async () => {
  const targetDir = process.argv[2] || process.cwd();
  
  console.log(`🚀 Analyzing code in: ${targetDir}\n`);
  
  const files = scanDirectory(targetDir);
  console.log(`📂 Scanning ${files.length} file(s)...\n`);
  
  const allFindings = [];
  
  for (const file of files) {
    const findings = analyzeFile(file);
    allFindings.push(...findings);
  }
  
  displayResults(allFindings);
  
  process.exit(allFindings.length > 0 ? 1 : 0);
};

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { scanDirectory, analyzeFile };
