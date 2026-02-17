Next steps & safe-import checklist:

- Add `STAGING_SA_JSON` as a GitHub Actions secret (required for non-NOOP imports).
  - Example (do not run unless you have the SA JSON file locally):
    ```powershell
    gh secret set STAGING_SA_JSON --body "$(Get-Content .\staging-sa.json -Raw)"
    ```
- Run dry‑run import locally/CI and verify logs:
  - `node scripts/import_progress.cjs ./exports/progress-export.json --project=computing-science-2569 --noop`
- After reviewers approve + backups confirmed, run real import (requires `--confirm` and SA secret):
  - `node scripts/import_progress.cjs ./exports/progress-export.json --project=computing-science-2569 --confirm`
- Run `npm run check-sync` and E2E smoke once import completes.

If you want, tell me reviewer usernames and I will add them to the PR.