import React, { useState } from 'react';
import { Game } from '../types';
import GameCard from '../components/GameCard';
import { Plus, Target, Crosshair } from 'lucide-react';
import { playClickSound } from '../utils/audio';

const Home: React.FC = () => {
  const [games] = useState<Game[]>([
    {
      id: "1",
      title: "네온 테트리스",
      description: "고전 명작 테트리스를 모던한 스타일로 재해석했습니다. 빠른 반응속도와 전략이 필요한 퍼즐 게임입니다.",
      thumbnailUrl: "https://picsum.photos/400/300", 
      tags: ["IO", "PUZZLE", "RHYTHM"],
      path: "/neon-tetris"
    }
  ]);

  return (
    <main className="container mx-auto px-4 py-16 flex flex-col items-center">
      {/* Hero Area */}
      <div className="text-center mb-20 max-w-4xl relative">
        <div className="absolute -top-10 -left-10 w-12 h-12 bg-diep-red border-4 border-diep-dark animate-bounce delay-100 hidden md:block"></div>
        <div className="absolute bottom-10 -right-20 w-16 h-16 bg-diep-purple clip-hexagon border-4 border-diep-dark animate-pulse hidden md:block"></div>

        <div className="inline-block px-4 py-2 mb-6 bg-white border-4 border-diep-dark shadow-vector transform -rotate-2">
          <span className="font-bold text-sm text-diep-dark uppercase tracking-widest">
            Level 45 Tank Design
          </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-diep-dark leading-none">
          BUILD. <span className="text-diep-blue underline decoration-4 decoration-diep-dark underline-offset-4">PLAY.</span><br/>
          SURVIVE.
        </h1>

        <button 
          className="group relative inline-flex items-center gap-4 px-10 py-5 bg-diep-blue text-white font-black text-2xl uppercase tracking-wider border-4 border-diep-dark shadow-vector hover:bg-diep-blue/90 hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-none"
          onClick={playClickSound}
        >
          <Crosshair className="w-8 h-8 stroke-[3px]" />
          Enter World
        </button>
      </div>

      {/* Game Grid Section */}
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-8 bg-white p-4 border-4 border-diep-dark shadow-vector">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-diep-red stroke-[3px]" />
            <h2 className="text-2xl font-black text-diep-dark uppercase tracking-wider">
              Upgrade Path
            </h2>
          </div>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-diep-bg border-4 border-diep-dark hover:bg-diep-yellow text-diep-dark font-bold transition-colors shadow-[2px_2px_0px_#555555]"
            onClick={playClickSound}
          >
            <Plus className="stroke-[4px]" size={20} />
            <span className="text-sm font-black uppercase">Add Node</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.length > 0 ? (
            games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="col-span-full bg-white border-4 border-diep-dark border-dashed p-16 text-center">
              <p className="text-xl font-bold text-diep-dark/50">NO ENTITIES FOUND</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;