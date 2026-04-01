#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('🔨 Building with bunchee...');
  execSync('bunchee', { stdio: 'inherit', cwd: process.cwd() });

  console.log('🌐 Building browser bundle...');
  execSync('bun build ./src/browser-notify.js --format=iife --global-name=Notify --outfile ./dist/browser-notify.js', { 
    stdio: 'inherit',
    cwd: process.cwd() 
  });

  console.log('🌐 Building browser renderer bundle...');
  execSync('bun build ./src/render-notify-toasts.js --format=iife --outfile ./dist/render-notify-toasts.js', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('📋 Copying styles...');
  const src = path.join(process.cwd(), 'src', 'styles.css');
  const dest = path.join(process.cwd(), 'dist', 'styles.css');
  fs.copyFileSync(src, dest);

  console.log('✅ Build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
