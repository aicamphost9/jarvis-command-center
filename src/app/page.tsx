'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/dashboard/Dashboard';
import ChatConsole from '@/components/chat/ChatConsole';
import { cn } from '@/lib/utils';

export default function Home() {
  const { activePanel, initRealtimeData, updateRealtimeData } = useAppStore();

  // Initialize and auto-update realtime data
  useEffect(() => {
    initRealtimeData();

    const interval = setInterval(() => {
      updateRealtimeData();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [initRealtimeData, updateRealtimeData]);

  return (
    <div className="h-screen flex flex-col bg-bg-primary relative scanline">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Dashboard Panel */}
        {(activePanel === 'both' || activePanel === 'dashboard') && (
          <div className={cn(
            'overflow-hidden',
            activePanel === 'both' ? 'flex-1' : 'w-full',
          )}>
            <Dashboard />
          </div>
        )}

        {/* Chat Panel */}
        {(activePanel === 'both' || activePanel === 'chat') && (
          <div className={cn(
            'overflow-hidden',
            activePanel === 'both' ? 'w-[420px]' : 'w-full max-w-3xl mx-auto',
          )}>
            <ChatConsole />
          </div>
        )}
      </main>
    </div>
  );
}
