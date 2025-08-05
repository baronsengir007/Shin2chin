// Quick test runner script
const { exec } = require('child_process');

console.log('=== RUNNING ACTUAL TESTS - NO HALLUCINATIONS ===\n');

exec('npm test -- --run --reporter=verbose', { 
  cwd: __dirname,
  maxBuffer: 1024 * 1024 * 10 // 10MB buffer
}, (error, stdout, stderr) => {
  console.log('STDOUT:', stdout);
  if (stderr) console.log('STDERR:', stderr);
  if (error) console.log('ERROR:', error);
});
