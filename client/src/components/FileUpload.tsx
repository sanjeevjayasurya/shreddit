import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useShredder } from "@/lib/ShredderContext";
import { formatFileSize } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    file, 
    setFile, 
    isShredding, 
    resetShredder,
    documentRef
  } = useShredder();

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (!validTypes.includes(file.type)) {
      alert('Please select a PDF, JPG, or PNG file');
      return;
    }
    
    setFile(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    resetShredder();
  };

  return (
    <div className="w-full max-w-2xl mb-8">
      <Card 
        className={`border-4 border-dashed rounded-2xl p-8 text-center bg-white shadow-md cursor-pointer hover:shadow-lg transition-all 
        ${isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-primary'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!file ? handleBrowseClick : undefined}
      >
        <CardContent className="p-0">
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png" 
            onChange={handleFileSelect}
          />
          
          {!file ? (
            <div className="flex flex-col items-center">
              <div className="text-6xl text-primary mb-4 animate-bounce-slow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-dark mb-2">Drop your file here</h2>
              <p className="text-gray-500 mb-4">or</p>
              <Button 
                className="bg-primary text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-md"
              >
                Browse Files
              </Button>
              <p className="text-gray-400 mt-4 text-sm">Accepts PDF, JPG, and PNG</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center mb-4">
                <div className="text-4xl text-primary mr-4">
                  {file.type === 'application/pdf' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg text-dark truncate">{file.name}</h3>
                  <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
                </div>
                <button 
                  className="text-secondary hover:text-red-700 transition-all"
                  onClick={handleRemoveFile}
                  disabled={isShredding}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="preview-container max-h-64 overflow-hidden rounded-lg border border-gray-200 mb-4">
                {file.type === 'application/pdf' ? (
                  <object
                    data={URL.createObjectURL(file)}
                    type="application/pdf"
                    className="w-full h-64"
                  >
                    <div className="bg-gray-100 h-64 flex items-center justify-center text-gray-500">
                      <p>Your browser doesn't support PDF preview.<br />The file will still be shredded properly.</p>
                    </div>
                  </object>
                ) : (
                  <img 
                    className="max-w-full h-auto max-h-64 object-contain mx-auto" 
                    src={URL.createObjectURL(file)} 
                    alt="File preview" 
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hidden document to be shredded - will be controlled by the ShredderContext */}
      <div 
        ref={documentRef}
        className={`absolute w-48 h-64 bg-white shadow-md rounded transform -translate-y-80 left-1/2 -translate-x-1/2 ${!file ? 'hidden' : ''}`} 
        style={{ zIndex: 10 }}
      >
        <div className="h-full p-2 overflow-hidden flex flex-col">
          <div className="w-24 h-3 bg-gray-300 rounded mb-2"></div>
          <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
          <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
          <div className="w-2/3 h-2 bg-gray-200 rounded mb-4"></div>
          
          {file && file.type !== 'application/pdf' && (
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded mb-4"
            />
          )}
          
          {(!file || file.type === 'application/pdf') && (
            <div className="w-full h-32 bg-gray-100 rounded mb-4"></div>
          )}
          
          <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
          <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
