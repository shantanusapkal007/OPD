#!/usr/bin/env node

/**
 * Environment Configuration Checker
 * 
 * Run this script to verify all required environment variables are configured:
 * npx node scripts/verify-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

// Define required variables by category
const REQUIRED_VARS = {
  'Firebase (Required)': [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
  'Firebase (Optional)': [
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  ],
  'Google Drive (Optional)': [
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID',
  ],
  'Application (Optional)': [
    'NEXT_PUBLIC_ALLOWED_EMAILS',
    'APP_URL',
    'GEMINI_API_KEY',
  ],
};

// Read .env.local
let envVars = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key) {
        envVars[key.trim()] = value;
      }
    }
  });
} else {
  console.log('❌ .env.local file not found!');
  console.log('   Please create it by copying .env.example and adding your credentials.');
  console.log('   See FIREBASE_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

// Check variables
let hasErrors = false;
let allGood = true;

console.log('\n🔍 Verifying Environment Configuration\n');
console.log('=' .repeat(60));

for (const [category, vars] of Object.entries(REQUIRED_VARS)) {
  const isRequired = !category.includes('Optional');
  const icon = isRequired ? '📋' : '📝';
  
  console.log(`\n${icon} ${category}:`);
  
  let categoryMissing = 0;
  for (const varName of vars) {
    const value = envVars[varName];
    const hasPlaceholder = value && (
      value.includes('YOUR_') || 
      value === 'REPLACE_ME' ||
      value === 'REPLACE_ME_WITH_YOUR_ACTUAL_FOLDER_ID' ||
      value.startsWith('MY_')
    );
    
    if (!value) {
      console.log(`   ❌ ${varName} - NOT SET`);
      if (isRequired) hasErrors = true;
      categoryMissing++;
      allGood = false;
    } else if (hasPlaceholder) {
      console.log(`   ⚠️  ${varName} - STILL HAS PLACEHOLDER`);
      if (isRequired) hasErrors = true;
      categoryMissing++;
      allGood = false;
    } else {
      // Show first 20 chars and last 10 chars for security
      const display = value.length > 30 
        ? `${value.substring(0, 15)}...${value.substring(value.length - 10)}`
        : value;
      console.log(`   ✅ ${varName}`);
    }
  }
  
  if (categoryMissing === 0) {
    console.log(`   ✨ All ${isRequired ? 'required' : 'optional'} variables configured!`);
  }
}

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('\n❌ CRITICAL ISSUES FOUND:');
  console.log('   Some REQUIRED Firebase variables are missing or have placeholders.');
  console.log('   The application will NOT work without these.\n');
  console.log('   📖 Fix by following: FIREBASE_SETUP.md\n');
  process.exit(1);
} else if (!allGood) {
  console.log('\n⚠️  WARNINGS:');
  console.log('   Some optional variables are missing or have placeholders.');
  console.log('   The app will work, but some features may be unavailable.\n');
  process.exit(0);
} else {
  console.log('\n✅ ALL REQUIRED VARIABLES CONFIGURED!');
  console.log('   Your environment looks good. You can start developing.\n');
  console.log('   💡 Next steps:');
  console.log('      1. Start dev server: npm run dev');
  console.log('      2. Test sign-in at: http://localhost:3000/login');
  console.log('      3. For Vercel: Update env vars in Project Settings\n');
  process.exit(0);
}
