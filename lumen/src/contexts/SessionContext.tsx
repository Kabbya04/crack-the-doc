import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Analysis, DocumentFile, RecallRating, RecallRatings } from "../types/session";
import { getDocKey, getStoredRatings, setStoredRatings, recordActivity, setMastery, addStudiedToday } from "../lib/storage";

type SessionState = {
  document: DocumentFile | null;
  analysis: Analysis;
  isAnalysisLoading: boolean;
  apiKeyError: boolean;
  recallRatings: RecallRatings;
};

type SessionContextValue = SessionState & {
  docKey: string | null;
  setDocument: (doc: DocumentFile | null) => void;
  setAnalysis: (a: Analysis | ((prev: Analysis) => Analysis)) => void;
  setIsAnalysisLoading: (v: boolean) => void;
  setApiKeyError: (v: boolean) => void;
  setRecallRating: (questionId: number, rating: RecallRating | null) => void;
  resetSession: () => void;
  /** Mark current doc as studied today (for today's quiz tomorrow). Call after user activity. */
  recordStudiedToday: () => void;
};

const defaultAnalysis: Analysis = {
  summary: "",
  keyPoints: [],
  questions: [],
};

const initialState: SessionState = {
  document: null,
  analysis: defaultAnalysis,
  isAnalysisLoading: false,
  apiKeyError: false,
  recallRatings: {},
};

const SessionContext = createContext<SessionContextValue | null>(null);

const docKeyFrom = (doc: DocumentFile | null): string | null =>
  doc ? getDocKey(doc.name, doc.textContent.length) : null;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [document, setDocument] = useState<DocumentFile | null>(initialState.document);
  const [analysis, setAnalysis] = useState<Analysis>(initialState.analysis);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(initialState.isAnalysisLoading);
  const [apiKeyError, setApiKeyError] = useState(initialState.apiKeyError);
  const [recallRatings, setRecallRatingsState] = useState<RecallRatings>(initialState.recallRatings);

  const docKey = useMemo(() => docKeyFrom(document), [document]);

  useEffect(() => {
    if (!docKey) {
      setRecallRatingsState({});
      return;
    }
    const stored = getStoredRatings()[docKey];
    setRecallRatingsState(stored ?? {});
  }, [docKey]);

  useEffect(() => {
    if (!docKey || analysis.questions.length < 3) return;
    const rated = analysis.questions.filter((q) => recallRatings[q.id] != null).length;
    if (rated < 3) return;
    const gotIt = analysis.questions.filter((q) => recallRatings[q.id] === "got_it").length;
    const mastered = gotIt / rated >= 0.8;
    setMastery(docKey, mastered);
  }, [docKey, analysis.questions, recallRatings]);

  const setRecallRating = useCallback(
    (questionId: number, rating: RecallRating | null) => {
      if (rating !== null) recordActivity();
      setRecallRatingsState((prev) => {
        const next =
          rating === null ? (() => { const o = { ...prev }; delete o[questionId]; return o; })() : { ...prev, [questionId]: rating };
        if (docKey) setStoredRatings(docKey, next);
        return next;
      });
    },
    [docKey]
  );

  const resetSession = useCallback(() => {
    setDocument(null);
    setAnalysis(defaultAnalysis);
    setIsAnalysisLoading(false);
    setApiKeyError(false);
    setRecallRatingsState({});
  }, []);

  const recordStudiedToday = useCallback(() => {
    if (!document || !docKey || analysis.questions.length === 0) return;
    addStudiedToday(docKey, document.name, analysis.questions);
  }, [document, docKey, analysis.questions]);

  const value: SessionContextValue = {
    document,
    analysis,
    isAnalysisLoading,
    apiKeyError,
    recallRatings,
    docKey,
    setDocument,
    setAnalysis,
    setIsAnalysisLoading,
    setApiKeyError,
    setRecallRating,
    resetSession,
    recordStudiedToday,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
