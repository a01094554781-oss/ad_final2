
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

// Photo Card Template
const PhotoCardTemplate = React.forwardRef<HTMLDivElement, { word: WordData | null, date: string }>(({ word, date }, ref) => {
    if (!word) return null;

    // Static style for canvas rendering (Framer Motion doesn't capture well in html2canvas)
    const cookieStyle = {
        color: '#FACC15',
        WebkitTextStroke: '2.5px #000000',
        textShadow: '2px 2px 0px #000000',
    };

    const renderStaticCookies = () => {
        const chars = word.ko.split('');
        if (chars.length >= 4) {
            const split = Math.ceil(chars.length / 2);
            const top = chars.slice(0, split);
            const bottom = chars.slice(split);
            return (
                <div className="flex flex-col items-center leading-none gap-2">
                    {/* Reduced text size to text-5xl to prevent overlap */}
                    <div className="flex gap-1">{top.map((c, i) => <span key={i} className="font-korean text-5xl" style={cookieStyle}>{c}</span>)}</div>
                    <div className="flex gap-1">{bottom.map((c, i) => <span key={i} className="font-korean text-5xl" style={cookieStyle}>{c}</span>)}</div>
                </div>
            );
        }
        return (
            <div className="flex gap-1">
                {/* Reduced text size to text-6xl */}
                {chars.map((c, i) => <span key={i} className="font-korean text-6xl" style={cookieStyle}>{c}</span>)}
            </div>
        );
    };

    return (
        <div ref={ref} className="w-[340px] h-[520px] bg-[#2E1065] relative flex flex-col items-center p-6 border-[8px] border-[#FACC15] rounded-[24px] overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20" style={{ 
                backgroundImage: 'radial-gradient(#FACC15 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}></div>

            {/* Header */}
            <div className="relative z-10 flex flex-col items-center mt-2">
                <div className="font-korean text-3xl text-[#FACC15] drop-shadow-[2px_2px_0_#000]">한글과자</div>
                <div className="text-white/60 text-[10px] tracking-[0.4em] font-bold">HANGEUL KWAJA</div>
            </div>

            {/* Main Visual - Increased spacing gap-10 */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-4 gap-10">
                {renderStaticCookies()}
                
                <div className="bg-black text-[#FACC15] px-6 py-2 rounded-full text-sm font-black tracking-[0.2em] border-2 border-white/20 mt-2">
                    {word.romaji.toUpperCase()}
                </div>
            </div>

            {/* Footer */}
            <div className="w-full bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20 relative z-10">
                 <h2 className="text-white font-black text-2xl text-center mb-1 drop-shadow-md">{word.en}</h2>
                 <p className="text-[#FACC15] text-center text-xs font-bold uppercase tracking-wider mb-3 opacity-90">{word.desc}</p>
                 <div className="w-full h-px bg-white/20 mb-3"></div>
                 <p className="text-white text-center text-sm italic leading-snug opacity-90">"{word.sentence}"</p>
            </div>

            <div className="mt-4 text-white/30 text-[10px] tracking-widest font-bold">
                {date} • ORIGINAL
            </div>
        </div>
    );
});

export const VendingMachine: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [availableIndices, setAvailableIndices] = useState<number[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);

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

    setTimeout(() => {
      let nextIndices = [...availableIndices];
      
      if (nextIndices.length === 0) {
        nextIndices = Array.from({ length: WORDS.length }, (_, i) => i);
      }

      const randomIndexInPool = Math.floor(Math.random() * nextIndices.length);
      const selectedWordIndex = nextIndices[randomIndexInPool];
      
      nextIndices.splice(randomIndexInPool, 1);
      
      setAvailableIndices(nextIndices);
      setCurrentWord(WORDS[selectedWordIndex]);
      
      setIsSpinning(false);
      playSound('pop');
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#FFFFFF', '#000000']
      });

    }, 800);
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || !currentWord) return;
    playSound('click');
    playSound('print');
    
    try {
        // Force the element to be visible for capture if needed, though off-screen placement usually suffices
        const canvas = await html2canvas(receiptRef.current, {
            scale: 2,
            backgroundColor: null,
            useCORS: true,
            logging: false,
        });
        
        const link = document.createElement('a');
        link.download = `hangeul-card-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Card generation failed", err);
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

      <div className="bg-yellow-400 rounded-[2.5rem] border-[6px] border-black relative overflow-hidden flex flex-col">
        
        <div className="bg-yellow-400 p-4 text-center border-b-[6px] border-black flex items-center justify-between px-6">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
            </div>
            <span className="font-black text-black text-lg tracking-widest uppercase">TODAY'S WORD</span>
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-black"></div>
            </div>
        </div>

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
                  
                  <div className="flex-1 flex items-center justify-center w-full min-h-[140px]">
                     {renderCookies(currentWord)}
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full space-y-3"
                  >
                    <div className="bg-white border-4 border-black p-3 pb-4 rounded-xl text-center shadow-[4px_4px_0_rgba(0,0,0,0.15)] relative">
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
                            className="flex items-center gap-2 bg-white text-black text-xs font-black px-4 py-2 rounded-full border-2 border-black hover:bg-gray-100 active:scale-95 transition-all shadow-[2px_2px_0_black]"
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span>SAVE CARD</span>
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

        <div className="bg-purple-800 p-6 border-t-[6px] border-black relative">
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
                py-6 rounded-xl shadow-[0_8px_0_#3b0764] active:shadow-none
                transition-all duration-100 ease-out
                flex items-center justify-center gap-3 border-4 border-white
              `}
            >
               <Zap className="w-8 h-8 fill-yellow-400 group-hover:scale-110 transition-transform" />
               <span>{currentWord ? 'RETRY' : 'START'}</span>
            </button>
            
            <div className="mt-4 text-center">
                 <span className="text-purple-300/50 text-xs font-bold tracking-[0.2em]">INSERT COIN TO PLAY</span>
            </div>
        </div>
      </div>
      
      {/* Hidden Card Element for Capture - MOVED OFF-SCREEN (Not opacity 0) to allow correct rendering */}
      <div 
        style={{ 
            position: 'fixed', 
            top: 0, 
            left: '-9999px', 
            zIndex: -50 
        }}
      >
         <PhotoCardTemplate 
            ref={receiptRef} 
            word={currentWord} 
            date={new Date().toLocaleDateString('ko-KR')} 
         />
      </div>
      
    </div>
  );
};
