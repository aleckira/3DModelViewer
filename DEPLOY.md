# Deploy 3D Model Viewer to GitHub Pages

## Step 1: Push to GitHub

In your terminal, run:

```bash
cd c:\Users\aleck\3DModelViewer
git push -u origin main
```

If prompted for credentials:
- **Username:** your GitHub username (`aleckira`)
- **Password:** use a **Personal Access Token** (not your GitHub password)
  - Create one at: https://github.com/settings/tokens
  - Enable `repo` scope

---

## Step 2: Enable GitHub Pages

1. Go to your repo: **https://github.com/aleckira/3DModelViewer**
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**:
   - **Source:** select **GitHub Actions**
4. Save (no need to do anything else)

---

## Step 3: Deploy

Every push to `main` will automatically:
1. Build the app (`npm run build`)
2. Deploy the `dist` folder to GitHub Pages

You can also trigger it manually:
1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

---

## Step 4: View Your Site

After the workflow completes (1–2 minutes):

- **URL:** https://aleckira.github.io/3DModelViewer/

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on refresh | Ensure `base: '/3DModelViewer/'` in `vite.config.ts` matches your repo name |
| Workflow fails | Check the **Actions** tab for error details |
| Blank page | Open browser DevTools (F12) → Console for errors |
