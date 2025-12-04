import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { playClickSound } from '../utils/audio';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-grid font-sans selection:bg-diep-red selection:text-white flex flex-col text-diep-dark">
      
      {/* --- 공통 네비게이션 바 --- */}
      <nav className="relative z-50 w-full bg-diep-bg/90 border-b-4 border-diep-dark backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* 로고 클릭 시 홈으로 이동 */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer" onClick={playClickSound}>
            <div className="relative w-10 h-10 flex items-center justify-center">
               <div className="absolute inset-0 bg-diep-blue border-4 border-diep-dark rounded-sm transform group-hover:rotate-12 transition-transform"></div>
               <div className="absolute w-6 h-4 bg-diep-dark rounded-full"></div>
            </div>
            <span className="font-black text-2xl tracking-tight text-diep-dark">
              POLY<span className="text-diep-blue">GAMES</span>.io
            </span>
          </Link>
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