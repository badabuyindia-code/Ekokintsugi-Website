// src/components/PrebookingBanner.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PrebookingBannerProps {
  onPrebookClick: () => void;
}

const PrebookingBanner: React.FC<PrebookingBannerProps> = ({ onPrebookClick }) => {
  return (
    <div className="relative w-full overflow-hidden bg-yellow-400 text-black py-2 text-center text-sm font-semibold cursor-pointer z-50">
      <motion.div
        className="whitespace-nowrap"
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{
          x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' },
        }}
        onClick={onPrebookClick}
      >
        <span className="inline-block px-4">✨ Prebook Your Exclusive Piece Now! Limited Stock! ✨</span>
        <span className="inline-block px-4">✨ Prebook Your Exclusive Piece Now! Limited Stock! ✨</span>
        <span className="inline-block px-4">✨ Prebook Your Exclusive Piece Now! Limited Stock! ✨</span>
      </motion.div>
    </div>
  );
};

export default PrebookingBanner;
