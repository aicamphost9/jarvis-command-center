import { RealtimeData, QueueMetrics, AgentStatus, LiveFeedItem, OverviewKPI } from '@/types';

// ===== Mock Data Generator =====
// Generates realistic contact center data that updates dynamically

const QUEUE_NAMES = ['Sales', 'Support', 'Billing', 'VIP', 'Technical'];
const AGENT_NAMES = [
  'สมหญิง ใจดี', 'วิชัย สมบูรณ์', 'นภา แก้วมณี', 'สมศักดิ์ เจริญสุข',
  'พิชัย วงษ์สวัสดิ์', 'อรุณ ศรีสุข', 'ธนา กิจเจริญ', 'ปิยะ รุ่งเรือง',
  'สมชาย พงศ์เพชร', 'วันชัย ทองคำ', 'กนก สุขสำราญ', 'มานะ ตั้งมั่น',
  'ลลิตา ดวงใจ', 'นิรันดร์ พัฒนา', 'ศิริ ประเสริฐ', 'อัจฉรา ภูมิใจ',
  'ประเสริฐ ชูตระกูล', 'จิตรา สุวรรณ', 'รัตนา ทิพย์', 'เกศ ศรีวิไล',
  'ทวี สมบัติ', 'พรทิพย์ สว่าง', 'ณัฐ กาญจน์', 'วิไล ภักดี',
  'ชัยวัฒน์ มงคล', 'อุทัย รัตน์', 'บุญมี ศรี', 'กัญญา ทอง',
  'สมพร ดี', 'หทัย สุข', 'ภัทร สันติ', 'ดวงจันทร์ แสง',
  'ประภา พร', 'กิตติ ชัย', 'สิริ วัฒน์', 'ฤทัย มณี',
  'ณัฐพล ศรีสะอาด', 'กมล ชัยชนะ', 'วรรณา สุขใจ', 'สุภาพ ยืนยง',
  'เอกชัย ก้าวหน้า', 'ภัณฑิลา ร่มเย็น',
];

const AGENT_STATUSES: AgentStatus['status'][] = [
  'on-queue', 'on-queue', 'on-queue', 'on-queue', 'on-queue',
  'busy', 'busy', 'busy',
  'idle', 'idle',
  'acw', 'acw',
  'break',
  'meal',
  'meeting',
];

