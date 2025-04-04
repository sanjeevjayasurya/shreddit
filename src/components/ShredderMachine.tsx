import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import { useShredder } from "@/lib/ShredderContext";
import { formatFileSize } from "@/lib/utils";

// Define piece config types for better TypeScript support
type BasePieceConfig = {
  width: number;
  height: number;
  left: number;
  top: number;
  backgroundX: number;
  backgroundY: number;
  rotation: number;
  delay: number;
  type: string;
};

type StripPieceConfig = BasePieceConfig & {
  type: 'strip';
};

type CrossPieceConfig = BasePieceConfig & {
  type: 'cross';
  row: number;
  col: number;
};

type CrazyPieceConfig = BasePieceConfig & {
  type: 'crazy';
  borderRadius: number;
};

type PieceConfig = StripPieceConfig | CrossPieceConfig | CrazyPieceConfig;

const ShredderMachine = () => {
  const { file, shredMode, isShredding, progress, isShreddingComplete, documentRef, setFile, resetShredder } = useShredder();
  const shreddedPiecesRef = useRef<HTMLDivElement>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentAnimClass, setDocumentAnimClass] = useState("");
  
  // Debug shreddedPiecesRef on mount
  useEffect(() => {
    console.log("Shredder mounted, shreddedPiecesRef:", shreddedPiecesRef.current);
  }, []);
  
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
    console.log("Shredding state changed:", isShredding, isShreddingComplete);
    if (isShredding && !isShreddingComplete) {
      console.log("Starting shred animation!");
      // Create shreds immediately upon shredding
      setTimeout(() => {
        console.log("Creating shredded pieces now");
        createShredded();
      }, 800); // Wait for document to enter the shredder
    }
  }, [isShredding, isShreddingComplete]);

  // Handle animation state for document
  useEffect(() => {
    if (isShredding && !isShreddingComplete) {
      setDocumentAnimClass("document-falling");
    } else if (!isShredding) {
      setDocumentAnimClass("");
    }
  }, [isShredding, isShreddingComplete]);

  const createShredded = () => {
    console.log("createShredded called, file:", file?.name);
    if (!shreddedPiecesRef.current) {
      console.error("No shredded pieces container found!");
      return;
    }
    if (!file) {
      console.error("No file to shred!");
      return;
    }
    console.log("Starting to create shredded pieces");
    
    // Create a container div for this batch of shredded pieces
    const batchContainer = document.createElement('div');
    batchContainer.className = 'shredded-batch';
    batchContainer.style.position = 'absolute';
    batchContainer.style.width = '100%';
    batchContainer.style.height = '100%';
    batchContainer.style.zIndex = '5';
    batchContainer.style.pointerEvents = 'none';
    
    // Standard A4 paper aspect ratio for the document
    const width = 210; // Width in mm (scaled down)
    const height = 297; // Height in mm (scaled down)
    
    // Get document background (from image if available)
    let bgImageUrl = documentImage;
    
    // Get the container dimensions for better positioning
    const containerWidth = shreddedPiecesRef.current.offsetWidth;
    const containerHeight = shreddedPiecesRef.current.offsetHeight;
    
    // Center the document horizontally
    const startX = (containerWidth - width) / 2;
    
    // Calculate number of pieces based on shred mode
    let piecesConfig: PieceConfig[] = [];
    
    if (shredMode === 'strip') {
      // For strip cut: vertical strips
      const strips = 20; // Number of strips
      const stripWidth = width / strips;
      
      piecesConfig = Array(strips).fill(0).map((_, i) => ({
        width: stripWidth,
        height: height,
        left: startX + (i * stripWidth),
        top: -height,
        backgroundX: -(i * stripWidth),
        backgroundY: 0,
        rotation: Math.random() * 40 - 20,
        delay: i * 0.03,
        type: 'strip'
      } as StripPieceConfig));
    } 
    else if (shredMode === 'cross') {
      // For cross cut: grid of rectangles
      const cols = 7;
      const rows = 10;
      const pieceWidth = width / cols;
      const pieceHeight = height / rows;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          piecesConfig.push({
            width: pieceWidth,
            height: pieceHeight,
            left: startX + (col * pieceWidth),
            top: -pieceHeight,
            backgroundX: -(col * pieceWidth),
            backgroundY: -(row * pieceHeight),
            rotation: Math.random() * 180 - 90,
            delay: Math.random() * 0.3,
            type: 'cross',
            row: row,
            col: col
          } as CrossPieceConfig);
        }
      }
    } 
    else { // crazy mode
      // For crazy cut: random shaped pieces
      const pieces = 50; // More pieces for crazy mode
      
      for (let i = 0; i < pieces; i++) {
        // Random size between 15px and 40px
        const pieceWidth = Math.random() * 25 + 15;
        const pieceHeight = Math.random() * 25 + 15;
        
        // Random position within the document bounds
        const pieceLeft = startX + (Math.random() * (width - pieceWidth));
        const pieceTop = Math.random() * height * 0.2 - height; // Start slightly staggered
        
        // Random position in the original document for background image
        const backgroundX = -(Math.random() * (width - pieceWidth));
        const backgroundY = -(Math.random() * (height - pieceHeight));
        
        piecesConfig.push({
          width: pieceWidth,
          height: pieceHeight,
          left: pieceLeft,
          top: pieceTop,
          backgroundX: backgroundX,
          backgroundY: backgroundY,
          rotation: Math.random() * 720 - 360,
          delay: Math.random() * 0.5,
          type: 'crazy',
          borderRadius: Math.random() * 8
        } as CrazyPieceConfig);
      }
    }
    
    console.log("Creating", piecesConfig.length, "shredded pieces for mode:", shredMode);
    
    // Create and add all pieces to the DOM
    piecesConfig.forEach(config => {
      const piece = document.createElement('div');
      
      // Common styling for all pieces - make them very visible
      piece.style.position = 'absolute';
      piece.style.width = `${config.width}px`;
      piece.style.height = `${config.height}px`;
      piece.style.left = `${config.left}px`;
      piece.style.top = `${config.top}px`;
      piece.style.backgroundColor = '#ffffff';
      piece.style.border = '1px solid rgba(0, 0, 0, 0.3)'; // More subtle border
      piece.style.zIndex = '50'; // Make sure they're on top
      
      // Type guards for proper TypeScript type checking
      if (config.type === 'strip') {
        piece.className = 'paper-strip';
        piece.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        
        // Add document-like content if no image
        if (!bgImageUrl) {
          if (Math.random() > 0.6) {
            const line = document.createElement('div');
            line.style.height = '2px';
            line.style.width = '80%';
            line.style.backgroundColor = '#e0e0e0';
            line.style.margin = `${10 + Math.random() * 40}px auto`;
            piece.appendChild(line);
          }
        }
        
        // Animation for falling strips
        const horizontalShift = Math.random() * 80 - 40; // Move -40px to +40px horizontally
        piece.style.setProperty('--end-x', `${horizontalShift}px`);
        piece.style.setProperty('--end-y', `${containerHeight * 0.5 + Math.random() * 40}px`);
        piece.style.setProperty('--rotation', `${config.rotation}deg`);
        piece.style.animation = `shred-fall-strip 1.2s ease-in ${config.delay}s forwards`;
      } 
      else if (config.type === 'cross') {
        // We need to cast to get TypeScript to recognize the specific properties
        const crossConfig = config as CrossPieceConfig;
        piece.className = 'cross-piece';
        piece.style.boxShadow = '0 1px 2px rgba(0,0,0,0.12)';
        
        // Calculate end positions for scattering across the tray
        // Push pieces to the outside more based on their position from center
        const colFromCenter = Math.abs(crossConfig.col - 3); // 0-3
        const rowFromCenter = Math.abs(crossConfig.row - 5); // 0-5
        const distanceFromCenter = Math.sqrt(colFromCenter * colFromCenter + rowFromCenter * rowFromCenter);
        
        // More distance = more scatter
        const scatterFactor = 30 + distanceFromCenter * 15;
        const horizontalShift = ((crossConfig.col - 3) * scatterFactor) + (Math.random() * 40 - 20);
        const verticalShift = containerHeight * 0.3 + Math.random() * 60 + (crossConfig.row * 10);
        
        piece.style.setProperty('--end-x', `${horizontalShift}px`);
        piece.style.setProperty('--end-y', `${verticalShift}px`);
        piece.style.setProperty('--rotation', `${config.rotation}deg`);
        piece.style.animation = `shred-fall-cross 1.3s ease-in ${config.delay}s forwards`;
      } 
      else if (config.type === 'crazy') {
        // We need to cast to get TypeScript to recognize the specific properties
        const crazyConfig = config as CrazyPieceConfig;
        piece.className = 'crazy-piece';
        piece.style.boxShadow = '0 1px 3px rgba(0,0,0,0.15)';
        piece.style.borderRadius = `${crazyConfig.borderRadius}px`;
        
        // Even more random final positions for crazy mode
        const horizontalShift = Math.random() * containerWidth * 0.8 - containerWidth * 0.4;
        const verticalShift = containerHeight * 0.2 + Math.random() * (containerHeight * 0.6);
        
        piece.style.setProperty('--end-x', `${horizontalShift}px`);
        piece.style.setProperty('--end-y', `${verticalShift}px`);
        piece.style.setProperty('--rotation', `${config.rotation}deg`);
        piece.style.animation = `shred-fall-crazy 1.5s ease-in ${config.delay}s forwards`;
      }
      
      // Apply background image if available - for all piece types
      if (bgImageUrl) {
        piece.style.backgroundImage = `url(${bgImageUrl})`;
        piece.style.backgroundSize = `${width}px ${height}px`;
        piece.style.backgroundPosition = `${config.backgroundX}px ${config.backgroundY}px`;
      }
      
      // Add to batch container instead of directly to the shredded pieces container
      batchContainer.appendChild(piece);
    });

    // Add the batch container to the shredded pieces container
    if (shreddedPiecesRef.current) {
      shreddedPiecesRef.current.appendChild(batchContainer);
      console.log("Appended batch container with", piecesConfig.length, "pieces");
    } else {
      console.error("Failed to append batch container - shredded pieces ref is null");
    }
    
    // Hide the original document with a slight delay
    if (documentRef.current) {
      setTimeout(() => {
        if (documentRef.current) {
          documentRef.current.style.display = 'none';
        }
      }, 400);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    
    if (fileInput.files?.length) {
      const file = fileInput.files[0];
      validateAndSetFile(file);
      
      // Clear the input value to ensure onChange fires even if same file is selected again
      setTimeout(() => {
        if (fileInput) fileInput.value = '';
      }, 100);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!validTypes.includes(file.type)) {
      alert("Please select a JPG, or PNG file");
      return;
    }

    // Reset the shredder state first
    resetShredder();
    
    // Then set the new file
    setFile(file);
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();
    // Check if input exists and trigger click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    resetShredder();
  };

  return (
    <div className="w-full max-w-2xl mb-8 relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fallIntoShredder {
          0% {
            transform: translate(-50%, -300px);
            opacity: 1;
          }
          80% {
            transform: translate(-50%, 40px);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, 70px);
            opacity: 0;
          }
        }
        
        .document-container {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -300px);
          z-index: 50;
          width: 210px;
          height: 297px;
        }
        
        .document-falling {
          animation: fallIntoShredder 1.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        
        .document-wrapper {
          width: 100%;
          height: 100%;
          background-color: white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}} />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileSelect}
      />

      {/* Document animation container */}
      {file && !isShreddingComplete && (
        <div 
          ref={documentRef}
          className={`document-container ${documentAnimClass}`}
        >
          <div className="document-wrapper">
            <img
              src={URL.createObjectURL(file)}
              alt="Document"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <div 
        className={`shredder-machine ${isDragging ? 'border-4 border-dashed border-primary bg-primary/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        {/* Shredder machine with face */}
        <div className="shredder w-full max-w-4xl mx-auto relative h-[500px]">
          {/* Shredder body */}
          <div className="shredder-body bg-secondary rounded-3xl w-full h-[400px] shadow-lg relative overflow-hidden flex flex-col">
            {/* Shredder face */}
            <div className="shredder-face absolute w-full flex justify-center pt-6">
              {/* Eyes */}
              <div className="flex space-x-20">
                <div className="eye w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <div className={`pupil w-5 h-5 bg-dark rounded-full ${isShredding ? 'animate-pulse' : ''}`}></div>
                </div>
                <div className="eye w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <div className={`pupil w-5 h-5 bg-dark rounded-full ${isShredding ? 'animate-pulse' : ''}`}></div>
                </div>
              </div>
            </div>
            
            {/* Shredder mouth/slot - wider to accommodate document */}
            <div className="shredder-mouth w-3/4 h-10 bg-dark rounded-lg mx-auto mt-28 shadow-inner flex items-center justify-center overflow-hidden relative">
              {/* Black strip for shadow/depth inside slot */}
              <div className="absolute w-full h-full bg-black opacity-40"></div>
              <div className="shredder-teeth flex z-10">
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className={`tooth w-1 h-10 bg-gray-600 mx-1 ${isShredding ? 'animate-spin-slow' : ''}`}></div>
                ))}
              </div>
            </div>
            <div className="h-4 z-[51] bg-secondary"></div>
            {/* Shredder collection bin/tray */}
            <div className="shredder-bin flex-grow bg-gray-700 z-[51] relative overflow-hidden" id="shredBin">
              {/* Tray with raised edges */}
              <div className="absolute w-11/12 h-full mx-auto left-0 right-0 bg-gray-600 rounded-b-lg">
                {/* Inner tray shadow for depth */}
                <div className="absolute w-full h-full bg-black opacity-20 rounded-b-lg"></div>
                
                {/* Shredded pieces container */}
                <div 
                  ref={shreddedPiecesRef} 
                  className="absolute w-full h-full shredded-pieces-container"
                  id="shreddedPiecesContainer"
                  style={{ 
                    zIndex: 50, 
                    overflow: 'visible',
                    padding: '10px',
                    position: 'relative',
                    pointerEvents: 'none' // Allow clicks to pass through to underlying elements
                  }}
                >
                  {/* Shredded pieces will appear here dynamically */}
                </div>
              </div>
            </div>
          </div>
          
          {/* Shredder base/stand */}
          <div className="shredder-base w-5/6 h-16 bg-gray-800 rounded-b-3xl mx-auto shadow-lg"></div>
        </div>
      </div>

      {/* File info display when a file is selected */}
      {/* {file && !isShreddingComplete && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="text-4xl text-primary mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-dark truncate">
                {file.name}
              </h3>
              <p className="text-gray-500 text-sm">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              className="text-secondary hover:text-red-700 transition-all"
              onClick={handleRemoveFile}
              disabled={isShredding}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ShredderMachine;
