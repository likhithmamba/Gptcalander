import React from 'react';
import { AppProvider } from './store';
import { useCalendarState } from './hooks';
import { CalendarCanvas } from './components/CalendarCanvas';
import { FocusSession } from './components/FocusSession';
import { CommandPalette } from './components/CommandPalette';
import { ControlDock } from './components/ControlDock';

const AppContent: React.FC = () => {
  const { view } = useCalendarState();

  return (
     <div className="h-screen w-screen bg-bg font-sans flex flex-col text-text overflow-hidden relative selection:bg-primary/30">
        
        {/* The Brain (Overlay) */}
        <CommandPalette />

        {/* The Navigation Anchor */}
        <ControlDock />

        {/* The Viewport */}
        <main className="flex-1 w-full h-full relative z-0">
            {view === 'canvas' && <CalendarCanvas />}
            {view === 'focus' && <FocusSession />}
        </main>

        {/* Subtle Noise Texture */}
        <div className="pointer-events-none fixed inset-0 opacity-[0.03] z-[900] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
  );
};

export default function App() {
  return (
      <AppProvider>
        <AppContent />
      </AppProvider>
  );
}