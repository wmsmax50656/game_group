import React from 'react';
import { Link } from 'react-router-dom';

const Hantang: React.FC = () => {
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
      
      <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
        한탕 특공대
      </h1>
      
      <div className="space-y-2">
        <p className="text-2xl font-bold text-yellow-400 animate-pulse">
          업데이트 예정
        </p>
        <p className="text-gray-400">
          더 멋진 게임으로 찾아뵙겠습니다!<br/>
          (현재 개발 중입니다)
        </p>
      </div>
    </div>
  );
};

export default Hantang;