import fs from 'fs'
import path from 'path'

class UniversalLeaderboardModel {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data')
    this.leaderboardFile = path.join(this.dataDir, 'universal-leaderboard.json')
    this.ensureDataDir()
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
  }

  loadLeaderboard() {
    try {
      if (fs.existsSync(this.leaderboardFile)) {
        const data = fs.readFileSync(this.leaderboardFile, 'utf8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading universal leaderboard:', error)
    }

    // Initialize if file doesn't exist
    return this.initializeLeaderboard()
  }

  initializeLeaderboard() {
    return {
      eventDay: new Date().toISOString().split('T')[0],
      totalPlayers: 0,
      totalGamesPlayed: 0,
      lastUpdated: new Date().toISOString(),
      entries: []
    }
  }

  saveLeaderboard(data) {
    try {
      fs.writeFileSync(this.leaderboardFile, JSON.stringify(data, null, 2))
      return true
    } catch (error) {
      console.error('Error saving universal leaderboard:', error)
      return false
    }
  }

  updatePlayerScore(name, score, quizName, io) {
    const leaderboard = this.loadLeaderboard()

    // Clean name (remove special characters, normalize)
    const cleanName = this.cleanPlayerName(name)
    if (!cleanName || score <= 0) return false

    // Find existing player or create new entry
    let playerEntry = leaderboard.entries.find(entry => entry.name === cleanName)

    if (playerEntry) {
      // Update existing player
      playerEntry.totalPoints += score
      playerEntry.gamesPlayed += 1
      playerEntry.averageScore = Math.round(playerEntry.totalPoints / playerEntry.gamesPlayed)
      playerEntry.topScore = Math.max(playerEntry.topScore, score)
      playerEntry.lastPlayed = new Date().toISOString()

      // Add recent game
      if (!playerEntry.recentGames) playerEntry.recentGames = []
      playerEntry.recentGames.unshift({
        quiz: quizName,
        score: score,
        timestamp: new Date().toISOString()
      })

      // Keep only last 5 games
      if (playerEntry.recentGames.length > 5) {
        playerEntry.recentGames = playerEntry.recentGames.slice(0, 5)
      }
    } else {
      // Create new player
      leaderboard.totalPlayers += 1
      playerEntry = {
        name: cleanName,
        totalPoints: score,
        gamesPlayed: 1,
        averageScore: score,
        topScore: score,
        lastPlayed: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        recentGames: [{
          quiz: quizName,
          score: score,
          timestamp: new Date().toISOString()
        }]
      }
      leaderboard.entries.push(playerEntry)
    }

    // Update totals
    leaderboard.totalGamesPlayed += 1
    leaderboard.lastUpdated = new Date().toISOString()

    // Sort by total points descending and assign ranks
    leaderboard.entries.sort((a, b) => b.totalPoints - a.totalPoints)
    leaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1
    })

    // Add achievement badges
    this.addAchievements(playerEntry)

    if (this.saveLeaderboard(leaderboard)) {
      // Broadcast to TV displays and other clients
      if (io) {
        io.emit("universal-leaderboard:update", leaderboard)
        console.log(`Universal leaderboard updated: ${cleanName} +${score} points (${leaderboard.totalPlayers} total players)`)
      }
      return leaderboard
    }

    return false
  }

  cleanPlayerName(name) {
    if (!name || typeof name !== 'string') return null

    // Remove excessive whitespace, special characters at start/end
    let cleaned = name.trim()

    // Avoid obvious bot/spam names
    if (cleaned.length < 2 || cleaned.length > 50) return null
    if (/^\d+$/.test(cleaned)) return null // Just numbers
    if (/^.{0,2}[\-\+\_].*$/.test(cleaned)) return null // Too many special chars

    return cleaned
  }

  addAchievements(player) {
    // Add achievement flags based on player stats
    if (player.totalPoints >= 1000) {
      player.achievement = 'Champion'
    } else if (player.gamesPlayed >= 5) {
      player.achievement = 'Dedicated'
    } else if (player.topScore >= 500) {
      player.achievement = 'High Scorer'
    } else if (player.averageScore >= 200) {
      player.achievement = 'Consistent'
    }
  }

  getTopEntries(limit = 20) {
    const leaderboard = this.loadLeaderboard()
    return leaderboard.entries.slice(0, limit)
  }

  getPlayerRanking(name) {
    const leaderboard = this.loadLeaderboard()
    const player = leaderboard.entries.find(entry => entry.name === this.cleanPlayerName(name))
    return player || null
  }

  resetForNewEvent() {
    const newLeaderboard = this.initializeLeaderboard()
    this.saveLeaderboard(newLeaderboard)
    return newLeaderboard
  }

  getStats() {
    const leaderboard = this.loadLeaderboard()
    return {
      totalPlayers: leaderboard.totalPlayers,
      totalGames: leaderboard.totalGamesPlayed,
      topScore: leaderboard.entries[0]?.totalPoints || 0,
      topPlayer: leaderboard.entries[0]?.name || 'None'
    }
  }

  generateMockData(count = 50) {
    const names = ['Ravi', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohit', 'Kavya', 'Arjun', 'Meera']
    const surnames = ['Patel', 'Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Reddy', 'Iyer', 'Nair', 'Joshi']

    const mockEntries = []
    const usedNames = new Set()

    for (let i = 0; i < count; i++) {
      // Generate university-style name format: Name Surname RollNumber(10-digit)
      let firstName = names[Math.floor(Math.random() * names.length)]
      let lastName = surnames[Math.floor(Math.random() * surnames.length)]
      let rollNumber = String(1000000000 + Math.floor(Math.random() * 999999999)) // 10-digit

      const fullName = `${firstName} ${lastName} ${rollNumber}`

      // Avoid duplicates
      if (usedNames.has(fullName)) {
        i--
        continue
      }

      usedNames.add(fullName)

      const gamesPlayed = Math.floor(Math.random() * 8) + 1
      const averageScore = Math.floor(Math.random() * 200) + 100
      const totalPoints = averageScore * gamesPlayed + Math.floor(Math.random() * 500)

      mockEntries.push({
        name: fullName,
        totalPoints: totalPoints,
        gamesPlayed: gamesPlayed,
        averageScore: averageScore,
        topScore: Math.floor(averageScore * 1.5),
        lastPlayed: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Within last 24 hours
        joinedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // Within last week
        recentGames: [],
        rank: i + 1
      })
    }

    // Sort by total points descending
    mockEntries.sort((a, b) => b.totalPoints - a.totalPoints)
    mockEntries.forEach((entry, index) => {
      entry.rank = index + 1
      this.addAchievements(entry)
    })

    return mockEntries
  }

  loadMockLeaderboard() {
    const mockEntries = this.generateMockData(50)
    const mockLeaderboard = {
      eventDay: new Date().toISOString().split('T')[0],
      totalPlayers: mockEntries.length,
      totalGamesPlayed: mockEntries.reduce((sum, entry) => sum + entry.gamesPlayed, 0),
      lastUpdated: new Date().toISOString(),
      entries: mockEntries
    }

    return mockLeaderboard
  }
}

// Export singleton instance
const universalLeaderboardModel = new UniversalLeaderboardModel()
export default universalLeaderboardModel
