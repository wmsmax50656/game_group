import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

// --- CONSTANTS ---
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TICK_RATE_MS = 800;

// --- TYPES ---
type CellValue = string | number;
type BoardGrid = CellValue[][];
type TetrominoMatrix = CellValue[][];

interface TetrominoData {
  shape: TetrominoMatrix;
  color: string;
}

interface ActivePiece {
  position: { x: number; y: number };
  shape: TetrominoMatrix;
  color: string;
}

enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

// --- DATA ---
const TETROMINOS: Record<string, TetrominoData> = {
  I: { shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0]], color: 'cyan' },
  J: { shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]], color: 'blue' },
  L: { shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']], color: 'orange' },
  O: { shape: [['O', 'O'], ['O', 'O']], color: 'yellow' },
  S: { shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]], color: 'green' },
  T: { shape: [[0, 'T', 0], ['T', 'T', 'T'], [0, 0, 0]], color: 'purple' },
  Z: { shape: [['Z', 'Z', 0], [0, 'Z', 'Z'], [0, 0, 0]], color: 'red' },
};

const RANDOM_TETROMINO = (): TetrominoData => {
  const keys = Object.keys(TETROMINOS);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOS[randKey];
};

// --- AUDIO MOCK ---
const audioService = {
  playMove: () => {},
  playDrop: () => {},
  playRotate: () => {},
  playClear: () => {},
  playGameOver: () => {},
};

