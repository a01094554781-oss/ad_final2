import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import { WordData, WORDS } from '../data';
import { Cookie } from './Cookie';
import confetti from 'canvas-confetti';

export const VendingMachine: React.FC = () => {
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  // Removed flavor state to enforce yellow styling for all cookies
  
  // State to track which words haven't been shown yet
  const [availableIndices, setAvailableIndices] = useState<number[]>([]);

  // Initialize the "deck" of cards
  useEffect(() => {
    resetDeck();
  }, []);

  const resetDeck = () => {
    const indices = Array.from({ length: WORDS.length }, (_, i) => i);
    setAvailableIndices(indices);
  };

  const playSound = () => {
    // Placeholder for sound
  };

  const handleDispense = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setCurrentWord(null); 
    playSound();

    setTimeout(() => {
      // Logic to pick a unique word
      let nextIndices = [...availableIndices];
      
      // If we ran out of words, reset the deck so the game can continue
      if (nextIndices.length === 0) {
        nextIndices = Array.from({ length: WORDS.length }, (_, i) => i);
      }

      // Pick a random index from the available pool
      const randomIndexInPool = Math.floor(Math.random() * nextIndices.length);
      const selectedWordIndex = nextIndices[randomIndexInPool];
      
      // Remove the selected index from the pool
      nextIndices.splice(randomIndexInPool, 1);
      
      setAvailableIndices(nextIndices);
      setCurrentWord(WORDS[selectedWordIndex]);
      
      setIsSpinning(false);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#FFFFFF', '#000000']
      });

    }, 800);
  };

  const renderCookies = (word: WordData) => {
    const chars = word.ko.split('');
    const len = chars.length;

    // Split logic: breaks nicely for 4 chars (2x2), 5 chars (3x2 or 2x3)
    // For simplicity, if >= 4 chars, we split into two rows.
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

    // Default single row
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
      {/* Retro 3D decorative back panel */}
      <div className="absolute inset-0 bg-black rounded-[2.5rem] translate-x-4 translate-y-4 md:translate-x-5 md:translate-y-5"></div>

      {/* Machine Frame */}
      <div className="bg-yellow-400 rounded-[2.5rem] border-[6px] border-black relative overflow-hidden flex flex-col">
        
        {/* Top Header Panel */}
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

        {/* Display Area */}
        <div className="relative min-h-[26rem] bg-purple-50 flex items-center justify-center p-6 overflow-hidden">
            {/* Grid Pattern */}
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
                  
                  {/* The Cookies (Word) */}
                  <div className="flex-1 flex items-center justify-center w-full min-h-[140px]">
                     {renderCookies(currentWord)}
                  </div>
                  
                  {/* Info Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full space-y-3"
                  >
                    {/* Word Meaning */}
                    <div className="bg-white border-4 border-black p-3 pb-4 rounded-xl text-center shadow-[4px_4px_0_rgba(0,0,0,0.15)] relative">
                         <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-yellow-400 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                            {currentWord.romaji.toUpperCase()}
                         </div>
                        <h2 className="text-2xl font-black text-black mt-1 leading-tight">{currentWord.en}</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">{currentWord.desc}</p>
                    </div>

                    {/* Inspiring Sentence */}
                    <div className="relative text-center px-2 py-1">
                        <p className="text-purple-900 font-medium text-sm md:text-base leading-snug italic">
                          "{currentWord.sentence}"
                        </p>
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
        <div className="bg-purple-800 p-6 border-t-[6px] border-black relative">
            {/* Stripe decoration */}
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
    </div>
  );
};