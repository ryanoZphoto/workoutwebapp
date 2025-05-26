// This file helps debug Netlify build issues
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

const fs = require('fs');
const path = require('path');

// Check if key files exist
const filesToCheck = [
  'package.json',
  'netlify.toml',
  'src/App.js',
  'src/components/Subscription.jsx',
  'src/pages/SuccessPage.jsx',
  'src/pages/CancelPage.jsx',
  'netlify/functions/create-checkout-session.js',
  'netlify/functions/webhook.js'
];

console.log('Checking for required files:');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.resolve(file));
  console.log(`- ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Check package.json dependencies
const packageJson = require('./package.json');
console.log('\nDependencies:');
console.log('- react-router-dom:', packageJson.dependencies['react-router-dom'] || 'MISSING');
console.log('- stripe:', packageJson.dependencies['stripe'] || 'MISSING');

console.log('\nBuild command:', packageJson.scripts.build);