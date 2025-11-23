import { useState, useEffect } from "react"
import Image from "next/image"
import background from "@/assets/background.webp"
import { useSocketContext } from "@/context/socket"

export default function UniversalLeaderboard() {
  const { socket } = useSocketContext()
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState({ totalPlayers: 0, totalGames: 0, topScore: 0, topPlayer: 'None' })
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [useMockData, setUseMockData] = useState(false)

  const generateClientMockData = () => {
    const names = ['Ravi', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavya', 'Arjun', 'Meera']
    const surnames = ['Patel', 'Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Reddy', 'Iyer', 'Nair', 'Joshi']

    const mockEntries = []
    const usedNames = new Set()

    for (let i = 0; i < 30; i++) {
      let firstName = names[Math.floor(Math.random() * names.length)]
      let lastName = surnames[Math.floor(Math.random() * surnames.length)]
      let rollNumber = String(1000000000 + Math.floor(Math.random() * 999999999))
      const fullName = `${firstName} ${lastName} ${rollNumber}`

      if (usedNames.has(fullName)) {
        i--
        continue
      }
      usedNames.add(fullName)

      const gamesPlayed = Math.floor(Math.random() * 6) + 2
      const averageScore = Math.floor(Math.random() * 150) + 150
      const totalPoints = averageScore * gamesPlayed + Math.floor(Math.random() * 200)

      mockEntries.push({
        name: fullName,
        totalPoints: totalPoints,
        gamesPlayed: gamesPlayed,
        averageScore: averageScore,
        topScore: Math.floor(averageScore * 1.3),
        lastPlayed: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        joinedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        achievement: totalPoints > 1500 ? 'Champion' : gamesPlayed > 4 ? 'Dedicated' : averageScore > 200 ? 'Consistent' : null
      })
    }

    mockEntries.sort((a, b) => b.totalPoints - a.totalPoints)
    mockEntries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return mockEntries
  }

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      console.log('Fetching leaderboard, useMockData:', useMockData)
      if (useMockData) {
        console.log('Generating mock data...')
        const mockEntries = generateClientMockData()
        console.log('Mock data generated:', mockEntries.length, 'entries')
        setLeaderboard(mockEntries)
        setStats({
          totalPlayers: mockEntries.length,
          totalGames: mockEntries.reduce((sum, entry) => sum + entry.gamesPlayed, 0),
          topScore: mockEntries[0]?.totalPoints || 0,
          topPlayer: mockEntries[0]?.name || 'None'
        })
      } else {
        console.log('Fetching API data...')
        const response = await fetch('/api/universal-leaderboard')
        const data = await response.json()
        if (data.success) {
          console.log('API data received:', data.leaderboard?.length, 'entries')
          setLeaderboard(data.leaderboard)
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [useMockData])

  const toggleMockData = () => {
    setUseMockData(!useMockData)
  }

  useEffect(() => {
    if (socket) {
      const handleLeaderboardUpdate = (updatedLeaderboard) => {
        console.log('Real-time leaderboard update received')
        setLeaderboard(updatedLeaderboard.entries)
        setStats({
          totalPlayers: updatedLeaderboard.totalPlayers,
          totalGames: updatedLeaderboard.totalGamesPlayed,
          topScore: updatedLeaderboard.entries[0]?.totalPoints || 0,
          topPlayer: updatedLeaderboard.entries[0]?.name || 'None'
        })
      }

      socket.on('universal-leaderboard:update', handleLeaderboardUpdate)
      return () => socket.off('universal-leaderboard:update', handleLeaderboardUpdate)
    }
  }, [socket])

  useEffect(() => {
    if (leaderboard.length > 10) {
      const scrollInterval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.max(1, leaderboard.length - 9))
      }, 4000)
      return () => clearInterval(scrollInterval)
    }
  }, [leaderboard.length])

  const displayPlayers = leaderboard.slice(currentIndex, currentIndex + 10)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <div className="text-4xl font-bold text-white">Loading Event Leaderboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed left-0 top-0 -z-10 h-full w-full bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900">
        <Image
          className="pointer-events-none h-full w-full object-cover opacity-30"
          src={background}
          alt="background"
        />
      </div>

      <div className="flex justify-center pt-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
          <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
            🏆 EVENT CHAMPIONS
          </h1>
          <div className="grid grid-cols-4 gap-8 text-white">
            <div><div className="text-4xl font-bold text-yellow-400">{stats.totalPlayers}</div><div className="text-lg opacity-80">Champions</div></div>
            <div><div className="text-4xl font-bold text-blue-400">{stats.totalGames}</div><div className="text-lg opacity-80">Battles</div></div>
            <div><div className="text-4xl font-bold text-green-400">{stats.topScore}</div><div className="text-lg opacity-80">High Score</div></div>
            <div><div className="text-2xl font-bold text-orange-400">{stats.topPlayer}</div><div className="text-lg opacity-80">Leader</div></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={toggleMockData}
          className="bg-black/40 hover:bg-black/60 text-white/60 hover:text-white/80 transition-all rounded-full p-2 text-xs font-bold"
          title="Toggle between real quiz data and mock university tournament data"
        >
          {useMockData ? '🧪' : '📊'}
        </button>
      </div>

      <div className="flex justify-center py-12 px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 w-full max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-white">RANKINGS</h2>
            <div className="text-white/70 text-lg">Updating live...</div>
          </div>

          {leaderboard.length >= 3 && (
            <div className="flex justify-center items-end mb-8 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 text-black font-bold text-2xl">🥈</div>
                <div className="bg-gray-200 rounded-t-md w-32 h-24 flex flex-col items-center justify-center text-black font-bold">
                  <div className="text-sm font-bold">{leaderboard[1]?.name || 'N/A'}</div>
                  <div className="text-xs">{leaderboard[1]?.totalPoints || 0} pts</div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2 text-black font-bold text-3xl">👑</div>
                <div className="bg-yellow-200 rounded-t-md w-40 h-32 flex flex-col items-center justify-center text-black font-bold">
                  <div className="text-sm font-bold">{leaderboard[0]?.name || 'N/A'}</div>
                  <div className="text-sm">{leaderboard[0]?.totalPoints || 0} pts</div>
                  <div className="text-xs">EVENT CHAMPION!</div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2 text-black font-bold text-2xl">🥉</div>
                <div className="bg-orange-200 rounded-t-md w-32 h-20 flex flex-col items-center justify-center text-black font-bold">
                  <div className="text-sm font-bold">{leaderboard[2]?.name || 'N/A'}</div>
                  <div className="text-xs">{leaderboard[2]?.totalPoints || 0} pts</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {displayPlayers.map((player, index) => {
              const globalRank = currentIndex + index + 1
              return (
                <div key={player.name} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                  globalRank <= 3 ? 'bg-yellow-400/20 border border-yellow-400/50' :
                  globalRank <= 10 ? 'bg-blue-400/20 border border-blue-400/30' : 'bg-white/10 border border-white/20'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${
                      globalRank === 1 ? 'bg-yellow-400 text-black' :
                      globalRank === 2 ? 'bg-gray-300 text-black' :
                      globalRank === 3 ? 'bg-orange-400 text-black' : 'bg-white/20 text-white'
                    }`}>
                      {globalRank === 1 ? '👑' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : `#${globalRank}`}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{player.name}</div>
                      <div className="text-white/60 flex gap-4 text-sm">
                        <span>Games: {player.gamesPlayed}</span>
                        <span>Avg: {player.averageScore}</span>
                        {player.achievement && <span className="text-yellow-400">{player.achievement}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">{player.totalPoints}</div>
                    <div className="text-white/60 text-sm">Total Points</div>
                  </div>
                </div>
              )
            })}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-16 text-white/70">
              <div className="text-6xl mb-4">🎯</div>
              <div className="text-2xl">No players yet! Start quizzing to appear here.</div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 text-white/70 text-lg font-bold">
          ⏰ Real-time rankings • Updated every 10 seconds
        </div>
      </div>
    </div>
  )
}