// --- HELPERS ---
const createEmptyBoard = (): BoardGrid =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const checkCollision = (
  board: BoardGrid,
  piece: ActivePiece,
  moveX: number = 0,
  moveY: number = 0,
  newShape?: TetrominoMatrix
): boolean => {
  const shape = newShape || piece.shape;
  const { x, y } = piece.position;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const proposedX = x + col + moveX;
        const proposedY = y + row + moveY;

        if (
          proposedX < 0 ||
          proposedX >= BOARD_WIDTH ||
          proposedY >= BOARD_HEIGHT
        ) {
          return true;
        }

        if (proposedY >= 0) {
          // [Safe Check] Use optional chaining to prevent crash/type error
          if (board[proposedY] && board[proposedY][proposedX] !== 0) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

// --- SUB COMPONENTS ---
const Cell: React.FC<{ type: CellValue }> = ({ type }) => {
  const getColor = (t: CellValue) => {
    switch (t) {
      case 'I': return 'bg-cyan-400 shadow-[0_0_10px_cyan] border-cyan-200';
      case 'J': return 'bg-blue-500 shadow-[0_0_10px_blue] border-blue-300';
      case 'L': return 'bg-orange-500 shadow-[0_0_10px_orange] border-orange-300';
      case 'O': return 'bg-yellow-400 shadow-[0_0_10px_yellow] border-yellow-200';
      case 'S': return 'bg-green-500 shadow-[0_0_10px_green] border-green-300';
      case 'T': return 'bg-purple-500 shadow-[0_0_10px_purple] border-purple-300';
      case 'Z': return 'bg-red-500 shadow-[0_0_10px_red] border-red-300';
      default: return 'bg-slate-900/50 border-slate-800';
    }
  };
  return (
    <div className={`w-full h-full border ${type !== 0 ? getColor(type) : 'border-slate-800'} rounded-sm`} />
  );
};

const GameStats: React.FC<{ score: number; lines: number; level: number }> = ({ score, lines, level }) => (
  <div className="bg-slate-800 p-6 rounded-lg border-2 border-slate-700 w-full shadow-lg">
    <div className="mb-4">
      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Score</p>
      <p className="text-2xl text-white font-mono">{score.toLocaleString()}</p>
    </div>
    <div className="mb-4">
      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Lines</p>
      <p className="text-2xl text-white font-mono">{lines}</p>
    </div>
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Level</p>
      <p className="text-2xl text-cyan-400 font-mono">{level}</p>
    </div>
  </div>
);

// --- MAIN PAGE ---
const NeonTetris: React.FC = () => {
  const [board, setBoard] = useState<BoardGrid>(createEmptyBoard());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const spawnPiece = useCallback(() => {
    const newTetrominoData = RANDOM_TETROMINO();
    const newPiece: ActivePiece = {
      shape: newTetrominoData.shape,
      color: newTetrominoData.color,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: -2 },
    };

    if (checkCollision(board, newPiece, 0, 1)) {
      setGameStatus(GameStatus.GAME_OVER);
      audioService.playGameOver();
    } else {
      setActivePiece(newPiece);
    }
  }, [board]);

  const lockPiece = useCallback(() => {
    if (!activePiece) return;
    audioService.playDrop();

    const newBoard = board.map((row) => [...row]);
    const { x, y } = activePiece.position;

    activePiece.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value !== 0) {
          const boardY = y + rowIndex;
          const boardX = x + colIndex;
          if (
            boardY >= 0 && boardY < BOARD_HEIGHT &&
            boardX >= 0 && boardX < BOARD_WIDTH
          ) {
            newBoard[boardY][boardX] = value;
          }
        }
      });
    });

    let linesCleared = 0;
    const finalBoard = newBoard.reduce((acc, row) => {
      if (row.every((cell) => cell !== 0)) {
        linesCleared++;
        acc.unshift(Array(BOARD_WIDTH).fill(0));
      } else {
        acc.push(row);
      }
      return acc;
    }, [] as BoardGrid);

    if (linesCleared > 0) {
      setScore((prev) => prev + linesCleared * 100 * linesCleared);
      setLines((prev) => prev + linesCleared);
      audioService.playClear();
    }

    setBoard(finalBoard);
    spawnPiece();
  }, [activePiece, board, spawnPiece]);

  const move = useCallback(
    (dirX: number, dirY: number) => {
      if (gameStatus !== GameStatus.PLAYING || !activePiece) return;

      if (!checkCollision(board, activePiece, dirX, dirY)) {
        setActivePiece((prev) =>
          prev
            ? {
                ...prev,
                position: { x: prev.position.x + dirX, y: prev.position.y + dirY },
              }
            : null
        );
        if (dirX !== 0) audioService.playMove();
      } else if (dirY > 0 && dirX === 0) {
        lockPiece();
      }
    },
    [activePiece, board, gameStatus, lockPiece]
  );

  const rotate = useCallback(() => {
    if (gameStatus !== GameStatus.PLAYING || !activePiece) return;

    const originalShape = activePiece.shape;
    const rotatedShape = originalShape[0].map((_, index) =>
      originalShape.map((row) => row[index]).reverse()
    );

    if (!checkCollision(board, activePiece, 0, 0, rotatedShape)) {
      setActivePiece((prev) => (prev ? { ...prev, shape: rotatedShape } : null));
      audioService.playRotate();
    }
  }, [activePiece, board, gameStatus]);

  const gameLoop = useCallback(
    (time: number) => {
      if (gameStatus !== GameStatus.PLAYING) return;

      const deltaTime = time - lastTimeRef.current;
      const currentSpeed = Math.max(100, TICK_RATE_MS - lines * 10);

      if (deltaTime > currentSpeed) {
        move(0, 1);
        lastTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [gameStatus, lines, move]
  );

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameStatus, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== GameStatus.PLAYING) return;
      // Prevent default scrolling for arrows and space
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowUp': rotate(); break;
        case ' ': rotate(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, move, rotate]);

  const renderGrid = () => {
    const displayBoard = board.map((row) => [...row]);
    if (activePiece) {
      activePiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
          if (value !== 0) {
            const boardY = activePiece.position.y + dy;
            const boardX = activePiece.position.x + dx;
            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              displayBoard[boardY][boardX] = value;
            }
          }
        });
      });
    }
    return displayBoard;
  };

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setGameStatus(GameStatus.PLAYING);
    spawnPiece();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 font-sans text-slate-100">
      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          className="px-6 py-2 font-bold text-white bg-cyan-600 border-4 border-slate-700 hover:bg-cyan-500 hover:scale-105 transition-all shadow-[4px_4px_0px_#334155]"
        >
          ← BACK
        </Link>
      </div>

      <h1 className="text-4xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
        NEON TETRIS
      </h1>

      <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full max-w-4xl">
        <div className="relative p-2 bg-slate-800 rounded-xl border-4 border-slate-700 shadow-2xl">
          <div
            className="grid grid-cols-10 grid-rows-20 gap-[1px] bg-slate-900"
            style={{ width: '300px', height: '600px' }}
          >
            {renderGrid().map((row, y) =>
              row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell} />)
            )}
          </div>

          {gameStatus === GameStatus.IDLE && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 rounded-lg">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl tracking-wider rounded-sm transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              >
                START GAME
              </button>
            </div>
          )}

          {gameStatus === GameStatus.GAME_OVER && (
            <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-10 rounded-lg">
              <h2 className="text-4xl text-white font-black mb-4 tracking-tighter">GAME OVER</h2>
              <p className="text-xl text-slate-200 mb-8">Score: {score}</p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-white text-red-600 font-bold rounded-sm hover:bg-gray-200 transition-colors uppercase"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 w-full md:w-64">
          <GameStats score={score} lines={lines} level={Math.floor(lines / 10) + 1} />
          
          <div className="bg-slate-800 p-6 rounded-lg border-2 border-slate-700">
            <h4 className="uppercase tracking-wider font-bold mb-4 text-slate-400 text-sm">Controls</h4>
            <ul className="text-slate-300 text-sm space-y-2 font-mono">
              <li>⬅️ ➡️ : Move</li>
              <li>⬆️ / SPC : Rotate</li>
              <li>⬇️ : Soft Drop</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeonTetris;