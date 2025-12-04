import React from 'react';
import { Link } from 'react-router-dom'; // [추가됨] 페이지 이동을 위한 컴포넌트
import { Game } from '../types';
import { playHoverSound, playClickSound } from '../utils/audio';
import { Play } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Link 
      to={game.path} // [추가됨] types.ts에서 정의한 경로로 이동
      className="block group relative bg-white border-4 border-diep-dark hover:-translate-y-2 transition-transform duration-200 cursor-pointer shadow-vector hover:shadow-[8px_8px_0px_#555555]"
      onMouseEnter={playHoverSound}
      onClick={playClickSound}
    >
      {/* Thumbnail Section - Styled like a minimap or viewport */}
      <div className="relative h-56 w-full border-b-4 border-diep-dark overflow-hidden bg-diep-bg">
        {/* Grid pattern on top of image */}
        <div className="absolute inset-0 bg-grid opacity-30 z-10 pointer-events-none"></div>
        
        <img 
          src={game.thumbnailUrl} 
          alt={game.title} 
          className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
        />

        {/* Floating Play Icon - Looks like a center gun barrel */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           <div className="w-20 h-20 rounded-full bg-diep-blue border-4 border-diep-dark flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-200 shadow-xl">
             <Play className="w-8 h-8 fill-white text-white ml-1" />
           </div>
        </div>

        {/* Level Tag */}
        <div className="absolute top-3 left-3 z-20 bg-diep-purple border-4 border-diep-dark px-2 py-1 shadow-[2px_2px_0px_#555555]">
           <span className="text-xs font-black text-white uppercase">LVL 45</span>
        </div>
      </div>

      {/* Info Section - Styled like stats panel */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-black text-diep-dark uppercase tracking-tight">
            {game.title}
          </h3>
          <div className="text-xs font-bold text-diep-dark/60 bg-diep-bg px-2 py-1 border-2 border-diep-dark">
            #{game.id}
          </div>
        </div>
        
        <p className="text-diep-dark/80 text-sm mb-6 font-medium leading-relaxed border-l-4 border-diep-grid pl-3">
          {game.description}
        </p>
        
        {/* Tags - Styled like attribute bars */}
        <div className="space-y-2">
          {game.tags.map((tag, index) => {
            // Cycle through diep colors for tags
            const colors = ['bg-diep-red', 'bg-diep-green', 'bg-diep-blue', 'bg-diep-yellow'];
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={tag} className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase w-12 text-right text-diep-dark">{tag}</span>
                <div className="flex-grow h-3 bg-diep-bg border-2 border-diep-dark relative overflow-hidden">
                   <div className={`absolute top-0 left-0 h-full w-3/4 ${colorClass}`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
};

export default GameCard;