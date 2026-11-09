# Deadline Disaster

A chaotic workplace survival mini-game built with React and Vite.

## Features
- 60-second survival round with pause/resume
- Stress, productivity, sanity, and reputation stats
- Coffee Crisis: drag the mug away from an expanding spill
- Inbox Apocalypse: click urgent emails and avoid spam
- Desktop Disaster: close popups while keeping the presentation open
- Random events, score, performance review, and multiple endings
- Responsive layout and keyboard-friendly controls

## Run locally
1. Install Node.js LTS from https://nodejs.org/
2. Open this folder in VS Code.
3. Open the VS Code terminal in this folder.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL Vite prints, usually http://localhost:5173

## Build check
```bash
npm run build
npm run preview
```

## Push to GitHub
Create an empty repository on https://github.com/new named `deadline-disaster`.
Do not add a README or .gitignore there (this project already has them).
Then run these commands in this project folder, replacing YOUR-USERNAME:

```bash
git init
git add .
git commit -m "Build Deadline Disaster starter game"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/deadline-disaster.git
git push -u origin main
```

If Git asks you to identify yourself, configure:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Deploy on Vercel
1. Sign in at https://vercel.com/ using GitHub.
2. Click **Add New → Project**.
3. Import the `deadline-disaster` repository.
4. Vercel should detect Vite automatically.
5. Confirm:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Click **Deploy**.
7. Each push to the connected GitHub branch will trigger a new deployment.

No API keys or environment variables are needed for this starter.
