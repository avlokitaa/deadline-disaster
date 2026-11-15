import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause } from 'lucide-react';

// Imported pixel asset images
import coffeeMugImg from './assets/coffee.png';
import laptopImg from './assets/laptop.png';
import deskImg from './assets/desk.png';
import screenImg from './assets/screen.png';
import womanImg from './assets/woman.png';
import mobImg from './assets/mob.png';
import clockImg from './assets/clock.png';
import windowImg from './assets/window.png';

// Gameplay Constants & Fixed Starting Positions
const INITIAL_STATS = { stress: 0, productivity: 100, sanity: 100, score: 0 };
const FIXED_START_MUG_POS = { x: 150, y: 340 };
const INITIAL_WOMAN_POS = { x: 180, y: 280 };
const INITIAL_MOB_POS = { x: 650, y: 280 };
const MAX_ESCALATED_STRESS = 16;
const ESCALATION_DECAY_MS = 6000;
const CALM_BREATHS_REQUIRED = 3;

const PHASES = [
  { id: 1, name: 'COFFEE CRISIS', endAt: 45 },
  { id: 2, name: 'INBOX APOCALYPSE', endAt: 30 },
  { id: 3, name: 'DESKTOP DISASTER', endAt: 15 },
  { id: 4, name: 'SURVIVE THE MEETING', endAt: 0 }
];

const GOSSIP_TEXTS = [
  "Did you hear what happened?",
  "Wait, did you see that?",
  "Apparently she...",
  "Guys, I have some tea!",
  "Did you hear about the deadline?",
  "No way, you're joking!"
];

const RULES_PAGES = [
  {
    title: '💻 DEADLINE DISASTER',
    body: `Your deadline is approaching. Your sanity isn't.

Welcome to Deadline Disaster, a chaotic office survival game where your job is to somehow stay productive while everything around you tries to ruin your day.

You’ll have to deal with coffee spills, endless spam, distracting pop-ups, awkward meetings, gossip, and the general nightmare of trying to work in an office.

Your goal is simple:
Survive the chaos. Get your work done. Keep your sanity intact.`
  },
  {
    title: '🎯 YOUR GOAL',
    body: `Throughout the game, you'll need to balance four things:

🏆 Points
Your score.
Make good decisions to earn points and avoid mistakes that cost you.

🧠 Sanity
How mentally okay you are.
Certain events, especially office gossip, can chip away at your sanity.

📈 Productivity
Your ability to actually get work done.
Distractions and disasters can interfere with your productivity.

😰 Stress
How close you are to completely losing it.
Stress builds up as things go wrong — and if you keep repeating certain bad habits, it can rise very quickly.`
  },
  {
    title: '☕ COFFEE DISASTER',
    body: `Your coffee is dangerously close to your laptop.
Do not let it spill.

You can grab the coffee and physically drag it around the desk.
If it gets too close to the laptop, a 3-second danger countdown begins.

Your options:
Move it away from the laptop
or
Save it on the coaster.

To safely use the coaster:
Drag → Place on coaster → Release → Press SAFE

Successfully saving your coffee earns:
+100 Points

But be careful — if the coffee spills, your Stress goes up.
And repeatedly playing chicken with the laptop will make things worse.`
  },
  {
    title: '📧 SPAM MAIL',
    body: `Your inbox is full of things you absolutely do not need.
You may be tempted to click on them.

Don't.

Repeatedly interacting with spam makes your Stress increase faster and faster.
The more you keep doing it, the worse it gets

So maybe stop clicking that suspicious email.`
  },
  {
    title: '🖥️ DESKTOP DISASTER',
    body: `Your desktop has become a battlefield of pop-ups.

Your job:
Keep the relevant pop-ups.
Remove the irrelevant ones.

Some pop-ups may be hiding behind others, so you'll need to drag windows around to find what you need.

But don't let the clutter get out of control.
If too many irrelevant pop-ups are hanging around, you can lose points.

And there's another problem...
Don't accidentally remove the things you actually need.
Repeatedly removing relevant pop-ups will also send your Stress climbing
Your computer isn't the only thing getting overwhelmed.`
  },
  {
    title: '🧑‍💼 SURVIVE THE MEETING',
    body: `You've somehow ended up in a meeting.
And people are following you.
RUN.

Use:
WASD or Arrow Keys
to move around the room.

Avoid the mob chasing you.
If they catch you:
- You lose 5 Points
- Your character is temporarily stopped
- You are returned to your starting position
- The chase begins again

But the meeting has another weapon:
🗣️ GOSSIP
Random gossip will appear around the room.
Gossip increases your Stress and decreases your Sanity.

So keep moving.
And maybe don't listen to office gossip.`
  },
  {
    title: '⚠️ THE GOLDEN RULE',
    body: `Not everything that causes trouble immediately costs you points.

Some things affect Stress.
Some affect Sanity.
Some affect Productivity.
And some directly affect your Points.

Keep an eye on all four.`
  },
  {
    title: '🧠 WATCH YOUR HABITS',
    body: `Some mistakes become much worse when you keep repeating them.

If you repeatedly:
☕ mess around near the laptop
📧 click spam emails
🖥️ remove relevant pop-ups

your Stress can escalate rapidly.

So if something is clearly a bad idea...
doing it twelve more times probably isn't going to help.`
  },
  {
    title: '🧘 WHEN THINGS GET TOO MUCH',
    body: `When your Stress rises above 60%, things start getting serious.

You'll see:
⚠️ CALM DOWN BEFORE YOUR SANITY GETS WORSE
and a CALM DOWN button will appear.

Take a moment to calm down.
While you're calming down, the game timer will pause.
Once you're ready, continue the game.

But remember: calming down doesn't restore your Sanity.
You still need to manage your Stress and survive the rest of the day.`
  },
  {
    title: '🏁 CAN YOU SURVIVE?',
    body: `The office is chaotic.
Your computer is fighting you.
Your coffee is a hazard.
Your inbox is lying to you.
Your coworkers are gossiping.

And somehow, you're still expected to be productive.

Good luck.
Now get back to work.`
  }
];

