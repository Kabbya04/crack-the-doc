import { useState, useEffect } from "react";
import UploadForm from "../components/UploadForm";
import ChatPanel from "../components/ChatPanel";
import AnalysisPanel from "../components/AnalysisPanel";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { getSummary, getKeyPoints, getQuestions } from "../lib/groq";
import { safeJsonParse } from "../lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "/pdf-worker/pdf.worker.min.mjs",
  window.location.origin
).href;

export type DocumentFile = {
  name: string;
  type: "pdf" | "docx" | "md" | "txt" | "markdown";
  content: File | string | ArrayBuffer;
  textContent: string;
};

const Home = () => {
  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [analysis, setAnalysis] = useState({
    summary: "",
    keyPoints: [],
    questions: [],
  });
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    let docState: DocumentFile | null = null;

    try {
      let textContent = "";
      switch (extension) {
        case "pdf": {
          const pdfArrayBuffer = await file.arrayBuffer();
          const pdfCopy = pdfArrayBuffer.slice(0);
          const pdf = await pdfjsLib.getDocument({
            data: new Uint8Array(pdfArrayBuffer),
            useSystemFonts: true,
          }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageContent = await page.getTextContent();
            textContent += pageContent.items
              .map((item: { str: string }) => item.str)
              .join(" ");
          }
          docState = {
            name: file.name,
            type: "pdf",
            content: pdfCopy,
            textContent,
          };
          break;
        }
        case "md":
        case "markdown":
        case "txt":
          textContent = await file.text();
          docState = {
            name: file.name,
            type: extension as "md" | "markdown" | "txt",
            content: textContent,
            textContent,
          };
          break;
        case "docx": {
          const arrayBuffer = await file.arrayBuffer();
          const { value: docxText } = await mammoth.extractRawText({
            arrayBuffer,
          });
          textContent = docxText;
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          docState = {
            name: file.name,
            type: "docx",
            content: html,
            textContent,
          };
          break;
        }
        default:
          alert(`Unsupported file type: .${extension}`);
          break;
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("There was an error reading your file.");
    }

    setDocument(docState);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!document) return;
    const generateAnalysis = async () => {
      setIsAnalysisLoading(true);
      try {
        const [summaryRes, keyPointsRes, questionsRes] = await Promise.all([
          getSummary(document.textContent),
          getKeyPoints(document.textContent),
          getQuestions(document.textContent),
        ]);
        const summary =
          safeJsonParse(summaryRes.choices[0]?.message?.content || "{}", {})
            .summary || "";
        const keyPoints =
          safeJsonParse(keyPointsRes.choices[0]?.message?.content || "{}", {})
            .key_points || [];
        const questions =
          safeJsonParse(questionsRes.choices[0]?.message?.content || "{}", {})
            .questions || [];
        setAnalysis({ summary, keyPoints, questions });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("VITE_GROQ_API_KEY")
        ) {
          setApiKeyError(true);
        } else {
          console.error("Error generating analysis:", error);
          setAnalysis({
            summary: "Sorry, there was an error generating the analysis.",
            keyPoints: [],
            questions: [],
          });
        }
      }
      setIsAnalysisLoading(false);
    };
    generateAnalysis();
  }, [document]);

  if (apiKeyError) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-deep-moss/20 bg-white p-6 shadow-soft dark:border-dark-moss/30 dark:bg-dark-sage-surface">
          <h2 className="text-xl font-semibold text-deep-moss dark:text-dark-moss">
            API key required
          </h2>
          <p className="mt-2 text-sm text-deep-moss/80 dark:text-dark-moss/80">
            VITE_GROQ_API_KEY is not configured. Add it to a <code className="rounded bg-pale-sage px-1 dark:bg-dark-sage">.env</code> file in the project root.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-deep-moss/10 p-3 text-xs text-deep-moss dark:bg-dark-moss/20 dark:text-dark-moss">
            VITE_GROQ_API_KEY=your_api_key_here
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-soft-clay px-4 py-2.5 text-sm font-semibold text-deep-moss hover:bg-soft-clay-hover focus:outline-none focus:ring-2 focus:ring-soft-clay focus:ring-offset-2 dark:bg-dark-clay dark:text-dark-sage dark:hover:opacity-90 dark:focus:ring-dark-clay dark:focus:ring-offset-dark-sage"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <UploadForm onFileUpload={handleFileUpload} isLoading={isLoading} />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 py-6 md:flex-row md:h-[calc(100vh-theme(spacing.14)-theme(spacing.12))]">
        <div className="flex min-h-0 w-full flex-col md:w-1/2">
          <ChatPanel
            fileName={document.name}
            onPreviewClick={() => setIsPreviewOpen(true)}
            documentContent={document.textContent}
          />
        </div>
        <div className="min-h-0 w-full overflow-y-auto md:w-1/2 scrollbar-thin">
          <AnalysisPanel analysis={analysis} isLoading={isAnalysisLoading} />
        </div>
      </div>
      {isPreviewOpen && document && (
        <DocumentPreviewModal
          document={document}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
};

export default Home;
