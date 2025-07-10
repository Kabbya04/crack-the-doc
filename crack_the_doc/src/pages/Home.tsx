import { useState, useEffect } from "react";
import UploadForm from "../components/UploadForm";
import ChatPanel from "../components/ChatPanel";
import AnalysisPanel from "../components/AnalysisPanel";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import mammoth from "mammoth";
import { getSummary, getKeyPoints, getQuestions } from "../lib/groq";
import { safeJsonParse } from "../lib/utils";

export type DocumentFile = {
  name: string;
  type: "pdf" | "docx" | "md" | "txt" | "markdown";
  content: File | string | ArrayBuffer;
};

const Home = () => {
  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [analysis, setAnalysis] = useState({ summary: "", keyPoints: [], questions: [] });
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    let docState: DocumentFile | null = null;

    try {
      switch (extension) {
        case "pdf":
          const pdfArrayBuffer = await file.arrayBuffer();
          docState = { name: file.name, type: "pdf", content: pdfArrayBuffer };
          break;

        case "md":
        case "markdown":
        case "txt":
          const textContent = await file.text();
          docState = {
            name: file.name,
            type: extension as "md" | "markdown" | "txt",
            content: textContent,
          };
          break;

        case "docx":
          const arrayBuffer = await file.arrayBuffer();
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          docState = { name: file.name, type: "docx", content: html };
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
            getSummary(document.content.toString()),
            getKeyPoints(document.content.toString()),
            getQuestions(document.content.toString()),
          ]);

          const summary = safeJsonParse(summaryRes.choices[0]?.message?.content || '{}', {}).summary || "";
          const keyPoints = safeJsonParse(keyPointsRes.choices[0]?.message?.content || '{}', {}).key_points || [];
          const questions = safeJsonParse(questionsRes.choices[0]?.message?.content || '{}', {}).questions || [];

          setAnalysis({ summary, keyPoints, questions });
        } catch (error) {
          console.error("Error generating analysis:", error);
          setAnalysis({
            summary: "Sorry, there was an error generating the analysis.",
            keyPoints: [],
            questions: [],
          });
        }
        setIsAnalysisLoading(false);
      };
      generateAnalysis();
    }
  }, [document]);

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
            documentContent={document.content.toString()}
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
