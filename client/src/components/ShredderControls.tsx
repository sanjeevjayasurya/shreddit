import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useShredder } from "@/lib/ShredderContext";

const ShredderControls = () => {
  const { 
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
    clearShreddedPieces,
    resetShredder
  } = useShredder();

  return (
    <div className="shredder-controls w-full max-w-2xl bg-white rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-dark">Shredding Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={() => setShredMode('strip')} 
            className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center hover:animate-wiggle ${
              shredMode === 'strip' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
            disabled={isShredding}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Strip Cut
          </Button>
          <Button 
            onClick={() => setShredMode('cross')} 
            className={`py-3 px-4 rounded-xl font-bold flex items-center justify-center hover:animate-wiggle ${
              shredMode === 'cross' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
            disabled={isShredding}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Cross Cut
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 text-dark">Shredding Progress</h3>
        <div className="progress-container relative h-10 bg-gray-200 rounded-full overflow-hidden">
          <Progress value={progress} className="h-full transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-dark">{progressText}</span>
          </div>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
            <span>{progressFace}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Button 
          onClick={startShredding}
          className="bg-secondary text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center hover:animate-bounce"
          disabled={!file || isShredding}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          Start Shredding
        </Button>
        <Button 
          onClick={clearShreddedPieces}
          className="bg-accent text-dark py-4 px-8 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center hover:animate-bounce"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Bin
        </Button>
        <Button 
          onClick={toggleSound}
          className="bg-white border-2 border-primary text-primary py-4 px-4 rounded-xl font-bold shadow-md"
        >
          {soundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </Button>
      </div>
      
      {isShreddingComplete && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              resetShredder();
              setFile(null);
            }}
            className="bg-primary text-white py-3 px-6 rounded-xl font-medium text-md shadow-md flex items-center justify-center mt-4 hover:bg-primary/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload New Document
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShredderControls;
