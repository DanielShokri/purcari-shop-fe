#!/usr/bin/env node

/**
 * Phase 8 - Appwrite API Key Helper
 * 
 * This script guides you through getting your Appwrite API key
 * and running the Phase 8 completion script.
 * 
 * Run with: node scripts/get-appwrite-api-key.mjs
 */

import readline from 'readline';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

function step(number, title) {
  log(`\n${colors.bright}STEP ${number}: ${title}${colors.reset}`, 'cyan');
}

function instruction(text) {
  console.log(`  ${colors.cyan}→${colors.reset} ${text}`);
}

function highlight(text) {
  return `${colors.bright}${colors.cyan}${text}${colors.reset}`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(`${colors.yellow}${prompt}${colors.reset} `, resolve);
  });
}

async function main() {
  section('PHASE 8 - API KEY HELPER');
  
  log('\nThis script will guide you through getting your Appwrite API key', 'cyan');
  log('and running Phase 8 completion.\n');
  
  // Step 1
  step(1, 'Open Appwrite Console');
  instruction('Visit: https://cloud.appwrite.io');
  instruction('If not logged in, sign in with your credentials');
  
  await question('When ready, press Enter...');
  
  // Step 2
  step(2, 'Select Your Project');
  instruction('Look for project: ' + highlight('696b5bee001fe3af955a'));
  instruction('If you see it in the list, click on it');
  instruction('If not, scroll down or search for it');
  
  await question('Press Enter when you\'re in the project...');
  
  // Step 3
  step(3, 'Navigate to Settings');
  instruction('Look for the Settings button (usually at bottom left)');
  instruction('Or click the gear icon (⚙️) if you see one');
  
  await question('Press Enter when you see the Settings menu...');
  
  // Step 4
  step(4, 'Find API Keys');
  instruction('In Settings, look for ' + highlight('API Keys'));
  instruction('Click on API Keys');
  
  await question('Press Enter when you see the API Keys list...');
  
  // Step 5
  step(5, 'Copy Your API Key');
  log('\n' + '─'.repeat(80), 'cyan');
  instruction('You should see a list of API keys');
  instruction('Look for a key with a ' + highlight('copy icon') + ' next to it');
  instruction('Click the copy icon to copy the key');
  instruction('⚠️  ' + colors.yellow + 'Keep this key SECURE - it\'s like a password!' + colors.reset);
  log('─'.repeat(80) + '\n', 'cyan');
  
  await question('Press Enter when you\'ve copied the key...');
  
  // Step 6 - Ask for key
  step(6, 'Paste Your API Key');
  log('\n' + '─'.repeat(80), 'cyan');
  const apiKey = await question('Paste your API key here: ');
  log('─'.repeat(80) + '\n', 'cyan');
  
  if (!apiKey || apiKey.trim().length < 10) {
    log('\n❌ API key seems too short. Please try again.', 'red');
    rl.close();
    process.exit(1);
  }
  
  // Step 7 - Confirm and run
  section('READY TO RUN PHASE 8');
  
  log('✅ API Key received\n', 'green');
  log('The following command will be executed:\n', 'cyan');
  log(`  API_KEY='${apiKey.substring(0, 10)}...' node scripts/complete-phase8.mjs\n`, 'bright');
  
  log('This will:', 'cyan');
  log('  ✓ Create the ' + highlight('posts') + ' collection', 'bright');
  log('  ✓ Create the ' + highlight('coupon_usage') + ' collection', 'bright');
  log('  ✓ Fix ' + highlight('notifications') + ' permissions', 'bright');
  log('  ✓ Verify all 10 collections are accessible\n');
  
  const confirm = await question('Run Phase 8 completion now? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    log('\n❌ Cancelled', 'yellow');
    rl.close();
    process.exit(0);
  }
  
  rl.close();
  
  // Step 8 - Run the script
  log('\n🚀 Running Phase 8 completion script...\n', 'green');
  
  const { spawn } = await import('child_process');
  
  const child = spawn('node', ['scripts/complete-phase8.mjs'], {
    env: { ...process.env, API_KEY: apiKey },
    stdio: 'inherit',
  });
  
  child.on('close', code => {
    if (code === 0) {
      section('✅ PHASE 8 COMPLETE');
      log('All collections created and verified!', 'green');
      log('\nNext steps:', 'cyan');
      log('  1. Review .planning/NEXT_PHASES_ROADMAP.md', 'bright');
      log('  2. Start Phase 10: E2E Testing', 'bright');
      log('  3. Run: git add -A && git commit -m "Phase 8 - Collections created"\n');
    } else {
      section('⚠️  PHASE 8 PARTIAL COMPLETE');
      log('Some collections may need manual creation.', 'yellow');
      log('See .planning/PHASE_8_STATUS_REPORT.md for details.\n');
    }
    process.exit(code);
  });
}

main().catch(error => {
  log('\n❌ Error: ' + error.message, 'red');
  rl.close();
  process.exit(1);
});
