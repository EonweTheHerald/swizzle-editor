import { Header } from './components/layout/Header';
import { LeftPanel } from './components/layout/LeftPanel';
import { CenterPanel } from './components/layout/CenterPanel';
import { RightPanel } from './components/layout/RightPanel';
import { StatusBar } from './components/layout/StatusBar';
import { Toaster } from 'sonner';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      {/* Header / Toolbar */}
      <Header />

      {/* Main three-panel layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel: Layers + Assets */}
        <LeftPanel />

        {/* Center Panel: Preview Canvas */}
        <CenterPanel />

        {/* Right Panel: Properties */}
        <RightPanel />
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Toast notifications */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontSize: 'var(--text-xs)',
            borderRadius: 'var(--radius-md)',
          },
        }}
      />
    </div>
  );
}

export default App;
