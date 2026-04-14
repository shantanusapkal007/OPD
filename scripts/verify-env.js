#!/usr/bin/env node

/**
 * Environment Configuration Checker
 *
 * Run this script to verify all required environment variables are configured:
 * npm run verify-env
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");

const REQUIRED_VARS = {
  "Supabase (Required)": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ],
  "App (Optional)": [
    "NEXT_PUBLIC_APP_NAME",
    "NEXT_PUBLIC_ALLOWED_EMAILS",
  ],
};

const PLACEHOLDER_MATCHES = [
  "REPLACE_ME",
  "your-anon-key",
  "https://your-project-ref.supabase.co",
  "YOUR_",
];

function readEnvFile(filePath) {
  const envVars = {};
  const content = fs.readFileSync(filePath, "utf-8");

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const [key, ...valueParts] = trimmed.split("=");
    if (!key) {
      return;
    }

    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    envVars[key.trim()] = value;
  });

  return envVars;
}

if (!fs.existsSync(envPath)) {
  console.log("ERROR: .env.local file not found.");
  console.log("Create it by copying .env.example and filling in your project values.");
  process.exit(1);
}

const envVars = readEnvFile(envPath);
let hasErrors = false;
let hasWarnings = false;

console.log("\nVerifying environment configuration\n");
console.log("=".repeat(60));

for (const [category, vars] of Object.entries(REQUIRED_VARS)) {
  const isRequired = !category.includes("Optional");
  let categoryMissing = 0;

  console.log(`\n${category}:`);

  for (const varName of vars) {
    const value = envVars[varName];
    const hasPlaceholder =
      !!value &&
      PLACEHOLDER_MATCHES.some((placeholder) => value.includes(placeholder));

    if (!value) {
      console.log(`  [missing] ${varName}`);
      categoryMissing += 1;
      if (isRequired) {
        hasErrors = true;
      } else {
        hasWarnings = true;
      }
      continue;
    }

    if (hasPlaceholder) {
      console.log(`  [placeholder] ${varName}`);
      categoryMissing += 1;
      if (isRequired) {
        hasErrors = true;
      } else {
        hasWarnings = true;
      }
      continue;
    }

    console.log(`  [ok] ${varName}`);
  }

  if (categoryMissing === 0) {
    console.log(`  All ${isRequired ? "required" : "optional"} variables configured.`);
  }
}

console.log(`\n${"=".repeat(60)}`);

if (hasErrors) {
  console.log("\nCRITICAL ISSUES FOUND:");
  console.log("Required Supabase variables are missing or still use placeholders.");
  console.log("The application will not work correctly until they are fixed.\n");
  console.log("Update .env.local using the values from Supabase Project Settings > API.\n");
  process.exit(1);
}

if (hasWarnings) {
  console.log("\nWARNINGS:");
  console.log("Some optional variables are missing or still use placeholders.");
  console.log("The app can run, but branding or access control may be incomplete.\n");
  process.exit(0);
}

console.log("\nAll required variables are configured.");
console.log("Suggested checks:");
console.log("  1. Start the dev server: npm run dev");
console.log("  2. Verify sign-in at: http://localhost:3000/login");
console.log("  3. Mirror the same values in your production hosting environment\n");
process.exit(0);
