import fs from 'fs'
import path from 'path'

function loadLeaderboard() {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const leaderboardFile = path.join(dataDir, 'universal-leaderboard.json')

    if (fs.existsSync(leaderboardFile)) {
      const data = fs.readFileSync(leaderboardFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading universal leaderboard:', error)
  }

  // Return empty leaderboard if file doesn't exist
  return {
    eventDay: new Date().toISOString().split('T')[0],
    totalPlayers: 0,
    totalGamesPlayed: 0,
    lastUpdated: new Date().toISOString(),
    entries: []
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20
      const leaderboard = loadLeaderboard()
      const topEntries = leaderboard.entries.slice(0, limit)

      res.status(200).json({
        success: true,
        leaderboard: topEntries,
        stats: {
          totalPlayers: leaderboard.totalPlayers,
          totalGames: leaderboard.totalGamesPlayed,
          topScore: leaderboard.entries[0]?.totalPoints || 0,
          topPlayer: leaderboard.entries[0]?.name || 'None'
        }
      })
    } catch (error) {
      console.error('Error fetching universal leaderboard:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to load leaderboard'
      })
    }
  } else if (req.method === 'POST' && req.query.action === 'reset') {
    // Admin function to reset leaderboard for new events
    try {
      const dataDir = path.join(process.cwd(), 'data')
      const leaderboardFile = path.join(dataDir, 'universal-leaderboard.json')

      const newLeaderboard = {
        eventDay: new Date().toISOString().split('T')[0],
        totalPlayers: 0,
        totalGamesPlayed: 0,
        lastUpdated: new Date().toISOString(),
        entries: []
      }

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      fs.writeFileSync(leaderboardFile, JSON.stringify(newLeaderboard, null, 2))

      res.status(200).json({
        success: true,
        message: 'Leaderboard reset for new event',
        leaderboard: newLeaderboard
      })
    } catch (error) {
      console.error('Error resetting leaderboard:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to reset leaderboard'
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
