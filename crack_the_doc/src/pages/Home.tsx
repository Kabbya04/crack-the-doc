import { useState, useEffect } from "react";
import UploadForm from "../components/UploadForm";
import ChatPanel from "../components/ChatPanel";
import AnalysisPanel from "../components/AnalysisPanel";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { getSummary, getKeyPoints, getQuestions } from "../lib/groq";
import { safeJsonParse } from "../lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf-worker/pdf.worker.min.js`;

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
  const [analysis, setAnalysis] = useState({ summary: "", keyPoints: [], questions: [] });
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    let docState: DocumentFile | null = null;

    try {
      let textContent = "";
      switch (extension) {
        case "pdf":
          const pdfArrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(pdfArrayBuffer).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageContent = await page.getTextContent();
            textContent += pageContent.items.map((item: any) => item.str).join(" ");
          }
          docState = { name: file.name, type: "pdf", content: pdfArrayBuffer, textContent };
          break;

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

        case "docx":
          const arrayBuffer = await file.arrayBuffer();
          const { value: docxText } = await mammoth.extractRawText({ arrayBuffer });
          textContent = docxText;
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          docState = { name: file.name, type: "docx", content: html, textContent };
          break;

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
    if (document) {
      const generateAnalysis = async () => {
        setIsAnalysisLoading(true);
        try {
          const [summaryRes, keyPointsRes, questionsRes] = await Promise.all([
            getSummary(document.textContent),
            getKeyPoints(document.textContent),
            getQuestions(document.textContent),
          ]);

          const summary = safeJsonParse(summaryRes.choices[0]?.message?.content || '{}', {}).summary || "";
          const keyPoints = safeJsonParse(keyPointsRes.choices[0]?.message?.content || '{}', {}).key_points || [];
          const questions = safeJsonParse(questionsRes.choices[0]?.message?.content || '{}', {}).questions || [];

          setAnalysis({ summary, keyPoints, questions });
        } catch (error) {
            if (error instanceof Error && error.message.includes("VITE_GROQ_API_KEY")) {
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
    }
  }, [document]);

  if (apiKeyError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">API Key Error</h2>
          <p>The VITE_GROQ_API_KEY is not configured.</p>
          <p>Please create a `.env` file in the root of the project and add your API key:</p>
          <pre className="mt-4 p-2 bg-gray-800 text-white rounded">
            VITE_GROQ_API_KEY=your_api_key_here
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!document) {
    return <UploadForm onFileUpload={handleFileUpload} isLoading={isLoading} />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
        <div className="w-full md:w-1/2 p-6 flex flex-col">
          <ChatPanel
            fileName={document.name}
            onPreviewClick={() => setIsPreviewOpen(true)}
            documentContent={document.textContent}
          />
        </div>
        <div className="w-full md:w-1/2 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
