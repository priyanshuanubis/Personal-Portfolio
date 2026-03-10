# Free Deployment (GitHub Pages)

This repo is now configured for automatic free deployment via **GitHub Pages**.

## One-time setup in GitHub
1. Push this branch to your GitHub repository.
2. Open your repo on GitHub → **Settings** → **Pages**.
3. Under **Build and deployment**, set:
   - **Source:** GitHub Actions
4. Go to **Actions** tab and run/verify workflow: **Deploy Portfolio to GitHub Pages**.

## Your live URL
After workflow succeeds, site will be available at:
- `https://<your-github-username>.github.io/<repo-name>/`

If your repo is named `<your-github-username>.github.io`, URL will be:
- `https://<your-github-username>.github.io/`

## Notes
- Any push to `main`, `master`, or `work` triggers deployment automatically.
- This is fully free for public repos.
