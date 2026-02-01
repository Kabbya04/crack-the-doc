import { Component, type ReactNode } from "react";
import { X } from "lucide-react";
import { DocumentPreviewContent } from "./DocumentPreviewContent";
import type { DocumentFile } from "../pages/Home";

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

type Props = { document: DocumentFile; onClose: () => void };

export default function DocumentPreviewModal({ document, onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-moss/30 p-4 dark:bg-black/45"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-deep-moss/12 bg-white shadow-soft-lg dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark-md"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-deep-moss/[0.08] px-4 py-3 dark:border-dark-moss/15">
          <h2
            id="preview-title"
            className="truncate text-title font-semibold text-deep-moss dark:text-dark-moss"
          >
            {document.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-deep-moss/65 transition-colors duration-150 hover:bg-deep-moss/10 hover:text-deep-moss dark:text-dark-moss/65 dark:hover:bg-dark-moss/15 dark:hover:text-dark-moss"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <PreviewErrorBoundary
            fallback={
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-title font-medium text-deep-moss dark:text-dark-moss">
                  Preview could not be loaded
                </p>
                <p className="mt-2 text-body text-deep-moss/65 dark:text-dark-moss/65">
                  The document may be unsupported or the viewer encountered an
                  error.
                </p>
              </div>
            }
          >
            <DocumentPreviewContent
              document={document}
              baseWidth={560}
              showZoom={true}
              showPagination={document.type === "pdf"}
            />
          </PreviewErrorBoundary>
        </div>
      </div>
    </div>
  );
}
