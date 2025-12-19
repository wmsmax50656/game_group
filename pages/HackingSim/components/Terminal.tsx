import React, { useEffect, useState, useRef } from 'react';
import { audioService } from '../services/audioService';
import { LogEntry } from '../types';
import { Plus, Minus, Square, X, ChevronDown } from 'lucide-react';

interface TerminalProps {
  onComplete: () => void;
}

const HACKING_TEXTS = [
  "Microsoft Windows [Version 10.0.22631.3007]",
  "(c) Microsoft Corporation. All rights reserved.",
  "",
  "C:\\Users\\User\\Downloads> CloverPit_Cheat.exe",
  "[!] Verifying integrity...",
  "[+] Bypass detected. Injecting...",
  "Target: GameProcess.exe [PID: 4120]",
  "Hooking memory address 0x4A12B...",
  "Bypassing kernel level protection...",
  "Warning: Anti-cheat trigger disabled.",
  "Injecting payload: trojan.win32.agent",
  "Accessing System32 drivers...",
  "Downloading payload from 89.12.XX.XX...",
  "Stealing cached chrome_credentials...",
  "Capturing Discord Token...",
  "Scanning for crypto wallets...",
  "Wallet found: wallet.dat (BTC)",
  "Uploading wallet.dat...",
  "Encrypting User Documents...",
  "Encrypting User Pictures...",
  "Deleting Shadow Copies (vssadmin delete shadows /all)...",
  "CRITICAL_PROCESS_DIED",
  "Initiating System Crash..."
];

const Terminal: React.FC<TerminalProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      // Safety check to prevent index out of bounds
      if (currentIndex >= HACKING_TEXTS.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800); 
        return;
      }

      const currentText = HACKING_TEXTS[currentIndex];
      
      // Strict check for undefined
      if (currentText !== undefined) {
        setLogs(prev => [
            ...prev, 
            { id: Date.now() + Math.random(), text: currentText }
        ]);
      
        // Play sound only for actual logs, not empty lines
        if (currentText.length > 0) {
            audioService.playDataNoise();
        }
      }
      
      // Auto scroll
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

      currentIndex++;
    }, 120); 

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#0c0c0c]/90 border border-[#333] shadow-2xl flex flex-col rounded-lg overflow-hidden font-mono z-50 backdrop-blur-xl animate-in fade-in zoom-in duration-300 ring-1 ring-white/10">
      
      {/* Windows Terminal Tab Bar */}
      <div className="bg-[#202020]/50 h-[34px] flex items-center w-full select-none drag-none">
        
        {/* Active Tab */}
        <div className="h-full bg-[#0c0c0c]/80 flex items-center px-3 gap-2 min-w-[200px] border-r border-[#333] relative group rounded-t-lg mt-1 ml-1">
             <div className="w-2 h-full bg-blue-500 absolute left-0 top-0 hidden"></div>
             <span className="text-xs text-white font-medium">Administrator: Command Prompt</span>
             <X size={14} className="ml-auto text-white/50 hover:bg-white/20 hover:text-white rounded p-[1px] cursor-pointer" />
        </div>

        {/* New Tab Button */}
        <div className="h-full flex items-center px-2 hover:bg-white/10 cursor-pointer">
            <Plus size={14} className="text-white/70" />
        </div>

        <div className="flex-1 drag-region h-full"></div>

        {/* Dropdown Menu */}
        <div className="h-full flex items-center px-3 hover:bg-white/10 cursor-pointer">
            <ChevronDown size={14} className="text-white/70" />
        </div>

        {/* Window Controls */}
        <div className="flex items-start h-full self-start">
            <div className="h-full w-12 flex items-center justify-center hover:bg-white/10 text-white transition-colors cursor-pointer">
                <Minus size={16} />
            </div>
            <div className="h-full w-12 flex items-center justify-center hover:bg-white/10 text-white transition-colors cursor-pointer">
                <Square size={12} />
            </div>
            <div className="h-full w-12 flex items-center justify-center hover:bg-[#c42b1c] text-white transition-colors cursor-pointer">
                <X size={16} />
            </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto text-[#cccccc] text-base font-['Consolas','Monaco','Cascadia_Code','Courier_New'] leading-relaxed scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent bg-black/40"
      >
        {logs.map((log) => {
          // Guard clause against undefined log or text
          if (!log || typeof log.text !== 'string') return null;

          return (
            <div key={log.id} className="whitespace-pre-wrap break-all mb-0.5">
                {log.text.includes("C:\\") ? (
                    <span className="text-white">{log.text}</span>
                ) : log.text.startsWith("[!]") || log.text.includes("Warning") ? (
                    <span className="text-yellow-400">{log.text}</span>
                ) : log.text.startsWith("[+]") ? (
                    <span className="text-green-400">{log.text}</span>
                ) : log.text.includes("Error") || log.text.includes("CRITICAL") ? (
                    <span className="text-red-500 font-bold">{log.text}</span>
                ) : (
                    <span>{log.text}</span>
                )}
            </div>
          );
        })}
        <div className="animate-pulse text-white inline-block h-5 w-2.5 bg-white align-middle mt-1 ml-0.5"></div>
      </div>
    </div>
  );
};

export default Terminal;