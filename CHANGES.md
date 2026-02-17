# Changes — Password Reset Improvements (2026-02-07)

- UI: `TeacherDashboard` now uses Cloud Function `resetUserPassword` as the default flow for resetting student passwords. A UI toggle/link "ใช้ Reset Code แทน" is available to use the one-time reset-code fallback when needed.
- Docs: Added explicit recommendation to use Cloud Function in `IMPLEMENTATION_SUMMARY.md`, `DEPLOYMENT_READY_SUMMARY.md`, and `README.md`.
- CI: `E2E (with Firebase Emulator)` workflow now uploads `reset_emulator.log` and automatically creates a GitHub issue when the `resetUserPassword` emulator test fails (issue body includes a truncated log excerpt and artifact list).
- Tests: Added Playwright test to verify the UI default uses Cloud Function and that the reset-code fallback can be triggered.
- CI: Added optional Slack notification (via `SLACK_WEBHOOK` secret) to `e2e-emulator.yml` to post a failure summary when the `resetUserPassword` emulator test fails.
- Monitoring: Added `docs/password-reset-monitoring.md` with recommended log-based metrics and alerting steps.
- Utility: Added `scripts/prepare_reset_pr.sh` to help create the branch/PR and run checks locally.

Notes:
- Reset code flow remains available as a fallback for offline/testing scenarios but is not recommended for production due to lack of server-side audit logging.
- When changing password reset behavior, update `PR_INSTRUCTIONS.md` per the new checklist items.
