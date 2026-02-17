Title: chore: env guards + point app to computing-science-2569; redact SA; fix local-seed

What:
- Point client/CI to Firebase project `computing-science-2569`.
- Prevent `localStorage` demo data from appearing on live DB (`DataContext.tsx`).
- Add build-time env guard (`scripts/check_env.cjs`) and redact embedded service-account JSON.
- Migration tooling: dry‑run by default; real writes require `--confirm`.

Why:
- Convert Teacher Dashboard mock into a safe, production-capable site and harden CI/security.

Safety checklist for reviewers:
- [ ] Confirm no service-account JSON files committed to repository
- [ ] Run `npm run check-env`, `npm test`, `npm run build` locally
- [ ] Verify `VITE_SHOW_FIREBASE_PROJECT` behavior in `DataContext.tsx`
- [ ] Ensure PR CI `pr-check` passes before merging

Notes:
- Staging hosting: https://computing-science-2569.web.app
- Import scripts default to NOOP/dry-run; to perform real import use `--confirm` and ensure SA JSON is loaded via CI secrets.

Commands to create PR (if `gh` available):

```bash
# create branch (if not already created)
git checkout -b ci/pr/connect-live-firebase
# push branch
git push -u origin ci/pr/connect-live-firebase
# create PR
gh pr create --base main --head ci/pr/connect-live-firebase --title "chore: env guards + point app to computing-science-2569; redact SA; fix local-seed" --body "$(cat PR_BODY.md)"
```
