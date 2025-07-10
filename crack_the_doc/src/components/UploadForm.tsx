// src/components/UploadForm.tsx
import { useState, type DragEvent, type ChangeEvent } from 'react'; // <-- Import ChangeEvent for clarity
import { UploadCloud, Loader2 } from 'lucide-react';

type Props = {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
};

const UploadForm = ({ onFileUpload, isLoading }: Props) => {
  const [dragActive, setDragActive] = useState(false);

  // === FIX 1: Update the type to match the <form> element ===
  const handleDrag = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // === FIX 2: Update the type to match the <form> element ===
  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const supportedFileTypes = ".pdf, .md, .markdown, .txt, .docx";

  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)] p-4">
      <form 
        className={`w-full max-w-2xl p-8 border-2 border-dashed rounded-lg text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop} // <-- This line will now be error-free
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Analyzing your document...</p>
            <p className="text-sm text-gray-500">This might take a moment.</p>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-semibold">Upload Your Document</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Drag and drop a file or click to select</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Supported: PDF, TXT, DOCX, Markdown</p>
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleChange} 
              accept={supportedFileTypes}
            />
            <label 
              htmlFor="file-upload"
              className="mt-6 inline-block cursor-pointer rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Select File
            </label>
          </>
        )}
      </form>
    </div>
  );
};

export default UploadForm;