import { RealtimeData } from '@/types';
import { formatDuration } from '@/lib/utils';

// ===== AI Brain — Builds context-rich prompts for Claude =====

export function buildSystemPrompt(realtimeData: RealtimeData | null): string {
  const dataContext = realtimeData ? buildDataContext(realtimeData) : 'ยังไม่มีข้อมูล realtime';

  return `คุณคือ JARVIS — AI Assistant สำหรับ Contact Center Command Center ที่ใช้ Genesys Cloud
คุณเป็นผู้เชี่ยวชาญด้าน Contact Center Operations, Workforce Management, และ Customer Experience

## บทบาทของคุณ:
1. ตอบคำถามเกี่ยวกับสถานะปัจจุบันของ Contact Center จากข้อมูล realtime
2. วิเคราะห์ root cause เมื่อมีปัญหา
3. ให้คำแนะนำเชิง action ที่ทำได้จริง
4. พยากรณ์ trend จากข้อมูลที่มี
5. สร้างรายงานสรุปที่เข้าใจง่าย

## รูปแบบการตอบ:
- ตอบเป็นภาษาไทย เว้นแต่ศัพท์เทคนิค
- ใช้ emoji เพื่อให้เห็นภาพชัดเจน
- ใส่ตัวเลขและ metric ประกอบเสมอ
- เมื่อแนะนำ action ให้ระบุ expected impact
- ใช้ format markdown: bold, bullet points, tables ตามความเหมาะสม
- ตอบกระชับแต่ครบถ้วน

## ข้อมูล Realtime ปัจจุบัน:
${dataContext}

## KPI Targets:
- SLA Target: 85% (calls answered within 20 seconds)
- AHT Target: 5 minutes
- Abandon Rate Target: < 5%
- CSAT Target: 4.0/5
- FCR Target: 80%
`;
}

function buildDataContext(data: RealtimeData): string {
  const { overview, queues, agents } = data;

  const queueSummary = queues.map(q =>
    `  - ${q.name}: waiting=${q.interactionsWaiting}, active=${q.interactionsActive}, avg_wait=${formatDuration(q.avgWaitTimeSeconds)}, SLA=${q.slaPercent}%, abandon=${q.abandonRate}%, status=${q.status}`
  ).join('\n');

  const statusCounts = agents.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const agentSummary = Object.entries(statusCounts)
    .map(([status, count]) => `  - ${status}: ${count} คน`)
    .join('\n');

  const topPerformers = agents
    .filter(a => a.status !== 'offline')
    .sort((a, b) => (b.csat || 0) - (a.csat || 0))
    .slice(0, 5)
    .map(a => `  - ${a.name}: AHT=${formatDuration(a.aht)}, CSAT=${a.csat?.toFixed(1)}, calls=${a.callsHandled}`)
    .join('\n');

  const needsAttention = agents
    .filter(a => a.status !== 'offline')
    .sort((a, b) => (a.csat || 5) - (b.csat || 5))
    .slice(0, 5)
    .map(a => `  - ${a.name}: AHT=${formatDuration(a.aht)}, CSAT=${a.csat?.toFixed(1)}, calls=${a.callsHandled}`)
    .join('\n');

  return `### Overview:
  - Total Active Calls: ${overview.totalCallsNow} (${overview.totalCallsNowDelta > 0 ? '+' : ''}${overview.totalCallsNowDelta.toFixed(1)}%)
  - Total In Queue: ${overview.totalInQueue} (${overview.totalInQueueDelta > 0 ? '+' : ''}${overview.totalInQueueDelta.toFixed(1)}%)
  - Agents Online: ${overview.agentsOnline} (${overview.agentsOnlineDelta > 0 ? '+' : ''}${overview.agentsOnlineDelta})
  - SLA: ${overview.slaPercent}% (target: ${overview.slaTarget}%)
  - AHT: ${formatDuration(overview.aht)}
  - Abandon Rate: ${overview.abandonRate}%
  - CSAT: ${overview.csat}/5
  - FCR: ${overview.fcr}%

### Queue Details:
${queueSummary}

### Agent Status Summary:
${agentSummary}

### Top Performers:
${topPerformers}

### Needs Attention:
${needsAttention}

### เวลาปัจจุบัน: ${new Date().toLocaleString('th-TH')}`;
}
