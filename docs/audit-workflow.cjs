// HTTP/PostgreSQL workflow checks now run against an isolated temporary schema.
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..', 'backend');
execFileSync(process.execPath, [path.join(root, 'scripts/test-e2e.cjs')], { cwd: root, stdio: 'inherit' });
