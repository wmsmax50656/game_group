import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// --- 완성된 게임 ---
import Home from './pages/Home';
import NeonTetris from './pages/NeonTetris';
import PolyRhythmGame from './pages/PolyRhythmGame/PolyRhythmGame';

// --- 준비 중인 게임 (이제 오류 안 남) ---
import Hantang from './pages/Hantang/Hantang';

// --- 기타 배너용 게임들 ---
import PixelSlots from './pages/PixelSlots/PixelSlots';
import HackingSim from './pages/HackingSim/HackingSim';
import GeoTank from './pages/GeoTank/GeoTank';
import Duel1v1 from './pages/Duel1v1/Duel1v1';
import NeonCapture from './pages/NeonCapture/NeonCapture';
import SnakeIO from './pages/SnakeIO/SnakeIO';
import OrbitDefender from './pages/OrbitDefender/OrbitDefender';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* 메인 홈 */}
          <Route path="/" element={<Home />} />
          
          {/* 실행 가능한 게임 */}
          <Route path="/neon-tetris" element={<NeonTetris />} />
          <Route path="/polyrhythm" element={<PolyRhythmGame />} />
          
          {/* 준비 중 화면으로 연결 */}
          <Route path="/hantang" element={<Hantang />} />

          {/* 나머지 배너들 */}
          <Route path="/pixel-slots" element={<PixelSlots />} />
          <Route path="/hacking-sim" element={<HackingSim />} />
          <Route path="/geotank" element={<GeoTank />} />
          <Route path="/duel-1v1" element={<Duel1v1 />} />
          <Route path="/neon-capture" element={<NeonCapture />} />
          <Route path="/snake-io" element={<SnakeIO />} />
          <Route path="/orbit-defender" element={<OrbitDefender />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;