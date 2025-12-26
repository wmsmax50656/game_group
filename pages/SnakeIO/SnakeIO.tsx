import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const SnakeIO: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const requestRef = useRef<number>();

  // Config
  const CELL_SIZE = 20;
  const GRID_W = 40; // 800 / 20
  const GRID_H = 30; // 600 / 20

  // State
  const snakeRef = useRef<{ x: number, y: number }[]>([]);
  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const foodRef = useRef({ x: 10, y: 10 });
  const frameCountRef = useRef(0);
  const speedRef = useRef(8); // frames per move

  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) setHighScore(parseInt(saved));

    const handleKeyDown = (e: KeyboardEvent) => {
      if ([37, 38, 39, 40].includes(e.keyCode) || ['w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': if (directionRef.current.x === 0) nextDirectionRef.current = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': if (directionRef.current.x === 0) nextDirectionRef.current = { x: 1, y: 0 }; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    spawnFood();
    frameCountRef.current = 0;
    speedRef.current = 8;

    cancelAnimationFrame(requestRef.current!);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnFood = () => {
    let valid = false;
    while (!valid) {
      const x = Math.floor(Math.random() * GRID_W);
      const y = Math.floor(Math.random() * GRID_H);
      // Check collision with snake
      let collision = false;
      for (const seg of snakeRef.current) {
        if (seg.x === x && seg.y === y) { collision = true; break; }
      }
      if (!collision) {
        foodRef.current = { x, y };
        valid = true;
      }
    }
  };

  const gameLoop = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    frameCountRef.current++;
    if (frameCountRef.current % speedRef.current === 0) {
      update();
    }

    draw(ctx);

    if (!gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const update = () => {
    directionRef.current = nextDirectionRef.current;
    const head = snakeRef.current[0];
    const newHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };

    // Wall Collision
    if (newHead.x < 0 || newHead.x >= GRID_W || newHead.y < 0 || newHead.y >= GRID_H) {
      handleGameOver();
      return;
    }

    // Self Collision
    for (const seg of snakeRef.current) {
      if (newHead.x === seg.x && newHead.y === seg.y) {
        handleGameOver();
        return;
      }
    }

    snakeRef.current.unshift(newHead);

    // Eat Food
    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      setScore(prev => {
        const newScore = prev + 10;
        // Speed up every 50 points
        if (newScore % 50 === 0 && speedRef.current > 3) speedRef.current--;
        return newScore;
      });
      spawnFood();
    } else {
      snakeRef.current.pop();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Grid Lines
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= GRID_W; i++) { ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, ctx.canvas.height); }
    for (let i = 0; i <= GRID_H; i++) { ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(ctx.canvas.width, i * CELL_SIZE); }
    ctx.stroke();

    // Draw Snake
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#10b981' : '#059669'; // Emerald
      ctx.shadowBlur = i === 0 ? 15 : 0;
      ctx.shadowColor = '#10b981';
      ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      ctx.shadowBlur = 0;

      // Eyes
      if (i === 0) {
        ctx.fillStyle = 'white';
        // Simple logic to place eyes based on direction
        const d = directionRef.current;
        const cx = seg.x * CELL_SIZE + 10;
        const cy = seg.y * CELL_SIZE + 10;
        // .. skipping detailed eyes for simplicity, just a white dot center
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
      }
    });

    // Draw Food
    ctx.fillStyle = '#ef4444'; // Red
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    const fx = foodRef.current.x * CELL_SIZE + 10;
    const fy = foodRef.current.y * CELL_SIZE + 10;
    ctx.beginPath();
    ctx.arc(fx, fy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
    cancelAnimationFrame(requestRef.current!);
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 800;
      canvasRef.current.height = 600;
    }
  }, [CELL_SIZE, GRID_W, GRID_H]);

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[90vh] bg-black font-sans relative">
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="px-6 py-2 font-bold text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-white transition-all text-xs uppercase tracking-widest"
        >
          ← BACK
        </Link>
      </div>

      <div className="flex justify-between w-[800px] mb-4 uppercase font-mono font-bold tracking-widest bg-gray-900 border border-gray-700 p-2 rounded">
        <div className="text-gray-400">Score: <span className="text-white">{score}</span></div>
        <div className="text-emerald-500">High Score: {highScore}</div>
      </div>

      <div className="relative border-4 border-emerald-900 rounded-lg overflow-hidden shadow-2xl">
        <canvas ref={canvasRef} className="block bg-gray-900" />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600 mb-8 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              SNAKE.IO
            </h1>
            <button
              onClick={initGame}
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xl uppercase tracking-widest shadow-lg transition-transform hover:scale-105"
            >
              START GAME
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm text-white">
            <h2 className="text-6xl font-black mb-4">GAME OVER</h2>
            <p className="text-2xl mb-8">SCORE: {score}</p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-white text-red-900 font-bold uppercase tracking-widest hover:bg-gray-200"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 font-mono">USE ARROW KEYS or WASD TO CONTROL</div>
    </div>
  );
};

export default SnakeIO;