'use client';

import KPICards from './KPICards';
import QueueHealth from './QueueHealth';
import AgentGrid from './AgentGrid';
import LiveFeed from './LiveFeed';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {/* KPI Overview */}
      <KPICards />

      {/* Queue Health */}
      <QueueHealth />

      {/* Agent Grid + Live Feed */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <AgentGrid />
        </div>
        <div className="col-span-1">
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
