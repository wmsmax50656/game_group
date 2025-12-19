import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom'; // [추가됨] 뒤로가기 링크
import SlotCanvas from './components/SlotCanvas';
import { GamePhase, GameState, SymbolType } from './types';
import { SYMBOLS, SYMBOL_WEIGHTS } from './constants';
import * as AudioService from './services/audio';
import './PixelSlots.module.css'; 

// --- RNG Helper ---
const getRandomSymbol = (): SymbolType => {
  const totalWeight = SYMBOL_WEIGHTS.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of SYMBOL_WEIGHTS) {
    if (random < item.weight) return item.type;
    random -= item.weight;
  }
  return SymbolType.CHERRY;
};

// --- Initial State ---
const INITIAL_STATE: GameState = {
  money: 10,
  debt: 100, 
  spins: 5,
  maxSpins: 5,
  round: 1,
  phase: GamePhase.IDLE,
  grid: Array(3).fill(null).map(() => Array(3).fill(SymbolType.CHERRY)),
};

// [수정됨] 컴포넌트 이름 변경 (App -> PixelSlots)
const PixelSlots: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false]);
  const [offsets, setOffsets] = useState<number[]>([0, 0, 0]);
  const [message, setMessage] = useState<string>("PULL LEVER");
  const [isLeverPulled, setIsLeverPulled] = useState(false);
  
  const reqRef = useRef<number>();

  const handleSpin = useCallback(() => {
    if (gameState.phase !== GamePhase.IDLE || gameState.spins <= 0) {
        if (gameState.phase === GamePhase.GAME_OVER) {
            handleRestart();
            return;
        }
        if (gameState.phase === GamePhase.SHOP) {
            handleNextRound();
            return;
        }
        return;
    }

    setIsLeverPulled(true);
    setTimeout(() => setIsLeverPulled(false), 500); 
    
    setGameState(prev => ({ ...prev, spins: prev.spins - 1, phase: GamePhase.SPINNING }));
    setMessage("ROLLING...");
    
    setTimeout(() => {
        AudioService.playSpinSound();
        setTimeout(() => AudioService.playSpinSound(), 150);
    }, 200);

    const startTime = performance.now();
    const durations = [1000, 1600, 2200]; 
    
    setSpinningCols([true, true, true]);
    
    const newGrid = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => getRandomSymbol())
    );

    const animate = (time: number) => {
      const elapsed = time - startTime;
      setOffsets(prev => prev.map((off, idx) => {
        if (elapsed > durations[idx]) return 0;
        return (off + 32) % 128; 
      }));

      if (elapsed > 2200) {
        setSpinningCols([false, false, false]);
        setOffsets([0, 0, 0]);
        setGameState(prev => ({ ...prev, phase: GamePhase.IDLE, grid: newGrid }));
        checkScore(newGrid);
        return;
      }
      
      setSpinningCols(cols => cols.map((isSpinning, idx) => elapsed < durations[idx]));
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);

  }, [gameState.phase, gameState.spins]);

  const checkScore = (grid: SymbolType[][]) => {
    let winnings = 0;
    const lines = [];

    // Rows
    for (let y = 0; y < 3; y++) lines.push([grid[0][y], grid[1][y], grid[2][y]]);
    // Diagonals
    lines.push([grid[0][0], grid[1][1], grid[2][2]]);
    lines.push([grid[0][2], grid[1][1], grid[2][0]]);

    let hitJackpot = false;

    lines.forEach(line => {
        const [a, b, c] = line;
        if (a === SymbolType.GOLD_CLOVER && b === SymbolType.GOLD_CLOVER && c === SymbolType.GOLD_CLOVER) {
            hitJackpot = true;
            winnings += SYMBOLS[SymbolType.GOLD_CLOVER].value;
            return;
        }
        const nonWilds = line.filter(s => s !== SymbolType.CLOVER);
        const isMatch = nonWilds.every(s => s === nonWilds[0]);

        if (isMatch) {
            const symbolType = nonWilds.length > 0 ? nonWilds[0] : SymbolType.CLOVER;
            if (symbolType !== SymbolType.GOLD_CLOVER) {
                 winnings += SYMBOLS[symbolType].value;
            }
        }
    });

    if (winnings > 0) {
      if (hitJackpot) {
        AudioService.playJackpotSound();
        setMessage(`JACKPOT! $${winnings}`);
      } else {
        AudioService.playCoinSound();
        setMessage(`WON $${winnings}`);
      }
      setGameState(prev => ({ ...prev, money: prev.money + winnings }));
    } else {
      setMessage("TRY AGAIN");
    }
  };

  useEffect(() => {
    if (gameState.phase === GamePhase.IDLE && !spinningCols.some(Boolean)) {
      if (gameState.spins === 0) {
        if (gameState.money >= gameState.debt) {
            setGameState(prev => ({...prev, phase: GamePhase.SHOP}));
            setMessage("RENT MET");
        } else {
            setGameState(prev => ({...prev, phase: GamePhase.GAME_OVER}));
            setMessage("BROKE");
        }
      }
    }
  }, [gameState.money, gameState.spins, gameState.phase, spinningCols, gameState.debt]);

  const handleNextRound = () => {
    setGameState(prev => ({
      ...prev,
      round: prev.round + 1,
      debt: Math.floor(prev.debt * 1.5),
      spins: prev.maxSpins,
      money: prev.money - prev.debt,
      phase: GamePhase.IDLE
    }));
    setMessage("ROUND START");
  };
  
  const handleRestart = () => {
      setGameState(INITIAL_STATE);
      setMessage("GOOD LUCK");
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleSpin();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSpin]);

  return (
    // [수정됨] 배경 스타일 변경: 원본의 짙은 그라데이션 적용 및 전체 화면 꽉 채우기
    <div className="w-full flex-grow min-h-[85vh] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_#3E2D2D_0%,_#120808_100%)] relative overflow-hidden select-none perspective-1000">
      
      {/* [추가됨] 뒤로가기 버튼 */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          to="/" 
          className="px-4 py-2 font-bold text-[#eecfa1] border-2 border-[#5a4035] bg-[#2a1d1d] hover:bg-[#3e2b2b] transition-all text-xs uppercase tracking-widest rounded shadow-lg"
        >
          ← EXIT CASINO
        </Link>
      </div>

      {/* --- THE MACHINE WRAPPER --- */}
      <div className="relative flex items-end transform scale-[0.85] md:scale-[0.95] overflow-visible">
        
        {/* ================= CABINET BODY ================= */}
        <div className="relative w-[840px] h-[540px] deep-wood rounded-[40px] border-b-[24px] border-[#221310] flex flex-col items-center shadow-2xl z-20">
            
            {/* DECORATIVE SCREWS */}
            <div className="absolute top-4 left-4 screw"></div>
            <div className="absolute top-4 right-4 screw"></div>
            <div className="absolute bottom-6 left-4 screw"></div>
            <div className="absolute bottom-6 right-4 screw"></div>

            {/* --- TOP BRANDING PLATE --- */}
            <div className="w-[85%] mt-6 h-14 gold-gradient rounded-lg shadow-lg flex items-center justify-center relative z-20">
                 <div className="absolute inset-1 border border-[#D4AF37] rounded opacity-50"></div>
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 screw opacity-70 scale-75"></div>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 screw opacity-70 scale-75"></div>
                 <h1 className="classic-text text-3xl text-[#3E2723] tracking-[0.2em] font-black drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                    PIXEL SLOTS
                 </h1>
            </div>

            {/* --- MAIN DISPLAY AREA --- */}
            <div className="w-[85%] flex-1 my-5 chrome-gradient rounded-[30px] p-3 relative shadow-[0_5px_15px_rgba(0,0,0,0.6)]">
                
                {/* The Recessed Black Plastic Housing */}
                <div className="w-full h-full recessed-panel p-5 flex gap-4 relative overflow-hidden">
                    
                    {/* LIGHTS PATTERN (Under glass) */}
                    <div className="absolute top-2 left-0 right-0 flex justify-center gap-16 opacity-60 pointer-events-none">
                        <div className={`w-3 h-3 rounded-full ${spinningCols[0] ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#4a0404]'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${spinningCols[1] ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#4a0404]'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${spinningCols[2] ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#4a0404]'}`}></div>
                    </div>

                    {/* --- CRT SCREEN (Physical Glass) --- */}
                    <div className="w-full h-full crt-frame border-[4px] border-[#2a2a2a] relative shadow-2xl bg-black">
                        <div className="screen-glare"></div>
                        <div className="scanlines"></div>
                        <div className="crt-overlay"></div>
                        
                        {/* SCREEN CONTENT */}
                        <div className="crt-content-layer w-full h-full bg-[#EADDCA] flex items-stretch p-3 text-[#3e2723]">
                            
                            {/* LEFT: Stats Panel */}
                            <div className="w-[28%] flex flex-col justify-center border-r-2 border-[#5d4037] border-dashed border-opacity-30 pr-4 space-y-4">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Credit</div>
                                    <div className="text-3xl font-mono font-bold text-[#b8860b] drop-shadow-[1px_1px_0_rgba(0,0,0,0.1)] leading-none">${gameState.money}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Target</div>
                                    <div className="text-xl font-mono font-bold text-red-700 leading-none">-${gameState.debt}</div>
                                </div>
                                <div className="bg-[#3e2723]/10 rounded p-1 border border-[#3e2723]/20 flex justify-between items-center px-2">
                                    <span className="text-[10px] uppercase font-bold">Rnd</span>
                                    <span className="font-bold font-mono text-lg">{gameState.round}</span>
                                </div>
                            </div>

                            {/* CENTER: Reels */}
                            <div className="flex-1 px-4 flex flex-col items-center justify-center">
                                {/* Bezel Depth for Canvas */}
                                <div className="relative p-[6px] bg-[#111] rounded-xl shadow-[inset_0_0_15px_#000,0_1px_0_rgba(255,255,255,0.2)]">
                                     <div className="w-[180px] h-[180px] bg-[#000] rounded-lg overflow-hidden relative border border-[#333]">
                                        <SlotCanvas grid={gameState.grid} spinningCols={spinningCols} offsets={offsets} />
                                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]"></div>
                                     </div>
                                </div>
                                
                                {/* Spin Counter */}
                                <div className="mt-3 flex items-center gap-2 opacity-90">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="font-mono text-sm font-bold tracking-widest">SPINS: <span className="text-xl text-red-600">{gameState.spins}</span></span>
                                </div>
                            </div>

                            {/* RIGHT: Paytable & Info */}
                            <div className="w-[28%] flex flex-col justify-between pl-4 border-l-2 border-[#5d4037] border-dashed border-opacity-30">
                                <div className="h-full flex flex-col justify-center items-end">
                                    <div className="font-mono text-2xl font-black text-[#2979FF] uppercase text-right leading-7 drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">
                                        {message}
                                    </div>
                                </div>
                                <div className="text-[9px] font-mono opacity-60 text-right space-y-1 pb-1">
                                    <div className="border-b border-[#3e2723]/20 pb-1 mb-1 font-bold">PAY TABLE</div>
                                    <div>777 = <span className="font-bold">$50</span></div>
                                    <div>🍀🍀🍀 = <span className="font-bold">$100</span></div>
                                    <div className="text-[#b8860b]">🏆🏆🏆 = $1K</div>
                                </div>
                            </div>

                        </div>
                        
                        {/* Phase Overlay */}
                        {(gameState.phase === GamePhase.SHOP || gameState.phase === GamePhase.GAME_OVER) && (
                            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-[#F6F7D4]">
                                <h2 className={`text-5xl classic-text mb-4 ${gameState.phase === GamePhase.GAME_OVER ? 'text-red-500' : 'text-[#D4AF37]'} drop-shadow-md`}>
                                    {gameState.phase === GamePhase.GAME_OVER ? 'GAME OVER' : 'VICTORY'}
                                </h2>
                                <p className="animate-pulse font-mono text-xs uppercase tracking-widest text-white/60">Pull Lever to Continue</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* --- BOTTOM TRAY --- */}
            <div className="w-[92%] h-16 bg-[#1a100d] rounded-b-[30px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] border-t border-[#3e2723] flex items-center justify-center relative">
                 <div className="absolute top-2 w-[80%] h-1 bg-[#000] opacity-20 blur-sm rounded-full"></div>
                 <div className="w-2/3 h-10 bg-[#0f0806] rounded-full shadow-[inset_0_3px_8px_black] border-b border-[#3e2723]/20 flex items-center justify-center">
                     <span className="text-[10px] text-[#5d4037] tracking-[0.3em] font-bold opacity-60">COIN TRAY</span>
                 </div>
            </div>

        </div>

        {/* ================= MECHANICAL LEVER ================= */}
        <div className="relative -ml-5 mb-32 z-30 lever-container flex flex-col justify-end">
             
             {/* Gearbox Housing */}
             <div className="w-14 h-28 chrome-gradient rounded-r-xl border-l border-black shadow-[10px_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-center relative">
                  <div className="absolute top-2 right-2 screw scale-50"></div>
                  <div className="absolute bottom-2 right-2 screw scale-50"></div>
                  <div className="w-8 h-16 bg-[#1a1a1a] rounded-full shadow-[inset_0_0_5px_#000] border border-[#444]"></div>
                  <div className="absolute w-6 h-6 rounded-full bg-gray-300 shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.5),2px_2px_5px_rgba(0,0,0,0.3)] border border-gray-500 z-20"></div>
             </div>
             
             {/* The Lever Arm Wrapper */}
             <div 
                className={`lever-arm-wrapper absolute bottom-[60px] left-[20px] w-6 h-[200px] ${isLeverPulled ? 'pulling' : ''}`} 
                style={{ transformOrigin: 'bottom center' }}
             >
                 {/* Shaft */}
                 <div className="w-4 h-full mx-auto bg-gradient-to-r from-gray-400 via-gray-200 to-gray-500 rounded-full border border-gray-600 shadow-[5px_0_10px_rgba(0,0,0,0.3)] relative z-10"></div>
                 
                 {/* Handle (The Red Sphere) */}
                 <div 
                    className="absolute -top-6 -left-5 w-14 h-14 rounded-full cursor-pointer hover:brightness-110 active:scale-95 transition-transform z-30 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_-5px_-5px_15px_rgba(0,0,0,0.3)]"
                    style={{ background: 'radial-gradient(circle at 35% 35%, #ff4d4d, #b30000)' }}
                    onClick={handleSpin}
                 >
                    <div className="absolute top-2 left-3 w-5 h-3 bg-white opacity-40 rounded-full blur-[2px]"></div>
                 </div>
             </div>

        </div>

      </div>
    </div>
  );
};

export default PixelSlots;