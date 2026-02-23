export type DocumentFile = {
  name: string;
  type: "pdf" | "docx" | "md" | "txt" | "markdown";
  content: File | string | ArrayBuffer;
  textContent: string;
};

export type KeyPoint = { id: number; point: string; definition: string };
export type Question = { id: number; question: string; answer: string };

export type Analysis = {
  summary: string;
  keyPoints: KeyPoint[];
  questions: Question[];
};

export type RecallRating = "got_it" | "almost" | "missed";

/** Per-question recall rating (by question id). */
export type RecallRatings = Record<number, RecallRating>;
