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
import { abortCooldown, cooldown, sleep } from "../utils/cooldown.js"
import deepClone from "../utils/deepClone.js"
import generateRoomId from "../utils/generateRoomId.js"
import { startRound } from "../utils/round.js"

const Manager = {
  createRoom: (game, io, socket, password) => {
    if (game.password !== password) {
      io.to(socket.id).emit("game:errorMessage", "Bad Password")
      return
    }

    if (game.manager || game.room) {
      io.to(socket.id).emit("game:errorMessage", "Already manager")
      return
    }

    let roomInvite = generateRoomId()
    game.room = roomInvite
    game.manager = socket.id

    socket.join(roomInvite)
    io.to(socket.id).emit("manager:inviteCode", roomInvite)

    console.log("New room created: " + roomInvite)
  },

  kickPlayer: (game, io, socket, playerId) => {
    if (game.manager !== socket.id) {
      return
    }

    const player = game.players.find((p) => p.id === playerId)
    game.players = game.players.filter((p) => p.id !== playerId)

    io.in(playerId).socketsLeave(game.room)
    io.to(player.id).emit("game:kick")
    io.to(game.manager).emit("manager:playerKicked", player.id)
  },

  startGame: async (game, io, socket) => {
    if (game.started || !game.room) {
      return
    }

    // Check if quiz is selected and has questions
    if (!game.questions || game.questions.length === 0) {
      io.to(socket.id).emit("game:errorMessage", "Please select a quiz before starting the game")
      return
    }

    game.started = true
    io.to(game.room).emit("game:status", {
      name: "SHOW_START",
      data: {
        time: 3,
        subject: game.subject,
      },
    })

    await sleep(3)
    io.to(game.room).emit("game:startCooldown")

    await cooldown(3, io, game.room)
    startRound(game, io, socket)
  },

  nextQuestion: (game, io, socket) => {
    if (!game.started) {
      return
    }

    if (socket.id !== game.manager) {
      return
    }

    if (!game.questions[game.currentQuestion + 1]) {
      return
    }

    game.currentQuestion++
    startRound(game, io, socket)
  },

  abortQuiz: (game, io, socket) => {
    if (!game.started) {
      return
    }

    if (socket.id !== game.manager) {
      return
    }

    abortCooldown(game, io, game.room)
  },

  selectQuiz: (game, io, socket, quizData) => {
    if (game.manager !== socket.id) {
      return
    }

    try {
      // Quiz data now comes directly from frontend
      game.selectedQuiz = quizData
      game.subject = `${quizData.genre} - ${quizData.quizName}`
      game.questions = quizData.questions
      io.to(game.manager).emit("manager:quizSelected", quizData)
      console.log(`Quiz selected: ${quizData.genre}/${quizData.topic}/${quizData.quizName}`)
    } catch (error) {
      io.to(socket.id).emit("game:errorMessage", error.message)
    }
  },

  showLoaderboard: (game, io, socket) => {
    console.log("showLoaderboard called - Manager:", game.manager, "Current Question:", game.currentQuestion, "Total Questions:", game.questions?.length)

    // Check if this is the final question (no more questions after current)
    const isLastQuestion = !game.questions[game.currentQuestion + 1]
    
    if (isLastQuestion) {
      console.log("Quiz finished - checking mode. Manager is null?", game.manager === null)

      if (game.manager === null) {
        // Solo mode: show performance report instead of leaderboard
        const player = game.players.find(p => p.id === socket.id)
        console.log("Solo mode - Player found:", !!player, "Player data:", player ? {
          correctAnswers: player.correctAnswers,
          totalTime: player.totalTime,
          answersCount: player.answers?.length
        } : "No player")

        if (player) {
          console.log("Sending SHOW_PERFORMANCE_REPORT")

          // Update universal leaderboard
          const quizName = `${game.selectedQuiz?.quizName || "Unknown Quiz"}`
          console.log("Updating universal leaderboard - Solo:", player.username, player.points, quizName)
          // Leaderboard update handled by frontend API
          console.log("Universal leaderboard update: delegated to frontend")

          socket.emit("game:status", {
            name: "SHOW_PERFORMANCE_REPORT",
            data: {
              playerStats: {
                correctAnswers: player.correctAnswers,
                totalQuestions: game.questions.length,
                totalTime: player.totalTime,
                answers: player.answers,
                finalScore: player.points
              },
              quizData: {
                genre: game.selectedQuiz?.genre || "General",
                topic: game.selectedQuiz?.topic || "Knowledge",
                quizName: game.selectedQuiz?.quizName || "Quiz",
                questions: game.questions
              }
            },
          })
        } else {
          console.log("No player found for performance report")
        }
      } else {
        // Multi-player: show finish podium
        console.log("Multiplayer mode - showing finish podium")

        // Update universal leaderboard for all multiplayer participants
        const quizName = `${game.selectedQuiz?.quizName || "Unknown Quiz"}`
        console.log("Updating universal leaderboard - Multiplayer players:", game.players.map(p => `${p.username}:${p.points}`))
        // Leaderboard update handled by frontend API
        console.log(`Universal leaderboard update: delegated to frontend for ${game.players.length} multiplayer players`)

        io.to(game.room).emit("game:status", {
          name: "FINISH",
          data: {
            subject: game.subject,
            top: game.players.slice(0, 3).sort((a, b) => b.points - a.points),
          },
        })
        game = deepClone(GAME_STATE_INIT)
      }
      return
    }

    // Show intermediate leaderboard (not the final one)
    console.log("Showing intermediate leaderboard")
    io.to(game.room).emit("game:status", {
      name: "SHOW_LEADERBOARD",
      data: {
        leaderboard: game.players
          .sort((a, b) => b.points - a.points)
          .slice(0, 5),
        isIntermediate: true, // Flag to indicate this is not the final leaderboard
      },
    })
  },
}

export default Manager
