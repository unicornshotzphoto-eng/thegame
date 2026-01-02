#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = readJson(pkgPath);

if (!pkg) {
  console.error('Could not read package.json at', pkgPath);
  process.exit(1);
}

const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);

function logHeader(title) {
  console.log('\n=== ' + title + ' ===');
}

logHeader('Frontend Dependency Snapshot');
['expo','react','react-dom','react-native','react-native-web','expo-router'].forEach(name => {
  console.log(`${name}: ${deps[name] || 'not found'}`);
});

logHeader('Common Web Build Pitfalls');
// Expo 54 typically pairs with React 18.2; React 19 can break web bundling in some setups
const reactVersion = deps['react'] || '';
const reactDomVersion = deps['react-dom'] || '';
if (/^19\./.test(reactVersion) || /^19\./.test(reactDomVersion)) {
  console.warn('- Detected React 19.x. Expo SDK 54 web may expect React 18.2.0.');
  console.warn('  Consider pinning: react@18.2.0 and react-dom@18.2.0, then reinstall.');
}

// Native-only modules imported on web can hang builds
console.warn('- Ensure no native-only modules are imported on web entry.');
console.warn('  If needed, guard imports with Platform.OS !== "web" or dynamic import.');

// Enable verbose Expo logs
logHeader('Enable Verbose Expo Logs');
console.log('Run: npm run web:debug');
console.log('This sets EXPO_DEBUG=1 and clears Metro cache to surface errors.');

logHeader('If Build Still Hangs');
console.log('- Share the first error block from the terminal here.');
console.log('- Try removing experimental flags in app.json: experiments.reactCompiler, typedRoutes.');
console.log('- If using a physical device for web, ensure localhost access or use LAN IPs.');

console.log('\nDone.');
