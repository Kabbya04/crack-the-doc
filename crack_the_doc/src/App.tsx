import Home from "./pages/Home";
import { useTheme } from "./contexts/ThemeContext";
import { BookOpen, Moon, Sun } from "lucide-react";

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-pale-sage text-deep-moss dark:bg-dark-sage dark:text-dark-moss transition-colors">
      <header className="sticky top-0 z-40 border-b border-deep-moss/10 dark:border-dark-moss/20 bg-pale-sage/95 dark:bg-dark-sage/95 backdrop-blur supports-[backdrop-filter]:bg-pale-sage/80 dark:supports-[backdrop-filter]:bg-dark-sage/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo + app name */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-deep-moss text-pale-sage dark:bg-dark-moss dark:text-dark-sage">
              <BookOpen className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-lg font-semibold tracking-tight text-deep-moss dark:text-dark-moss">
              Crack The Doc
            </span>
          </div>

          {/* Placeholder nav for future: Library, Settings, Focus mode, etc. */}
          <nav className="hidden sm:flex items-center gap-1" aria-label="Primary">
            <span className="rounded-md px-3 py-2 text-sm font-medium text-deep-moss/70 dark:text-dark-moss/70">
              Study
            </span>
            <span className="rounded-md px-3 py-2 text-sm font-medium text-deep-moss/50 dark:text-dark-moss/50 cursor-not-allowed" title="Coming soon">
              Library
            </span>
            <span className="rounded-md px-3 py-2 text-sm font-medium text-deep-moss/50 dark:text-dark-moss/50 cursor-not-allowed" title="Coming soon">
              Focus
            </span>
          </nav>

          {/* Theme toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-deep-moss hover:bg-deep-moss/10 dark:text-dark-moss dark:hover:bg-dark-moss/20 transition-colors focus:outline-none focus:ring-2 focus:ring-soft-clay focus:ring-offset-2 focus:ring-offset-pale-sage dark:focus:ring-offset-dark-sage"
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
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Home />
      </main>
    </div>
  );
}

export default App;
