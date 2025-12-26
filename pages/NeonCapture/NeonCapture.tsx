import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const GRID_SIZE = 7;

type Player = 1 | 2; // 1: Player (Green), 2: AI (Purple)
type Cell = Player | 0 | null; // 0: Empty, null: invalid

const NeonCapture: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [turn, setTurn] = useState<Player>(1);
  const [selected, setSelected] = useState<{ r: number, c: number } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<{ r: number, c: number, type: 'clone' | 'jump' }[]>([]);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Initialize Board
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    // Starting positions
    newBoard[0][0] = 1;
    newBoard[GRID_SIZE - 1][0] = 2; // AI bottom-left? No let's do corners.
    newBoard[0][GRID_SIZE - 1] = 2;
    newBoard[GRID_SIZE - 1][GRID_SIZE - 1] = 1;

    // Alt setup: P1 top-left & bottom-right vs P2 top-right & bottom-left

    setBoard(newBoard);
    setTurn(1);
    setSelected(null);
    setScores({ 1: 2, 2: 2 });
    setGameOver(false);
    setIsAiThinking(false);
  };

  // Calculate scores
  useEffect(() => {
    let p1 = 0;
    let p2 = 0;
    let empty = 0;
    board.forEach(row => row.forEach(cell => {
      if (cell === 1) p1++;
      else if (cell === 2) p2++;
      else if (cell === 0) empty++;
    }));
    setScores({ 1: p1, 2: p2 });

    if (empty === 0 || p1 === 0 || p2 === 0) {
      setGameOver(true);
    } else if (turn === 1) {
      // Check if P1 has moves
      if (!canMove(1, board)) {
        // Pass turn or game over? Usually pass. If both pass -> game over.
        // For simplicity, if no moves, you lose turn.
        setTurn(2);
      }
    } else if (turn === 2) {
      if (!canMove(2, board)) {
        setTurn(1);
      } else {
        // AI Turn
        if (!isAiThinking && !gameOver) {
          setIsAiThinking(true);
          setTimeout(makeAiMove, 800);
        }
      }
    }
  }, [board, turn, gameOver]);

  const canMove = (p: Player, currentBoard: Cell[][]) => {
    // Very naive check: find all piecs of p, check if any has valid empty neighbor (dist 1 or 2)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentBoard[r][c] === p) {
          // Check 5x5 area around
          for (let nr = r - 2; nr <= r + 2; nr++) {
            for (let nc = c - 2; nc <= c + 2; nc++) {
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && currentBoard[nr][nc] === 0) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || turn !== 1 || isAiThinking) return;

    const cell = board[r][c];

    // Select own piece
    if (cell === 1) {
      setSelected({ r, c });
      // Calculate valid moves
      const moves: { r: number, c: number, type: 'clone' | 'jump' }[] = [];
      for (let nr = r - 2; nr <= r + 2; nr++) {
        for (let nc = c - 2; nc <= c + 2; nc++) {
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] === 0) {
            const dist = Math.max(Math.abs(nr - r), Math.abs(nc - c));
            if (dist === 1) moves.push({ r: nr, c: nc, type: 'clone' });
            else if (dist === 2) moves.push({ r: nr, c: nc, type: 'jump' });
          }
        }
      }
      setPossibleMoves(moves);
      return;
    }

    // Move to empty
    if (cell === 0 && selected) {
      const move = possibleMoves.find(m => m.r === r && m.c === c);
      if (move) {
        executeMove(selected.r, selected.c, r, c, move.type, 1);
      }
    }
  };

  const executeMove = (fromR: number, fromC: number, toR: number, toC: number, type: 'clone' | 'jump', player: Player) => {
    const newBoard = board.map(row => [...row]);

    if (type === 'jump') {
      newBoard[fromR][fromC] = 0;
    }
    newBoard[toR][toC] = player;

    // Capture neighbors
    for (let nr = toR - 1; nr <= toR + 1; nr++) {
      for (let nc = toC - 1; nc <= toC + 1; nc++) {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          const neighbor = newBoard[nr][nc];
          if (neighbor !== 0 && neighbor !== player) {
            newBoard[nr][nc] = player; // Convert
          }
        }
      }
    }

    setBoard(newBoard);
    setSelected(null);
    setPossibleMoves([]);
    setTurn(player === 1 ? 2 : 1);
  };

  const makeAiMove = useCallback(() => {
    // GREEDY AI: Maximize net score gain (my gain + enemy loss)

    let bestMove: { fr: number, fc: number, tr: number, tc: number, score: number, type: 'clone' | 'jump' } | null = null;
    let maxScore = -Infinity;

    // Iterate all AI pieces
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === 2) {
          // Check all valid moves
          for (let nr = r - 2; nr <= r + 2; nr++) {
            for (let nc = c - 2; nc <= c + 2; nc++) {
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] === 0) {
                const dist = Math.max(Math.abs(nr - r), Math.abs(nc - c));
                const type = dist === 1 ? 'clone' : 'jump';

                // Emulate move
                let gain = 1; // +1 for the new cell
                if (type === 'jump') gain = 0; // Jump doesn't increase count, just moves

                // Count conversions
                for (let x = nr - 1; x <= nr + 1; x++) {
                  for (let y = nc - 1; y <= nc + 1; y++) {
                    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                      if (board[x][y] === 1) gain += 2; // +1 for me, -1 for enemy => net +2 ? Or just treat simple score.
                    }
                  }
                }

                if (gain > maxScore) {
                  maxScore = gain;
                  bestMove = { fr: r, fc: c, tr: nr, tc: nc, score: gain, type };
                } else if (gain === maxScore) {
                  if (Math.random() > 0.5) {
                    bestMove = { fr: r, fc: c, tr: nr, tc: nc, score: gain, type };
                  }
                }
              }
            }
          }
        }
      }
    }

    if (bestMove) {
      executeMove(bestMove.fr, bestMove.fc, bestMove.tr, bestMove.tc, bestMove.type, 2);
    } else {
      // No moves possible
      setTurn(1);
    }
    setIsAiThinking(false);
  }, [board]);


  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[90vh] bg-gray-900 font-sans relative select-none">

      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="px-6 py-2 font-bold text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-white transition-all text-xs uppercase tracking-widest"
        >
          ← SURRENDER
        </Link>
      </div>

      <div className="mb-4 flex gap-12 text-2xl font-black uppercase tracking-widest bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
        <div className={`${turn === 1 ? 'text-green-400 scale-110 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-green-800'} transition-all`}>
          YOU: <span className="font-mono">{scores[1]}</span>
        </div>
        <div className={`${turn === 2 ? 'text-purple-400 scale-110 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]' : 'text-purple-900'} transition-all`}>
          CPU: <span className="font-mono">{scores[2]}</span>
        </div>
      </div>

      <div className="relative p-1 bg-gray-700 rounded-lg shadow-2xl">
        <div
          className="grid gap-1 bg-gray-800 p-2 rounded"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) => (
            row.map((cell, c) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const isCandidate = possibleMoves.some(m => m.r === r && m.c === c);
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                                w-8 h-8 md:w-16 md:h-16 rounded transition-all duration-300 relative cursor-pointer
                                ${cell === 0 ? 'bg-gray-900' : ''}
                                ${cell === 1 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] z-10' : ''}
                                ${cell === 2 ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.6)] z-10' : ''}
                                ${isSelected ? 'ring-4 ring-white animate-pulse' : ''}
                                ${isCandidate ? 'bg-gray-700 hover:bg-gray-600 after:content-[""] after:absolute after:inset-2 after:bg-white/10 after:rounded-full' : ''}
                            `}
                >
                  {/* Inner detail for style */}
                  {cell !== 0 && <div className="absolute inset-1 bg-black/10 rounded-sm"></div>}
                </div>
              );
            })
          ))}
        </div>

        {gameOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
            <h2 className={`text-6xl font-black mb-4 ${scores[1] > scores[2] ? 'text-green-500' : 'text-purple-500'}`}>
              {scores[1] > scores[2] ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-gray-500 text-sm max-w-lg text-center font-mono">
        <p className="mb-2 uppercase text-xs font-bold tracking-widest">HOW TO PLAY</p>
        <ul className="space-y-1">
          <li>select your piece (green)</li>
          <li>• Move to adjacent tile: <span className="text-white">CLONE</span> (Create new piece)</li>
          <li>• Move 2 tiles away: <span className="text-white">JUMP</span> (Move piece)</li>
          <li>Landing converts all adjacent enemies!</li>
        </ul>
      </div>

    </div>
  );
};

export default NeonCapture;