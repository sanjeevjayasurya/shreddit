import { useEffect, useRef } from "react";
import { useShredder } from "@/lib/ShredderContext";

const ShredderMachine = () => {
  const { shredMode, isShredding, progress, isShreddingComplete, documentRef } = useShredder();
  const shreddedPiecesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isShredding && progress > 50 && !isShreddingComplete) {
      createShredded();
    }
  }, [isShredding, progress, isShreddingComplete]);

  const createShredded = () => {
    if (!shreddedPiecesRef.current) return;
    shreddedPiecesRef.current.innerHTML = '';
    
    // Number of pieces depends on shred mode
    const piecesCount = shredMode === 'strip' ? 12 : (shredMode === 'cross' ? 40 : 30);
    
    for (let i = 0; i < piecesCount; i++) {
      const piece = document.createElement('div');
      
      if (shredMode === 'strip') {
        // Create vertical strips
        piece.className = 'paper-strip';
        piece.style.height = '80px';
        piece.style.left = `${(i * 10) + 40}px`;
        piece.style.backgroundColor = i % 3 === 0 ? '#f0f0f0' : '#ffffff';
        piece.style.setProperty('--rotation', `${Math.random() * 30 - 15}deg`);
      } else if (shredMode === 'cross') {
        // Create small rectangles
        piece.className = 'confetti';
        piece.style.height = '12px';
        piece.style.width = '8px';
        piece.style.left = `${Math.random() * 200 + 40}px`;
        piece.style.backgroundColor = i % 5 === 0 ? '#e0e0e0' : '#ffffff';
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        piece.style.animationDelay = `${Math.random() * 0.5}s`;
      } else {
        // Crazy cut - irregular shapes
        piece.className = 'confetti';
        piece.style.height = `${Math.random() * 15 + 5}px`;
        piece.style.width = `${Math.random() * 15 + 5}px`;
        piece.style.left = `${Math.random() * 200 + 40}px`;
        piece.style.backgroundColor = i % 7 === 0 ? '#e0e0e0' : (i % 5 === 0 ? '#f5f5f5' : '#ffffff');
        piece.style.borderRadius = `${Math.random() * 5}px`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        piece.style.animationDelay = `${Math.random() * 0.8}s`;
      }
      
      shreddedPiecesRef.current.appendChild(piece);
    }
    
    // Hide the original document
    if (documentRef.current) {
      setTimeout(() => {
        if (documentRef.current) {
          documentRef.current.style.display = 'none';
        }
      }, 500);
    }
  };

  return (
    <div id="shredderContainer" className="shredder-container relative mb-8">
      {/* Shredder machine with face */}
      <div className="shredder w-80 h-96 mx-auto relative">
        {/* Shredder body */}
        <div className="shredder-body bg-secondary rounded-3xl w-80 h-72 shadow-lg relative overflow-hidden flex flex-col">
          {/* Shredder face */}
          <div className="shredder-face absolute w-full flex justify-center pt-6">
            {/* Eyes */}
            <div className="flex space-x-12">
              <div className="eye w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className={`pupil w-4 h-4 bg-dark rounded-full ${isShredding ? 'animate-pulse' : ''}`}></div>
              </div>
              <div className="eye w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className={`pupil w-4 h-4 bg-dark rounded-full ${isShredding ? 'animate-pulse' : ''}`}></div>
              </div>
            </div>
          </div>
          
          {/* Shredder mouth/slot */}
          <div className="shredder-mouth w-60 h-8 bg-dark rounded-lg mx-auto mt-24 shadow-inner flex items-center justify-center overflow-hidden">
            <div className="shredder-teeth flex">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className={`tooth w-1 h-8 bg-gray-600 mx-1 ${isShredding ? 'animate-spin-slow' : ''}`}></div>
              ))}
            </div>
          </div>
          
          {/* Shredder collection bin */}
          <div className="flex-grow bg-gray-700 mt-4 relative overflow-hidden" id="shredBin">
            {/* Shredded pieces will appear here dynamically */}
            <div ref={shreddedPiecesRef} className="absolute w-full h-full"></div>
          </div>
        </div>
        
        {/* Shredder base/stand */}
        <div className="shredder-base w-64 h-12 bg-gray-800 rounded-b-3xl mx-auto shadow-lg"></div>
      </div>
    </div>
  );
};

export default ShredderMachine;
