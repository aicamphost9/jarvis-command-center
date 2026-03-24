'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import Header from '@/components/layout/Header';
import HudBackground from '@/components/layout/HudBackground';
import Dashboard from '@/components/dashboard/Dashboard';
import ChatConsole from '@/components/chat/ChatConsole';
import { cn } from '@/lib/utils';

export default function Home() {
  const { activePanel, fetchRealtimeData } = useAppStore();

  useEffect(() => {
    // Fetch immediately, then poll every 10 seconds
    fetchRealtimeData();
    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchRealtimeData]);

  return (
    <div className="h-screen flex flex-col bg-bg-void relative overflow-hidden">
      <HudBackground />

      <div className="relative z-10 flex flex-col h-full">
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
    </div>
  );
}
