import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NeonTetris from './pages/NeonTetris';
// [추가됨] 방금 만든 폴리 리듬 게임 임포트 (경로 주의!)
import PolyRhythmGame from './pages/PolyRhythmGame/PolyRhythmGame';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Layout 컴포넌트로 모든 페이지를 감쌉니다 */}
        <Route element={<Layout />}>
          {/* 메인 홈 */}
          <Route path="/" element={<Home />} />
          
          {/* 네온 테트리스 */}
          <Route path="/neon-tetris" element={<NeonTetris />} />
          
          {/* [추가됨] 폴리 리듬 게임 라우트 */}
          <Route path="/polyrhythm" element={<PolyRhythmGame />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;