function getEndGameMessage(score) {
  if (score >= 600) {
    return '"Solid run! Your manager nodded at you in the hallway. That is basically a promotion."';
  }
  if (score > 300) {
    return '"Well, maybe it is time for a raise"';
  }
  if (score >= 100) {
    return '"Manager looks impressed, he might finally ask you to join the dinner gang"';
  }
  return '"The manager gave you a weird look, maybe you keep your nose buried in work"';
}

export default function App() {
  const [gameState, setGameState] = useState('TITLE'); // TITLE, PLAYING, GAME_OVER
  const [gameOverReason, setGameOverReason] = useState('TIME_UP'); // TIME_UP, SANITY_DEPLETED
  const [showRules, setShowRules] = useState(false);
  const [rulesPage, setRulesPage] = useState(0);

  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [muted, setMuted] = useState(false);

  // Panic / Calm Mechanic State
  const [isCalming, setIsCalming] = useState(false);
  const [calmProgress, setCalmProgress] = useState(0);

  // Game Viewport & Monitor Display Refs
  const gameAreaRef = useRef(null);
  const monitorDisplayRef = useRef(null);

  // Stage 1 State: Coffee Mug Drag State, Laptop Danger Timer (3s), Room Timer (5s), and Safe Coaster State
  const [mugPos, setMugPos] = useState(FIXED_START_MUG_POS);
  const isDraggingMug = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const wasInLaptopDangerRef = useRef(false);

  const [spillPos, setSpillPos] = useState({ x: 400, y: 220, radius: 0 });
  const [coffeeTimer, setCoffeeTimer] = useState(null); // 3-second laptop danger timer
  const [roomTimer, setRoomTimer] = useState(5);       // 5-second general room timer
  const [isOnCoaster, setIsOnCoaster] = useState(false);

  // Guard ref to prevent duplicate rewards within a single round
  const coffeeRoundRewarded = useRef(false);

  // Independent Repeated-Action Stress Escalation Counters & Decay Timers
  const laptopEscalationCount = useRef(0);
  const laptopDecayTimer = useRef(null);

  const spamEscalationCount = useRef(0);
  const spamDecayTimer = useRef(null);

  const relevantPopupEscalationCount = useRef(0);
  const relevantPopupDecayTimer = useRef(null);

  // Stage 2 & 3 State
  const [emails, setEmails] = useState([]);
  const [popups, setPopups] = useState([]);
  const activeDragRef = useRef(null);
  const prevIrrelevantCountRef = useRef(0);

  // Stage 4 State: Player Woman, Enemy Mob, Freeze state, and Gossip Hazards
  const [womanPos, setWomanPos] = useState(INITIAL_WOMAN_POS);
  const [mobPos, setMobPos] = useState(INITIAL_MOB_POS);
  const [isFrozen, setIsFrozen] = useState(false);
  const isFrozenRef = useRef(false);
  const [gossips, setGossips] = useState([]);

  // Keyboard Movement Input Tracker
  const keysPressed = useRef({});

  // Active Phase calculation
  const currentPhase = PHASES.find(p => timeLeft > p.endAt) || PHASES[3];

  // Independent Stats Updater
  const updateStats = (delta) => {
    setStats(prev => ({
      stress: Math.max(0, Math.min(100, prev.stress + (delta.stress || 0))),
      productivity: Math.max(0, Math.min(100, prev.productivity + (delta.productivity || 0))),
      sanity: Math.max(0, Math.min(100, prev.sanity + (delta.sanity || 0))),
      score: Math.max(0, prev.score + (delta.score || 0))
    }));
  };

  // Helper: Compute controlled exponential stress (+1 -> +2 -> +4 -> +8 -> +16) and schedule individual reset
  const triggerEscalatedStress = (countRef, timerRef) => {
    const stressGain = Math.min(MAX_ESCALATED_STRESS, Math.pow(2, countRef.current));
    countRef.current += 1;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      countRef.current = 0;
    }, ESCALATION_DECAY_MS);

    return stressGain;
  };

  // Cleanup escalation decay timers on unmount
  useEffect(() => {
    return () => {
      if (laptopDecayTimer.current) clearTimeout(laptopDecayTimer.current);
      if (spamDecayTimer.current) clearTimeout(spamDecayTimer.current);
      if (relevantPopupDecayTimer.current) clearTimeout(relevantPopupDecayTimer.current);
    };
  }, []);

  // Immediate Game Over when Sanity reaches 0 or below
  useEffect(() => {
    if (gameState === 'PLAYING' && stats.sanity <= 0) {
      isDraggingMug.current = false;
      activeDragRef.current = null;
      setIsCalming(false);
      setCalmProgress(0);
      setGameOverReason('SANITY_DEPLETED');
      setGameState('GAME_OVER');
    }
  }, [gameState, stats.sanity]);

  // Panic / Calm Down Handlers
  const handleStartCalming = () => {
    if (gameState !== 'PLAYING' || stats.stress <= 60 || isCalming) return;
    isDraggingMug.current = false;
    activeDragRef.current = null;
    setCalmProgress(0);
    setIsCalming(true);
  };

  const finishCalming = () => {
    setIsCalming(false);
    setCalmProgress(0);
    // Bring Stress back under the 60% panic threshold without restoring Sanity
    setStats(prev => ({
      ...prev,
      stress: Math.min(50, Math.max(0, prev.stress - 25))
    }));
  };

  const handleCalmBreathClick = () => {
    if (!isCalming) return;
    const nextProgress = calmProgress + 1;
    if (nextProgress >= CALM_BREATHS_REQUIRED) {
      finishCalming();
    } else {
      setCalmProgress(nextProgress);
    }
  };

  // Auto-advance calming bar so calming state cannot permanently freeze the game
  useEffect(() => {
    if (!isCalming || gameState !== 'PLAYING') return;

    const autoCalmTimer = setInterval(() => {
      setCalmProgress(prev => {
        if (prev + 1 >= CALM_BREATHS_REQUIRED) {
          finishCalming();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(autoCalmTimer);
  }, [isCalming, gameState]);

  // Resets coffee round state and prepares for next interaction
  const resetCoffeeRound = () => {
    isDraggingMug.current = false;
    wasInLaptopDangerRef.current = false;
    setCoffeeTimer(null);
    setRoomTimer(5);
    setIsOnCoaster(false);
    setMugPos(FIXED_START_MUG_POS);
    setTimeout(() => {
      coffeeRoundRewarded.current = false;
    }, 100);
  };

  // Explicit Step 2: Triggered ONLY when player clicks the active [ SAFE ] button
  const handleSafeButtonClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCalming) return;
    if (isOnCoaster && !coffeeRoundRewarded.current) {
      coffeeRoundRewarded.current = true;
      updateStats({ score: 100 });
      resetCoffeeRound();
    }
  };

  // Triggers coffee spill event (+1 percentage point Stress)
  const triggerCoffeeSpill = (x, y) => {
    updateStats({ stress: 1 });
    setSpillPos({ x, y, radius: 45 });
    resetCoffeeRound();
  };

  // Stage 1 Drag Interaction: Pointer Down directly on Mug
  const handleMugPointerDown = (e) => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 1 || isCalming) return;
    e.stopPropagation();
    e.preventDefault();

    isDraggingMug.current = true;

    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      dragOffset.current = {
        x: pointerX - mugPos.x,
        y: pointerY - mugPos.y
      };
    }
  };

  // Window Pointer Listeners for Smooth Coffee Mug Dragging & Release
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      if (!isDraggingMug.current || !gameAreaRef.current) return;

      const rect = gameAreaRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const newX = pointerX - dragOffset.current.x;
      const newY = pointerY - dragOffset.current.y;

      const clampedX = Math.max(30, Math.min(rect.width - 30, newX));
      const clampedY = Math.max(30, Math.min(rect.height - 30, newY));

      setMugPos({ x: clampedX, y: clampedY });
    };

    const handleWindowPointerUp = () => {
      if (isDraggingMug.current) {
        isDraggingMug.current = false;
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, []);

  // Main 60s Workday Timer & Passive Stat Degradation (Pauses while CALM DOWN is active)
  useEffect(() => {
    if (gameState !== 'PLAYING' || isCalming) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOverReason('TIME_UP');
          setGameState('GAME_OVER');
          return 0;
        }
        return prev - 1;
      });

      updateStats({
        sanity: -0.5,
        productivity: -0.5,
        stress: 0.5
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isCalming]);

  // Stage 1: Coaster & Laptop Danger Zone Detection (with discrete entry stress escalation)
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 1) {
      if (coffeeTimer !== null) setCoffeeTimer(null);
      wasInLaptopDangerRef.current = false;
      return;
    }

    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const laptopX = rect.width / 2;
      const laptopY = 225;
      const distToLaptop = Math.hypot(mugPos.x - laptopX, mugPos.y - laptopY);

      const coasterX = rect.width - 170;
      const coasterY = 225;
      const distToCoaster = Math.hypot(mugPos.x - coasterX, mugPos.y - coasterY);

      if (distToCoaster < 55) {
        if (!isOnCoaster) setIsOnCoaster(true);
        if (coffeeTimer !== null) setCoffeeTimer(null);
        wasInLaptopDangerRef.current = false;
      } else {
        if (isOnCoaster) setIsOnCoaster(false);
        
        if (distToLaptop < 150) {
          if (!wasInLaptopDangerRef.current) {
            wasInLaptopDangerRef.current = true;
            const escalatedStress = triggerEscalatedStress(laptopEscalationCount, laptopDecayTimer);
            updateStats({ stress: escalatedStress });
          }
          if (coffeeTimer === null) {
            setCoffeeTimer(3);
          }
        } else {
          wasInLaptopDangerRef.current = false;
          if (coffeeTimer !== null) {
            setCoffeeTimer(null);
          }
        }
      }
    }
  }, [gameState, currentPhase, mugPos, coffeeTimer, isOnCoaster]);

  // Stage 1: 3-Second Laptop Danger Countdown Ticker (Pauses while CALM DOWN is active)
  useEffect(() => {
    if (coffeeTimer === null || gameState !== 'PLAYING' || currentPhase.id !== 1 || isCalming) return;

    if (coffeeTimer === 0) {
      triggerCoffeeSpill(mugPos.x, mugPos.y);
      return;
    }

    const countdown = setInterval(() => {
      setCoffeeTimer(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(countdown);
  }, [coffeeTimer, gameState, currentPhase, mugPos, isCalming]);

  // Stage 1: 5-Second General Room Timer Ticker (Pauses on coaster or while CALM DOWN is active)
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 1 || isOnCoaster || isCalming) return;

    const interval = setInterval(() => {
      setRoomTimer(prev => {
        if (prev <= 1) {
          triggerCoffeeSpill(mugPos.x, mugPos.y);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, currentPhase, isOnCoaster, mugPos, isCalming]);

  // Stage 2 & 3: Email & Popup Spawners (Pauses while CALM DOWN is active)
  useEffect(() => {
    if (gameState !== 'PLAYING' || isCalming) return;

    const gameTick = setInterval(() => {
      if (currentPhase.id === 2) {
        if (Math.random() > 0.94 && emails.length < 5) {
          setEmails(prev => [...prev, {
            id: Date.now(),
            x: 15 + Math.random() * 440,
            y: 15 + Math.random() * 210,
            urgent: Math.random() > 0.5
          }]);
        }
      } else if (currentPhase.id === 3) {
        if (Math.random() > 0.94 && popups.length < 7) {
          setPopups(prev => [...prev, {
            id: Date.now(),
            x: 20 + Math.random() * 430,
            y: 20 + Math.random() * 200,
            isPresentation: Math.random() > 0.8
          }]);
        }
      }
    }, 50);

    return () => clearInterval(gameTick);
  }, [gameState, currentPhase, emails.length, popups.length, isCalming]);

  // Stage 3 Penalty Event: Check whenever irrelevant pop-ups exceed 5
  const irrelevantPopupsCount = popups.filter(p => !p.isPresentation).length;
  useEffect(() => {
    if (currentPhase.id === 3 && gameState === 'PLAYING') {
      if (irrelevantPopupsCount > 5 && prevIrrelevantCountRef.current <= 5) {
        updateStats({ score: -5 });
      }
      prevIrrelevantCountRef.current = irrelevantPopupsCount;
    }
  }, [irrelevantPopupsCount, currentPhase, gameState]);

  // Stage 3 Draggable Popups Pointer Logic
  const handlePopupPointerDown = (id, e) => {
    if (isCalming) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    const popupEl = e.currentTarget;
    if (!popupEl) return;
    const rect = popupEl.getBoundingClientRect();
    activeDragRef.current = {
      id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
    setPopups(prev => {
      const target = prev.find(p => p.id === id);
      if (!target) return prev;
      return [...prev.filter(p => p.id !== id), target];
    });
  };

  useEffect(() => {
    const handleWindowPopupMove = (e) => {
      const dragData = activeDragRef.current;
      if (!dragData || !monitorDisplayRef.current) return;

      const displayRect = monitorDisplayRef.current.getBoundingClientRect();
      let newX = e.clientX - displayRect.left - dragData.offsetX;
      let newY = e.clientY - displayRect.top - dragData.offsetY;

      if (!Number.isFinite(newX) || !Number.isFinite(newY)) return;

      newX = Math.max(0, Math.min(470, newX));
      newY = Math.max(0, Math.min(250, newY));

      const targetId = dragData.id;
      setPopups(prev => prev.map(p => (p.id === targetId ? { ...p, x: newX, y: newY } : p)));
    };

    const handleWindowPopupUp = () => {
      if (activeDragRef.current) {
        activeDragRef.current = null;
      }
    };

    window.addEventListener('pointermove', handleWindowPopupMove);
    window.addEventListener('pointerup', handleWindowPopupUp);
    window.addEventListener('pointercancel', handleWindowPopupUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPopupMove);
      window.removeEventListener('pointerup', handleWindowPopupUp);
      window.removeEventListener('pointercancel', handleWindowPopupUp);
    };
  }, []);

  // Stage 4 Keyboard Listener (WASD & Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Stage 4 Loop: Player Movement, Mob Chasing AI, Gossip Spawner & Collision Handling (Pauses while CALM DOWN is active)
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 4 || isCalming) return;

    const moveSpeed = 5;

    const frameLoop = setInterval(() => {
      if (!isFrozenRef.current) {
        setWomanPos(prev => {
          let newX = prev.x;
          let newY = prev.y;

          if (keysPressed.current['w'] || keysPressed.current['arrowup']) newY -= moveSpeed;
          if (keysPressed.current['s'] || keysPressed.current['arrowdown']) newY += moveSpeed;
          if (keysPressed.current['a'] || keysPressed.current['arrowleft']) newX -= moveSpeed;
          if (keysPressed.current['d'] || keysPressed.current['arrowright']) newX += moveSpeed;

          const clampedX = Math.max(40, Math.min(840, newX));
          const clampedY = Math.max(160, Math.min(420, newY));

          return { x: clampedX, y: clampedY };
        });

        setMobPos(prev => {
          const dx = womanPos.x - prev.x;
          const dy = womanPos.y - prev.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 2) return prev;

          const mobSpeed = 2.4;
          const moveX = (dx / dist) * mobSpeed;
          const moveY = (dy / dist) * mobSpeed;

          return {
            x: Math.max(40, Math.min(840, prev.x + moveX)),
            y: Math.max(160, Math.min(420, prev.y + moveY))
          };
        });
      }

      if (Math.random() > 0.94 && gossips.length < 5) {
        setGossips(prev => [...prev, {
          id: Date.now(),
          text: GOSSIP_TEXTS[Math.floor(Math.random() * GOSSIP_TEXTS.length)],
          x: 60 + Math.random() * 740,
          y: 170 + Math.random() * 230
        }]);
      }

      const distToMob = Math.hypot(womanPos.x - mobPos.x, womanPos.y - mobPos.y);
      if (distToMob < 40 && !isFrozenRef.current) {
        isFrozenRef.current = true;
        setIsFrozen(true);

        updateStats({ score: -5 });
        setWomanPos(INITIAL_WOMAN_POS);
        setMobPos(INITIAL_MOB_POS);

        setTimeout(() => {
          isFrozenRef.current = false;
          setIsFrozen(false);
        }, 500);
      }

      setGossips(prev => {
        return prev.filter(g => {
          const distToGossip = Math.hypot(womanPos.x - g.x, womanPos.y - g.y);
          if (distToGossip < 35 && !isFrozenRef.current) {
            updateStats({ stress: 5, sanity: -5 });
            return false;
          }
          return true;
        });
      });

    }, 30);

    return () => clearInterval(frameLoop);
  }, [gameState, currentPhase, womanPos, mobPos, gossips, isCalming]);

  // Stage 2 Email Click Handler (Escalating stress on repeated spam email interactions)
  const handleEmailClick = (id, urgent) => {
    if (isCalming) return;
    if (!emails.some(e => e.id === id)) return;

    if (urgent) {
      updateStats({ productivity: 5, score: 30 });
    } else {
      const escalatedStress = triggerEscalatedStress(spamEscalationCount, spamDecayTimer);
      updateStats({ sanity: -5, stress: escalatedStress });
    }
    setEmails(prev => prev.filter(e => e.id !== id));
  };

  // Stage 3 Popup Close Handler (Escalating stress ONLY on repeated removal of relevant popups)
  const handlePopupClick = (id, isPresentation) => {
    if (isCalming) return;
    if (!popups.some(p => p.id === id)) return;

    if (isPresentation) {
      const escalatedStress = triggerEscalatedStress(relevantPopupEscalationCount, relevantPopupDecayTimer);
      updateStats({ sanity: -20, score: -100, stress: escalatedStress });
    } else {
      updateStats({ stress: -5, score: 20 });
    }
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  // Shared Full State Reset Helper
  const resetAllGameState = () => {
    setStats(INITIAL_STATS);
    setTimeLeft(60);
    setGameOverReason('TIME_UP');
    setIsCalming(false);
    setCalmProgress(0);
    setMugPos(FIXED_START_MUG_POS);
    isDraggingMug.current = false;
    wasInLaptopDangerRef.current = false;
    setSpillPos({ x: 400, y: 220, radius: 0 });
    setCoffeeTimer(null);
    setRoomTimer(5);
    setIsOnCoaster(false);
    coffeeRoundRewarded.current = false;

    laptopEscalationCount.current = 0;
    spamEscalationCount.current = 0;
    relevantPopupEscalationCount.current = 0;
    if (laptopDecayTimer.current) clearTimeout(laptopDecayTimer.current);
    if (spamDecayTimer.current) clearTimeout(spamDecayTimer.current);
    if (relevantPopupDecayTimer.current) clearTimeout(relevantPopupDecayTimer.current);

    setEmails([]);
    setPopups([]);
    activeDragRef.current = null;
    prevIrrelevantCountRef.current = 0;
    setWomanPos(INITIAL_WOMAN_POS);
    setMobPos(INITIAL_MOB_POS);
    setIsFrozen(false);
    isFrozenRef.current = false;
    setGossips([]);
    keysPressed.current = {};
  };

  const startGame = () => {
    resetAllGameState();
    setShowRules(false);
    setGameState('PLAYING');
  };

  const goToHome = () => {
    resetAllGameState();
    setRulesPage(0);
    setShowRules(false);
    setGameState('TITLE');
  };

  const openRules = () => {
    setRulesPage(0);
    setShowRules(true);
  };

  return (
    <div className="game-container">
      {/* TITLE / HOME OVERLAY */}
      {gameState === 'TITLE' && (
        <div className="overlay-pixel">
          <div className="title-pixel-main">
            <span>DEADLINE</span>
            <span>DISASTER</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.6' }}>
            SURVIVE 60 SECONDS OF OFFICE CHAOS!<br/>
            HOLD & DRAG COFFEE TO COASTER & CLICK SAFE TO EARN +100 PTS!
          </p>

          <div className="home-btn-row">
            <button className="pixel-play-btn" onClick={startGame}>▶ PLAY GAME</button>
            <button className="pixel-secondary-btn" onClick={openRules}>📖 HOW TO PLAY</button>
          </div>
          
          <div className="grid-cards-pixel">
            {['01: COFFEE CRISIS', '02: INBOX DISASTER', '03: POPUP CHAOS', '04: SURVIVE MEETING'].map((title, i) => (
              <div key={i} className="intro-card-pixel">
                <div style={{ color: 'var(--pixel-orange)', fontSize: '0.6rem', fontFamily: 'var(--font-pixel-heading)', marginBottom: 4 }}>STAGE 0{i+1}</div>
                <h4 style={{ fontSize: '0.75rem', color: '#fff' }}>{title}</h4>
              </div>
            ))}
          </div>

          {/* PAGINATED RULES / HOW TO PLAY SECTION */}
          {showRules && (
            <div className="rules-modal-backdrop" onClick={() => setShowRules(false)}>
              <div className="rules-card-pixel" onClick={(e) => e.stopPropagation()}>
                <div className="rules-card-header">
                  <span className="rules-card-badge">📖 HOW TO PLAY — PAGE {rulesPage + 1} OF {RULES_PAGES.length}</span>
                  <button className="rules-close-btn" onClick={() => setShowRules(false)}>✕ CLOSE</button>
                </div>

                <div className="rules-card-body">
                  <h3 className="rules-page-title">{RULES_PAGES[rulesPage].title}</h3>
                  <div className="rules-page-content">{RULES_PAGES[rulesPage].body}</div>
                </div>

                <div className="rules-card-footer">
                  <button
                    className="rules-nav-btn"
                    onClick={() => setRulesPage(prev => Math.max(0, prev - 1))}
                    disabled={rulesPage === 0}
                  >
                    ← PREVIOUS
                  </button>

                  <span className="rules-page-indicator">{rulesPage + 1} / {RULES_PAGES.length}</span>

                  <button
                    className="rules-nav-btn"
                    onClick={() => setRulesPage(prev => Math.min(RULES_PAGES.length - 1, prev + 1))}
                    disabled={rulesPage === RULES_PAGES.length - 1}
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOP HUD */}
      {(gameState === 'PLAYING' || gameState === 'GAME_OVER') && (
        <div className="top-hud">
          <div className="hud-title">
            DEADLINE <span>DISASTER</span>
            <div className="phase-badge">STAGE {currentPhase.id}/4: {currentPhase.name}</div>
          </div>
          
          <div className={`timer-box-pixel ${isCalming ? 'timer-paused' : ''}`}>
            {isCalming ? 'PAUSED' : `00:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}`}
          </div>

          <div className="stats-container">
            {[
              { label: 'STRESS', val: stats.stress, color: 'var(--pixel-orange)' },
              { label: 'PROD', val: stats.productivity, color: 'var(--pixel-green)' },
              { label: 'SANITY', val: stats.sanity, color: 'var(--pixel-purple)' }
            ].map(s => (
              <div key={s.label} className="hud-stat">
                <div className="stat-labels">
                  <span style={{ color: s.color }}>{s.label}</span>
                  <span>{Math.round(s.val)}%</span>
                </div>
                <div className="stat-bar-outer-pixel">
                  <div className="stat-bar-inner-pixel" style={{ width: `${s.val}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="hud-actions">
            <div className="score-box-pixel">
              <span>SCORE</span>
              <strong>{stats.score}</strong>
            </div>
            <button className="pixel-btn-icon" onClick={() => setMuted(!muted)}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button className="pixel-btn-icon"><Pause size={18} /></button>
          </div>
        </div>
      )}

      {/* PLAYING VIEWPORT */}
      {gameState === 'PLAYING' && (
        <div className="game-viewport" ref={gameAreaRef}>

          {/* STRESS > 60% PANIC WARNING & CALM DOWN BUTTON */}
          {stats.stress > 60 && !isCalming && (
            <div className="panic-alert-bar">
              <span className="panic-alert-text">⚠️ CALM DOWN BEFORE YOUR SANITY GETS WORSE</span>
              <button className="panic-calm-btn" onClick={handleStartCalming}>
                CALM DOWN
              </button>
            </div>
          )}

          {/* CALMING STATE OVERLAY (TIMER PAUSED, SANITY NOT RESTORED) */}
          {isCalming && (
            <div className="calming-overlay-pixel">
              <div className="calming-card-pixel">
                <div className="calming-title">🧘 TAKING A BREATHER...</div>
                <p className="calming-desc">
                  Game timer paused. Catch your breath to regain control.<br/>
                  <span style={{ color: 'var(--pixel-orange)', fontSize: '0.72rem' }}>
                    (Note: Calming down lowers Stress, not Sanity)
                  </span>
                </p>
                <div className="calming-progress-outer">
                  <div
                    className="calming-progress-inner"
                    style={{ width: `${(calmProgress / CALM_BREATHS_REQUIRED) * 100}%` }}
                  />
                </div>
                <button className="calming-breathe-btn" onClick={handleCalmBreathClick}>
                  TAKE DEEP BREATH ({calmProgress}/{CALM_BREATHS_REQUIRED})
                </button>
              </div>
            </div>
          )}
          
          {/* STAGE 1: COFFEE CRISIS */}
          {currentPhase.id === 1 && (
            <div className="pixel-workspace">
              <div className="pixel-workspace-wallpaper" />

              {/* General 5-Second Room Timer Tag */}
              <div className="room-timer-tag">
                {isOnCoaster ? '☕ COASTER: READY' : `⏱️ ROOM TIMER: ${roomTimer}s`}
              </div>

              <div className="pixel-desk-container">
                <img src={deskImg} alt="Pixel Desk" className="pixel-desk-img" />
              </div>

              <div className="pixel-laptop-container">
                <img src={laptopImg} alt="Pixel Laptop" className="pixel-laptop-img" />
              </div>

              {/* Laptop Danger Zone (3-Second Timer) */}
              <div className={`spill-danger-zone ${coffeeTimer !== null ? 'active-warning' : ''}`}>
                <span className="spill-warning-tag">
                  {coffeeTimer !== null ? `⚠️ MOVE COFFEE! SPILL IN: ${coffeeTimer}s` : '⚠️ LAPTOP DANGER ZONE'}
                </span>
              </div>

              {/* Step 1 & 2: Safe Coaster Zone & Clickable [ SAFE ] Button */}
              <div className={`pixel-coaster-zone ${isOnCoaster ? 'coaster-active' : ''}`}>
                <span className="coaster-label">COASTER</span>
                <button 
                  className={`coaster-safe-btn ${isOnCoaster ? 'btn-active' : ''}`}
                  onClick={handleSafeButtonClick}
                  disabled={!isOnCoaster || isCalming}
                >
                  SAFE
                </button>
              </div>

              {spillPos.radius > 0 && (
                <div 
                  className="pixel-spill-puddle" 
                  style={{ 
                    left: spillPos.x, 
                    top: spillPos.y, 
                    width: spillPos.radius * 2, 
                    height: spillPos.radius * 2 
                  }} 
                />
              )}

              {/* Draggable Coffee Mug Container */}
              <div 
                className="pixel-coffee-mug-container" 
                style={{ left: mugPos.x, top: mugPos.y }}
                onPointerDown={handleMugPointerDown}
              >
                <img src={coffeeMugImg} alt="Pixel Coffee Mug" className="pixel-coffee-img" />
              </div>
            </div>
          )}

          {/* STAGE 2: INBOX APOCALYPSE */}
          {currentPhase.id === 2 && (
            <div className="pixel-monitor-wrapper">
              <img src={screenImg} alt="Pixel Monitor Frame" className="pixel-monitor-frame" />
              <div className="pixel-monitor-display">
                {emails.map(e => (
                  <div key={e.id} className={`inbox-card-pixel ${e.urgent ? '' : 'spam'}`} 
                       style={{ left: e.x, top: e.y }} onClick={() => handleEmailClick(e.id, e.urgent)}>
                    <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-pixel-heading)', color: e.urgent ? 'var(--pixel-orange)' : 'var(--pixel-purple)' }}>
                      {e.urgent ? '⚠️ ACTION NEEDED' : '👾 SPAM?'}
                    </span>
                    <h4 style={{ margin: '4px 0', fontSize: '0.7rem' }}>{e.urgent ? 'Build failing in prod!' : 'You won a free cruise!'}</h4>
                    <button style={{ background: e.urgent ? 'var(--pixel-orange)' : 'var(--pixel-purple)', color: '#000', border: '2px solid #000', padding: '3px 6px', fontFamily: 'var(--font-pixel-heading)', fontSize: '0.5rem', cursor: 'pointer', marginTop: 2 }}>
                      {e.urgent ? 'RESOLVE' : 'DELETE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: DESKTOP DISASTER */}
          {currentPhase.id === 3 && (
            <div className="pixel-monitor-wrapper">
              <img src={screenImg} alt="Pixel Monitor Frame" className="pixel-monitor-frame" />
              <div 
                className="pixel-monitor-display"
                ref={monitorDisplayRef}
              >
                <div className={`desktop-warning-banner ${irrelevantPopupsCount > 5 ? 'critical' : ''}`}>
                  {irrelevantPopupsCount === 5 && "⚠️ 1 MORE POPUP AND YOUR PRODUCTIVITY BONUS HAS LEFT THE CHAT 💀"}
                  {irrelevantPopupsCount > 5 && "⚠️ OVERLOAD! >5 POPUPS ON DESKTOP (-5 PTS PENALTY) 💀"}
                  {irrelevantPopupsCount < 5 && `🖥️ DESKTOP STATUS: ${irrelevantPopupsCount}/5 POPUPS`}
                </div>

                {popups.map(p => (
                  <div 
                    key={p.id} 
                    className="popup-window-pixel" 
                    style={{ left: p.x, top: p.y }}
                    onPointerDown={(e) => handlePopupPointerDown(p.id, e)}
                  >
                    <div 
                      className="popup-header-pixel" 
                      style={{ background: p.isPresentation ? 'var(--pixel-cyan)' : 'var(--pixel-red)' }}
                    >
                      <span>{p.isPresentation ? 'DECK.ppt' : 'System Error'}</span>
                      <button 
                        className="popup-close-btn-pixel" 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePopupClick(p.id, p.isPresentation);
                        }}
                      >
                        X
                      </button>
                    </div>
                    <div className="popup-body-pixel">
                      {p.isPresentation ? 'Q3 GROWTH DECK 📈' : '0xDEADBEEF: motivation.dll missing.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 4: SURVIVE THE MEETING */}
          {currentPhase.id === 4 && (
            <div className="pixel-meeting-room" tabIndex="0">
              <div className="meeting-wall">
                <img src={windowImg} alt="Office Windows Left" className="meeting-window-img" />
                <div className="meeting-whiteboard-group">
                  <div className="meeting-whiteboard" />
                  <img src={clockImg} alt="Office Wall Clock" className="wall-clock-img" />
                </div>
                <img src={windowImg} alt="Office Windows Right" className="meeting-window-img" />
              </div>

              <div className="meeting-floor" />
              <div className="pixel-conference-table" />

              {/* Player Woman Character */}
              <div 
                className="woman-character-pixel" 
                style={{ 
                  left: womanPos.x, 
                  top: womanPos.y,
                  opacity: isFrozen ? 0.6 : 1
                }}
              >
                <img src={womanImg} alt="Woman Player Character" className="woman-character-img" />
              </div>

              {/* Enemy Mob Character */}
              <div 
                className="mob-character-pixel" 
                style={{ left: mobPos.x, top: mobPos.y }}
              >
                <span className="mob-tag">👾 GOSSIP MOB</span>
                <img src={mobImg} alt="Mob Character Enemy" className="mob-character-img" />
              </div>

              {/* Random Gossip Speech Bubbles */}
              {gossips.map(g => (
                <div key={g.id} className="gossip-bubble-pixel" style={{ left: g.x, top: g.y }}>
                  💬 {g.text}
                </div>
              ))}

              <div className="controls-hint-bar">
                ⌨️ USE WASD OR ARROW KEYS TO OUTRUN THE MOB & AVOID GOSSIP!
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {gameState === 'GAME_OVER' && (
        <div className="overlay-pixel">
          <div
            style={{
              color: gameOverReason === 'SANITY_DEPLETED' ? 'var(--pixel-red)' : 'var(--pixel-green)',
              fontFamily: 'var(--font-pixel-heading)',
              fontSize: '0.75rem',
              marginBottom: 8
            }}
          >
            {gameOverReason === 'SANITY_DEPLETED' ? 'SANITY REACHED 0% — GAME OVER' : 'SHIFT COMPLETED'}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-pixel-heading)', color: 'var(--pixel-orange)', marginBottom: 20 }}>
            {gameOverReason === 'SANITY_DEPLETED' ? 'TOTAL OFFICE BURNOUT' : 'CORNER OFFICE CANDIDATE'}
          </h2>
          
          <div className="end-stats-grid-pixel">
            <div className="end-stat-box-pixel"><span>STRESS</span><strong>{Math.round(stats.stress)}%</strong></div>
            <div className="end-stat-box-pixel"><span>PRODUCTIVITY</span><strong>{Math.round(stats.productivity)}%</strong></div>
            <div className="end-stat-box-pixel"><span>SANITY</span><strong>{Math.round(stats.sanity)}%</strong></div>
            <div className="end-stat-box-pixel"><span>SCORE</span><strong>{stats.score}</strong></div>
          </div>

          <div className="manager-feedback-pixel">
            {getEndGameMessage(stats.score)}
          </div>

          <div className="end-actions-row">
            <button className="pixel-play-btn" onClick={startGame}>↻ REPLAY GAME</button>
            <button className="pixel-secondary-btn" onClick={goToHome}>🏠 GO TO HOME</button>
          </div>
        </div>
      )}
    </div>
  );
}