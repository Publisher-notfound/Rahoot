import { GAME_STATE_INIT } from "../../../config.mjs"
import { abortCooldown, cooldown, sleep } from "../utils/cooldown.js"
import deepClone from "../utils/deepClone.js"
import generateRoomId from "../utils/generateRoomId.js"
import { startRound } from "../utils/round.js"
import universalLeaderboardModel from "../../../src/utils/UniversalLeaderboardModel.js"
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

  selectQuiz: (game, io, socket, { genre, topic, quizName }) => {
    if (game.manager !== socket.id) {
      return
    }

    try {
      const quizData = loadQuiz(genre, topic, quizName)
      game.selectedQuiz = quizData
      game.subject = `${quizData.genre} - ${quizData.quizName}`
      game.questions = quizData.questions
      io.to(game.manager).emit("manager:quizSelected", quizData)
      console.log(`Quiz selected: ${genre}/${topic}/${quizName}`)
    } catch (error) {
      io.to(socket.id).emit("game:errorMessage", error.message)
    }
  },

  showLoaderboard: (game, io, socket) => {
    console.log("showLoaderboard called - Manager:", game.manager, "Current Question:", game.currentQuestion, "Total Questions:", game.questions?.length)

    if (!game.questions[game.currentQuestion + 1]) {
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
          const updateResult = universalLeaderboardModel.updatePlayerScore(player.username, player.points, quizName, io)
          console.log("Universal leaderboard update result:", updateResult ? "SUCCESS" : "FAILED")

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
        let updateCount = 0
        game.players.forEach(player => {
          if (player.username && player.points > 0) {
            console.log("Updating player:", player.username, player.points, quizName)
            const updateResult = universalLeaderboardModel.updatePlayerScore(player.username, player.points, quizName, io)
            if (updateResult) updateCount++
          }
        })
        console.log(`Universal leaderboard updated for ${updateCount}/${game.players.length} multiplayer players`)

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

    console.log("Showing intermediate leaderboard")
    socket.emit("game:status", {
      name: "SHOW_LEADERBOARD",
      data: {
        leaderboard: game.players
          .sort((a, b) => b.points - a.points)
          .slice(0, 5),
      },
    })
  },
}

export default Manager
