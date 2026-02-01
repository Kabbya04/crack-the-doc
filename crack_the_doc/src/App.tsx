import Home from "./pages/Home";
import { useTheme } from "./contexts/ThemeContext";
import { BookOpen, Moon, Sun } from "lucide-react";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-pale-sage text-deep-moss transition-colors duration-200 dark:bg-dark-sage dark:text-dark-moss">
      <header className="sticky top-0 z-40 border-b border-deep-moss/[0.08] bg-pale-sage/90 backdrop-blur-md dark:border-dark-moss/15 dark:bg-dark-sage/90 shadow-soft dark:shadow-soft-dark">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deep-moss text-pale-sage shadow-soft dark:bg-dark-moss dark:text-dark-sage dark:shadow-soft-dark">
              <BookOpen className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-title font-semibold tracking-tight text-deep-moss dark:text-dark-moss">
              Crack The Doc
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-0.5" aria-label="Primary">
            <span className="rounded-lg px-3 py-2 text-caption font-medium text-deep-moss/80 dark:text-dark-moss/80">
              Study
            </span>
            <span
              className="rounded-lg px-3 py-2 text-caption font-medium text-deep-moss/40 dark:text-dark-moss/40 cursor-not-allowed"
              title="Coming soon"
            >
              Library
            </span>
            <span
              className="rounded-lg px-3 py-2 text-caption font-medium text-deep-moss/40 dark:text-dark-moss/40 cursor-not-allowed"
              title="Coming soon"
            >
              Focus
            </span>
          </nav>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-soft-clay px-4 py-2.5 text-caption font-semibold text-deep-moss shadow-soft transition-colors duration-150 hover:bg-soft-clay-hover focus:outline-none focus:ring-2 focus:ring-soft-clay focus:ring-offset-2 focus:ring-offset-pale-sage dark:bg-dark-clay dark:text-dark-sage dark:hover:opacity-90 dark:focus:ring-dark-clay dark:focus:ring-offset-dark-sage"
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
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Home />
      </main>
    </div>
  );
}

export default App;
