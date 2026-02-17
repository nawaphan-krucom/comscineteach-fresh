#!/usr/bin/env node
'use strict';
const { execSync } = require('child_process');

function tryCmd(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    return null;
  }
}

console.log('check-env: Node', process.version);
const npmV = tryCmd('npm -v');
if (npmV) console.log('check-env: npm', npmV);
const gitV = tryCmd('git --version');
if (gitV) console.log('check-env: git', gitV);

// Basic environment validations (non-fatal)
console.log('check-env: basic checks complete (non-fatal)');
process.exit(0);
