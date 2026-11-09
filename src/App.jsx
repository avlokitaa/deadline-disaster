import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause } from 'lucide-react';

// Imported pixel asset images
import coffeeMugImg from './assets/coffee.png';
import laptopImg from './assets/laptop.png';
import deskImg from './assets/desk.png';
import screenImg from './assets/screen.png';
import womanImg from './assets/woman.png';
import mobImg from './assets/mob.png';

const INITIAL_STATS = { stress: 20, productivity: 20, sanity: 100, score: 0 };
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
  
  // Stage 1 State
  const [mugPos, setMugPos] = useState({ x: 450, y: 220 });
  const [spillPos, setSpillPos] = useState({ x: 400, y: 220, radius: 0 });
  const [coffeeTimer, setCoffeeTimer] = useState(null);

  // Stage 2 & 3 State
  const [emails, setEmails] = useState([]);
  const [popups, setPopups] = useState([]);

  // Stage 4 State: Player Woman, Enemy Mob, and Gossip Hazards
  const [womanPos, setWomanPos] = useState({ x: 180, y: 280 });
  const [mobPos, setMobPos] = useState({ x: 620, y: 280 });
  const [mobVel, setMobVel] = useState({ dx: 3.5, dy: 2.5 });
  const [gossips, setGossips] = useState([]);

  // Active Key Tracker for Smooth Multidirectional Movement
  const keysPressed = useRef({});

  // Active Phase calculation
  const currentPhase = PHASES.find(p => timeLeft > p.endAt) || PHASES[3];

  const updateStats = (delta) => {
    setStats(prev => ({
      stress: Math.max(0, Math.min(100, prev.stress + (delta.stress || 0))),
      productivity: Math.max(0, Math.min(100, prev.productivity + (delta.productivity || 0))),
      sanity: Math.max(0, Math.min(100, prev.sanity + (delta.sanity || 0))),
      score: prev.score + (delta.score || 0)
    }));
  };

  // Main 60s Workday Timer
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
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Stage 1: Coffee Danger Zone & 5s Timer
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

      if (distToLaptop < 150) {
        if (coffeeTimer === null) setCoffeeTimer(5);
      } else {
        if (coffeeTimer !== null) setCoffeeTimer(null);
      }
    }
  }, [gameState, currentPhase, mugPos, coffeeTimer]);

  useEffect(() => {
    if (coffeeTimer === null || gameState !== 'PLAYING' || currentPhase.id !== 1) return;

    if (coffeeTimer === 0) {
      updateStats({ stress: 15, sanity: -10 });
      setSpillPos({ x: mugPos.x, y: mugPos.y, radius: 45 });
      setCoffeeTimer(null);
      return;
    }

    const countdown = setInterval(() => {
      setCoffeeTimer(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(countdown);
  }, [coffeeTimer, gameState, currentPhase, mugPos]);

  // Stages 2 & 3 Spawners
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
        if (Math.random() > 0.94 && popups.length < 4) {
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

  // Stage 4: Game Loop (Player WASD Movement, Mob Patrol, Gossip Spawner & Collision Checks)
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentPhase.id !== 4) return;

    const moveSpeed = 5;

    const frameLoop = setInterval(() => {
      // 1. Update Player (Woman) Position via WASD / Arrows
      setWomanPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) newY -= moveSpeed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) newY += moveSpeed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) newX -= moveSpeed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) newX += moveSpeed;

        // Boundary Clamping (Keep inside meeting room)
        const clampedX = Math.max(40, Math.min(840, newX));
        const clampedY = Math.max(160, Math.min(420, newY));

        return { x: clampedX, y: clampedY };
      });

      // 2. Autonomous Mob Movement & Bounce AI
      setMobPos(prev => {
        let newX = prev.x + mobVel.dx;
        let newY = prev.y + mobVel.dy;

        let nextDx = mobVel.dx;
        let nextDy = mobVel.dy;

        if (newX <= 50 || newX >= 820) nextDx = -nextDx;
        if (newY <= 160 || newY >= 420) nextDy = -nextDy;

        if (nextDx !== mobVel.dx || nextDy !== mobVel.dy) {
          setMobVel({ dx: nextDx, dy: nextDy });
        }

        return { x: Math.max(50, Math.min(820, newX)), y: Math.max(160, Math.min(420, newY)) };
      });

      // 3. Spawn Random Gossip Bubbles
      if (Math.random() > 0.94 && gossips.length < 4) {
        setGossips(prev => [...prev, {
          id: Date.now(),
          text: GOSSIP_TEXTS[Math.floor(Math.random() * GOSSIP_TEXTS.length)],
          x: 100 + Math.random() * 680,
          y: 170 + Math.random() * 220
        }]);
      }

      // 4. Collision Detection: Woman vs Mob
      const distToMob = Math.hypot(womanPos.x - mobPos.x, womanPos.y - mobPos.y);
      if (distToMob < 45) {
        updateStats({ stress: 1.2, sanity: -0.8 });
      }

      // 5. Collision Detection: Woman vs Gossip Bubbles
      setGossips(prev => {
        return prev.filter(g => {
          const distToGossip = Math.hypot(womanPos.x - g.x, womanPos.y - g.y);
          if (distToGossip < 40) {
            updateStats({ stress: 4, sanity: -3 });
            return false; // Remove bubble on touch
          }
          return true;
        });
      });

    }, 30);

    return () => clearInterval(frameLoop);
  }, [gameState, currentPhase, womanPos, mobPos, mobVel, gossips]);

  // Pointer Movement for Stage 1 Coffee Mug
  const handlePointerMove = (e) => {
    if (gameState !== 'PLAYING' || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentPhase.id === 1) {
      setMugPos({ x, y });
      
      const coasterX = rect.width - 175;
      const coasterY = 225;
      const distToCoaster = Math.hypot(x - coasterX, y - coasterY);

      if (distToCoaster < 50) {
        updateStats({ score: 50, productivity: 8, stress: -5 });
        setSpillPos({ x: coasterX, y: coasterY, radius: 15 });
      }
    }
  };

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
    setMugPos({ x: 450, y: 220 });
    setCoffeeTimer(null);
    setEmails([]);
    setPopups([]);
    setWomanPos({ x: 180, y: 280 });
    setMobPos({ x: 620, y: 280 });
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
            USE WASD / ARROW KEYS TO SURVIVE THE MEETING.
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
        <div className="game-viewport" ref={gameAreaRef} onPointerMove={handlePointerMove}>
          
          {/* STAGE 1: COFFEE CRISIS */}
          {currentPhase.id === 1 && (
            <div className="pixel-workspace">
              <div className="pixel-workspace-wallpaper" />

              <div className="pixel-desk-container">
                <img src={deskImg} alt="Pixel Desk" className="pixel-desk-img" />
              </div>

              <div className="pixel-laptop-container">
                <img src={laptopImg} alt="Pixel Laptop" className="pixel-laptop-img" />
              </div>

              <div className={`spill-danger-zone ${coffeeTimer !== null ? 'active-warning' : ''}`}>
                <span className="spill-warning-tag">
                  {coffeeTimer !== null ? `⚠️ MOVE COFFEE! SPILL IN: ${coffeeTimer}s` : '⚠️ LAPTOP DANGER ZONE'}
                </span>
              </div>

              <div className="pixel-coaster-zone">SAFE</div>

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

              <div 
                className="pixel-coffee-mug-container" 
                style={{ left: mugPos.x, top: mugPos.y }}
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
              <div className="pixel-monitor-display">
                {popups.map(p => (
                  <div key={p.id} className="popup-window-pixel" style={{ left: p.x, top: p.y }}>
                    <div className="popup-header-pixel" style={{ background: p.isPresentation ? 'var(--pixel-cyan)' : 'var(--pixel-red)' }}>
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

          {/* STAGE 4: SURVIVE THE MEETING (PIXEL-ART MEETING ROOM & CHARACTERS) */}
          {currentPhase.id === 4 && (
            <div className="pixel-meeting-room" tabIndex="0">
              {/* Meeting Room Wall, Windows & Whiteboard */}
              <div className="meeting-wall">
                <div className="meeting-window" />
                <div className="meeting-whiteboard" />
                <div className="wall-clock">3:00</div>
                <div className="meeting-window" />
              </div>

              {/* Tiled Floor */}
              <div className="meeting-floor" />

              {/* Conference Table */}
              <div className="pixel-conference-table" />

              {/* Player Woman Character */}
              <div 
                className="woman-character-pixel" 
                style={{ left: womanPos.x, top: womanPos.y }}
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

              {/* Movement Controls Hint */}
              <div className="controls-hint-bar">
                ⌨️ USE WASD OR ARROW KEYS TO MOVE WOMAN AWAY FROM MOB & GOSSIP!
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