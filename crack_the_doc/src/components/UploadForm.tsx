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
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center py-12 px-4">
      <form
        className={`relative w-full max-w-xl rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ease-out sm:p-12 ${
          dragActive
            ? "border-deep-moss bg-deep-moss/5 dark:border-dark-moss dark:bg-dark-moss/10"
            : "border-deep-moss/30 bg-white dark:border-dark-moss/30 dark:bg-dark-sage-surface"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-clay/20 dark:bg-dark-clay/20">
              <Loader2 className="h-8 w-8 animate-spin text-soft-clay dark:text-dark-clay" />
            </div>
            <div>
              <p className="text-lg font-medium text-deep-moss dark:text-dark-moss">
                Analyzing your document
              </p>
              <p className="mt-1 text-sm text-deep-moss/70 dark:text-dark-moss/70">
                This may take a moment
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-pale-sage dark:bg-dark-sage">
              <UploadCloud className="h-10 w-10 text-deep-moss/60 dark:text-dark-moss/60" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-deep-moss dark:text-dark-moss sm:text-3xl">
              Upload your document
            </h2>
            <p className="mt-2 text-deep-moss/80 dark:text-dark-moss/80">
              Drag and drop a file here, or click to choose
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-deep-moss/60 dark:text-dark-moss/60">
              <FileText className="h-3.5 w-3.5" />
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
              className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-xl bg-soft-clay px-6 py-3 text-sm font-semibold text-deep-moss shadow-soft hover:bg-soft-clay-hover focus-within:outline focus-within:ring-2 focus-within:ring-soft-clay focus-within:ring-offset-2 dark:bg-dark-clay dark:text-dark-sage dark:hover:opacity-90 dark:focus-within:ring-dark-clay dark:focus-within:ring-offset-dark-sage"
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
