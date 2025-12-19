import React, { useEffect, useState } from 'react'
import AnimatedBackground from '@/components/AnimatedBackground'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { apiRequestV2 } from '@/lib/queryClient'

type Entry = {
  _id: string
  username: string
  avatar?: string
  display_name?: string
  xp: number
  level: number
}

export default function Leaderboard(): JSX.Element {
  const [list, setList] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { leaderboardInfo: { leaderboardByXp } } = await apiRequestV2("GET", "/api/leaderboard")

        const entries = leaderboardByXp || [];

        setList(entries)
      } catch (err) {
        console.warn('Using mock data for leaderboard')
        setList([
          { _id: '1', username: 'Cryptohanas', xp: 50000, level: 15 },
          { _id: '2', username: 'RChris', xp: 49500, level: 14 },
          { _id: '3', username: 'Nuel', xp: 49490, level: 13 },
          { _id: '4', username: 'Omotola', xp: 49480, level: 12 },
          { _id: '5', username: 'Bright', xp: 49470, level: 11 },
          { _id: '6', username: 'Emmy', xp: 49460, level: 10 },
          { _id: '7', username: 'TFK', xp: 49450, level: 9 },
          { _id: '8', username: 'Doodle', xp: 49440, level: 8 },
          { _id: '9', username: 'Kraken', xp: 49430, level: 7 },
          { _id: '10', username: 'Vankedas', xp: 49420, level: 6 },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-auto relative">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center" style={{ height: '200px' }}>
          <p className="text-white/60">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const topThree = list.slice(0, 3)
  const remaining = list.slice(3)

  return (
    <div className="min-h-screen bg-black text-white overflow-auto relative" data-testid="leaderboard-page">
      <AnimatedBackground />

      {/* Main Content */}
      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Leaderboard</h1>
          <p className="text-white/60">Compete and earn rewards</p>
        </div>

        {/* Top 3 Pyramid */}
        {topThree.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-8">Top Performers</h2>
            <div className="flex items-flex-end justify-center gap-6">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center">
                  <div className="glass rounded-2xl p-6 w-56 text-center mb-4 transform translate-y-12">
                    <div className="mb-4 flex justify-center">
                      <img src="/silver72x15852-wqrf-200w.png" alt="Silver" className="w-10 h-12" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">2</div>
                    <div className="text-sm text-white/80 font-medium mb-2">{topThree[1].username}</div>
                    <div className="text-lg text-white/60 font-semibold">{topThree[1].xp.toLocaleString()} XP</div>
                  </div>
                </div>
              )}

              {/* 1st Place - Center & Tallest */}
              {topThree[0] && (
                <div className="flex flex-col items-center">
                  <div className="glass rounded-2xl p-8 w-64 text-center border border-white/20">
                    <div className="mb-4 flex justify-center">
                      <img src="/gold72x15852-yld-200w.png" alt="Gold" className="w-12 h-14" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">👑</div>
                    <div className="text-lg text-white font-bold mb-2">{topThree[0].username}</div>
                    <div className="text-xl text-white font-semibold">{topThree[0].xp.toLocaleString()} XP</div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center">
                  <div className="glass rounded-2xl p-6 w-56 text-center mb-4 transform translate-y-24">
                    <div className="mb-4 flex justify-center">
                      <img src="/bronze72x15852-hwq-200w.png" alt="Bronze" className="w-10 h-12" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">3</div>
                    <div className="text-sm text-white/80 font-medium mb-2">{topThree[2].username}</div>
                    <div className="text-lg text-white/60 font-semibold">{topThree[2].xp.toLocaleString()} XP</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-fit grid-cols-1 bg-muted/50 glass">
            <TabsTrigger value="all" data-testid="tab-all">All Players</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {/* Leaderboard Table */}
            <div className="glass rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">#</div>
                <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">Player</div>
                <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">Level</div>
                <div className="text-sm font-semibold text-white/60 uppercase tracking-wider text-right">XP</div>
              </div>

              {/* Table Rows */}
              <div>
                {remaining.map((entry, idx) => {
                  const rank = idx + 4
                  return (
                    <div
                      key={entry._id || idx}
                      className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <div className="text-sm font-semibold text-white/80">{rank}</div>
                      <div className="text-sm text-white font-medium">{entry.username || 'Anonymous'}</div>
                      <div className="text-sm text-white/60">{entry.level || 1}</div>
                      <div className="text-sm text-white/80 font-semibold text-right">{entry.xp.toLocaleString()}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
