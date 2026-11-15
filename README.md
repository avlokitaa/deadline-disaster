# Deadline Disaster

A chaotic workplace survival mini-game built with React and Vite.

## Features
- 60-second survival round with pause/resume
- Stress, productivity, sanity, and reputation stats
- Coffee Crisis: drag the mug away from an expanding spill
- Inbox Apocalypse: click # 💻 Deadline Disaster

> **Your deadline is approaching. Your sanity isn't.**

**Deadline Disaster** is a chaotic office-survival game where you try to stay productive while everything around you works against you.

Coffee is dangerously close to your laptop. Your inbox is full of spam. Your desktop is drowning in pop-ups. And somehow, you still have to survive an office meeting.

The goal is simple:

**Survive the chaos. Get your work done. Keep your sanity intact.**

---

## 🎮 Play the Game

**[▶️ Play Deadline Disaster](YOUR_DEPLOYED_WEBSITE_URL_HERE)**

> Replace the link above with your deployed website URL.

---

## 🕹️ How to Play

Deadline Disaster is divided into four chaotic mini-games, each testing a different kind of workplace survival skill.

### ☕ Coffee Disaster

Your coffee is dangerously close to your laptop.

Drag the coffee around the desk and prevent it from spilling.

If it gets too close to the laptop, a **3-second danger countdown** begins.

You can either:

- Move the coffee away from the laptop
- Place it on the coaster
- Release it
- Press **SAFE**

Successfully saving the coffee earns:

**+100 Points**

But repeatedly playing chicken with the laptop will increase your Stress.

---

### 📧 Spam Mail

Your inbox is full of emails you absolutely do not need.

You may be tempted to click them.

**Don't.**

Repeatedly interacting with spam causes your Stress to escalate faster and faster.

Sometimes the best productivity strategy is simply:

**Don't click the suspicious email.**

---

### 🖥️ Desktop Disaster

Your desktop has become a battlefield of pop-ups.

Your job is to:

- **Keep relevant pop-ups**
- **Remove irrelevant pop-ups**
- Drag windows around to uncover hidden ones
- Avoid letting too many irrelevant pop-ups pile up

Be careful.

Removing relevant pop-ups repeatedly will increase your Stress too.

---

### 🧑‍💼 Survive the Meeting

You've somehow ended up in a meeting.

And people are following you.

**RUN.**

Use:

- `WASD`
- `Arrow Keys`

to move around the meeting room and avoid the mob.

If the mob catches you:

- You lose **5 Points**
- Your character is temporarily stopped
- You are returned to your starting position
- The chase continues

And then there's the gossip.

Random gossip events appear around the room and increase your **Stress** while decreasing your **Sanity**.

So keep moving.

And maybe don't listen to office gossip.

---

## 📊 Your Stats

Throughout the game, you'll need to balance four things:

| Stat | What it means |
|---|---|
| 🏆 **Points** | Your overall score |
| 🧠 **Sanity** | How mentally okay you are |
| 📈 **Productivity** | How effectively you're getting work done |
| 😰 **Stress** | How close you are to completely losing it |

These are separate systems, so not every mistake costs Points.

Some events affect Stress.

Some affect Sanity.

Some affect Productivity.

And some directly affect your score.

---

## 🧠 Stress & Repeated Actions

Some bad habits become much worse when you keep repeating them.

Certain actions can cause Stress to escalate rapidly:

**+1 → +2 → +4 → +8...**

This can happen when repeatedly:

- ☕ Messing around near the laptop
- 📧 Clicking spam emails
- 🖥️ Removing relevant pop-ups

So if something is clearly a bad idea...

**Doing it twelve more times probably isn't going to help.**

---

## 🧘 The Calm Button

When your Stress rises above **60%**, things start getting serious.

You'll see a warning:

> ⚠️ **CALM DOWN BEFORE YOUR SANITY GETS WORSE**

A **CALM DOWN** button will appear.

Using it temporarily pauses the game timer and gives you a moment to recover before continuing.

However:

**Calming down does not restore your Sanity.**

Your existing Sanity-loss mechanics continue to matter, so you still need to manage your Stress and make good decisions.

---

## 💀 Game Over

If your **Sanity reaches 0**, the game is over.

You'll receive a final score evaluation based on your Points.

Your goal isn't simply to collect the highest score.

It's to survive long enough to actually finish the workday.

---

## 🏆 Final Score

Your performance is evaluated at the end of the game.

| Points | Manager's opinion |
|---:|---|
| **0–100** | *The manager gave you a weird look, maybe you keep your nose buried in work* |
| **100–300** | *Manager looks impressed, he might finally ask you to join the dinner gang* |
| **300–500** | *Well, maybe it is time for a raise* |
| **600+** | *Solid run.* |

---

## ✨ Features

- 🎮 Multiple workplace-themed mini-games
- ☕ Interactive drag-and-drop coffee mechanic
- 📧 Spam-mail interactions
- 🖥️ Draggable desktop pop-ups
- 🧑‍💼 Meeting escape/chase gameplay
- 🗣️ Random office gossip events
- 🧠 Dynamic Stress & Sanity systems
- 🧘 Panic/Calm mechanic
- 🏆 Score-based performance evaluation
- 🎨 Pixel-art inspired office aesthetic
- 💀 Multiple ways to completely lose control of your workday

---

## 🛠️ Built With

- **React**
- **JavaScript / JSX**
- **HTML**
- **CSS**
- **Vite**

---

## 📁 Project Structure

```text
deadline-disaster/
├── src/
│   ├── assets/
│   │   ├── clock.png
│   │   ├── coffee.png
│   │   ├── desk.png
│   │   ├── laptop.png
│   │   ├── mob.png
│   │   ├── screen.png
│   │   ├── shelf.png
│   │   ├── window.png
│   │   └── woman.png
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/avlokitaa/deadline-disaster.git
```

Navigate into the project:

```bash
cd deadline-disaster
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL provided by Vite.

---

## 🌐 Deployment

Deadline Disaster is deployed as a web game, so it can be played directly through the browser without installing anything.

**[🎮 Play it here](YOUR_DEPLOYED_WEBSITE_URL_HERE)**

---

## 💡 Concept

Deadline Disaster is built around a simple idea:

> **What if surviving a normal workday was a game?**

Instead of fighting monsters or solving ancient mysteries, you're fighting the things that actually destroy productivity:

**distractions, bad decisions, overflowing inboxes, unstable desktops, office gossip, and coffee.**

Because apparently, getting through one workday is a boss battle.

---

## 👩‍💻 Author

**Avlokita Pathania**

Computer Science Student  
BMS College of Engineering

---

## 📜 License

This project was created as a personal game project.

Feel free to explore the code and learn from it, but please do not redistribute the project as your own.urgent emails and avoid spam
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
