import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // [추가됨] 뒤로가기 링크
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { UpgradeState, CONSTANTS } from './types';
import styles from './GeoTank.module.css'; // [추가됨] 스타일 불러오기

// [수정됨] 컴포넌트 이름 변경 (App -> GeoTank)
const GeoTank: React.FC = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [maxXp, setMaxXp] = useState(100);
  const [hp, setHp] = useState(CONSTANTS.PLAYER_BASE_HP);
  const [maxHp, setMaxHp] = useState(CONSTANTS.PLAYER_BASE_HP);
  const [upgradePoints, setUpgradePoints] = useState(0);
  
  const [upgrades, setUpgrades] = useState<UpgradeState>({
    bulletSpeed: 0,
    reload: 0,
    moveSpeed: 0,
    damage: 0,
    points: 0
  });

  const handleUpgrade = useCallback((type: keyof UpgradeState) => {
    if (upgradePoints > 0 && upgrades[type] < 8) {
      setUpgrades(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
      setUpgradePoints(p => p - 1);
    }
  }, [upgradePoints, upgrades]);

  // Keyboard shortcuts for upgrades
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handleUpgrade('bulletSpeed');
      if (e.key === '2') handleUpgrade('reload');
      if (e.key === '3') handleUpgrade('moveSpeed');
      if (e.key === '4') handleUpgrade('damage');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUpgrade]);

  return (
    // [수정됨] CSS 모듈 클래스 적용 (배경색 및 폰트 적용)
    <div className={styles.geoContainer}>
      
      {/* [추가됨] 게임 스타일에 맞춘 뒤로가기 버튼 */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          to="/" 
          className="px-4 py-2 font-bold text-white bg-[#00B2E1] border-4 border-[#0085A8] hover:brightness-110 active:translate-y-1 transition-all text-sm rounded shadow-lg"
        >
          ← EXIT ARENA
        </Link>
      </div>

      <GameCanvas 
        setScore={setScore}
        setLevel={setLevel}
        setXp={setXp}
        setHp={setHp}
        setUpgradePoints={setUpgradePoints}
        upgrades={upgrades}
      />
      
      <UIOverlay 
        score={score}
        level={level}
        xp={xp}
        maxXp={maxXp}
        hp={hp}
        maxHp={maxHp}
        upgradePoints={upgradePoints}
        upgrades={upgrades}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}

export default GeoTank;