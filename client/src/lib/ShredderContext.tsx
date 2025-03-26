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
      documentRef.current.style.display = 'block';
      documentRef.current.style.transition = 'transform 2s ease-in-out';
      documentRef.current.style.transform = 'translate(-50%, 70px)';
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
    
    // Reset shredded pieces
    if (documentRef.current) {
      // Show original document and reset position
      documentRef.current.style.display = 'block';
      documentRef.current.style.transition = 'transform 1s ease-out';
      documentRef.current.style.transform = 'translate(-50%, -20rem)';
    }
    
    // Reset progress
    setProgress(0);
    setProgressText('Ready to shred!');
    setProgressFace('😊');
    setIsShreddingComplete(false);
    
    // Play restore sound
    if (soundEnabled) {
      playRestoreSound();
    }
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
