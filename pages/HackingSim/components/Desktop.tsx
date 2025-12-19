import React, { useState, useEffect } from 'react';
import { Skull, Search, LayoutGrid, MessageCircle, Wifi, Volume2, Battery, ChevronUp, Bell } from 'lucide-react';
import { audioService } from '../services/audioService';

interface DesktopProps {
  onRunCheat: () => void;
}

const Desktop: React.FC<DesktopProps> = ({ onRunCheat }) => {
  const [selected, setSelected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Windows 11 Dark Mode Bloom Wallpaper
  // Using a high-quality Unsplash source that perfectly mimics the official Windows 11 dark theme wallpaper
  const WALLPAPER_URL = "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(true);
    audioService.playClick();
  };

  const handleDoubleClick = () => {
    onRunCheat();
  };

  const handleBackgroundClick = () => {
    setSelected(false);
  };

  // Windows 11 Date/Time Format
  const timeString = currentTime.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateString = currentTime.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-').slice(0, -1);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-[Segoe UI,sans-serif] cursor-default overflow-hidden select-none text-white"
      onClick={handleBackgroundClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
            src={WALLPAPER_URL} 
            alt="Windows 11 Wallpaper" 
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
        />
        {/* Overlay to ensure text readability if image is too bright, though this image is dark */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      </div>

      {/* Desktop Area */}
      <div className="flex-1 p-[10px] relative z-10 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-y-2 gap-x-0 w-fit content-start">
        {/* Cheat Executable Icon */}
        <div 
          className={`
            w-[84px] h-[100px] flex flex-col items-center justify-start group cursor-pointer p-1 rounded-[4px] border border-transparent transition-all duration-75
            ${selected ? 'bg-white/10 border-white/10' : 'hover:bg-white/5'}
          `}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <div className="w-12 h-12 relative mb-2 mt-1 transition-transform active:scale-95">
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden border border-gray-600">
               {/* Icon Content */}
               <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                 <Skull className="text-red-500 w-8 h-8 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" strokeWidth={2} />
               </div>
               
               {/* Shortcut Arrow */}
               <div className="absolute bottom-0 left-0 bg-[#1a1a1a] border-t border-r border-gray-600 w-4 h-4 rounded-tr-md shadow-sm flex items-center justify-center z-10">
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 -rotate-45 translate-y-[1px] translate-x-[1px]">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
               </div>
            </div>
          </div>
          <span className={`
            text-white text-[12px] px-1 text-center leading-tight tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] line-clamp-2 break-all
            ${selected ? '' : ''}
          `}>
            CloverPit_Cheat.exe
          </span>
        </div>
      </div>

      {/* Windows 11 Taskbar */}
      <div className="h-12 w-full bg-[#1c1c1c]/85 backdrop-blur-2xl flex justify-between items-center px-3 z-50 border-t border-white/5 relative">
        
        {/* Left Spacer (Weather) */}
        <div className="flex-1 flex items-center justify-start invisible md:visible opacity-0 md:opacity-100 transition-opacity">
             <div className="flex items-center gap-2 hover:bg-white/5 px-2 py-1.5 rounded-md transition-colors cursor-default group">
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] shadow-sm">☀</div>
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/90">21°C</span>
                    <span className="text-[10px] text-white/60 leading-none">대체로 맑음</span>
                </div>
             </div>
        </div>

        {/* Center Icons (Dock) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 h-full">
            {/* Start Button */}
            <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all duration-200 cursor-pointer group">
                <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-sm transition-transform group-hover:scale-105">
                    <path fill="#00a1f1" d="M0,3.44 L10.53,1.98 L10.53,11.53 L0,11.59 L0,3.44 Z" />
                    <path fill="#00a1f1" d="M11.66,1.82 L24,0 L24,11.53 L11.66,11.53 L11.66,1.82 Z" />
                    <path fill="#00a1f1" d="M0,12.7 L10.53,12.75 L10.53,22.25 L0,20.84 L0,12.7 Z" />
                    <path fill="#00a1f1" d="M11.66,12.75 L24,12.75 L24,24 L11.66,22.38 L11.66,12.75 Z" />
                </svg>
            </div>

            <TaskbarIcon icon={<Search size={18} className="text-white/90" strokeWidth={3} />} />
            <TaskbarIcon icon={<LayoutGrid size={18} className="text-white/90" />} />
            <TaskbarIcon icon={<MessageCircle size={18} className="text-white/90" />} />
            <TaskbarIcon icon={<div className="w-5 h-4 bg-yellow-400 rounded-[2px] border-t-2 border-yellow-200 shadow-sm relative"><div className="absolute -top-1 left-0 w-2 h-1 bg-yellow-400 rounded-t-[2px]"></div></div>} />
        </div>

        {/* Right System Tray */}
        <div className="flex-1 flex items-center justify-end gap-1.5">
            {/* Overflow Menu */}
            <div className="flex items-center justify-center hover:bg-white/10 w-6 h-8 rounded transition-colors cursor-default">
                <ChevronUp size={16} className="text-white/80" />
            </div>

            {/* Quick Settings Group */}
            <div className="flex items-center gap-2.5 hover:bg-white/10 px-3 h-8 rounded-md transition-colors cursor-default border border-transparent hover:border-white/5">
                <Wifi size={16} className="text-white/90" />
                <Volume2 size={16} className="text-white/90" />
                <Battery size={16} className="text-white/90 rotate-90" />
            </div>
            
            {/* Clock & Date */}
            <div className="flex flex-col items-end justify-center hover:bg-white/10 px-2 h-8 rounded-md transition-colors cursor-default min-w-[70px]">
                <span className="text-white text-xs font-medium leading-none mb-[2px]">{timeString}</span>
                <span className="text-white text-[10px] leading-none">{dateString}</span>
            </div>

            {/* Bell / Notification */}
            <div className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer ml-1">
                 <Bell size={16} className="text-white/90" />
            </div>
            
            {/* Show Desktop Sliver */}
            <div className="w-[2px] h-4 bg-white/20 ml-1 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const TaskbarIcon = ({ icon }: { icon: React.ReactNode }) => (
    <div className="w-10 h-10 flex items-center justify-center rounded-[4px] hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all duration-200 cursor-pointer">
        {icon}
    </div>
);

export default Desktop;