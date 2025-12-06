import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const ProductShowcase: React.FC = () => {
  return (
    <div className="mt-12 w-full max-w-2xl mx-auto flex flex-col items-center px-6 text-center">
        
      <h3 className="text-yellow-400 font-black text-2xl md:text-3xl mb-6 tracking-wide drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
        Want real Hangeul Cookies?
      </h3>

      {/* Official Link Button */}
      <a 
        href="https://hangeulkwaja.com/?NaPm=ct%3Dmitw4ew1%7Cci%3Dcheckout%7Ctr%3Dds%7Ctrx%3Dnull%7Chk%3D7304ed45e84a232479073b6f5c5ccf40f557baaf" 
        target="_blank" 
        rel="noopener noreferrer"
        className="
            group relative
            flex items-center justify-center gap-3
            bg-white text-black 
            w-full md:w-auto
            px-8 py-4 
            rounded-full 
            font-black text-xl md:text-2xl 
            tracking-tight
            border-[4px] border-yellow-400
            hover:bg-yellow-400 hover:border-white hover:text-black
            transition-all duration-300
            shadow-[0_0_20px_rgba(250,204,21,0.3)]
            hover:shadow-[0_0_40px_rgba(250,204,21,0.6)]
        "
      >
        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
        <span>VISIT OFFICIAL STORE</span>
        <div className="bg-black text-white rounded-full p-1 group-hover:bg-white group-hover:text-black transition-colors ml-2">
            <ArrowRight className="w-5 h-5" />
        </div>
      </a>
      
    </div>
  );
};