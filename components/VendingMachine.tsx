
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Image as ImageIcon } from 'lucide-react';
import { WordData, WORDS } from '../data';
import { Cookie } from './Cookie';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

// Sound Logic
const playSound = (type: 'click' | 'spin' | 'pop' | 'print') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'click') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'spin') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(200, now + 0.2);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'pop') {
            osc.disconnect();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
            notes.forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = freq;
                o.connect(g);
                g.connect(ctx.destination);
                
                const start = now + (i * 0.05);
                g.gain.setValueAtTime(0, start);
                g.gain.linearRampToValueAtTime(0.1, start + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
                
                o.start(start);
                o.stop(start + 0.3);
            });
        } else if (type === 'print') {
           // Shutter sound effect
           osc.type = 'triangle';
           osc.frequency.setValueAtTime(800, now);
           osc.frequency.linearRampToValueAtTime(100, now + 0.1);
           gain.gain.setValueAtTime(0.1, now);
           gain.gain.linearRampToValueAtTime(0, now + 0.1);
           osc.start(now);
           osc.stop(now + 0.1);
        }
    } catch (e) {
        console.error("Sound play failed", e);
    }
};

// Photo Card Template (Premium Vertical Style)
const PhotoCardTemplate = React.forwardRef<HTMLDivElement, { word: WordData | null, date: string, isLucky?: boolean }>(({ word, date, isLucky }, ref) => {
    if (!word) return null;

    // ROBUST STROKE FIX: Use multiple text-shadows instead of WebkitTextStroke.
    const cookieStyle = {
        color: '#FACC15',
        textShadow: `
            3px 3px 0 #000,
            -1px -1px 0 #000,  
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000
        `, 
    };

    const renderStaticCookies = () => {
        const chars = word.ko.split('');
        if (chars.length >= 4) {
            const split = Math.ceil(chars.length / 2);
            const top = chars.slice(0, split);
            const bottom = chars.slice(split);
            return (
                <div className="flex flex-col items-center leading-none gap-2"> {/* Reduced gap */}
                    <div className="flex gap-2">{top.map((c, i) => <span key={i} className="font-korean text-5xl" style={cookieStyle}>{c}</span>)}</div> {/* text-6xl -> text-5xl */}
                    <div className="flex gap-2">{bottom.map((c, i) => <span key={i} className="font-korean text-5xl" style={cookieStyle}>{c}</span>)}</div> {/* text-6xl -> text-5xl */}
                </div>
            );
        }
        return (
            <div className="flex gap-2">
                {chars.map((c, i) => <span key={i} className="font-korean text-7xl" style={cookieStyle}>{c}</span>)}
            </div>
        );
    };

    // LUCKY GOLD THEME
    const bgClass = isLucky 
        ? "bg-gradient-to-br from-yellow-600 via-yellow-400 to-yellow-700"
        : "bg-[#2E1065]";
    
    return (
        <div ref={ref} className={`w-[340px] h-[540px] ${bgClass} relative flex flex-col rounded-[30px] overflow-hidden`}>
            
            {/* Glow Background (Standard Only) */}
            {!isLucky && (
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[80%] bg-[#4c1d95] rounded-full blur-[80px] opacity-60 pointer-events-none"></div>
            )}
            
            {/* 1. VISUAL ZONE */}
            <div className="h-[55%] w-full relative flex flex-col items-center pt-8 z-10">
                {/* Brand Header */}
                <div className={`${isLucky ? 'bg-black text-[#FACC15]' : 'bg-white/10 text-white/80'} px-5 py-2 rounded-full border border-white/10 backdrop-blur-sm mb-4`}>
                    <span className="text-xs tracking-[0.3em] font-black uppercase">
                        {isLucky ? "★ GOLDEN TICKET ★" : "HANGEUL KWAJA"}
                    </span>
                </div>

                {/* Cookie Word - TOP ANCHORED to prevent overlapping bottom */}
                {/* justify-start + pt-4 ensures it hangs from top and doesn't grow down into the pill */}
                <div className="flex-1 flex items-start justify-center pt-4 w-full">
                     {renderStaticCookies()}
                </div>
            </div>

            {/* 2. INFO ZONE (Floating Card) */}
            <div className="absolute bottom-6 left-6 right-6 bg-white rounded-[24px] p-6 shadow-2xl z-20 flex flex-col items-center text-center">
                
                {/* Romaji Pill */}
                <div className="absolute -top-5 bg-black text-[#FACC15] px-6 py-2 rounded-full border-4 border-[#FACC15] shadow-lg">
                    <span className="text-lg font-black tracking-widest uppercase">{word.romaji}</span>
                </div>

                <div className="mt-4 space-y-3 w-full">
                    {/* Definition */}
                    <div className="border-b-2 border-gray-100 pb-3">
                        <h2 className="font-black text-black text-4xl leading-none tracking-tight">{word.en}</h2>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{word.desc}</p>
                    </div>

                    {/* Sentence */}
                    <div className="bg-gray-50 p-3 rounded-xl w-full">
                         <p className="text-gray-800 font-medium text-sm italic leading-tight">
                            "{word.sentence}"
                        </p>
                    </div>
                </div>

                {/* Footer Date */}
                <div className="mt-4 text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">
                    {date} • ORIGINAL
                </div>
            </div>

            {/* Lucky Confetti Overlay */}
            {isLucky && (
                 <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#FFF 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
            )}
        </div>
    );
});

export const VendingMachine: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLucky, setIsLucky] = useState(false);
  const [availableIndices, setAvailableIndices] = useState<number[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    resetDeck();
  }, []);

  const resetDeck = () => {
    const indices = Array.from({ length: WORDS.length }, (_, i) => i);
    setAvailableIndices(indices);
  };

  const handleDispense = () => {
    if (isSpinning) return;
    
    playSound('click');
    playSound('spin');
    setIsSpinning(true);
    setCurrentWord(null); 
    setIsLucky(false);

    setTimeout(() => {
      let nextIndices = [...availableIndices];
      
      if (nextIndices.length === 0) {
        nextIndices = Array.from({ length: WORDS.length }, (_, i) => i);
      }

      const randomIndexInPool = Math.floor(Math.random() * nextIndices.length);
      const selectedWordIndex = nextIndices[randomIndexInPool];
      
      // Lucky Logic (10% Chance)
      const luckyChance = Math.random() < 0.1;
      setIsLucky(luckyChance);

      nextIndices.splice(randomIndexInPool, 1);
      
      setAvailableIndices(nextIndices);
      setCurrentWord(WORDS[selectedWordIndex]);
      
      setIsSpinning(false);
      playSound('pop');
      
      confetti({
        particleCount: luckyChance ? 300 : 150,
        spread: luckyChance ? 120 : 80,
        origin: { y: 0.6 },
        colors: luckyChance ? ['#FFD700', '#FACC15', '#FFFFFF'] : ['#FACC15', '#FFFFFF', '#000000']
      });

    }, 800);
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !currentWord) return;
    
    setIsDownloading(true);
    playSound('click');
    playSound('print');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for render
        
        const canvas = await html2canvas(receiptRef.current, {
            scale: 3, // High resolution
            backgroundColor: null,
            useCORS: true,
            logging: false,
            windowWidth: 1600, // Enforce desktop context
        });
        
        const link = document.createElement('a');
        link.download = `hangeul-card-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Card generation failed", err);
        alert("Image generation failed. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  const renderCookies = (word: WordData) => {
    const chars = word.ko.split('');
    const len = chars.length;

    if (len >= 4) {
      const splitIndex = Math.ceil(len / 2);
      const topRow = chars.slice(0, splitIndex);
      const bottomRow = chars.slice(splitIndex);

      return (
        <div className="flex flex-col gap-1 items-center -space-y-4">
           <div className="flex gap-1">
              {topRow.map((char, i) => (
                <Cookie key={`top-${i}`} char={char} delay={i * 0.1} />
              ))}
           </div>
           <div className="flex gap-1">
              {bottomRow.map((char, i) => (
                <Cookie key={`btm-${i}`} char={char} delay={(splitIndex + i) * 0.1} />
              ))}
           </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-2">
        {chars.map((char, index) => (
          <Cookie 
            key={`${word.ko}-${index}`} 
            char={char} 
            delay={index * 0.1} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[420px] mx-auto relative group">
      <div className="absolute inset-0 bg-black rounded-[2.5rem] translate-x-4 translate-y-4 md:translate-x-5 md:translate-y-5"></div>

      <div className={`
        rounded-[2.5rem] border-[6px] border-black relative overflow-hidden flex flex-col transition-colors duration-500
        ${isLucky ? 'bg-yellow-500' : 'bg-yellow-400'}
      `}>
        
        {/* Header */}
        <div className={`p-4 text-center border-b-[6px] border-black flex items-center justify-between px-6 ${isLucky ? 'bg-yellow-500' : 'bg-yellow-400'}`}>
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
            </div>
            <span className="font-black text-black text-lg tracking-widest uppercase">
                {isLucky ? "★ LUCKY DRAW ★" : "TODAY'S WORD"}
            </span>
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-black"></div>
            </div>
        </div>

        {/* Display Screen */}
        <div className="relative min-h-[26rem] bg-purple-50 flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-10" 
                style={{ 
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                }}>
            </div>
            
            <AnimatePresence mode="wait">
              {isSpinning ? (
                 <motion.div
                 key="loader"
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 className="flex flex-col items-center gap-4 z-10"
               >
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="p-4 bg-black rounded-full"
                 >
                    <RefreshCw className="w-10 h-10 text-yellow-400" />
                 </motion.div>
                 <span className="text-black font-black text-xl tracking-widest animate-pulse">BAKING...</span>
               </motion.div>
              ) : currentWord ? (
                <div className="flex flex-col items-center justify-between w-full h-full py-2 z-10 gap-3">
                  
                  <div className="flex-1 flex items-center justify-center w-full min-h-[140px] scale-110">
                     {renderCookies(currentWord)}
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full space-y-3"
                  >
                    {/* Result Info Box */}
                    <div className={`border-4 border-black p-3 pb-4 rounded-xl text-center shadow-[4px_4px_0_rgba(0,0,0,0.15)] relative ${isLucky ? 'bg-yellow-200' : 'bg-white'}`}>
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-yellow-400 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                            {currentWord.romaji.toUpperCase()}
                         </div>
                        <h2 className="text-2xl font-black text-black mt-1 leading-tight">{currentWord.en}</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">{currentWord.desc}</p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="relative text-center px-2 py-1">
                            <p className="text-purple-900 font-medium text-sm md:text-base leading-snug italic">
                              "{currentWord.sentence}"
                            </p>
                        </div>
                        
                        <button 
                            onClick={handleDownloadReceipt}
                            disabled={isDownloading}
                            className={`
                                flex items-center gap-2 bg-white text-black text-xs font-black px-5 py-3 rounded-full border-2 border-black 
                                hover:bg-gray-100 active:scale-95 transition-all shadow-[2px_2px_0_black]
                                disabled:opacity-50 disabled:cursor-wait
                            `}
                        >
                            {isDownloading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>SAVING...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-4 h-4" />
                                    <span>SAVE CARD</span>
                                </>
                            )}
                        </button>
                    </div>

                  </motion.div>
                </div>
              ) : (
                <div className="text-center z-10">
                    <h3 className="text-4xl font-black text-black mb-2 tracking-tighter transform -rotate-2">PUSH<br/>START</h3>
                    <p className="text-gray-400 font-bold text-sm">Find your word</p>
                </div>
              )}
            </AnimatePresence>
        </div>

        {/* Control Panel */}
        <div className={`p-6 border-t-[6px] border-black relative transition-colors duration-500 ${isLucky ? 'bg-yellow-700' : 'bg-purple-800'}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-black/20"></div>

            <button
              onClick={handleDispense}
              disabled={isSpinning}
              className={`
                w-full group relative
                bg-black
                hover:bg-gray-900
                active:translate-y-2
                disabled:opacity-80 disabled:cursor-not-allowed
                text-yellow-400 font-black text-3xl tracking-widest uppercase
                py-6 rounded-xl shadow-[0_8px_0_rgba(0,0,0,0.5)] active:shadow-none
                transition-all duration-100 ease-out
                flex items-center justify-center gap-3 border-4 border-white
              `}
            >
               <Zap className={`w-8 h-8 fill-yellow-400 group-hover:scale-110 transition-transform ${isSpinning ? 'animate-pulse' : ''}`} />
               <span>{currentWord ? 'RETRY' : 'START'}</span>
            </button>
            
            <div className="mt-4 text-center">
                 <span className={`${isLucky ? 'text-yellow-200' : 'text-purple-300/50'} text-xs font-bold tracking-[0.2em]`}>
                    INSERT COIN TO PLAY
                 </span>
            </div>
        </div>
      </div>
      
      {/* HIDDEN CAPTURE ELEMENT (Z-Index Hiding Strategy) */}
      <div 
        style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            zIndex: -50,
            pointerEvents: 'none',
            visibility: 'visible' 
        }}
      >
         <PhotoCardTemplate 
            ref={receiptRef} 
            word={currentWord} 
            date={new Date().toLocaleDateString('ko-KR')} 
            isLucky={isLucky}
         />
      </div>
      
    </div>
  );
};
