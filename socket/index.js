import { Server } from "socket.io"
import { GAME_STATE_INIT, WEBSOCKET_SERVER_PORT } from "./config.mjs"
import Manager from "./roles/manager.js"
import Player from "./roles/player.js"
import { abortCooldown } from "./utils/cooldown.js"
import deepClone from "./utils/deepClone.js"
import generateRoomId from "./utils/generateRoomId.js"
import fs from 'fs'
import path from 'path'

function loadQuiz(genre, topic, quizName) {
  const quizPath = path.join(process.cwd(), 'quizzes', genre, topic, `${quizName}.json`);
  if (!fs.existsSync(quizPath)) {
    throw new Error(`Quiz not found: ${genre}/${topic}/${quizName}`);
  }
  const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
  return quizData;
}

let gameState = deepClone(GAME_STATE_INIT)

const io = new Server({
  cors: {
    origin: "*",
  },
})

console.log(`Server running on port ${WEBSOCKET_SERVER_PORT}`)
io.listen(WEBSOCKET_SERVER_PORT)

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
    
    try {
      const quizData = loadQuiz(genre, topic, quizName)
      let soloRoom = generateRoomId()
      gameState.room = soloRoom
      gameState.manager = null // no manager for solo
      gameState.selectedQuiz = quizData
      gameState.subject = `${quizData.genre} - ${quizData.quizName}`
      gameState.questions = quizData.questions
      io.to(socket.id).emit("player:soloRoomCreated", soloRoom)
      console.log(`Solo room created: ${soloRoom}, Manager set to: ${gameState.manager}`)
    } catch (error) {
      io.to(socket.id).emit("game:errorMessage", error.message)
    }
  })

  socket.on("manager:createRoom", (password) =>
    Manager.createRoom(gameState, io, socket, password),
  )
  socket.on("manager:selectQuiz", (quizInfo) =>
    Manager.selectQuiz(gameState, io, socket, quizInfo),
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
