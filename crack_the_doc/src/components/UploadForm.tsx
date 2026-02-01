import { useState, type DragEvent, type ChangeEvent } from "react";
import { UploadCloud, Loader2, FileText } from "lucide-react";

type Props = {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
};

const UploadForm = ({ onFileUpload, isLoading }: Props) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) onFileUpload(e.dataTransfer.files[0]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) onFileUpload(e.target.files[0]);
  };

  const supportedFileTypes = ".pdf, .md, .markdown, .txt, .docx";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16 px-4">
      <form
        className={`relative w-full max-w-lg rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200 sm:p-14 ${
          dragActive
            ? "border-deep-moss bg-deep-moss/[0.04] dark:border-dark-moss dark:bg-dark-moss/10"
            : "border-deep-moss/25 bg-white dark:border-dark-moss/25 dark:bg-dark-sage-surface shadow-soft-md dark:shadow-soft-dark"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-soft-clay/15 dark:bg-dark-clay/15">
              <Loader2 className="h-9 w-9 animate-spin text-soft-clay dark:text-dark-clay" />
            </div>
            <div>
              <p className="text-title font-semibold text-deep-moss dark:text-dark-moss">
                Analyzing your document
              </p>
              <p className="mt-1.5 text-body text-deep-moss/70 dark:text-dark-moss/70">
                This may take a moment
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-22 w-22 items-center justify-center rounded-2xl bg-pale-sage dark:bg-dark-sage shadow-soft dark:shadow-soft-dark">
              <UploadCloud className="h-11 w-11 text-deep-moss/50 dark:text-dark-moss/50" />
            </div>
            <p className="mt-8 text-display-sm font-semibold tracking-tight text-deep-moss dark:text-dark-moss sm:text-display-md">
              Upload your document
            </p>
            <p className="mt-3 text-body text-deep-moss/80 dark:text-dark-moss/80">
              Drag and drop a file here, or click to choose
            </p>
            <p className="mt-2 flex items-center justify-center gap-2 text-caption text-deep-moss/55 dark:text-dark-moss/55">
              <FileText className="h-4 w-4" />
              PDF, TXT, DOCX, Markdown
            </p>
            <input
              type="file"
              id="file-upload"
              className="sr-only"
              onChange={handleChange}
              accept={supportedFileTypes}
            />
            <label
              htmlFor="file-upload"
              className="mt-10 inline-flex cursor-pointer items-center justify-center rounded-xl bg-soft-clay px-8 py-3.5 text-body font-semibold text-deep-moss shadow-soft transition-colors duration-150 hover:bg-soft-clay-hover focus-within:outline focus-within:ring-2 focus-within:ring-soft-clay focus-within:ring-offset-2 dark:bg-dark-clay dark:text-dark-sage dark:hover:opacity-90 dark:focus-within:ring-dark-clay dark:focus-within:ring-offset-dark-sage"
            >
              Select file
            </label>
          </>
        )}
      </form>
    </div>
  );
};

export default UploadForm;
