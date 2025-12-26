import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Duel1v1: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const requestRef = useRef<number>();

  const CONFIG = {
    moveSpeed: 5,
    bulletSpeed: 10,
    fireRate: 20, // frames
    maxHealth: 100,
  };

  const stateRef = useRef({
    p1: { x: 100, y: 300, color: '#3b82f6', health: 100, cooldown: 0, angle: 0 },
    p2: { x: 700, y: 300, color: '#ef4444', health: 100, cooldown: 0, angle: Math.PI },
    bullets: [] as any[],
    particles: [] as any[],
    keys: {} as { [key: string]: boolean },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { stateRef.current.keys[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { stateRef.current.keys[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    stateRef.current.p1 = { x: 100, y: canvas.height / 2, color: '#3b82f6', health: 100, cooldown: 0, angle: 0 };
    stateRef.current.p2 = { x: canvas.width - 100, y: canvas.height / 2, color: '#ef4444', health: 100, cooldown: 0, angle: Math.PI };
    stateRef.current.bullets = [];
    stateRef.current.particles = [];

    setWinner(null);
    setGameStarted(true);

    cancelAnimationFrame(requestRef.current!);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      stateRef.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 20,
        color
      });
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { p1, p2, bullets, particles, keys } = stateRef.current;

    // Clear
    ctx.fillStyle = 'rgba(10, 10, 10, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Controls P1
    if (keys['KeyW']) p1.y -= CONFIG.moveSpeed;
    if (keys['KeyS']) p1.y += CONFIG.moveSpeed;
    if (keys['KeyA']) p1.x -= CONFIG.moveSpeed;
    if (keys['KeyD']) p1.x += CONFIG.moveSpeed;

    // Controls P2
    if (keys['ArrowUp']) p2.y -= CONFIG.moveSpeed;
    if (keys['ArrowDown']) p2.y += CONFIG.moveSpeed;
    if (keys['ArrowLeft']) p2.x -= CONFIG.moveSpeed;
    if (keys['ArrowRight']) p2.x += CONFIG.moveSpeed;

    // Clamp positions
    const clamp = (obj: any) => {
      obj.x = Math.max(20, Math.min(canvas.width - 20, obj.x));
      obj.y = Math.max(20, Math.min(canvas.height - 20, obj.y));
    };
    clamp(p1);
    clamp(p2);

    // Shooting
    if (p1.cooldown > 0) p1.cooldown--;
    if (keys['Space'] && p1.cooldown <= 0) {
      // Shoot towards P2
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      bullets.push({ x: p1.x, y: p1.y, vx: Math.cos(angle) * CONFIG.bulletSpeed, vy: Math.sin(angle) * CONFIG.bulletSpeed, owner: 1, color: p1.color });
      p1.cooldown = CONFIG.fireRate;
    }

    if (p2.cooldown > 0) p2.cooldown--;
    if (keys['Enter'] && p2.cooldown <= 0) {
      // Shoot towards P1
      const angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
      bullets.push({ x: p2.x, y: p2.y, vx: Math.cos(angle) * CONFIG.bulletSpeed, vy: Math.sin(angle) * CONFIG.bulletSpeed, owner: 2, color: p2.color });
      p2.cooldown = CONFIG.fireRate;
    }

    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      let hit = false;
      // Check collision with P1
      if (b.owner === 2) {
        const dx = b.x - p1.x;
        const dy = b.y - p1.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          p1.health -= 10;
          createExplosion(p1.x, p1.y, p1.color);
          hit = true;
        }
      }
      // Check collision with P2
      if (b.owner === 1) {
        const dx = b.x - p2.x;
        const dy = b.y - p2.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          p2.health -= 10;
          createExplosion(p2.x, p2.y, p2.color);
          hit = true;
        }
      }

      if (hit || b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Draw Players
    const drawPlayer = (p: any) => {
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Health Bar
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#333';
      ctx.fillRect(p.x - 20, p.y - 30, 40, 5);
      ctx.fillStyle = p.health > 30 ? '#22c55e' : '#ef4444';
      ctx.fillRect(p.x - 20, p.y - 30, 40 * (p.health / 100), 5);
    };

    drawPlayer(p1);
    drawPlayer(p2);

    // Draw Bullets
    bullets.forEach(b => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = b.color;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1;
    });

    if (p1.health <= 0) {
      setWinner(2);
      setGameStarted(false);
      return;
    }
    if (p2.health <= 0) {
      setWinner(1);
      setGameStarted(false);
      return;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 800;
      canvasRef.current.height = 600;
    }
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[90vh] bg-black font-sans relative">
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="px-6 py-2 font-bold text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-white transition-all text-xs uppercase tracking-widest"
        >
          ← EXIT ARENA
        </Link>
      </div>

      <div className="relative border-4 border-gray-800 rounded-lg overflow-hidden bg-gray-900 shadow-2xl">
        <canvas ref={canvasRef} width={800} height={600} className="block cursor-none" />

        {!gameStarted && !winner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
            <h1 className="text-6xl font-black italic tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-red-500">
              NEON DUEL
            </h1>
            <div className="flex gap-12 mb-12">
              <div className="text-center">
                <h2 className="text-blue-400 font-bold text-xl mb-2">PLAYER 1</h2>
                <p className="text-gray-400 font-mono text-sm">WASD + SPACE</p>
              </div>
              <div className="text-center">
                <h2 className="text-red-400 font-bold text-xl mb-2">PLAYER 2</h2>
                <p className="text-gray-400 font-mono text-sm">ARROWS + ENTER</p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-12 py-4 bg-white text-black font-black text-2xl uppercase tracking-widest hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
              FIGHT
            </button>
          </div>
        )}

        {winner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-white">
            <h1 className={`text-7xl font-black mb-4 ${winner === 1 ? 'text-blue-500' : 'text-red-500'}`}>
              PLAYER {winner} WINS
            </h1>
            <button
              onClick={startGame}
              className="mt-8 px-8 py-3 border-2 border-white hover:bg-white hover:text-black transition-all font-bold tracking-widest uppercase"
            >
              REMATCH
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Duel1v1;