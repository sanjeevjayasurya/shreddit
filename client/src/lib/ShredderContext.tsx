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
  
  // Handle file changes without resetting all shredded pieces
  useEffect(() => {
    // When a new file is uploaded, we want to:
    // 1. Keep all the shredded pieces from previous files
    // 2. Just reset the shredding state to prepare for the new file
    if (file) {
      // Only reset the shredding state, not the actual shredded pieces
      setProgress(0);
      setProgressText('Ready to shred!');
      setProgressFace('😊');
      setIsShredding(false);
      setIsShreddingComplete(false);
      
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Remove any previous document clone
      const documentClone = document.getElementById('documentClone');
      if (documentClone) {
        documentClone.remove();
      }
    } else {
      // No file selected - perform a complete reset
      resetShredder();
    }
  }, [file]);
  
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
    
    // Don't reset or clear the previously shredded pieces
    // They should accumulate over time with each new shred
    
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
