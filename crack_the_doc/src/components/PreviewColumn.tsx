import { Maximize2 } from "lucide-react";
import { DocumentPreviewContent } from "./DocumentPreviewContent";
import type { DocumentFile } from "../types/session";

type Props = {
  document: DocumentFile;
  onFocusClick: () => void;
  /** "readable" = full-width row layout with larger PDF base width for PC/laptop */
  layout?: "compact" | "readable";
};

const READABLE_PDF_BASE_WIDTH = 680;
const COMPACT_PDF_BASE_WIDTH = 280;

export default function PreviewColumn({ document, onFocusClick, layout = "compact" }: Props) {
  const isReadable = layout === "readable";
  const pdfBaseWidth = isReadable ? READABLE_PDF_BASE_WIDTH : COMPACT_PDF_BASE_WIDTH;

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-deep-moss/12 bg-white shadow-soft-md dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark">
      <div className="shrink-0 border-b border-deep-moss/[0.08] dark:border-dark-moss/15">
        <p className="px-3 pt-3 pb-1 text-caption font-medium uppercase tracking-wider text-deep-moss/50 dark:text-dark-moss/50 md:px-4">
          Preview
        </p>
        <div className="flex items-center justify-between gap-2 px-3 pb-3 md:px-4">
          <span className="truncate text-caption font-medium text-deep-moss dark:text-dark-moss md:text-body">
            {document.name}
          </span>
          <button
            type="button"
            onClick={onFocusClick}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-caption font-medium text-deep-moss/80 transition-colors duration-150 hover:bg-deep-moss/10 dark:text-dark-moss/80 dark:hover:bg-dark-moss/15 md:px-3 md:py-2"
            title="Open in focus mode"
          >
            <Maximize2 className="h-4 w-4" />
            Focus
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin md:p-4">
        <DocumentPreviewContent
          document={document}
          baseWidth={pdfBaseWidth}
          showZoom={true}
          showPagination={document.type === "pdf"}
        />
      </div>
    </div>
  );
}
