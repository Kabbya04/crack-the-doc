/**
 * Local storage for persistence until auth is implemented.
 * All keys are prefixed to avoid collisions.
 */

const PREFIX = "lumen-";

export function getDocKey(name: string, textLength: number): string {
  return `${name}|${textLength}`;
}

const RATINGS_KEY = PREFIX + "ratings";
const LAST_DOC_KEY = PREFIX + "last-doc";
const STUDIED_PER_DAY_KEY = PREFIX + "studied-per-day";
const TAKEAWAYS_KEY = PREFIX + "takeaways";
const STREAK_KEY = PREFIX + "streak";
const MASTERY_KEY = PREFIX + "mastery";

export type RecallRating = "got_it" | "almost" | "missed";
export type RecallRatings = Record<number, RecallRating>;

export function getStoredRatings(): Record<string, RecallRatings> {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setStoredRatings(docKey: string, ratings: RecallRatings): void {
  const all = getStoredRatings();
  all[docKey] = ratings;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
}

export type StoredLastDoc = {
  docKey: string;
  docName: string;
  questions: Array<{ id: number; question: string; answer: string }>;
  keyPoints: Array<{ id: number; point: string; definition: string }>;
};

export function getLastDoc(): StoredLastDoc | null {
  try {
    const raw = localStorage.getItem(LAST_DOC_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLastDoc(data: StoredLastDoc): void {
  localStorage.setItem(LAST_DOC_KEY, JSON.stringify(data));
}

/** One doc's snapshot for "studied on this date" (used to build today's quiz from yesterday). */
export type StudiedDocEntry = {
  docKey: string;
  docName: string;
  questions: Array<{ id: number; question: string; answer: string }>;
};

function getStudiedPerDay(): Record<string, StudiedDocEntry[]> {
  try {
    const raw = localStorage.getItem(STUDIED_PER_DAY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStudiedPerDay(data: Record<string, StudiedDocEntry[]>): void {
  localStorage.setItem(STUDIED_PER_DAY_KEY, JSON.stringify(data));
}

export function getStudiedDocsForDate(date: string): StudiedDocEntry[] {
  return getStudiedPerDay()[date] ?? [];
}

/** Mark that this doc was studied today (idempotent per docKey per day). */
export function addStudiedToday(
  docKey: string,
  docName: string,
  questions: Array<{ id: number; question: string; answer: string }>
): void {
  if (!docKey || questions.length === 0) return;
  const todayStr = today();
  const perDay = getStudiedPerDay();
  const todayList = perDay[todayStr] ?? [];
  if (todayList.some((e) => e.docKey === docKey)) return;
  perDay[todayStr] = [...todayList, { docKey, docName, questions }];
  setStudiedPerDay(perDay);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Docs studied yesterday — used as the source for today's quiz. */
export function getYesterdayStudiedDocs(): StudiedDocEntry[] {
  return getStudiedDocsForDate(yesterday());
}

export type TakeawayEntry = {
  id: string;
  docKey: string;
  docName: string;
  takeaway: string;
  date: string;
};

export function getTakeaways(): TakeawayEntry[] {
  try {
    const raw = localStorage.getItem(TAKEAWAYS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addTakeaway(entry: Omit<TakeawayEntry, "id">): void {
  const list = getTakeaways();
  const id = `${entry.docKey}-${Date.now()}`;
  const updated = list.filter((t) => t.docKey !== entry.docKey);
  updated.push({ ...entry, id });
  localStorage.setItem(TAKEAWAYS_KEY, JSON.stringify(updated));
}

export function getTakeawayForDoc(docKey: string): TakeawayEntry | null {
  return getTakeaways().find((t) => t.docKey === docKey) ?? null;
}

export type StreakData = { lastActivityDate: string; currentStreak: number };

export function getStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { lastActivityDate: "", currentStreak: 0 };
    return JSON.parse(raw);
  } catch {
    return { lastActivityDate: "", currentStreak: 0 };
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function recordActivity(): StreakData {
  const prev = getStreak();
  const todayStr = today();
  if (prev.lastActivityDate === todayStr) return prev;
  let nextStreak = prev.currentStreak;
  if (!prev.lastActivityDate) {
    nextStreak = 1;
  } else {
    const last = new Date(prev.lastActivityDate);
    const now = new Date(todayStr);
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
    if (diffDays === 1) nextStreak += 1;
    else if (diffDays > 1) nextStreak = 1;
  }
  const next: StreakData = { lastActivityDate: todayStr, currentStreak: nextStreak };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return next;
}

export type MasteryEntry = { mastered: boolean; masteredAt?: string };

export function getMastery(): Record<string, MasteryEntry> {
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setMastery(docKey: string, mastered: boolean): void {
  const all = getMastery();
  all[docKey] = {
    mastered,
    masteredAt: mastered ? new Date().toISOString() : undefined,
  };
  localStorage.setItem(MASTERY_KEY, JSON.stringify(all));
}

export function isMastered(docKey: string): boolean {
  return getMastery()[docKey]?.mastered ?? false;
}

/** One question in the daily quiz (with doc context for rating storage). */
export type QuizQuestionItem = {
  docKey: string;
  docName: string;
  id: number;
  question: string;
  answer: string;
};

const MAX_QUIZ_QUESTIONS = 10;

/** Shuffle array (Fisher–Yates) with date-based seed so same day = same order. */
function shuffleWithSeed<T>(arr: T[], seed: string): T[] {
  const out = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 16807) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Get questions for today's quiz: from docs studied yesterday, or fallback to last doc. */
export function getTodayQuizQuestions(): QuizQuestionItem[] {
  const yesterdayDocs = getYesterdayStudiedDocs();
  let items: QuizQuestionItem[] = [];
  if (yesterdayDocs.length > 0) {
    for (const doc of yesterdayDocs) {
      for (const q of doc.questions) {
        items.push({
          docKey: doc.docKey,
          docName: doc.docName,
          id: q.id,
          question: q.question,
          answer: q.answer,
        });
      }
    }
  } else {
    const last = getLastDoc();
    if (last?.questions.length) {
      for (const q of last.questions) {
        items.push({
          docKey: last.docKey,
          docName: last.docName,
          id: q.id,
          question: q.question,
          answer: q.answer,
        });
      }
    }
  }
  if (items.length === 0) return [];
  const todayStr = today();
  const shuffled = shuffleWithSeed(items, todayStr);
  return shuffled.slice(0, MAX_QUIZ_QUESTIONS);
}

/** True if there is a quiz for today and not every question has been rated (pending quiz). */
export function hasPendingQuiz(): boolean {
  const questions = getTodayQuizQuestions();
  if (questions.length === 0) return false;
  const ratings = getStoredRatings();
  const allRated = questions.every((q) => ratings[q.docKey]?.[q.id] != null);
  return !allRated;
}
