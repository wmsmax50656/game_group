import React, { useState } from 'react';
import Desktop from './components/Desktop';
import UACPrompt from './components/UACPrompt';
import Installer from './components/Installer';
import ChaosLayer from './components/ChaosLayer';
import WalletTheft from './components/WalletTheft';
import FinalError from './components/FinalError';
import BSOD from './components/BSOD';
import GameOver from './components/GameOver';
import { AppPhase } from './types';

const HackingSim: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.DESKTOP);

  const startSequence = () => setPhase(AppPhase.UAC_PROMPT);
  const handleUACConfirm = () => setPhase(AppPhase.INSTALLING);
  const handleUACCancel = () => setPhase(AppPhase.DESKTOP);
  const triggerChaos = () => setPhase(AppPhase.CHAOS);
  const finishChaos = () => setPhase(AppPhase.WALLET_THEFT);
  const finishTheft = () => setPhase(AppPhase.FINAL_ERROR);
  const triggerRealBSOD = () => setPhase(AppPhase.BSOD);
  const showGameOver = () => setPhase(AppPhase.GAMEOVER);
  const restartApp = () => setPhase(AppPhase.DESKTOP);

  return (
    // [수정됨] min-h-[80vh] -> h-[85vh] 로 변경
    // 부모 높이가 고정되어야 내부의 바탕화면(h-full)이 꽉 찹니다.
    <div className="w-full h-[85vh] relative overflow-hidden bg-black select-none font-[Segoe UI] border-x-4 border-b-4 border-gray-800 rounded-b-xl shadow-2xl">
      
      {/* Layer 0: Desktop */}
      {phase !== AppPhase.BSOD && phase !== AppPhase.GAMEOVER && (
         <Desktop onRunCheat={startSequence} />
      )}

      {/* Layer 1: UAC Prompt */}
      {phase === AppPhase.UAC_PROMPT && (
        <UACPrompt onConfirm={handleUACConfirm} onCancel={handleUACCancel} />
      )}

      {/* Layer 2: Installer */}
      {phase === AppPhase.INSTALLING && (
        <>
            <div className="absolute inset-0 bg-black/20 z-40" />
            <Installer onGlitchStart={triggerChaos} />
        </>
      )}

      {/* Layer 3: Chaos */}
      {phase === AppPhase.CHAOS && (
        <ChaosLayer onComplete={finishChaos} />
      )}

      {/* Layer 4: Wallet Theft */}
      {phase === AppPhase.WALLET_THEFT && (
        <WalletTheft onComplete={finishTheft} />
      )}

       {/* Layer 5: Final Error */}
      {phase === AppPhase.FINAL_ERROR && (
        <FinalError onComplete={triggerRealBSOD} />
      )}

      {/* Layer 6: BSOD */}
      {phase === AppPhase.BSOD && (
        <BSOD onComplete={showGameOver} />
      )}

      {/* Layer 7: Game Over */}
      {phase === AppPhase.GAMEOVER && (
        <GameOver onRestart={restartApp} />
      )}
    </div>
  );
};

export default HackingSim;