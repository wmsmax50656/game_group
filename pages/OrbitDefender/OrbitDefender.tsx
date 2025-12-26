import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const OrbitDefender: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const requestRef = useRef<number>();

  const CONFIG = {
    baseHealth: 100,
    bulletSpeed: 10,
    enemySpeed: 1.5,
    spawnRate: 60,
  };

  const stateRef = useRef({
    bullets: [] as any[],
    enemies: [] as any[],
    particles: [] as any[],
    baseHealth: 100,
    mouseX: 0,
    mouseY: 0,
    frameCount: 0,
    difficulty: 1,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        stateRef.current.mouseX = e.clientX - rect.left;
        stateRef.current.mouseY = e.clientY - rect.top;
      }
    };
    const handleMouseDown = () => {
      if (gameStarted && !gameOver) shoot();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameStarted, gameOver]);

  const initGame = () => {
    stateRef.current = {
      bullets: [],
      enemies: [],
      particles: [],
      baseHealth: 100,
      mouseX: 0,
      mouseY: 0,
      frameCount: 0,
      difficulty: 1,
    };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    cancelAnimationFrame(requestRef.current!);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const shoot = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const angle = Math.atan2(stateRef.current.mouseY - centerY, stateRef.current.mouseX - centerX);
    stateRef.current.bullets.push({
      x: centerX + Math.cos(angle) * 30,
      y: centerY + Math.sin(angle) * 30,
      vx: Math.cos(angle) * CONFIG.bulletSpeed,
      vy: Math.sin(angle) * CONFIG.bulletSpeed,
      life: 100
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      stateRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 30,
        color
      });
    }
  };

  const gameLoop = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = stateRef.current;

    state.frameCount++;
    if (state.frameCount % 500 === 0) state.difficulty += 0.2;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spawn Enemies
    if (state.frameCount % Math.max(20, Math.floor(CONFIG.spawnRate / state.difficulty)) === 0) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.max(canvas.width, canvas.height) / 1.5;
      state.enemies.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: -Math.cos(angle) * CONFIG.enemySpeed * state.difficulty,
        vy: -Math.sin(angle) * CONFIG.enemySpeed * state.difficulty,
        type: Math.random() > 0.8 ? 'fast' : 'normal',
        hp: Math.random() > 0.8 ? 2 : 1
      });
    }

    // Update Bullets
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0) state.bullets.splice(i, 1);
    }

    // Update Enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.x += e.vx;
      e.y += e.vy;

      const distToCenter = Math.sqrt((e.x - centerX) ** 2 + (e.y - centerY) ** 2);
      if (distToCenter < 40) {
        // Hit Base
        state.baseHealth -= 10;
        createExplosion(e.x, e.y, '#ef4444');
        state.enemies.splice(i, 1);
        if (state.baseHealth <= 0) {
          handleGameOver();
          return;
        }
        continue;
      }

      // Hit by Bullet
      let hit = false;
      for (let j = state.bullets.length - 1; j >= 0; j--) {
        const b = state.bullets[j];
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        if (dx * dx + dy * dy < 400) { // 20px radius approx
          state.bullets.splice(j, 1);
          e.hp--;
          createExplosion(e.x, e.y, '#fff');
          if (e.hp <= 0) {
            setScore(s => s + 100);
            createExplosion(e.x, e.y, '#f59e0b');
            state.enemies.splice(i, 1);
          }
          hit = true;
          break;
        }
      }
    }

    // Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    // Draw Base
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Base Health Ring
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2 * (state.baseHealth / 100));
    ctx.stroke();

    // Draw Turret
    const aimAngle = Math.atan2(state.mouseY - centerY, state.mouseX - centerX);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(aimAngle);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(0, -5, 40, 10);
    ctx.restore();

    // Draw Enemies
    state.enemies.forEach((e: any) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = e.type === 'fast' ? '#f472b6' : '#ef4444';
      ctx.fillStyle = e.type === 'fast' ? '#f472b6' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(e.x + 15 * Math.cos(Math.atan2(e.vy, e.vx)), e.y + 15 * Math.sin(Math.atan2(e.vy, e.vx)));
      ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Bullets
    ctx.fillStyle = '#fff';
    state.bullets.forEach((b: any) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Particles
    state.particles.forEach((p: any) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 30;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1;
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    cancelAnimationFrame(requestRef.current!);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="flex-grow w-full h-screen overflow-hidden bg-black relative cursor-crosshair">
      {/* HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="text-white text-2xl font-black tracking-widest drop-shadow-[0_0_10px_blue]">SCORE: {score}</div>
        <div className="text-red-400 font-mono">BASE INTEGRITY: {stateRef.current.baseHealth}%</div>
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <Link to="/" className="px-6 py-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-xs backdrop-blur-md">
          ABORT MISSION
        </Link>
      </div>

      <canvas ref={canvasRef} className="block" />

      {(!gameStarted && !gameOver) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto cursor-default">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-600 mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
            ORBIT DEFENDER
          </h1>
          <p className="text-blue-200 mb-10 text-xl tracking-widest">DEFEND THE CORE. THEY ARE COMING.</p>
          <button
            onClick={initGame}
            className="px-16 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all transform hover:scale-105"
          >
            ENGAGE
          </button>
          <p className="mt-8 text-gray-500 text-xs font-mono">MOUSE to AIM • CLICK to FIRE</p>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-md pointer-events-auto cursor-default">
          <h1 className="text-9xl font-black text-white mb-2 drop-shadow-xl">DEFEAT</h1>
          <p className="text-3xl text-red-400 mb-8 font-mono">CORE DESTROYED. SCORE: {score}</p>
          <button
            onClick={initGame}
            className="px-10 py-4 bg-white text-red-900 font-bold uppercase tracking-widest hover:bg-red-50"
          >
            REBOOT SYSTEM
          </button>
        </div>
      )}
    </div>
  );
};

export default OrbitDefender;