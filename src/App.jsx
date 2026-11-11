import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause } from 'lucide-react';

// Imported pixel asset images
import coffeeMugImg from './assets/coffee.png';
import laptopImg from './assets/laptop.png';
import deskImg from './assets/desk.png';
import screenImg from './assets/screen.png';
import womanImg from './assets/woman.png';
import mobImg from './assets/mob.png';

// Gameplay Constants & Fixed Starting Positions
const INITIAL_STATS = { stress: 0, productivity: 100, sanity: 100, score: 0 };
const FIXED_START_MUG_POS = { x: 150, y: 340 };
const INITIAL_WOMAN_POS = { x: 180, y: 280 };

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

export default function App() {
  const [gameState, setGameState] = useState('TITLE'); // TITLE, PLAYING, GAME_OVER
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [muted, setMuted] = useState(false);
  
  // Game Viewport Ref
  const gameAreaRef = useRef(null);
  
  // Stage 1 State: Coffee Mug Drag State, Laptop Danger Timer (3s), Room Timer (5s), and Safe Coaster State
  const [mugPos, setMugPos] = useState(FIXED_START_MUG_POS);
  const isDraggingMug = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [spillPos, setSpillPos] = useState({ x: 400, y: 220, radius: 0 });
  const [coffeeTimer, setCoffeeTimer] = useState(null); // 3-second laptop danger timer
  const [roomTimer, setRoomTimer] = useState(5);       // 5-second general room timer
  const [isOnCoaster, setIsOnCoaster] = useState(false);

  // Guard ref to prevent duplicate rewards within a single round
  const coffeeRoundRewarded = useRef(false);

  // Stage 2 & 3 State
  const [emails, setEmails] = useState([]);
  const [popups, setPopups] = useState([]);
  const activeDragRef = useRef(null);
  const prevIrrelevantCountRef = useRef(0);

  // Stage 4 State: Player Woman, Enemy Mob, Freeze state, and Gossip Hazards
  const [womanPos, setWomanPos] = useState(INITIAL_WOMAN_POS);
  const [mobPos, setMobPos] = useState({ x: 650, y: 280 });
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

  // Resets coffee round state and prepares for next interaction
  const resetCoffeeRound = () => {
    isDraggingMug.current = false;
    setCoffeeTimer(null);
    setRoomTimer(5);
    setIsOnCoaster(false);
    setMugPos(FIXED_START_MUG_POS); // Returns to fixed starting position
    setTimeout(() => {
      coffeeRoundRewarded.current = false;
    }, 100);
  };

  // Explicit Step 2: Triggered ONLY when player clicks the active [ SAFE ] button
  const handleSafeButtonClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOnCoaster && !coffeeRoundRewarded.current) {
      coffeeRoundRewarded.current = true;
      updateStats({ score: 100 }); // Award +100 points exactly once upon clicking SAFE
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
    if (gameState !== 'PLAYING' || currentPhase.id !== 1) return;
    e.stopPropagation();
    e.preventDefault();

    isDraggingMug.current = true;

    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      // Retain precise offset so mug doesn't snap center to pointer
      dragOffset.current = {
        x: pointerX - mugPos.x,
        y: pointerY - mugPos.y
      };
    }
  };

  // Window Pointer Listeners for Smooth Dragging & Mouse Release
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      if (!isDraggingMug.current || !gameAreaRef.current) return;

      const rect = gameAreaRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const newX = pointerX - dragOffset.current.x;
      const newY = pointerY - dragOffset.current.y;

      // Clamp inside game viewport
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

  // Main 60s Workday Timer & Passive Stat Degradation
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
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
  }, [gameState]);

  // Stage 1: Coaster & Laptop Danger Zone Detection
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 1) {
      if (coffeeTimer !== null) setCoffeeTimer(null);
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

      // Check if mug is placed on coaster
      if (distToCoaster < 55) {
        if (!isOnCoaster) setIsOnCoaster(true);
        if (coffeeTimer !== null) setCoffeeTimer(null); // Clear danger timer while on coaster
      } else {
        if (isOnCoaster) setIsOnCoaster(false);
        
        // Check Laptop Danger Zone (3-second timer)
        if (distToLaptop < 150) {
          if (coffeeTimer === null) {
            setCoffeeTimer(3);
          }
        } else {
          if (coffeeTimer !== null) {
            setCoffeeTimer(null);
          }
        }
      }
    }
  }, [gameState, currentPhase, mugPos, coffeeTimer, isOnCoaster]);

  // Stage 1: 3-Second Laptop Danger Countdown Ticker
  useEffect(() => {
    if (coffeeTimer === null || gameState !== 'PLAYING' || currentPhase.id !== 1) return;

    if (coffeeTimer === 0) {
      triggerCoffeeSpill(mugPos.x, mugPos.y);
      return;
    }

    const countdown = setInterval(() => {
      setCoffeeTimer(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(countdown);
  }, [coffeeTimer, gameState, currentPhase, mugPos]);

  // Stage 1: 5-Second General Room Timer Ticker (Pauses when coffee is on safe coaster)
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 1 || isOnCoaster) return;

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
  }, [gameState, currentPhase, isOnCoaster, mugPos]);

  // Stage 2 & 3: Email & Popup Spawners
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

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
  }, [gameState, currentPhase, emails.length, popups.length]);

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
    e.stopPropagation();
    const popupEl = e.currentTarget.closest('.popup-window-pixel');
    if (!popupEl) return;
    const rect = popupEl.getBoundingClientRect();
    activeDragRef.current = {
      id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
  };

  const handleMonitorDisplayPointerMove = (e) => {
    if (!activeDragRef.current) return;
    const displayEl = e.currentTarget;
    const displayRect = displayEl.getBoundingClientRect();
    
    let newX = e.clientX - displayRect.left - activeDragRef.current.offsetX;
    let newY = e.clientY - displayRect.top - activeDragRef.current.offsetY;

    newX = Math.max(0, Math.min(470, newX));
    newY = Math.max(0, Math.min(250, newY));

    setPopups(prev => prev.map(p => p.id === activeDragRef.current.id ? { ...p, x: newX, y: newY } : p));
  };

  const handleMonitorDisplayPointerUp = () => {
    activeDragRef.current = null;
  };

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

  // Stage 4 Loop: Player Movement, Mob Chasing AI, Gossip Spawner & Collision Handling
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 4) return;

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
      }

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
  }, [gameState, currentPhase, womanPos, mobPos, gossips]);

  const handleEmailClick = (id, urgent) => {
    updateStats(urgent ? { productivity: 5, score: 30 } : { sanity: -5, stress: 5 });
    setEmails(prev => prev.filter(e => e.id !== id));
  };

  const handlePopupClick = (id, isPresentation) => {
    if (isPresentation) updateStats({ sanity: -20, score: -100 });
    else updateStats({ stress: -5, score: 20 });
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  const startGame = () => {
    setStats(INITIAL_STATS);
    setTimeLeft(60);
    setMugPos(FIXED_START_MUG_POS);
    isDraggingMug.current = false;
    setCoffeeTimer(null);
    setRoomTimer(5);
    setIsOnCoaster(false);
    coffeeRoundRewarded.current = false;
    setEmails([]);
    setPopups([]);
    activeDragRef.current = null;
    prevIrrelevantCountRef.current = 0;
    setWomanPos(INITIAL_WOMAN_POS);
    setMobPos({ x: 650, y: 280 });
    setIsFrozen(false);
    isFrozenRef.current = false;
    setGossips([]);
    setGameState('PLAYING');
  };

  return (
    <div className="game-container">
      {/* TITLE OVERLAY */}
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

          <button className="pixel-play-btn" onClick={startGame}>▶ PLAY GAME</button>
          
          <div className="grid-cards-pixel">
            {['01: COFFEE CRISIS', '02: INBOX DISASTER', '03: POPUP CHAOS', '04: SURVIVE MEETING'].map((title, i) => (
              <div key={i} className="intro-card-pixel">
                <div style={{ color: 'var(--pixel-orange)', fontSize: '0.6rem', fontFamily: 'var(--font-pixel-heading)', marginBottom: 4 }}>STAGE 0{i+1}</div>
                <h4 style={{ fontSize: '0.75rem', color: '#fff' }}>{title}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP HUD */}
      {(gameState === 'PLAYING' || gameState === 'GAME_OVER') && (
        <div className="top-hud">
          <div className="hud-title">
            DEADLINE <span>DISASTER</span>
            <div className="phase-badge">STAGE {currentPhase.id}/4: {currentPhase.name}</div>
          </div>
          
          <div className="timer-box-pixel">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>

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
                  disabled={!isOnCoaster}
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
                onPointerMove={handleMonitorDisplayPointerMove}
                onPointerUp={handleMonitorDisplayPointerUp}
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
                  >
                    <div 
                      className="popup-header-pixel" 
                      style={{ background: p.isPresentation ? 'var(--pixel-cyan)' : 'var(--pixel-red)' }}
                      onPointerDown={(e) => handlePopupPointerDown(p.id, e)}
                    >
                      <span>{p.isPresentation ? 'DECK.ppt' : 'System Error'}</span>
                      <button className="popup-close-btn-pixel" onClick={() => handlePopupClick(p.id, p.isPresentation)}>X</button>
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
                <div className="meeting-window" />
                <div className="meeting-whiteboard" />
                <div className="wall-clock">3:00</div>
                <div className="meeting-window" />
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
          <div style={{ color: 'var(--pixel-green)', fontFamily: 'var(--font-pixel-heading)', fontSize: '0.75rem', marginBottom: 8 }}>SHIFT COMPLETED</div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-pixel-heading)', color: 'var(--pixel-orange)', marginBottom: 20 }}>CORNER OFFICE CANDIDATE</h2>
          
          <div className="end-stats-grid-pixel">
            <div className="end-stat-box-pixel"><span>STRESS</span><strong>{Math.round(stats.stress)}%</strong></div>
            <div className="end-stat-box-pixel"><span>PRODUCTIVITY</span><strong>{Math.round(stats.productivity)}%</strong></div>
            <div className="end-stat-box-pixel"><span>SANITY</span><strong>{Math.round(stats.sanity)}%</strong></div>
            <div className="end-stat-box-pixel"><span>SCORE</span><strong>{stats.score}</strong></div>
          </div>

          <div className="manager-feedback-pixel">
            "Solid run! Your manager nodded at you in the hallway. That is basically a promotion."
          </div>

          <button className="pixel-play-btn" style={{ margin: 0 }} onClick={startGame}>↻ REPLAY GAME</button>
        </div>
      )}
    </div>
  );
}