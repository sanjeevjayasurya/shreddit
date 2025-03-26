import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { playShredSound, playRestoreSound } from '@/assets/shredder-sound';

type ShredMode = 'strip' | 'cross' | 'crazy';

interface ShredderContextType {
  file: File | null;
  setFile: (file: File | null) => void;
  shredMode: ShredMode;
  setShredMode: (mode: ShredMode) => void;
  isShredding: boolean;
  isShreddingComplete: boolean;
  progress: number;
  progressText: string;
  progressFace: string;
  soundEnabled: boolean;
  toggleSound: () => void;
  startShredding: () => void;
  restoreDocument: () => void;
  resetShredder: () => void;
  documentRef: React.RefObject<HTMLDivElement>;
}

const ShredderContext = createContext<ShredderContextType | undefined>(undefined);

export const ShredderProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [shredMode, setShredMode] = useState<ShredMode>('strip');
  const [isShredding, setIsShredding] = useState(false);
  const [isShreddingComplete, setIsShreddingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('Ready to shred!');
  const [progressFace, setProgressFace] = useState('😊');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const documentRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  const startShredding = () => {
    if (!file || isShredding) return;
    
    setIsShredding(true);
    setIsShreddingComplete(false);
    setProgress(0);
    setProgressText('Shredding...');
    setProgressFace('😈');
    
    // Play shredding sound
    if (soundEnabled) {
      playShredSound();
    }
    
    // Animate document going into shredder
    if (documentRef.current) {
      // Initialize document position above the shredder mouth
      documentRef.current.style.display = 'block';
      documentRef.current.style.transition = 'none';
      documentRef.current.style.transform = 'translateX(-50%) translateY(-120px)';
      
      // Force reflow to ensure the position is applied before starting animation
      documentRef.current.offsetHeight;
      
      // Animate document movement in two steps for a more realistic effect
      setTimeout(() => {
        if (documentRef.current) {
          // Get shredder slot position
          const shredderSlot = document.querySelector('.shredder-mouth');
          if (shredderSlot) {
            const slotRect = shredderSlot.getBoundingClientRect();
            const docRect = documentRef.current.getBoundingClientRect();
            
            // First move halfway to the slot
            documentRef.current.style.transition = 'transform 0.5s ease-out';
            documentRef.current.style.transform = 'translateX(-50%) translateY(-30px)';
            
            // Then move into the slot with a slight pause
            setTimeout(() => {
              if (documentRef.current) {
                // Calculate final position - slightly into the slot
                const targetY = slotRect.top - docRect.top + 20;
                
                // Set the transition and transform for the final movement
                documentRef.current.style.transition = 'transform 0.8s ease-in';
                documentRef.current.style.transform = `translateX(-50%) translateY(${targetY}px) scale(0.95)`;
              }
            }, 520);
          }
        }
      }, 50);
    }
    
    // Update progress bar
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 5;
        
        if (newProgress >= 50 && newProgress < 80) {
          setProgressFace('😆');
        } else if (newProgress >= 80) {
          setProgressFace('🤩');
        }
        
        if (newProgress >= 100) {
          if (progressIntervalRef.current !== null) {
            window.clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          finishShredding();
        }
        
        return newProgress;
      });
    }, 100);
  };
  
  const finishShredding = () => {
    setIsShredding(false);
    setIsShreddingComplete(true);
    setProgressText('Shredding complete!');
  };
  
  const restoreDocument = () => {
    if (!file) return;
    
    // Play restore sound first - feels more responsive
    if (soundEnabled) {
      playRestoreSound();
    }
    
    // Reset shredded pieces with a magical animation
    const shreddedContainer = document.querySelector('#shredBin > div');
    if (shreddedContainer) {
      // Add a magical floating/dissolve animation to the shredded pieces 
      const pieces = shreddedContainer.querySelectorAll('div');
      pieces.forEach((piece, i) => {
        // Randomize the animation for each piece for a more magical effect
        const randomX = Math.random() * 40 - 20; // Random -20px to +20px
        const randomDelay = Math.random() * 0.3; // Random delay 0-0.3s
        
        piece.style.transition = `all 0.7s ease-out ${randomDelay}s`;
        piece.style.opacity = '0';
        piece.style.transform = `translateY(-30px) translateX(${randomX}px) scale(0.8) rotate(${Math.random() * 180}deg)`;
        
        // Remove after animation
        setTimeout(() => {
          piece.remove();
        }, 800);
      });
    }
    
    // Wait a bit before showing the original document
    setTimeout(() => {
      // Reset original document position with animation
      if (documentRef.current) {
        // Show original document and reset position to hover above the shredder
        documentRef.current.style.display = 'block';
        documentRef.current.style.transition = 'transform 0.8s ease-out';
        documentRef.current.style.transform = 'translateX(-50%) translateY(0)';
      }
      
      // Reset progress state
      setProgress(0);
      setProgressText('Ready to shred!');
      setProgressFace('😊');
      setIsShreddingComplete(false);
    }, 300);
  };
  
  const resetShredder = () => {
    setProgress(0);
    setProgressText('Ready to shred!');
    setProgressFace('😊');
    setIsShredding(false);
    setIsShreddingComplete(false);
    
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Clean up any shredded pieces
    const shreddedContainer = document.querySelector('#shredBin > div');
    if (shreddedContainer) {
      shreddedContainer.innerHTML = '';
    }
    
    // Remove any cloned document 
    const documentClone = document.getElementById('documentClone');
    if (documentClone) {
      documentClone.remove();
    }
  };
  
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  return (
    <ShredderContext.Provider
      value={{
        file,
        setFile,
        shredMode,
        setShredMode,
        isShredding,
        isShreddingComplete,
        progress,
        progressText,
        progressFace,
        soundEnabled,
        toggleSound,
        startShredding,
        restoreDocument,
        resetShredder,
        documentRef,
      }}
    >
      {children}
    </ShredderContext.Provider>
  );
};

export const useShredder = () => {
  const context = useContext(ShredderContext);
  if (context === undefined) {
    throw new Error('useShredder must be used within a ShredderProvider');
  }
  return context;
};
