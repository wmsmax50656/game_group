import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Hantang: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const requestRef = useRef<number>();
  const scoreRef = useRef(0);

  // Game configuration
  const CONFIG = {
    playerSpeed: 7,
    baseSpawnRate: 60, // frames
    obstacleSpeed: 4,
    coinSpeed: 3,
  };

  // Game state refs (mutable for loop)
  const playerRef = useRef({ x: 0, y: 0, width: 30, height: 30 });
  const obstaclesRef = useRef<any[]>([]);
  const coinsRef = useRef<any[]>([]);
  const particlesRef = useRef<any[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const frameCountRef = useRef(0);
  const difficultyRef = useRef(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const initGame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Set initial player position
    playerRef.current = {
      x: canvas.width / 2 - 15,
      y: canvas.height - 100,
      width: 30,
      height: 30
    };
    
    obstaclesRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    frameCountRef.current = 0;
    difficultyRef.current = 1;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    
    cancelAnimationFrame(requestRef.current!);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const createParticle = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
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

    // Clear screen with trail effect
    ctx.fillStyle = 'rgba(17, 24, 39, 0.4)'; // Dark blue-gray with transparency for trails
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frameCountRef.current++;
    
    // Increase difficulty every 500 frames
    if (frameCountRef.current % 500 === 0) {
        difficultyRef.current += 0.2;
    }

    // --- Update Player ---
    if (keysRef.current['ArrowLeft']) playerRef.current.x -= CONFIG.playerSpeed;
    if (keysRef.current['ArrowRight']) playerRef.current.x += CONFIG.playerSpeed;
    
    // Clamp player to screen
    if (playerRef.current.x < 0) playerRef.current.x = 0;
    if (playerRef.current.x > canvas.width - playerRef.current.width) playerRef.current.x = canvas.width - playerRef.current.width;

    // --- Spawning ---
    const spawnRate = Math.max(20, Math.floor(CONFIG.baseSpawnRate / difficultyRef.current));
    if (frameCountRef.current % spawnRate === 0) {
        // Spawn Obstacle
        obstaclesRef.current.push({
            x: Math.random() * (canvas.width - 30),
            y: -50,
            width: 30,
            height: 30,
            speed: CONFIG.obstacleSpeed * difficultyRef.current
        });
    }
    if (frameCountRef.current % (spawnRate * 3) === 0) {
        // Spawn Coin
        coinsRef.current.push({
            x: Math.random() * (canvas.width - 20),
            y: -50,
            radius: 10,
            speed: CONFIG.coinSpeed * difficultyRef.current
        });
    }

    // --- Update Entities ---
    obstaclesRef.current.forEach((obs, index) => {
        obs.y += obs.speed;
        // Collision with player
        if (
            playerRef.current.x < obs.x + obs.width &&
            playerRef.current.x + playerRef.current.width > obs.x &&
            playerRef.current.y < obs.y + obs.height &&
            playerRef.current.height + playerRef.current.y > obs.y
        ) {
            handleGameOver();
        }
    });

    coinsRef.current.forEach((coin, index) => {
        coin.y += coin.speed;
        // Collision with player (Circle vs Rect approx)
        const dx = (playerRef.current.x + playerRef.current.width/2) - coin.x;
        const dy = (playerRef.current.y + playerRef.current.height/2) - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < coin.radius + playerRef.current.width/2) {
             // Collect coin
             createParticle(coin.x, coin.y, '#fbbf24');
             scoreRef.current += 100;
             setScore(scoreRef.current);
             coinsRef.current.splice(index, 1);
        }
    });

    particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if(p.life <= 0) particlesRef.current.splice(i, 1);
    });

    // Cleanup off-screen
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.y < canvas.height);
    coinsRef.current = coinsRef.current.filter(coin => coin.y < canvas.height);

    // --- Draw ---
    
    // Draw Player
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(playerRef.current.x + 15, playerRef.current.y); // Top
    ctx.lineTo(playerRef.current.x + 30, playerRef.current.y + 30); // Right
    ctx.lineTo(playerRef.current.x + 15, playerRef.current.y + 20); // Bottom notch
    ctx.lineTo(playerRef.current.x, playerRef.current.y + 30); // Left
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;
    });

    // Draw Coins
    coinsRef.current.forEach(coin => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;
    });
    
    if (!gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    cancelAnimationFrame(requestRef.current!);
  };

  useEffect(() => {
    if (canvasRef.current) {
        // Handle resizing if needed
        canvasRef.current.width = Math.min(window.innerWidth - 32, 600);
        canvasRef.current.height = window.innerHeight * 0.7;
    }
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[90vh] bg-gray-900 font-sans relative overflow-hidden">
      
      {/* HUD */}
      <div className="absolute top-4 left-4 z-20">
        <Link 
          to="/" 
          className="px-6 py-2 font-bold text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-white transition-all text-xs uppercase tracking-widest"
        >
          ← BACK
        </Link>
      </div>
      
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
          <div className="text-sm text-gray-400 uppercase tracking-wider">SCORE</div>
          <div className="text-4xl font-black text-cyan-400 font-mono">{score.toString().padStart(6, '0')}</div>
      </div>

      <div className="relative z-10 border-4 border-gray-700 rounded-lg shadow-2xl bg-gray-800 overflow-hidden">
        <canvas 
            ref={canvasRef} 
            className="block bg-gray-900 cursor-crosshair"
            width={600}
            height={600}
        />
        
        {/* Overlays */}
        {(!gameStarted && !gameOver) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white backdrop-blur-sm">
                <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter filter drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                    HANTANG FORCES
                </h1>
                <p className="mb-8 text-gray-300">AVOID RED BLOCKS. COLLECT GOLD. SURVIVE.</p>
                <button 
                    onClick={initGame}
                    className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all transform hover:scale-105"
                >
                    START MISSION
                </button>
            </div>
        )}

        {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white backdrop-blur-sm">
                <h1 className="text-6xl font-black mb-2 text-red-500 tracking-tighter drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                    KIA
                </h1>
                <p className="text-xl mb-6">MISSION FAILED</p>
                <div className="text-3xl font-mono mb-8">FINAL SCORE: {score}</div>
                <button 
                    onClick={initGame}
                    className="px-8 py-3 bg-white text-red-900 font-bold rounded text-lg uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg"
                >
                    RETRY
                </button>
            </div>
        )}
      </div>

      <div className="mt-6 text-gray-500 text-xs text-center max-w-md">
          <p>CONTROLS: ARROW KEYS or TOUCH (LEFT/RIGHT)</p>
      </div>

    </div>
  );
};

export default Hantang;