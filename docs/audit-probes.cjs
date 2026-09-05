// Compatibility entry point for the regression tests replacing the original defect probes.
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..', 'backend');
execFileSync(process.execPath, [path.join(root, 'node_modules/jest/bin/jest.js'), '--runInBand'], { cwd: root, stdio: 'inherit' });
