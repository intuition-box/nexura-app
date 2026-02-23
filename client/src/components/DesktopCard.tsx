"use client";

import { ResponsivePie } from "@nivo/pie";

export default function DesktopCards({ usersJoined, tasksCompleted }) {
  return (
    <div className="grid grid-cols-3 gap-2">

      {/* TOTAL QUESTS CREATED */}
      <div
        className="bg-gray-800 rounded-2xl p-4 flex flex-col justify-between border-2 border-purple-500"
        style={{ width: '350px', height: '195px' }}
      >
        <h2 className="text-purple-500 font-bold text-lg">
          TOTAL QUESTS CREATED
        </h2>
        <p className="text-4xl font-semibold text-purple-500 mt-4">1</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-white/70 text-sm">
            VERIFIED ECOSYSTEM TASKS
          </span>
          <div className="flex items-center text-center">
            <img src="/quest-icon.png" alt="Quest Icon" className="w-8 h-8 mb-2" />
          </div>
        </div>
      </div>

      {/* Join vs Completion Ratio */}
      <div
        className="bg-gray-800 rounded-2xl p-4 flex flex-col items-center border-2 border-purple-500 row-span-4"
        style={{ width: '350px', height: '400px' }}
      >
        <h2 className="text-white font-bold text-center text-lg mb-4">
          Join vs Completion Ratio
        </h2>

        <div className="relative w-56 h-56" style={{ height: 220 }}>
          <ResponsivePie
            data={[
              { id: 'Tasks Completed', value: Math.min(tasksCompleted, usersJoined) },
              { id: 'Users Not Completed', value: Math.max(usersJoined - tasksCompleted, 0) },
            ]}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.6}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={['#3B82F6', '#833AFD']}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            enableArcLinkLabels={false}
            enableArcLabels={false}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            theme={{
              tooltip: {
                container: {
                  background: '#333333',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                },
              },
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-white font-bold text-2xl">
              {usersJoined === 0 ? 0 : ((Math.min(tasksCompleted, usersJoined) / usersJoined) * 100).toFixed(2)}%
            </p>
            <span className="text-white text-xs">Completion</span>
          </div>
        </div>
        {/* Legend Boxes */} <div className="mt-4 flex flex-col gap-3 w-full items-center"> <div className="w-56 bg-gray-700/50 border border-purple-500 rounded-lg px-3 py-3 flex justify-between items-center"> <div className="flex items-center gap-2"> <span className="w-3 h-3 bg-purple-500 rounded-full"></span> <span className="text-white text-sm">Users Joined</span> </div> <span className="text-white text-sm font-semibold">{usersJoined}</span> </div> <div className="w-56 bg-gray-700/50 border border-purple-500 rounded-lg px-4 py-3 flex justify-between items-center"> <div className="flex items-center gap-2"> <span className="w-3 h-3 bg-blue-500 rounded-full"></span> <span className="text-white text-sm">Tasks Completed</span> </div> <span className="text-white text-sm font-semibold">{tasksCompleted}</span> </div> </div>
      </div>

      {/* TOTAL $TRUST DISTRIBUTED */}
      <div
        className="bg-gray-800 rounded-2xl p-4 border-2 border-purple-500"
        style={{ width: '380px', height: '125px' }}
      >
        <div className="grid grid-cols-2 h-full">
          <div className="flex flex-col justify-center">
            <h2 className="text-white font-bold text-sm tracking-wide whitespace-nowrap">
              TOTAL $TRUST DISTRIBUTED
            </h2>
            <div className="flex items-center mt-2 gap-3">
              <p className="text-3xl font-semibold text-white">4000</p>
              <img src="/trust-icon.png" alt="Trust Icon" className="w-16 h-8 object-contain" />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <img src="/intuition-icon.png" alt="Intuition Icon" className="w-16 h-16 rounded-lg object-cover" />
          </div>
        </div>
      </div>

      {/* TOTAL CAMPAIGNS CREATED */}
      <div
        className="bg-gray-800 rounded-2xl p-4 flex flex-col justify-between border-2 border-purple-500"
        style={{ width: '350px', height: '195px' }}
      >
        <h2 className="text-purple-500 font-bold text-lg">TOTAL CAMPAIGNS CREATED</h2>
        <p className="text-4xl font-semibold text-purple-500 mt-4">1</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-white/70 text-sm">
            VERIFIED ECOSYSTEM CAMPAIGNS
          </span>
          <div className="flex items-center">
            <img src="/quest-icon.png" alt="Quest Icon" className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* On-Chain Activity */}
      <div
        className="rounded-2xl p-4 flex flex-col items-center justify-center -mt-16"
        style={{ width: '380px', height: '265px', backgroundColor: '#833AFD' }}
      >
        <h2 className="text-white font-bold text-lg mb-4 text-center">On-Chain Activity</h2>
        <div className="flex items-center mb-6 gap-3">
          <img src="/rate-icon.png" alt="Rate Icon" className="w-24 h-24" />
          <div className="flex flex-col">
            <p className="text-white font-bold text-2xl">1500</p>
            <p className="text-white text-sm">INTERACTIONS</p>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 py-1 inline-block">
          <p className="flex items-start text-white">
            <span className="text-lg mr-8 mt-4">Total On-Chain Claims</span>
            <span className="flex flex-col text-right">
              <span className="text-5xl font-bold leading-none">500</span>
              <span className="text-xs">INTERACTED</span>
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}
