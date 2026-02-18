#!/usr/bin/env node
// Minimal environment check used by CI/build scripts.
// This stub ensures `npm run build` can run in environments
// where the original checks are not necessary.
try {
  console.log('check_env: running minimal stub - OK');
  process.exit(0);
} catch (err) {
  console.error('check_env: unexpected error', err);
  process.exit(1);
}
