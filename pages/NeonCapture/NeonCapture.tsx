import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ComingSoon: React.FC = () => {
  // 현재 주소(URL)를 가져와서 게임 이름을 추측합니다.
  const location = useLocation();
  const gameName = location.pathname.replace('/', '').toUpperCase();

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[60vh] text-center bg-gray-900 text-white font-sans">
      {/* 뒤로 가기 버튼 */}
      <div className="absolute top-4 left-4">
        <Link 
          to="/" 
          className="px-6 py-2 font-bold text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-white transition-all text-xs uppercase tracking-widest"
        >
          ← BACK TO HUB
        </Link>
      </div>

      <div className="animate-bounce mb-8 text-6xl">🚧</div>
      
      <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
        {gameName}
      </h1>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-yellow-400 animate-pulse">
          업데이트 예정
        </p>
        <p className="text-gray-400">
          개발자가 열심히 만들고 있습니다. 조금만 기다려주세요!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;