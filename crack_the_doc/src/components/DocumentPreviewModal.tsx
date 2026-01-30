import { useState, useMemo, Component, type ReactNode } from "react";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DocumentFile } from "../pages/Home";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "/pdf-worker/pdf.worker.react-pdf.min.mjs",
  window.location.origin
).href;

class PreviewErrorBoundary extends Component<{
  children: ReactNode;
  fallback: ReactNode;
}> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const PDFViewer = ({ file }: { file: ArrayBuffer }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) =>
    setNumPages(numPages);
  const goToPrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goToNextPage = () =>
    setPageNumber((p) => Math.min(p + 1, numPages || 1));
  const fileProp = useMemo(() => ({ data: new Uint8Array(file) }), [file]);

  return (
    <div className="flex w-full min-h-[400px] flex-col items-center">
      <Document
        file={fileProp}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-soft-clay dark:text-dark-clay" />
          </div>
        }
        error={
          <div className="rounded-xl border border-deep-moss/20 bg-pale-sage/80 p-4 text-deep-moss dark:border-dark-moss/30 dark:bg-dark-sage/80 dark:text-dark-moss">
            Failed to load PDF. Please ensure it&apos;s a valid PDF file.
          </div>
        }
      >
        <Page pageNumber={pageNumber} width={560} />
      </Document>
      {numPages != null && (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-deep-moss/15 bg-pale-sage/80 px-4 py-2 dark:border-dark-moss/20 dark:bg-dark-sage/80">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="rounded-lg p-1.5 text-deep-moss hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss dark:hover:bg-dark-moss/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-deep-moss dark:text-dark-moss">
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="rounded-lg p-1.5 text-deep-moss hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss dark:hover:bg-dark-moss/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

const HtmlViewer = ({ htmlContent }: { htmlContent: string }) => (
  <div
    className="prose max-w-none text-deep-moss dark:prose-invert dark:text-dark-moss prose-headings:text-deep-moss dark:prose-headings:text-dark-moss prose-p:text-deep-moss/90 dark:prose-p:text-dark-moss/90"
    dangerouslySetInnerHTML={{ __html: htmlContent }}
  />
);

const MarkdownViewer = ({ markdownContent }: { markdownContent: string }) => (
  <article className="prose max-w-none text-deep-moss dark:prose-invert dark:text-dark-moss prose-headings:text-deep-moss dark:prose-headings:text-dark-moss prose-p:text-deep-moss/90 dark:prose-p:text-dark-moss/90">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
  </article>
);

const TextViewer = ({ textContent }: { textContent: string }) => (
  <pre className="whitespace-pre-wrap font-sans text-sm text-deep-moss dark:text-dark-moss">
    {textContent}
  </pre>
);

const RenderContent = ({ document }: { document: DocumentFile }) => {
  switch (document.type) {
    case "pdf":
      return <PDFViewer file={document.content as ArrayBuffer} />;
    case "docx":
      return <HtmlViewer htmlContent={document.content as string} />;
    case "md":
    case "markdown":
      return <MarkdownViewer markdownContent={document.content as string} />;
    case "txt":
      return <TextViewer textContent={document.content as string} />;
    default:
      return (
        <p className="text-deep-moss/80 dark:text-dark-moss/80">
          Preview for this file type is not available.
        </p>
      );
  }
};

type Props = { document: DocumentFile; onClose: () => void };

const DocumentPreviewModal = ({ document, onClose }: Props) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-moss/40 p-4 dark:bg-black/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-deep-moss/15 bg-white shadow-soft dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-deep-moss/10 px-4 py-3 dark:border-dark-moss/20">
          <h2
            id="preview-title"
            className="truncate text-lg font-semibold text-deep-moss dark:text-dark-moss"
          >
            {document.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-deep-moss/70 hover:bg-deep-moss/10 hover:text-deep-moss dark:text-dark-moss/70 dark:hover:bg-dark-moss/20 dark:hover:text-dark-moss"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <PreviewErrorBoundary
            fallback={
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="font-medium text-deep-moss dark:text-dark-moss">
                  Preview could not be loaded
                </p>
                <p className="mt-2 text-sm text-deep-moss/70 dark:text-dark-moss/70">
                  The document may be unsupported or the viewer encountered an
                  error.
                </p>
              </div>
            }
          >
            <RenderContent document={document} />
          </PreviewErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
