import React from 'react';
import { Outlet } from 'react-router-dom';
import { playClickSound } from '../utils/audio';

const Layout: React.FC = () => {
  
  // 로고 클릭 시 홈(Base URL)으로 이동하며 강제 새로고침
  const handleLogoClick = () => {
    playClickSound();
    // import.meta.env.BASE_URL은 vite.config.ts에서 설정한 base 경로('/game_group/')를 가리킵니다.
    window.location.href = import.meta.env.BASE_URL;
  };

  return (
    <div className="min-h-screen bg-grid font-sans selection:bg-diep-red selection:text-white flex flex-col text-diep-dark">
      
      {/* --- 공통 네비게이션 바 --- */}
      <nav className="relative z-50 w-full bg-diep-bg/90 border-b-4 border-diep-dark backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* [수정됨] 로고: Link 대신 div + onClick으로 변경하여 새로고침 유도 */}
          <div 
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={handleLogoClick}
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
               <div className="absolute inset-0 bg-diep-blue border-4 border-diep-dark rounded-sm transform group-hover:rotate-12 transition-transform"></div>
               <div className="absolute w-6 h-4 bg-diep-dark rounded-full"></div>
            </div>
            <span className="font-black text-2xl tracking-tight text-diep-dark">
              POLY<span className="text-diep-blue">GAMES</span>.io
            </span>
          </div>

          <div className="flex gap-3">
             <button className="hidden md:flex items-center px-4 py-2 font-bold text-diep-dark bg-white border-4 border-diep-dark hover:bg-diep-purple hover:text-white transition-colors uppercase tracking-wider shadow-vector active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
               Leaderboard
             </button>
             <button className="hidden md:flex items-center px-4 py-2 font-bold text-white bg-diep-green border-4 border-diep-dark hover:brightness-110 transition-all uppercase tracking-wider shadow-vector active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
               Login
             </button>
          </div>
        </div>
      </nav>

      {/* --- 페이지별 내용이 들어갈 자리 (Outlet) --- */}
      <div className="flex-grow flex flex-col relative z-10">
        <Outlet />
      </div>

      {/* --- 공통 푸터 --- */}
      <footer className="relative z-10 border-t-4 border-diep-dark bg-white py-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-bold text-diep-dark mb-2">
            SERVER: <span className="text-diep-green">ONLINE (Seoul)</span>
          </p>
          <p className="text-xs font-bold text-diep-dark/60 uppercase">
            &copy; 2024 POLYGAMES.IO
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;