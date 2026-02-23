"use client";

import { ResponsivePie } from "@nivo/pie";

export default function MobileCards({ usersJoined, tasksCompleted }) {
  return (
    <div className="grid grid-cols-1 gap-4">

  {/* First row: TOTAL QUESTS CREATED + TOTAL CAMPAIGNS CREATED */}
  <div className="grid grid-cols-2 gap-2 w-full">

    {/* TOTAL QUESTS CREATED */}
    <div
      className="bg-gray-800 rounded-2xl p-4 flex flex-col justify-between border-2 border-purple-500"
      style={{ height: '160px' }}
    >
      <h2 className="font-bold text-lg">TOTAL QUESTS CREATED</h2>
      <p className="text-3xl font-semibold mt-3">1</p>
    </div>

    {/* TOTAL CAMPAIGNS CREATED */}
    <div
      className="bg-gray-800 rounded-2xl p-4 flex flex-col justify-between border-2 border-purple-500"
      style={{ height: '160px' }}
    >
      <h2 className=" font-bold text-lg">TOTAL CAMPAIGNS CREATED</h2>
      <p className="text-3xl font-semibold mt-3">1</p>

    </div>

  </div>

      {/* Join vs Completion Ratio */}
      <div
        className="bg-gray-800 rounded-2xl p-4 flex flex-col items-center border-2 border-purple-500"
        style={{ width: '100%', height: '320px' }}
      >
        <h2 className="text-white font-bold text-center text-lg mb-4">Join vs Completion Ratio</h2>

        <div className="relative w-52 h-52">
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
              {usersJoined === 0
                ? 0
                : ((Math.min(tasksCompleted, usersJoined) / usersJoined) * 100).toFixed(2)}%
            </p>
            <span className="text-white text-xs">Completion</span>
          </div>
        </div>

        {/* Legend Boxes */}
        <div className="mt-4 flex flex-col gap-2 w-full items-center">
          <div className="w-full bg-gray-700/50 border border-purple-500 rounded-lg px-3 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span className="text-white text-sm">Users Joined</span>
            </div>
            <span className="text-white text-sm font-semibold">{usersJoined}</span>
          </div>

          <div className="w-full bg-gray-700/50 border border-purple-500 rounded-lg px-3 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-white text-sm">Tasks Completed</span>
            </div>
            <span className="text-white text-sm font-semibold">{tasksCompleted}</span>
          </div>
        </div>
      </div>

      {/* TOTAL $TRUST DISTRIBUTED */}
      <div
        className="bg-gray-800 rounded-2xl p-4 border-2 border-purple-500"
        style={{ width: '100%', height: '120px' }}
      >
        <div className="grid grid-cols-2 h-full">
          <div className="flex flex-col justify-center">
            <h2 className="text-white font-bold text-sm tracking-wide whitespace-nowrap">
              TOTAL $TRUST DISTRIBUTED
            </h2>
            <div className="flex items-center mt-2 gap-2">
              <p className="text-2xl font-semibold text-white">4000</p>
              <img src="/trust-icon.png" alt="Trust Icon" className="w-12 h-6 object-contain" />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <img src="/intuition-icon.png" alt="Intuition Icon" className="w-12 h-12 rounded-lg object-cover" />
          </div>
        </div>
      </div>

      {/* On-Chain Activity */}
      <div
        className="rounded-2xl p-4 flex flex-col items-center justify-center"
        style={{ width: '100%', height: '240px', backgroundColor: '#833AFD' }}
      >
        <h2 className="text-white font-bold text-lg mb-4 text-center">On-Chain Activity</h2>
        <div className="flex items-center mb-4 gap-2">
          <img src="/rate-icon.png" alt="Rate Icon" className="w-20 h-20" />
          <div className="flex flex-col">
            <p className="text-white font-bold text-xl">1500</p>
            <p className="text-white text-sm">INTERACTIONS</p>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 inline-block w-full">
          <p className="flex items-start text-white justify-between">
            <span className="text-base">Total On-Chain Claims</span>
            <span className="flex flex-col text-right">
              <span className="text-3xl font-bold leading-none">500</span>
              <span className="text-xs">INTERACTED</span>
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}
