// Test import of HeyAnon SDK
const HeyAnon = require('@heyanon/sdk');

console.log('HeyAnon SDK loaded:', typeof HeyAnon);
console.log('Available keys:', Object.keys(HeyAnon));

// If there are specific methods or types, print them
if (HeyAnon && typeof HeyAnon === 'object') {
  for (const key of Object.keys(HeyAnon)) {
    console.log(`Type of ${key}:`, typeof HeyAnon[key]);
  }
} 