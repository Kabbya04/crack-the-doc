// src/components/DocumentPreviewModal.tsx
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { DocumentFile } from '../pages/Home'; // Import the shared type

// Point to the local worker file. This is the key to fixing the PDF preview.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';

// ---- Specialized Viewer Components ----

const PDFViewer = ({ file }: { file: ArrayBuffer | string }) => {
  console.log("PDFViewer received file:", file);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => setNumPages(numPages);
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  return (
    <div className="flex flex-col items-center h-full">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Loader2 className="w-8 h-8 animate-spin my-10" />}
        error={<div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/50 rounded-md">Failed to load PDF file. Please ensure it's a valid PDF.</div>}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      {numPages && (
        <div className="flex-shrink-0 flex items-center space-x-4 mt-4 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="p-1 rounded-full disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeft /></button>
          <p>Page {pageNumber} of {numPages}</p>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="p-1 rounded-full disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRight /></button>
        </div>
      )}
    </div>
  );
};

const HtmlViewer = ({ htmlContent }: { htmlContent: string }) => {
  return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const MarkdownViewer = ({ markdownContent }: { markdownContent:string }) => {
  return <article className="prose dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown></article>;
};

const TextViewer = ({ textContent }: { textContent: string }) => {
  return <pre className="whitespace-pre-wrap font-sans text-sm">{textContent}</pre>;
};

// ---- Main Dispatcher and Modal Component ----

const RenderContent = ({ document }: { document: DocumentFile }) => {
  switch (document.type) {
    case 'pdf': return <PDFViewer file={document.content as ArrayBuffer} />;
    case 'docx': return <HtmlViewer htmlContent={document.content as string} />;
    case 'md':
    case 'markdown': return <MarkdownViewer markdownContent={document.content as string} />;
    case 'txt': return <TextViewer textContent={document.content as string} />;
    default: return <p>Preview for this file type is not available.</p>;
  }
};

type Props = {
  document: DocumentFile;
  onClose: () => void;
};

const DocumentPreviewModal = ({ document, onClose }: Props) => {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div onClick={(e) => e.stopPropagation()} className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{document.name}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <RenderContent document={document} />
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;