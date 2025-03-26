import { useState, useEffect, useRef } from "react";
import { useShredder } from "@/lib/ShredderContext";

const ShredderMachine = () => {
  const { file, shredMode, isShredding, progress, isShreddingComplete, documentRef } = useShredder();
  const shreddedPiecesRef = useRef<HTMLDivElement>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  
  // Get document image when file changes
  useEffect(() => {
    if (file && file.type.includes('image')) {
      const url = URL.createObjectURL(file);
      setDocumentImage(url);
      
      // Clean up URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setDocumentImage(null);
    }
  }, [file]);
  
  // Create shreds when shredding is started
  useEffect(() => {
    if (isShredding && !isShreddingComplete) {
      // Create shreds immediately upon shredding
      setTimeout(() => {
        createShredded();
      }, 800); // Wait for document to enter the shredder
    }
  }, [isShredding, isShreddingComplete]);

  const createShredded = () => {
    if (!shreddedPiecesRef.current) return;
    shreddedPiecesRef.current.innerHTML = '';
    
    // Get document dimensions
    const width = 180; // Standard document width
    const height = 250; // Standard document height
    
    // Get document background (from image if available)
    let bgImageUrl = documentImage;
    
    // Number of pieces depends on shred mode
    const piecesCount = shredMode === 'strip' ? 15 : (shredMode === 'cross' ? 42 : 36);
    
    // Distribute pieces over document width
    const stripWidth = shredMode === 'strip' ? width / piecesCount : null;
    
    // Center the pieces in the bin
    const containerWidth = shreddedPiecesRef.current.offsetWidth;
    const startX = (containerWidth - width) / 2;
    
    for (let i = 0; i < piecesCount; i++) {
      const piece = document.createElement('div');
      
      if (shredMode === 'strip') {
        // Create vertical strips that look like the document
        piece.className = 'paper-strip';
        const stripLeft = (i * (stripWidth || 10));
        
        // Styling
        piece.style.width = `${stripWidth}px`;
        piece.style.height = `${height}px`;
        piece.style.left = `${startX + stripLeft}px`;
        piece.style.position = 'absolute';
        piece.style.top = `-${height}px`; // Start above the bin
        piece.style.backgroundColor = '#ffffff';
        piece.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        piece.style.zIndex = '2';
        
        // If we have an image, use it as background
        if (bgImageUrl) {
          piece.style.backgroundImage = `url(${bgImageUrl})`;
          piece.style.backgroundSize = `${width}px ${height}px`;
          piece.style.backgroundPosition = `-${stripLeft}px 0`;
        } else {
          // Document-like appearance if no image
          if (i % 5 === 0) {
            const line = document.createElement('div');
            line.style.height = '2px';
            line.style.width = '80%';
            line.style.backgroundColor = '#e0e0e0';
            line.style.margin = '8px auto';
            piece.appendChild(line);
          }
          if (i % 3 === 0) {
            const line = document.createElement('div');
            line.style.height = '2px';
            line.style.width = '60%';
            line.style.backgroundColor = '#e0e0e0';
            line.style.margin = '16px auto';
            piece.appendChild(line);
          }
          if (i % 7 === 0) {
            const line = document.createElement('div');
            line.style.height = '2px';
            line.style.width = '70%';
            line.style.backgroundColor = '#e0e0e0';
            line.style.margin = '30px auto';
            piece.appendChild(line);
          }
        }
        
        // Animation for falling
        piece.style.animation = `shred-fall-strip 1.5s ease-in ${i * 0.05}s forwards`;
        piece.style.setProperty('--rotation', `${Math.random() * 30 - 15}deg`);
      } else if (shredMode === 'cross') {
        // Create small rectangles from document in a grid
        piece.className = 'shredded-piece';
        
        // Position across the document width in a grid
        const cols = 6;
        const rows = 7;
        const pieceWidth = width / cols;
        const pieceHeight = height / rows;
        const row = Math.floor(i / cols);
        const col = i % cols;
        const pieceLeft = col * pieceWidth;
        const pieceTop = row * pieceHeight;
        
        // Styling for small rectangles
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.style.position = 'absolute';
        piece.style.left = `${startX + (Math.random() * width * 0.8)}px`;
        piece.style.top = `-${height * 0.8}px`;
        piece.style.backgroundColor = '#ffffff';
        piece.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        piece.style.zIndex = '2';
        
        // Background image if available
        if (bgImageUrl) {
          piece.style.backgroundImage = `url(${bgImageUrl})`;
          piece.style.backgroundSize = `${width}px ${height}px`;
          piece.style.backgroundPosition = `-${pieceLeft}px -${pieceTop}px`;
        }
        
        // Rotation for flying pieces
        const rotation = Math.random() * 360;
        const delay = Math.random() * 0.5;
        piece.style.animation = `shred-fall-cross 2s ease-in ${delay}s forwards`;
        piece.style.transform = `rotate(${rotation}deg)`;
      } else {
        // Crazy cut - irregular shapes but still from document
        piece.className = 'shredded-piece';
        
        // Random size and position
        const pieceWidth = Math.random() * 20 + 10;
        const pieceHeight = Math.random() * 20 + 10;
        
        // Styling
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.style.position = 'absolute';
        piece.style.left = `${startX + (Math.random() * width * 0.9)}px`;
        piece.style.top = `-${height}px`;
        piece.style.backgroundColor = '#ffffff';
        piece.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        piece.style.borderRadius = `${Math.random() * 5}px`;
        piece.style.zIndex = '2';
        
        // Random position in the document for background image
        const pieceLeft = Math.random() * (width - pieceWidth);
        const pieceTop = Math.random() * (height - pieceHeight);
        
        // Background image if available
        if (bgImageUrl) {
          piece.style.backgroundImage = `url(${bgImageUrl})`;
          piece.style.backgroundSize = `${width}px ${height}px`;
          piece.style.backgroundPosition = `-${pieceLeft}px -${pieceTop}px`;
        }
        
        // Animation
        const rotation = Math.random() * 720 - 360;
        const delay = Math.random() * 0.8;
        piece.style.animation = `shred-fall-crazy 2.5s ease-in ${delay}s forwards`;
        piece.style.transform = `rotate(${rotation}deg)`;
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
