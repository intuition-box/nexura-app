"use client";

import { ResponsivePie } from "@nivo/pie";

interface DesktopCardsProps {
  usersJoined: number;
  tasksCompleted: number;
  totalQuests: number;
  totalCampaigns: number;
  totalTrustDistributed: number;
  totalOnchainInteractions: number;
  totalOnchainClaims: number;
}

export default function DesktopCards({
  usersJoined,
  tasksCompleted,
  totalQuests,
  totalCampaigns,
  totalTrustDistributed,
  totalOnchainInteractions,
  totalOnchainClaims,
}: DesktopCardsProps) {
  const remaining = Math.max(totalOnchainInteractions - totalOnchainClaims, 0);
  const mints = Math.floor(remaining * 0.5);
  const payments = remaining - mints;
  const interactionData = [
    { id: 'Claims', label: 'Claims', value: Math.max(totalOnchainClaims, 0), color: '#a855f7' },
    { id: 'Mints', label: 'Mints', value: Math.max(mints, 0), color: '#3b82f6' },
    { id: 'Payments', label: 'Payments', value: Math.max(payments, 0), color: '#10b981' },
  ];
  const hasData = totalOnchainInteractions > 0;
  return (
    <div className="grid grid-cols-3 gap-3">

      {/* ── Col 1: Quests + Campaigns stacked, spans 3 rows ── */}
      <div className="col-start-1 row-start-1 row-span-3 flex flex-col gap-3">

        {/* Total Quests */}
        <div className="glass glass-hover shimmer-once rounded-xl p-3 flex flex-col justify-between border border-purple-500/40 hover:border-purple-400/70 transition-all duration-300 group flex-1">
          <h2 className="text-purple-400 font-bold text-[10px] tracking-widest uppercase">Total Quests</h2>
          <p className="text-2xl font-bold text-purple-300 mt-1 group-hover:text-white transition-colors duration-300">{totalQuests}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-white/40 text-[9px] uppercase tracking-wider">Ecosystem Tasks</span>
            <img src="/quest-icon.png" alt="" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Total Campaigns */}
        <div className="glass glass-hover shimmer-once rounded-xl p-3 flex flex-col justify-between border border-purple-500/40 hover:border-purple-400/70 transition-all duration-300 group flex-1">
          <h2 className="text-purple-400 font-bold text-[10px] tracking-widest uppercase">Total Campaigns</h2>
          <p className="text-2xl font-bold text-purple-300 mt-1 group-hover:text-white transition-colors duration-300">{totalCampaigns}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-white/40 text-[9px] uppercase tracking-wider">Ecosystem Campaigns</span>
            <img src="/quest-icon.png" alt="" className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

      </div>

      {/* ── Join vs Completion — col 2, rows 1-3 (full height) ── */}
      <div className="col-start-2 row-start-1 row-span-3 glass glass-hover rounded-xl p-3 flex flex-col border border-purple-500/40 hover:border-purple-400/70 transition-all duration-300">
        <h2 className="text-white font-bold text-xs mb-2">Join vs Completion</h2>
        <div className="flex flex-col items-center gap-3 flex-1 justify-center">
          <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
            <ResponsivePie
              data={[
                { id: 'Tasks Completed', value: Math.min(tasksCompleted, usersJoined) },
                { id: 'Users Not Completed', value: Math.max(usersJoined - tasksCompleted, 0) },
              ]}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              innerRadius={0.62}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={5}
              colors={['#3B82F6', '#833AFD']}
              borderWidth={0}
              enableArcLinkLabels={false}
              enableArcLabels={false}
              animate={true}
              theme={{ tooltip: { container: { background: '#1a1a2e', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' } } }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-white font-bold text-lg leading-none">
                {usersJoined === 0 ? '0' : ((Math.min(tasksCompleted, usersJoined) / usersJoined) * 100).toFixed(1)}%
              </p>
              <span className="text-white/60 text-[8px]">Done</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span className="text-white/70 text-[10px]">Joined</span>
              </div>
              <span className="text-white text-[10px] font-semibold">{usersJoined.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-white/70 text-[10px]">Completed</span>
              </div>
              <span className="text-white text-[10px] font-semibold">{tasksCompleted.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── $TRUST Distributed — col 3, row 1 only (compact) ── */}
      <div className="col-start-3 row-start-1 glass glass-hover shimmer-once rounded-xl p-3 border border-purple-500/40 hover:border-purple-400/70 transition-all duration-300 flex items-center gap-3">
        <img src="/intuition-icon.png" alt="" className="w-9 h-9 rounded-lg object-cover opacity-90 shrink-0" />
        <div className="flex flex-col min-w-0">
          <h2 className="text-white/60 font-semibold text-[10px] uppercase tracking-widest">$TRUST Distributed</h2>
          <div className="flex items-baseline gap-1 mt-0.5">
            <img src="/trust-icon.png" alt="" className="w-5 h-3 object-contain shrink-0" />
            <p className="text-xl font-bold text-white truncate">{totalTrustDistributed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ── On-Chain Activity — col 3, rows 2-3 ── */}
      <div
        className="col-start-3 row-start-2 row-span-2 rounded-xl p-3 flex flex-col"
        style={{ background: 'linear-gradient(135deg, #833AFD 0%, #6028c7 100%)', boxShadow: '0 4px 20px rgba(131,58,253,0.4)' }}
      >
        <h2 className="text-white font-bold text-xs mb-0.5">On-Chain Activity</h2>
        <p className="text-white/50 text-[9px] uppercase tracking-widest mb-2">Interaction breakdown</p>
        <div className="flex flex-col items-center gap-2 flex-1 justify-center">
          <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
            <ResponsivePie
              data={hasData ? interactionData : [{ id: 'None', label: 'None', value: 1, color: '#ffffff20' }]}
              margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
              innerRadius={0.62}
              padAngle={1.5}
              cornerRadius={4}
              activeOuterRadiusOffset={5}
              colors={hasData ? interactionData.map(d => d.color) : ['#ffffff20']}
              borderWidth={0}
              enableArcLinkLabels={false}
              enableArcLabels={false}
              animate={true}
              theme={{ tooltip: { container: { background: '#1a1a2e', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' } } }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-white font-bold text-base leading-none">{totalOnchainInteractions.toLocaleString()}</p>
              <span className="text-white/60 text-[8px] mt-0.5">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            {interactionData.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-white/70 text-[10px]">{d.label}</span>
                </div>
                <span className="text-white font-semibold text-[10px]">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
