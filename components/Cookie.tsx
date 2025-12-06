import React from 'react';
import { motion } from 'framer-motion';

interface CookieProps {
  char: string;
  delay: number;
  // flavor prop removed as we are sticking to one yellow style
}

export const Cookie: React.FC<CookieProps> = ({ char, delay }) => {
  
  // Single Yellow Style as requested
  const textStyles = {
    color: '#FACC15', // Bright Yellow
    WebkitTextStroke: '2.5px #000000', // Bold Black Outline
    textShadow: `
      3px 3px 0px #000000,
      rgba(0,0,0,0.2) 5px 5px 5px
    `
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -15, y: -50 }}
      animate={{ scale: 1, rotate: 0, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 12,
        delay: delay 
      }}
      className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28"
    >
      <span 
        className="font-korean text-7xl md:text-8xl select-none relative z-10"
        style={textStyles}
      >
        {char}
        
        {/* Highlight for plastic/shiny cookie surface */}
        <span className="absolute top-[8%] left-[8%] text-white opacity-40 text-7xl md:text-8xl pointer-events-none" style={{ textShadow: 'none', WebkitTextStroke: '0' }}>
          {char}
        </span>
      </span>
    </motion.div>
  );
};