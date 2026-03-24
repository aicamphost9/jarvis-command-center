import { create } from 'zustand';
import { RealtimeData, ChatMessage, Alert } from '@/types';

interface AppState {
  // Realtime data
  realtimeData: RealtimeData | null;
  dataSource: 'genesys' | 'mock' | 'mock-fallback' | null;
  isConnected: boolean;

  // Chat
  messages: ChatMessage[];
  isAiTyping: boolean;

  // Alerts
  alerts: Alert[];

  // UI
  activePanel: 'dashboard' | 'chat' | 'both';
  chatExpanded: boolean;

  // Actions
  fetchRealtimeData: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setAiTyping: (typing: boolean) => void;
  setActivePanel: (panel: 'dashboard' | 'chat' | 'both') => void;
  setChatExpanded: (expanded: boolean) => void;
  acknowledgeAlert: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  realtimeData: null,
  dataSource: null,
  isConnected: false,
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: `สวัสดีครับ ผม **JARVIS** — AI Assistant สำหรับ Command Center

ผมช่วยคุณได้หลายอย่าง เช่น:
- 📊 **ถามข้อมูล**: "ตอนนี้คิวยาวแค่ไหน?", "SLA เท่าไหร่?"
- 🔍 **วิเคราะห์**: "ทำไม abandon rate สูง?", "วิเคราะห์ทีม support"
- 📈 **พยากรณ์**: "บ่ายนี้จะเป็นยังไง?", "พรุ่งนี้ต้องใช้ agent กี่คน?"
- 📋 **รายงาน**: "สรุปผลงานวันนี้", "เทียบกับสัปดาห์ที่แล้ว"
- ⚡ **สั่งงาน**: "ย้าย agent ไป support queue"

พิมพ์คำถามหรือคำสั่งได้เลยครับ!`,
      timestamp: new Date(),
    },
  ],
  isAiTyping: false,
  alerts: [],
  activePanel: 'both',
  chatExpanded: false,

  fetchRealtimeData: async () => {
    try {
      const response = await fetch('/api/metrics');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const { source, ...realtimeData } = data;

      set({
        realtimeData: {
          ...realtimeData,
          lastUpdated: new Date(realtimeData.lastUpdated),
          liveFeed: realtimeData.liveFeed?.map((item: Record<string, unknown>) => ({
            ...item,
            timestamp: new Date(item.timestamp as string),
          })) ?? [],
        },
        dataSource: source,
        isConnected: true,
      });
    } catch (error) {
      console.error('[Store] Failed to fetch metrics:', error);
      set({ isConnected: false });
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  setAiTyping: (typing) => set({ isAiTyping: typing }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setChatExpanded: (expanded) => set({ chatExpanded: expanded }),
  acknowledgeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    }));
  },
}));
