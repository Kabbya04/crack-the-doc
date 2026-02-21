import { useState } from "react";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Focus from "./pages/Focus";
import { useTheme } from "./contexts/ThemeContext";
import { SessionProvider, useSession } from "./contexts/SessionContext";
import { BookOpen, Moon, Sun, Library as LibraryIcon, Crosshair, Flame, Award } from "lucide-react";
import { getStreak, isMastered } from "./lib/storage";

type Page = "study" | "library" | "focus";

function AppNav({ currentPage, setPage }: { currentPage: Page; setPage: (p: Page) => void }) {
  const { document, analysis } = useSession();
  const hasSession = Boolean(document && (analysis.summary || analysis.keyPoints.length > 0));

  return (
    <nav className="hidden sm:flex items-center gap-0.5" aria-label="Primary">
      <button
        type="button"
        onClick={() => setPage("study")}
        className={`rounded-lg px-3 py-2 text-caption font-medium transition-colors duration-150 ${
          currentPage === "study"
            ? "text-deep-moss bg-deep-moss/10 dark:text-dark-moss dark:bg-dark-moss/15"
            : "text-deep-moss/80 hover:text-deep-moss dark:text-dark-moss/80 dark:hover:text-dark-moss"
        }`}
      >
        Study
      </button>
      <button
        type="button"
        onClick={() => hasSession && setPage("library")}
        disabled={!hasSession}
        className={`rounded-lg px-3 py-2 text-caption font-medium transition-colors duration-150 ${
          currentPage === "library"
            ? "text-deep-moss bg-deep-moss/10 dark:text-dark-moss dark:bg-dark-moss/15"
            : hasSession
              ? "text-deep-moss/80 hover:text-deep-moss dark:text-dark-moss/80 dark:hover:text-dark-moss"
              : "text-deep-moss/40 cursor-not-allowed dark:text-dark-moss/40"
        }`}
        title={hasSession ? "Self-Assessment Center" : "Upload a document in Study first"}
      >
        <span className="flex items-center gap-1.5">
          <LibraryIcon className="h-4 w-4" />
          Library
        </span>
      </button>
      <button
        type="button"
        onClick={() => hasSession && setPage("focus")}
        disabled={!hasSession}
        className={`rounded-lg px-3 py-2 text-caption font-medium transition-colors duration-150 ${
          currentPage === "focus"
            ? "text-deep-moss bg-deep-moss/10 dark:text-dark-moss dark:bg-dark-moss/15"
            : hasSession
              ? "text-deep-moss/80 hover:text-deep-moss dark:text-dark-moss/80 dark:hover:text-dark-moss"
              : "text-deep-moss/40 cursor-not-allowed dark:text-dark-moss/40"
        }`}
        title={hasSession ? "Focus mode" : "Upload a document in Study first"}
      >
        <span className="flex items-center gap-1.5">
          <Crosshair className="h-4 w-4" />
          Focus
        </span>
      </button>
    </nav>
  );
}

function StreakAndMastery() {
  const { docKey } = useSession();
  const { currentStreak, lastActivityDate } = getStreak();
  const today = new Date().toISOString().slice(0, 10);
  const showStreak = currentStreak > 0 && lastActivityDate === today;
  const mastered = docKey ? isMastered(docKey) : false;
  return (
    <div className="hidden items-center gap-2 sm:flex">
      {showStreak && (
        <span
          className="flex items-center gap-1.5 rounded-lg bg-soft-clay/20 px-2.5 py-1.5 text-caption font-semibold text-deep-moss dark:bg-dark-clay/20 dark:text-deep-moss"
          title="Daily streak"
        >
          <Flame className="h-4 w-4" />
          {currentStreak} day{currentStreak !== 1 ? "s" : ""}
        </span>
      )}
      {mastered && (
        <span
          className="flex items-center gap-1.5 rounded-lg bg-green-500/15 px-2.5 py-1.5 text-caption font-semibold text-green-700 dark:text-green-400"
          title="Document mastered"
        >
          <Award className="h-4 w-4" />
          Mastered
        </span>
      )}
    </div>
  );
}

function AppContent() {
  const [page, setPage] = useState<Page>("study");
  const { theme, toggleTheme } = useTheme();
  const { resetSession } = useSession();

  const handleNewSession = () => {
    resetSession();
    setPage("study");
  };

  return (
    <div className="min-h-screen bg-pale-sage text-deep-moss transition-colors duration-200 dark:bg-dark-sage dark:text-dark-moss">
      <header className="sticky top-0 z-40 border-b border-deep-moss/[0.12] bg-pale-sage/95 backdrop-blur-md dark:border-dark-moss/20 dark:bg-dark-sage/95 shadow-soft dark:shadow-soft-dark">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deep-moss text-pale-sage shadow-soft dark:bg-dark-moss dark:text-deep-moss dark:shadow-soft-dark">
              <BookOpen className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-title font-semibold tracking-tight text-deep-moss dark:text-dark-moss">
              Crack The Doc
            </span>
          </div>

          <AppNav currentPage={page} setPage={setPage} />

          <div className="flex items-center gap-3">
            <StreakAndMastery />
            <button
              type="button"
              onClick={handleNewSession}
              className="rounded-xl bg-soft-clay px-4 py-2.5 text-caption font-semibold text-deep-moss shadow-soft transition-colors duration-150 hover:bg-soft-clay-hover focus:outline-none focus:ring-2 focus:ring-soft-clay focus:ring-offset-2 focus:ring-offset-pale-sage dark:bg-dark-clay dark:text-deep-moss dark:hover:opacity-90 dark:focus:ring-dark-clay dark:focus:ring-offset-dark-sage"
            >
              New session
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-deep-moss/80 transition-colors duration-150 hover:bg-deep-moss/10 hover:text-deep-moss focus:outline-none focus:ring-2 focus:ring-soft-clay focus:ring-offset-2 focus:ring-offset-pale-sage dark:text-dark-moss/80 dark:hover:bg-dark-moss/15 dark:hover:text-dark-moss dark:focus:ring-offset-dark-sage"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {page === "study" && <Home />}
        {page === "library" && <Library onEnterFocus={() => setPage("focus")} />}
        {page === "focus" && <Focus />}
      </main>
    </div>
  );
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
