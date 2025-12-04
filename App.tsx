import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom'; // BrowserRouter -> HashRouter로 변경
import Home from './pages/Home';
import NeonTetris from './pages/NeonTetris';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    // 배포 환경(GitHub Pages) 호환성을 위해 HashRouter 사용
    <HashRouter>
      <Routes>
        {/* Layout 컴포넌트로 모든 페이지를 감쌉니다 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/neon-tetris" element={<NeonTetris />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;