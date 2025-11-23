import universalLeaderboardModel from "../../utils/UniversalLeaderboardModel.js"

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20
      const leaderboard = universalLeaderboardModel.getTopEntries(limit)

      res.status(200).json({
        success: true,
        leaderboard: leaderboard,
        stats: universalLeaderboardModel.getStats()
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
      const newLeaderboard = universalLeaderboardModel.resetForNewEvent()
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
