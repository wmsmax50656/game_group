import React, { useState } from 'react';
import { Game } from '../types';
import GameCard from '../components/GameCard';
import { Plus, Target, Crosshair } from 'lucide-react';
import { playClickSound } from '../utils/audio';

const Home: React.FC = () => {
  const [games] = useState<Game[]>([
    // 1. [실행 가능] 네온 테트리스
    {
      id: "1",
      title: "네온 테트리스",
      description: "고전 명작 테트리스를 모던한 스타일로 재해석했습니다. 빠른 반응속도와 전략이 필요한 퍼즐 게임입니다.",
      thumbnailUrl: "https://picsum.photos/400/300?random=1", 
      tags: ["IO", "PUZZLE", "RHYTHM"],
      path: "/neon-tetris"
    },
    // 2. [실행 가능] 폴리 리듬 마스터
    {
      id: "2",
      title: "폴리 리듬 마스터",
      description: "3박자와 4박자가 겹쳐지는 복합 리듬을 시각적으로 경험하세요. 타이밍 감각을 극한으로 시험합니다.",
      thumbnailUrl: "https://picsum.photos/400/300?random=2", 
      tags: ["RHYTHM", "MUSIC", "HARD"],
      path: "/polyrhythm"
    },
    // 3. [배너] 한탕 특공대 (준비중)
    {
      id: "3",
      title: "한탕 특공대 (Hantang)",
      description: "로그라이크 서바이벌! 몰려오는 적들을 막아내고 장비를 강화하여 최후의 생존자가 되세요.",
      thumbnailUrl: "https://picsum.photos/400/300?random=99", 
      tags: ["SURVIVAL", "ACTION", "RPG"],
      path: "/hantang"
    },
    // --- 예정작 배너들 ---
    {
      id: "4",
      title: "Pixel Slots Roguelite",
      description: "슬롯 머신을 돌려 적을 공격하세요! 운과 전략이 결합된 픽셀 아트 로그라이트.",
      thumbnailUrl: "https://picsum.photos/400/300?random=3",
      tags: ["ROGUE", "PIXEL", "CHANCE"],
      path: "/pixel-slots"
    },
    {
      id: "5",
      title: "해킹 시뮬레이터",
      description: "터미널을 조작하여 방화벽을 뚫고 데이터를 탈취하세요. (Hacking Sim)",
      thumbnailUrl: "https://picsum.photos/400/300?random=4",
      tags: ["SIMULATION", "TYPING", "HACK"],
      path: "/hacking-sim"
    },
    {
      id: "6",
      title: "GeoTank Survival",
      description: "끊임없이 몰려오는 도형 적들을 물리치고 탱크를 업그레이드하세요.",
      thumbnailUrl: "https://picsum.photos/400/300?random=5",
      tags: ["SHOOTER", "SURVIVAL", "TANK"],
      path: "/geotank"
    },
    {
      id: "7",
      title: "Diep-Style 1v1 Duel",
      description: "실력을 증명할 1대1 탱크 대결. 컨트롤이 승패를 좌우합니다.",
      thumbnailUrl: "https://picsum.photos/400/300?random=6",
      tags: ["PVP", "ACTION", "MULTIPLAYER"],
      path: "/duel-1v1"
    },
    {
      id: "8",
      title: "Neon Capture",
      description: "네온 빛깔의 영토를 점령하라. 팀 기반 전략 점령전.",
      thumbnailUrl: "https://picsum.photos/400/300?random=7",
      tags: ["STRATEGY", "TEAM", "NEON"],
      path: "/neon-capture"
    },
    {
      id: "9",
      title: "Neon Snake.io",
      description: "꼬리가 길어질수록 살아남기 힘들어집니다. 최고의 길이를 달성하세요.",
      thumbnailUrl: "https://picsum.photos/400/300?random=8",
      tags: ["IO", "CLASSIC", "SNAKE"],
      path: "/snake-io"
    },
    {
      id: "10",
      title: "Orbit Defender",
      description: "핵심 코어를 지키세요. Florr.io 스타일의 회전 방어 게임.",
      thumbnailUrl: "https://picsum.photos/400/300?random=9",
      tags: ["DEFENSE", "ORBIT", "STRATEGY"],
      path: "/orbit-defender"
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
          onClick={() => {
            playClickSound();
            window.location.reload(); // [수정됨] 클릭 시 페이지 새로고침
          }}
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