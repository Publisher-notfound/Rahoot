import { Server } from "socket.io"
// Import GAME_STATE_INIT locally since config.mjs is in parent directory
const GAME_STATE_INIT = {
  started: false,
  players: [],
  playersAnswer: [],
  manager: null,
  room: null,
  currentQuestion: 0,
  roundStartTime: 0,
  selectedQuiz: null,
  password: "PASSWORD",
  subject: "Adobe",
  questions: []
}

// Use Railway's PORT environment variable or fallback to 5506
const WEBSOCKET_SERVER_PORT = process.env.PORT || 5506
import Manager from "./roles/manager.js"
import Player from "./roles/player.js"
import { abortCooldown } from "./utils/cooldown.js"
import deepClone from "./utils/deepClone.js"
import generateRoomId from "./utils/generateRoomId.js"
// File system imports removed - quizzes loaded from frontend

// Quiz loading now handled by frontend

let gameState = deepClone(GAME_STATE_INIT)

const io = new Server({
  cors: {
    origin: "*",
  },
})

// Add basic HTTP server for health checks
import { createServer } from 'http'
const httpServer = createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('ADHYAYAN Socket Server is running!')
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

io.attach(httpServer)

console.log(`Server running on port ${WEBSOCKET_SERVER_PORT}`)
httpServer.listen(WEBSOCKET_SERVER_PORT)

io.on("connection", (socket) => {
  console.log(`A user connected ${socket.id}`)

  socket.on("player:checkRoom", (roomId) =>
    Player.checkRoom(gameState, io, socket, roomId),
  )

  socket.on("player:join", (player) => {
    Player.join(gameState, io, socket, player)
    // For solo mode, auto-start quiz after player joins, with delay
    if (gameState.manager === null && !gameState.started && gameState.questions?.length > 0) {
      setTimeout(() => Manager.startGame(gameState, io, socket), 500)
    }
  })

  socket.on("player:createSolo", (quizInfo) => {
    const { genre, topic, quizName } = quizInfo
    
    // Reset any existing game state before creating new solo room
    if (gameState.room || gameState.started) {
      console.log("Resetting existing game state for new solo room")
      gameState = deepClone(GAME_STATE_INIT)
      abortCooldown()
    }
    
    // For solo mode, quiz data comes from frontend
    let soloRoom = generateRoomId()
    gameState.room = soloRoom
    gameState.manager = null // no manager for solo
    gameState.selectedQuiz = quizInfo // This will be the full quiz data from frontend
    gameState.subject = `${quizInfo.genre} - ${quizInfo.quizName}`
    gameState.questions = quizInfo.questions
    io.to(socket.id).emit("player:soloRoomCreated", soloRoom)
    console.log(`Solo room created: ${soloRoom}, Manager set to: ${gameState.manager}`)
  })

  socket.on("manager:createRoom", (password) =>
    Manager.createRoom(gameState, io, socket, password),
  )
  socket.on("manager:selectQuiz", (quizData) =>
    Manager.selectQuiz(gameState, io, socket, quizData),
  )
  socket.on("manager:kickPlayer", (playerId) =>
    Manager.kickPlayer(gameState, io, socket, playerId),
  )

  socket.on("manager:startGame", () => Manager.startGame(gameState, io, socket))

  socket.on("player:selectedAnswer", (answerKey) =>
    Player.selectedAnswer(gameState, io, socket, answerKey),
  )

  socket.on("manager:abortQuiz", () => Manager.abortQuiz(gameState, io, socket))

  socket.on("manager:nextQuestion", () =>
    Manager.nextQuestion(gameState, io, socket),
  )

  socket.on("manager:showLeaderboard", () => {
    console.log("manager:showLeaderboard event received, gameState.manager:", gameState.manager)
    Manager.showLoaderboard(gameState, io, socket)
  })

  socket.on("disconnect", () => {
    console.log(`user disconnected ${socket.id}`)
    
    // Reset game if manager disconnects
    if (gameState.manager === socket.id) {
      console.log("Reset game - manager disconnected")
      io.to(gameState.room).emit("game:reset")
      gameState.started = false
      gameState = deepClone(GAME_STATE_INIT)
      abortCooldown()
      return
    }

    const player = gameState.players.find((p) => p.id === socket.id)

    if (player) {
      gameState.players = gameState.players.filter((p) => p.id !== socket.id)
      
      // For solo mode (no manager), reset game when solo player disconnects
      if (gameState.manager === null && gameState.players.length === 0) {
        console.log("Reset game - solo player disconnected")
        gameState.started = false
        gameState = deepClone(GAME_STATE_INIT)
        abortCooldown()
        return
      }
      
      // For multiplayer mode, notify manager
      if (gameState.manager) {
        socket.to(gameState.manager).emit("manager:removePlayer", player.id)
      }
    }
  })
})
