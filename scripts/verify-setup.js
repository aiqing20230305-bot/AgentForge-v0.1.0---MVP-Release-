#!/usr/bin/env node

/**
 * World of Claudecraft - Setup Verification Script
 *
 * Checks your environment and provides guidance for getting started.
 * Run with: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
}

function checkMark(passed) {
  return passed ? '✅' : '❌';
}

function getCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Main Checks
// ═══════════════════════════════════════════════════════════════

console.log('');
log('🏰 World of Claudecraft - Setup Verification', 'bright');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// ─────────────────────────────────────────────────────────────
section('1️⃣  Node.js Environment');
// ─────────────────────────────────────────────────────────────

const nodeVersion = getCommand('node --version');
const nodeVersionNum = nodeVersion ? parseInt(nodeVersion.slice(1).split('.')[0]) : 0;
const nodePassed = nodeVersionNum >= 16;

log(`${checkMark(nodePassed)} Node.js Version: ${nodeVersion || 'NOT FOUND'}`, nodePassed ? 'green' : 'red');

if (!nodePassed) {
  log('   ⚠️  Node.js 16+ required. Install from: https://nodejs.org/', 'yellow');
  results.failed++;
} else {
  results.passed++;
}

const npmVersion = getCommand('npm --version');
log(`${checkMark(!!npmVersion)} npm Version: ${npmVersion || 'NOT FOUND'}`, npmVersion ? 'green' : 'red');

if (!npmVersion) {
  log('   ⚠️  npm not found. It should come with Node.js', 'yellow');
  results.failed++;
} else {
  results.passed++;
}

// ─────────────────────────────────────────────────────────────
section('2️⃣  Project Structure');
// ─────────────────────────────────────────────────────────────

const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'src/App.tsx',
  'src/stores/taskStore.ts',
  'src/utils/openclawLoader.ts',
  'src/components/AgentDisplayPanel.tsx',
  'src/components/TaskManagementPanel.tsx'
];

let projectStructurePassed = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  log(`${checkMark(exists)} ${file}`, exists ? 'green' : 'red');

  if (!exists) {
    projectStructurePassed = false;
    results.failed++;
  } else {
    results.passed++;
  }
});

// ─────────────────────────────────────────────────────────────
section('3️⃣  Dependencies');
// ─────────────────────────────────────────────────────────────

const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));

log(`${checkMark(nodeModulesExists)} node_modules/ directory`, nodeModulesExists ? 'green' : 'yellow');

if (!nodeModulesExists) {
  log('   ℹ️  Dependencies not installed. Run: npm install', 'cyan');
  results.warnings++;
} else {
  results.passed++;
}

// Check critical packages
const criticalPackages = [
  'react',
  'react-dom',
  'zustand',
  'electron'
];

if (nodeModulesExists) {
  criticalPackages.forEach(pkg => {
    const exists = fs.existsSync(path.join(process.cwd(), 'node_modules', pkg));
    log(`${checkMark(exists)} ${pkg}`, exists ? 'green' : 'red');

    if (!exists) {
      results.failed++;
    } else {
      results.passed++;
    }
  });
}

// ─────────────────────────────────────────────────────────────
section('4️⃣  Port Availability');
// ─────────────────────────────────────────────────────────────

const defaultPort = 5173;
let portInUse = false;

try {
  const portCheck = getCommand(`lsof -i :${defaultPort}`);
  portInUse = !!portCheck;
} catch (error) {
  // Port is free (lsof returns error if port not in use)
  portInUse = false;
}

log(`${checkMark(!portInUse)} Port ${defaultPort} available`, !portInUse ? 'green' : 'yellow');

if (portInUse) {
  log(`   ⚠️  Port ${defaultPort} is in use. You may need to stop other services.`, 'yellow');
  results.warnings++;
} else {
  results.passed++;
}

// ─────────────────────────────────────────────────────────────
section('5️⃣  Configuration Check');
// ─────────────────────────────────────────────────────────────

// Check if agent IDs are standardized
const loaderPath = path.join(process.cwd(), 'src/utils/openclawLoader.ts');
if (fs.existsSync(loaderPath)) {
  const loaderContent = fs.readFileSync(loaderPath, 'utf8');

  // Check for old ID format
  const hasOldFormat = loaderContent.includes("id: 'local_agent_") || loaderContent.includes("id: 'openclaw_");

  log(`${checkMark(!hasOldFormat)} Agent ID format standardized`, !hasOldFormat ? 'green' : 'red');

  if (hasOldFormat) {
    log('   ❌ Old agent ID format detected (local_agent_* or openclaw_*)', 'red');
    log('   ℹ️  Run the fix script or check TROUBLESHOOTING.md', 'cyan');
    results.failed++;
  } else {
    results.passed++;
  }
} else {
  log('⚠️  Could not verify agent ID format (file not found)', 'yellow');
  results.warnings++;
}

// ═══════════════════════════════════════════════════════════════
// Summary & Next Steps
// ═══════════════════════════════════════════════════════════════

section('📊 Summary');

log(`✅ Passed: ${results.passed}`, 'green');
if (results.warnings > 0) {
  log(`⚠️  Warnings: ${results.warnings}`, 'yellow');
}
if (results.failed > 0) {
  log(`❌ Failed: ${results.failed}`, 'red');
}

console.log('');

if (results.failed === 0) {
  log('🎉 All critical checks passed!', 'green');
  console.log('');
  log('🚀 Next Steps:', 'bright');

  if (!nodeModulesExists) {
    log('   1. Install dependencies: npm install', 'cyan');
    log('   2. Start development server: npm run dev', 'cyan');
  } else {
    log('   1. Start development server: npm run dev', 'cyan');
  }

  log('   2. Open http://localhost:5173 in your browser', 'cyan');
  log('   3. You should see 8 demo agents and 35 sample tasks', 'cyan');
  console.log('');
  log('📖 For more help, see:', 'bright');
  log('   • README.md - Getting started guide', 'blue');
  log('   • TROUBLESHOOTING.md - Common issues and solutions', 'blue');
} else {
  log('⚠️  Some checks failed. Please address the issues above.', 'yellow');
  console.log('');
  log('💡 Common Solutions:', 'bright');

  if (nodeVersionNum < 16) {
    log('   • Install Node.js 16+: https://nodejs.org/', 'cyan');
  }

  if (!nodeModulesExists) {
    log('   • Run: npm install', 'cyan');
  }

  log('   • Check TROUBLESHOOTING.md for detailed help', 'cyan');
  log('   • Report issues: https://github.com/Summonair/world-of-claudecraft/issues', 'cyan');
}

console.log('');

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
