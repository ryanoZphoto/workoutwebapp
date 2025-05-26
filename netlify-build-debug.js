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
  'src/App.jsx',
  'src/index.js',
  'src/components/Subscription.jsx',
  'src/pages/SuccessPage.jsx',
  'src/pages/CancelPage.jsx',
  'netlify/functions/create-checkout-session.js',
  'netlify/functions/webhook.js',
  'src/styles.css',
  'src/images/workout.jpg'
];

console.log('Checking for required files:');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.resolve(file));
  console.log(`- ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Check for potential file duplication issues
console.log('/nPotential duplicate files:');
if (fs.existsSync('src/App.js') && fs.existsSync('src/App.jsx')) {
  console.log('WARNING: Both App.js and App.jsx exist - this may cause build confusion');
}

// Check package.json dependencies
const packageJson = require('./package.json');
console.log('/nKey Dependencies:');
const requiredDeps = [
  'react', 'react-dom', 'react-router-dom', 'stripe',
  'react-scripts', 'tailwindcss'
];

requiredDeps.forEach(dep => {
  const version = packageJson.dependencies[dep] || 
                  packageJson.devDependencies[dep] || 
                  'MISSING';
  console.log(`- ${dep}: ${version}`);
});

// Check for peer dependency issues
console.log('/nChecking for potential peer dependency issues:');
const reactVersion = packageJson.dependencies['react'];
const reactDomVersion = packageJson.dependencies['react-dom'];
if (reactVersion !== reactDomVersion) {
  console.log('WARNING: react and react-dom versions do not match');
}

console.log('/nBuild command:', packageJson.scripts.build);
console.log('Build directory:', packageJson.build?.outputDirectory || 'build');