const SKILLS_MAP: Record<string, string[]> = {
  'Sales': ['Sales', 'Product Knowledge'],
  'Support': ['Technical Support', 'Troubleshooting'],
  'Billing': ['Billing', 'Payment Processing'],
  'VIP': ['VIP Handling', 'Retention'],
  'Technical': ['Advanced Technical', 'Escalation'],
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getQueueStatus(avgWait: number, sla: number): QueueMetrics['status'] {
  if (avgWait > 300 || sla < 70) return 'critical';
  if (avgWait > 180 || sla < 80) return 'warning';
  return 'healthy';
}

function generateQueues(): QueueMetrics[] {
  const configs = [
    { name: 'Sales', waitRange: [30, 180], slaRange: [78, 95], waitingRange: [3, 15] },
    { name: 'Support', waitRange: [60, 500], slaRange: [60, 90], waitingRange: [8, 35] },
    { name: 'Billing', waitRange: [30, 240], slaRange: [72, 92], waitingRange: [2, 12] },
    { name: 'VIP', waitRange: [10, 60], slaRange: [90, 99], waitingRange: [0, 5] },
    { name: 'Technical', waitRange: [60, 360], slaRange: [65, 88], waitingRange: [3, 18] },
  ];

  return configs.map((cfg, i) => {
    const avgWait = randomBetween(cfg.waitRange[0], cfg.waitRange[1]);
    const sla = randomFloat(cfg.slaRange[0], cfg.slaRange[1]);
    return {
      id: `queue-${i}`,
      name: cfg.name,
      mediaType: 'voice' as const,
      interactionsWaiting: randomBetween(cfg.waitingRange[0], cfg.waitingRange[1]),
      interactionsActive: randomBetween(5, 20),
      avgWaitTimeSeconds: avgWait,
      longestWaitTimeSeconds: avgWait + randomBetween(30, 180),
      slaPercent: sla,
      slaTarget: 85,
      abandonRate: randomFloat(2, 12),
      status: getQueueStatus(avgWait, sla),
    };
  });
}

function generateAgents(): AgentStatus[] {
  return AGENT_NAMES.map((name, i) => {
    const status = AGENT_STATUSES[i % AGENT_STATUSES.length];
    const queueIdx = i % QUEUE_NAMES.length;
    const queueName = QUEUE_NAMES[queueIdx];
    return {
      id: `agent-${i}`,
      name,
      status,
      statusDuration: randomBetween(10, 1800),
      currentQueue: ['on-queue', 'busy', 'acw'].includes(status) ? queueName : undefined,
      currentInteractionType: ['on-queue', 'busy'].includes(status) ? 'voice' : undefined,
      currentInteractionDuration: ['on-queue', 'busy'].includes(status) ? randomBetween(30, 600) : undefined,
      aht: randomBetween(180, 480),
      callsHandled: randomBetween(5, 35),
      csat: randomFloat(3.2, 5.0),
      skills: SKILLS_MAP[queueName] || ['General'],
    };
  });
}

function generateLiveFeed(): LiveFeedItem[] {
  const now = new Date();
  const items: LiveFeedItem[] = [
    {
      id: 'feed-1',
      timestamp: new Date(now.getTime() - 15000),
      type: 'alert',
      message: 'Agent สมชาย → AHT 12m (ปกติ 5m)',
      queue: 'Support',
      agent: 'สมชาย พงศ์เพชร',
    },
    {
      id: 'feed-2',
      timestamp: new Date(now.getTime() - 30000),
      type: 'vip',
      message: 'VIP Customer "บริษัท ABC จำกัด" เข้าสาย',
      queue: 'VIP',
    },
    {
      id: 'feed-3',
      timestamp: new Date(now.getTime() - 45000),
      type: 'warning',
      message: 'Support Queue ทะลุ threshold 5 นาที',
      queue: 'Support',
    },
    {
      id: 'feed-4',
      timestamp: new Date(now.getTime() - 60000),
      type: 'info',
      message: 'Agent วิชัย กลับจาก break แล้ว',
      agent: 'วิชัย สมบูรณ์',
    },
    {
      id: 'feed-5',
      timestamp: new Date(now.getTime() - 90000),
      type: 'escalation',
      message: 'Escalation: ลูกค้า #4821 ขอคุยผู้จัดการ',
      queue: 'Billing',
      agent: 'กนก สุขสำราญ',
    },
    {
      id: 'feed-6',
      timestamp: new Date(now.getTime() - 120000),
      type: 'alert',
      message: 'Abandon rate พุ่ง 15% ใน Technical Queue',
      queue: 'Technical',
    },
    {
      id: 'feed-7',
      timestamp: new Date(now.getTime() - 150000),
      type: 'info',
      message: 'Agent นภา ปิดเคส #7392 — FCR ✓',
      agent: 'นภา แก้วมณี',
    },
    {
      id: 'feed-8',
      timestamp: new Date(now.getTime() - 200000),
      type: 'vip',
      message: 'VIP Customer "ธนาคาร XYZ" เข้า chat',
      queue: 'VIP',
    },
  ];
  return items;
}

function generateOverview(queues: QueueMetrics[], agents: AgentStatus[]): OverviewKPI {
  const totalWaiting = queues.reduce((sum, q) => sum + q.interactionsWaiting, 0);
  const totalActive = queues.reduce((sum, q) => sum + q.interactionsActive, 0);
  const onlineAgents = agents.filter(a => a.status !== 'offline').length;
  const avgSLA = queues.reduce((sum, q) => sum + q.slaPercent, 0) / queues.length;
  const avgAHT = agents.filter(a => a.status !== 'offline').reduce((sum, a) => sum + a.aht, 0) / onlineAgents;
  const avgAbandon = queues.reduce((sum, q) => sum + q.abandonRate, 0) / queues.length;

  return {
    totalCallsNow: totalActive + totalWaiting,
    totalCallsNowDelta: randomFloat(-10, 20),
    totalInQueue: totalWaiting,
    totalInQueueDelta: randomFloat(-20, 180),
    agentsOnline: onlineAgents,
    agentsOnlineDelta: randomBetween(-3, 2),
    slaPercent: parseFloat(avgSLA.toFixed(2)),
    slaTarget: 85,
    slaDelta: randomFloat(-5, 3),
    aht: Math.round(avgAHT),
    ahtDelta: randomFloat(-15, 15),
    abandonRate: parseFloat(avgAbandon.toFixed(2)),
    abandonRateDelta: randomFloat(-3, 5),
    csat: randomFloat(3.8, 4.5),
    csatDelta: randomFloat(-0.3, 0.3),
    fcr: randomFloat(72, 85),
    fcrDelta: randomFloat(-3, 3),
  };
}

export function generateMockRealtimeData(): RealtimeData {
  const queues = generateQueues();
  const agents = generateAgents();
  return {
    overview: generateOverview(queues, agents),
    queues,
    agents,
    liveFeed: generateLiveFeed(),
    lastUpdated: new Date(),
  };
}

// Slightly modify existing data to simulate real-time changes
export function evolveMockData(prev: RealtimeData): RealtimeData {
  const queues = prev.queues.map(q => ({
    ...q,
    interactionsWaiting: Math.max(0, q.interactionsWaiting + randomBetween(-3, 3)),
    avgWaitTimeSeconds: Math.max(10, q.avgWaitTimeSeconds + randomBetween(-30, 30)),
    slaPercent: Math.min(100, Math.max(50, q.slaPercent + randomFloat(-2, 2))),
    abandonRate: Math.max(0, Math.min(30, q.abandonRate + randomFloat(-1, 1))),
    status: getQueueStatus(
      Math.max(10, q.avgWaitTimeSeconds + randomBetween(-30, 30)),
      Math.min(100, Math.max(50, q.slaPercent + randomFloat(-2, 2)))
    ),
  }));

  const agents = prev.agents.map(a => {
    // Small chance to change status
    if (Math.random() < 0.1) {
      const newStatus = AGENT_STATUSES[randomBetween(0, AGENT_STATUSES.length - 1)];
      return { ...a, status: newStatus, statusDuration: 0 };
    }
    return { ...a, statusDuration: a.statusDuration + 5 };
  });

  return {
    overview: generateOverview(queues, agents),
    queues,
    agents,
    liveFeed: prev.liveFeed,
    lastUpdated: new Date(),
  };
}
