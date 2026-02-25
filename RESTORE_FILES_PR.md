# Restore .github, LICENSE, CONTRIBUTING.md to `main`

Use this flow to get the missing files back on `main` via a PR (no direct push to `main`).

## Do not

- **Do not** run `git rm --cached` again on those paths. That would remove them again.

## Option A: PR from `restore-github-license-contributing` (recommended)

1. Push the restore branch and open a PR **into** `main`:
   ```bash
   git push -u origin restore-github-license-contributing
   ```
2. On GitHub: **New Pull Request** → base: `main`, compare: `restore-github-license-contributing`.
3. When merging the PR, use **“Create a merge commit”** (do **not** use “Squash and merge”). Squash can drop the file additions and is likely why the files didn’t appear on `main` last time.
4. After the merge, the files (`.github/`, `LICENCE`, `CONTRIBUTING.md`, `opencode.json`, etc.) should appear on `main`.

If the PR shows “Already up to date” with `main`, then GitHub’s `main` already has the same commits as your local `main`; in that case use Option B.

## Option B: PR from `temp` into `main`

1. Merge `main` into `temp` so `temp` is up to date and still has the files:
   ```bash
   git checkout temp
   git merge main
   # resolve any conflicts (keep the files if in doubt), then:
   git push origin temp
   ```
2. On GitHub: **New Pull Request** → base: `main`, compare: `temp`.
3. When merging, use **“Create a merge commit”** (not “Squash and merge”).
4. After the merge, `main` will have `temp`’s tree, including the restored files.

## Vercel: why `main` fails and `temp` works

- **Default branch**: Your `origin/HEAD` points at `origin/temp`, so Vercel may be building `temp` by default. If the Vercel project is set to deploy `main`, it will use `main`’s tree.
- **Missing files on `main`**: If `.github` (e.g. workflows) or other files are only on `temp`, then:
  - Builds from `main` can fail (e.g. different config or missing workflow).
  - Builds from `temp` succeed because the files are there.
- **Fix**: After the files are restored on `main` (via the PR above), redeploy `main` on Vercel. If you want only one branch to deploy, set the “Production branch” in Vercel to that branch (e.g. `main` or `temp`) so behavior is consistent.

## Branch sync (optional)

- `temp` is 5 commits ahead of `main` (restore + workflows + rm --cached + fixes).
- `main` has 3 commits not in `temp` (merge conflicts, zk setup #30, build errors #29).
- After you merge the restore PR into `main`, consider merging `main` into `temp` (or the other way around) so the two branches don’t drift long term.
