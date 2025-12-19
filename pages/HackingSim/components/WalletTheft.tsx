
import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, Wallet, TrendingDown } from 'lucide-react';
import { audioService } from '../services/audioService';

interface WalletTheftProps {
  onComplete: () => void;
}

const WalletTheft: React.FC<WalletTheftProps> = ({ onComplete }) => {
  const [balance, setBalance] = useState(2000000000); // 2 Billion
  const TARGET_BALANCE = 20000000; // 20 Million

  useEffect(() => {
    // Animate drain
    const interval = setInterval(() => {
      setBalance(prev => {
        const drop = (prev - TARGET_BALANCE) * 0.2; // Move 20% closer each tick
        const next = prev - drop;
        
        if (Math.abs(next - TARGET_BALANCE) < 100000) {
           return next;
        }

        audioService.playCoinDrain(); // Play tick sound
        return next;
      });
    }, 50);

    // Close app after 4 seconds
    const timeout = setTimeout(onComplete, 4000);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
       <div className="w-[400px] h-[600px] bg-[#121212] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col text-white font-sans relative">
           {/* Header */}
           <div className="p-6 pb-2 flex justify-between items-center">
               <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                       <span className="font-bold text-lg">₿</span>
                   </div>
                   <span className="font-bold">MyCryptoWallet</span>
               </div>
               <Wallet className="text-gray-400" />
           </div>

           {/* Balance Section */}
           <div className="p-6 pt-10 flex flex-col items-center">
               <p className="text-gray-400 text-sm mb-1">Total Balance (KRW)</p>
               <h1 className="text-3xl font-bold tracking-tight text-white mb-2 tabular-nums">
                   ₩ {balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
               </h1>
               <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                   <TrendingDown size={12} />
                   <span>-99.0% (해킹 감지됨)</span>
               </div>
           </div>

           {/* Transaction History (Fake) */}
           <div className="flex-1 bg-[#1a1a1a] mt-8 rounded-t-3xl p-6">
               <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">Recent Transactions</h3>
               
               <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors border-l-2 border-red-500 bg-red-500/5">
                       <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                               <ArrowDownLeft className="text-red-500" />
                           </div>
                           <div>
                               <p className="font-bold text-sm text-red-400">외부 전송 (Unauthorized)</p>
                               <p className="text-xs text-gray-500">To: Unknown_Hacker_Addr</p>
                           </div>
                       </div>
                       <div className="text-right">
                           <p className="font-bold text-sm text-white">-1,980,000,000</p>
                           <p className="text-xs text-gray-500">KRW</p>
                       </div>
                   </div>
               </div>
           </div>
           
           {/* Overlay Alert */}
           <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none">
                <div className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
                    자금이 이체되고 있습니다!
                </div>
           </div>
       </div>
    </div>
  );
};

export default WalletTheft;
