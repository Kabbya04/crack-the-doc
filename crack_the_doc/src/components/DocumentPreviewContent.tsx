import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.25;

type PDFViewerProps = {
  file: ArrayBuffer;
  baseWidth: number;
  scale: number;
  showPagination?: boolean;
};

export function PDFViewerShared({
  file,
  baseWidth,
  scale,
  showPagination = true,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) =>
    setNumPages(numPages);
  const goToPrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goToNextPage = () =>
    setPageNumber((p) => Math.min(p + 1, numPages || 1));

  // Use a copy so react-pdf never detaches the original buffer (fixes "detached ArrayBuffer" on reopen)
  const fileProp = useMemo(() => {
    try {
      const copy = file.slice(0);
      return { data: new Uint8Array(copy) };
    } catch {
      return null;
    }
  }, [file]);

  if (!fileProp) {
    return (
      <div className="rounded-xl border border-deep-moss/20 bg-pale-sage/80 p-4 text-body text-deep-moss dark:border-dark-moss/30 dark:bg-dark-sage-surface/90 dark:text-dark-moss">
        Failed to load PDF. The file may be unavailable.
      </div>
    );
  }

  const width = Math.round(baseWidth * scale);

  return (
    <div className="flex w-full flex-col items-center">
      <Document
        file={fileProp}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-soft-clay dark:text-dark-clay" />
          </div>
        }
        error={
          <div className="rounded-xl border border-deep-moss/15 bg-pale-sage/80 p-4 text-body text-deep-moss dark:border-dark-moss/20 dark:bg-dark-sage-surface/90 dark:text-dark-moss">
            Failed to load PDF. Please ensure it&apos;s a valid PDF file.
          </div>
        }
      >
        <Page pageNumber={pageNumber} width={width} />
      </Document>
      {showPagination && numPages != null && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-deep-moss/10 bg-pale-sage/80 px-3 py-2 dark:border-dark-moss/15 dark:bg-dark-sage-surface/90">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="rounded-lg p-1.5 text-deep-moss/80 transition-colors duration-150 hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[4rem] text-center text-caption font-medium text-deep-moss dark:text-dark-moss">
            {pageNumber} / {numPages}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="rounded-lg p-1.5 text-deep-moss/80 transition-colors duration-150 hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

const HtmlViewer = ({ htmlContent }: { htmlContent: string }) => (
  <div
    className="prose prose-deep-moss dark:prose-invert max-w-none text-body prose-headings:text-title prose-headings:font-semibold prose-p:text-deep-moss/90 dark:prose-headings:text-dark-moss dark:prose-p:text-dark-moss/90"
    dangerouslySetInnerHTML={{ __html: htmlContent }}
  />
);

const MarkdownViewer = ({ markdownContent }: { markdownContent: string }) => (
  <article className="prose prose-deep-moss dark:prose-invert max-w-none text-body prose-headings:text-title prose-headings:font-semibold prose-p:text-deep-moss/90 dark:prose-headings:text-dark-moss dark:prose-p:text-dark-moss/90">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
  </article>
);

const TextViewer = ({ textContent }: { textContent: string }) => (
  <pre className="whitespace-pre-wrap font-sans text-body text-deep-moss dark:text-dark-moss">
    {textContent}
  </pre>
);

export type DocumentPreviewContentProps = {
  document: DocumentFile;
  baseWidth?: number;
  scale?: number;
  showZoom?: boolean;
  showPagination?: boolean;
};

export function DocumentPreviewContent({
  document: doc,
  baseWidth = 560,
  scale: controlledScale,
  showZoom = false,
  showPagination = true,
}: DocumentPreviewContentProps) {
  const [internalScale, setInternalScale] = useState(1);
  const scale = controlledScale ?? internalScale;

  const setScale = (s: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
    if (controlledScale == null) setInternalScale(next);
  };

  if (doc.type === "pdf") {
    const file = doc.content as ArrayBuffer;
    return (
      <div className="flex w-full flex-col items-center">
        {showZoom && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-deep-moss/10 bg-pale-sage/80 px-3 py-2 dark:border-dark-moss/15 dark:bg-dark-sage-surface/90">
            <button
              type="button"
              onClick={() => setScale(scale - SCALE_STEP)}
              disabled={scale <= MIN_SCALE}
              className="rounded-lg p-1.5 text-deep-moss/80 transition-colors hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15"
              aria-label="Zoom out"
            >
              <span className="text-body font-semibold">−</span>
            </button>
            <span className="min-w-[3rem] text-center text-caption font-medium text-deep-moss dark:text-dark-moss">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale(scale + SCALE_STEP)}
              disabled={scale >= MAX_SCALE}
              className="rounded-lg p-1.5 text-deep-moss/80 transition-colors hover:bg-deep-moss/10 disabled:opacity-40 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15"
              aria-label="Zoom in"
            >
              <span className="text-body font-semibold">+</span>
            </button>
          </div>
        )}
        <PDFViewerShared
          file={file}
          baseWidth={baseWidth}
          scale={scale}
          showPagination={showPagination}
        />
      </div>
    );
  }

  if (doc.type === "docx") {
    return <HtmlViewer htmlContent={doc.content as string} />;
  }
  if (doc.type === "md" || doc.type === "markdown") {
    return <MarkdownViewer markdownContent={doc.content as string} />;
  }
  if (doc.type === "txt") {
    return <TextViewer textContent={doc.content as string} />;
  }

  return (
    <p className="text-body text-deep-moss/75 dark:text-dark-moss/75">
      Preview for this file type is not available.
    </p>
  );
}
