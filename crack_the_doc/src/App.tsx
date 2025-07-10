// src/App.tsx
import Home from './pages/Home';

function App() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <header className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-center">Crack The Doc</h1>
      </header>
      <main>
        <Home />
      </main>
    </div>
  );
}

export default App;