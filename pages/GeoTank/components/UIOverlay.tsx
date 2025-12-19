import React from 'react';
import { UpgradeState, PlayerStats } from '../types';

interface UIOverlayProps {
  score: number;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  upgradePoints: number;
  upgrades: UpgradeState;
  onUpgrade: (type: keyof UpgradeState) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  score, level, xp, maxXp, hp, maxHp, upgradePoints, upgrades, onUpgrade
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-[Ubuntu]">
      {/* Top Bar: Score & Level */}
      <div className="flex justify-between items-start w-full">
         <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-gray-700 drop-shadow-sm select-none">GeoTank Survival</h1>
            <div className="text-gray-600 font-bold select-none">Lvl {level} Tank</div>
         </div>
         <div className="text-right select-none">
            <div className="text-sm font-bold text-gray-600">Score</div>
            <div className="text-3xl font-bold text-gray-800 tracking-tighter">{score.toLocaleString()}</div>
         </div>
      </div>

      {/* Center Top: HP Bar */}
      {/* Diep.io usually shows HP under the tank, but a main HUD bar is fine too. Let's make it cleaner. */}
      
      {/* Bottom Left: Upgrades (Diep Style Stack) */}
      <div className="pointer-events-auto w-64 space-y-1.5 mb-14">
        {upgradePoints > 0 && (
           <div className="text-black font-bold mb-2 animate-pulse text-sm">
             x{upgradePoints} Upgrades Available
           </div>
        )}
        
        <UpgradeBar 
            label="Bullet Speed" 
            keyName="1"
            value={upgrades.bulletSpeed} 
            color="#00b2e1" // Blue
            canUpgrade={upgradePoints > 0}
            onClick={() => onUpgrade('bulletSpeed')}
        />
        <UpgradeBar 
            label="Reload" 
            keyName="2"
            value={upgrades.reload} 
            color="#98e155" // Green
            canUpgrade={upgradePoints > 0}
            onClick={() => onUpgrade('reload')}
        />
        <UpgradeBar 
            label="Move Speed" 
            keyName="3"
            value={upgrades.moveSpeed} 
            color="#00e16e" // Teal-ish (actually classic Diep move speed is often cyan, sticking to theme)
            // Let's use darker Cyan or Teal
            onClick={() => onUpgrade('moveSpeed')}
        />
        <UpgradeBar 
            label="Damage" 
            keyName="4"
            value={upgrades.damage} 
            color="#f14e54" // Red
            canUpgrade={upgradePoints > 0}
            onClick={() => onUpgrade('damage')}
        />
      </div>

      {/* Bottom: XP Bar (Footer) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-gray-300 rounded-full border-2 border-gray-600 overflow-hidden shadow-sm">
        <div 
            className="h-full bg-[#ffe869] transition-all duration-300 ease-linear"
            style={{ width: `${(xp / maxXp) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700 select-none">
            Score: {score}
        </div>
      </div>
    </div>
  );
};

const UpgradeBar = ({ label, keyName, value, color, canUpgrade, onClick }: any) => (
    <div 
        onClick={canUpgrade ? onClick : undefined}
        className={`
            group relative h-7 flex items-center rounded-sm border-2 border-gray-600 bg-gray-200
            transition-all duration-100 overflow-hidden select-none
            ${canUpgrade ? 'cursor-pointer hover:brightness-110 active:scale-[0.98]' : 'opacity-80'}
        `}
    >
        {/* Fill based on level */}
        <div 
            className="absolute top-0 left-0 h-full transition-all duration-300"
            style={{ 
                width: `${(value / 8) * 100}%`,
                backgroundColor: color 
            }}
        />
        
        {/* Grid lines for levels */}
        <div className="absolute inset-0 flex">
            {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-black/10 last:border-0" />
            ))}
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 flex w-full justify-between items-center px-2 text-xs font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            <span className="flex items-center gap-2">
                <span className="bg-gray-700 text-white rounded px-1 py-0.5 text-[9px] border border-gray-500">[{keyName}]</span>
                {label}
            </span>
            <span>{value}</span>
        </div>
        
        {/* Plus button if upgrade available */}
        {canUpgrade && (
            <div className="absolute right-0 h-full aspect-square bg-gray-700/50 hover:bg-black/20 flex items-center justify-center text-white font-bold z-20">
                +
            </div>
        )}
    </div>
);