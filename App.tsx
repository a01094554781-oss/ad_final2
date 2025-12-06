import React from 'react';
import { VendingMachine } from './components/VendingMachine';
import { ProductShowcase } from './components/ProductShowcase';

function App() {
  return (
    <div className="min-h-screen bg-[#2E1065] text-white pb-20 overflow-x-hidden relative selection:bg-yellow-400 selection:text-black">
      
      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#581c87] rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#000000] rounded-full blur-[100px] opacity-60"></div>
        
        {/* Yellow floating particles */}
        <div className="absolute top-[20%] right-[10%] w-4 h-4 bg-yellow-400 rounded-full blur-[2px] opacity-80 animate-pulse"></div>
        <div className="absolute bottom-[30%] left-[5%] w-6 h-6 bg-yellow-400 rounded-full blur-[4px] opacity-60"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl pt-8 md:pt-16 flex flex-col items-center">
        
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-tight">
            <span className="text-yellow-400">Hangeul</span> Vending
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-purple-200 font-bold tracking-wide">
            Get your word of the day!
          </p>
        </div>

        {/* The Machine */}
        <VendingMachine />

        {/* The "Ad" Content / Shortcut */}
        <ProductShowcase />

        {/* Simple Footer */}
        <footer className="mt-20 text-center text-purple-400/60 text-sm">
           <p className="font-bold">© HANGEUL KWAJA</p>
        </footer>

      </div>
    </div>
  );
}

export default App;