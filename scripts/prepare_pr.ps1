<#
PowerShell helper to: verify environment, run tests/build, create branch, commit staged changes, push and create PR (if `gh` present).
Usage:
  - Interactive: .\scripts\prepare_pr.ps1
  - Provide REMOTE_URL as env var or first argument to init+push when .git is missing.
#>

param(
  [string] $RemoteUrl = $env:REMOTE_URL,
  [switch] $ForceInit
)

function ExitWith($msg, $code=1) {
  Write-Host $msg -ForegroundColor Red
  exit $code
}

Push-Location (Get-Location)

# 1) Basic checks
if (-not (Test-Path './package.json')) { ExitWith "package.json not found in current directory. Run this from the repo root." }

Write-Host "Node:" (node -v) "| npm:" (npm -v)

# 2) Git availability
$gitExists = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
if (-not $gitExists) { ExitWith "git is not installed or not on PATH." }

$hasGit = Test-Path .git
if (-not $hasGit) {
  if (-not $RemoteUrl) {
    Write-Host ".git not found. To proceed automatically provide a remote URL via:
  $env:REMOTE_URL='https://github.com/ORG/REPO.git'  OR  .\scripts\prepare_pr.ps1 -RemoteUrl 'https://github.com/ORG/REPO.git'" -ForegroundColor Yellow
    if (-not $ForceInit) { ExitWith "Aborting: .git missing and no remote provided." }
  }
  Write-Host "Initializing git repository..."
  git init
  if ($LASTEXITCODE -ne 0) { ExitWith "git init failed" }
  if ($RemoteUrl) {
    git remote add origin $RemoteUrl
    if ($LASTEXITCODE -ne 0) { Write-Host "remote add failed — remote may already exist" -ForegroundColor Yellow }
    git fetch origin --depth=1
    if ($LASTEXITCODE -ne 0) { Write-Host "fetch origin failed (non-fatal)" -ForegroundColor Yellow }
  }
}

# 3) Install deps (handle lockfile)
if (Test-Path package-lock.json) {
  Write-Host "Found package-lock.json → running npm ci"
  npm ci
  if ($LASTEXITCODE -ne 0) { ExitWith "npm ci failed" }
} else {
  Write-Host "Running npm install"
  npm install
  if ($LASTEXITCODE -ne 0) { ExitWith "npm install failed" }
}

# 4) Run env guard, tests, build
Write-Host "Running env check"
npm run check-env
if ($LASTEXITCODE -ne 0) { ExitWith "check-env failed" }

Write-Host "Running unit tests"
npm test
if ($LASTEXITCODE -ne 0) { ExitWith "npm test failed" }

Write-Host "Building production bundle"
npm run build
if ($LASTEXITCODE -ne 0) { ExitWith "build failed" }

# 5) Create branch and commit changes (stage only files that exist)
$branch = 'ci/pr/connect-live-firebase'
Write-Host "Creating branch: $branch"
try { git checkout -B $branch } catch { git checkout -b $branch }

$filesToStage = @(
  'contexts/DataContext.tsx',
  'firebase.ts',
  '.env.local',
  'admin_firebase_access.mjs',
  '.firebaserc',
  'PR_BODY.md'
)

$existing = $filesToStage | Where-Object { Test-Path $_ }
if ($existing.Count -eq 0) { Write-Host "No known files to stage were found — review local changes manually." }
else {
  Write-Host "Staging files: $($existing -join ', ')"
  git add $existing
}

# Stage any other unstaged changes (optional)
$unstaged = git status --porcelain | Select-String '^[ MADRCU]'
if ($unstaged) {
  Write-Host "Also staging ALL modified files (unstaged present)"
  git add -A
}

# Commit
$commitMsg = 'chore: point to computing-science-2569, add env guards, redact SA, fix DataContext local-seed + TS import'
if ($null -ne (git rev-parse --verify HEAD)) {
  git commit -m "$commitMsg"
  if ($LASTEXITCODE -ne 0) { Write-Host "No changes to commit or commit failed" -ForegroundColor Yellow }
} else {
  git add -A
  git commit -m "$commitMsg"
  if ($LASTEXITCODE -ne 0) { ExitWith "Initial commit failed" }
}

# 6) Push and open PR if possible
$hasRemote = $null -ne (git remote)
if ($hasRemote) {
  Write-Host "Pushing branch to origin..."
  git push -u origin $branch
  if ($LASTEXITCODE -ne 0) { Write-Host "Push failed — check credentials/remote" -ForegroundColor Yellow }
} else {
  Write-Host "No git remote configured. Set origin and push manually." -ForegroundColor Yellow
}

# Create PR with gh if available
if (Get-Command gh -ErrorAction SilentlyContinue) {
  Write-Host "Creating PR with gh..."
  gh pr create --base main --head $branch --title "chore: env guards + point app to computing-science-2569; redact SA; fix local-seed" --body "$(Get-Content PR_BODY.md -Raw)"
  if ($LASTEXITCODE -ne 0) { Write-Host "gh pr create failed (you may need to authenticate gh CLI)" -ForegroundColor Yellow }
} else {
  Write-Host "gh CLI not available — create PR via GitHub UI using branch: $branch" -ForegroundColor Yellow
}

Pop-Location
Write-Host "Done. If push or PR creation failed, follow the printed suggestions." -ForegroundColor Green
