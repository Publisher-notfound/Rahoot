import { cooldown, sleep } from "./cooldown.js"
import deepClone from "./deepClone.js"

// Local GAME_STATE_INIT since config.mjs is in parent directory
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

export const startRound = async (game, io, socket) => {
  const question = game.questions[game.currentQuestion]

  if (!game.started) return

  io.to(game.room).emit("game:updateQuestion", {
    current: game.currentQuestion + 1,
    total: game.questions.length,
  })

  io.to(game.room).emit("game:status", {
    name: "SHOW_PREPARED",
    data: {
      totalAnswers: game.questions[game.currentQuestion].answers.length,
      questionNumber: game.currentQuestion + 1,
    },
  })

  await sleep(2)

  if (!game.started) return

  io.to(game.room).emit("game:status", {
    name: "SHOW_QUESTION",
    data: {
      question: question.question,
      image: question.image,
      cooldown: question.cooldown,
    },
  })

  await sleep(question.cooldown)

  if (!game.started) return

  game.roundStartTime = Date.now()

  io.to(game.room).emit("game:status", {
    name: "SELECT_ANSWER",
    data: {
      question: question.question,
      answers: question.answers,
      image: question.image,
      time: question.time,
      totalPlayer: game.players.length,
    },
  })

  await cooldown(question.time, io, game.room)

  if (!game.started) return

  game.players.map(async (player) => {
    let playerAnswer = await game.playersAnswer.find((p) => p.id === player.id)

    let isCorrect = playerAnswer
      ? playerAnswer.answer === question.solution
      : false

    let points =
      (isCorrect && Math.round(playerAnswer && playerAnswer.points)) || 0

    player.points += points

    let sortPlayers = game.players.sort((a, b) => b.points - a.points)

    let rank = sortPlayers.findIndex((p) => p.id === player.id) + 1
    let aheadPlayer = sortPlayers[rank - 2]

    io.to(player.id).emit("game:status", {
      name: "SHOW_RESULT",
      data: {
        correct: isCorrect,
        message: isCorrect ? "Nice !" : "Too bad",
        points: points,
        myPoints: player.points,
        totalPlayer: game.players.length,
        rank,
        aheadOfMe: aheadPlayer ? aheadPlayer.username : null,
      },
    })
  })

  let totalType = {}

  game.playersAnswer.forEach(({ answer }) => {
    totalType[answer] = (totalType[answer] || 0) + 1
  })

  // Manager
  if (game.manager) {
    io.to(game.manager).emit("game:status", {
      name: "SHOW_RESPONSES",
      data: {
        question: game.questions[game.currentQuestion].question,
        responses: totalType,
        correct: game.questions[game.currentQuestion].solution,
        answers: game.questions[game.currentQuestion].answers,
        image: game.questions[game.currentQuestion].image,
      },
    })
  }

  // Auto-progress for solo mode
  if (game.manager === null) {
    if (game.questions[game.currentQuestion + 1]) {
      // Next questions: auto-advance after 5 seconds
      setTimeout(() => {
        game.currentQuestion++
        startRound(game, io, { emit: () => {} })
      }, 5000)
    } else {
      // Last question: wait for result display, then show podium
      setTimeout(() => {
        // Emit to the player directly for solo mode
        if (game.players.length === 1) {
          io.to(game.players[0].id).emit("game:status", {
            name: "FINISH",
            data: {
              subject: game.subject,
              top: game.players.slice(0, 3).sort((a, b) => b.points - a.points),
            },
          })
        } else {
          io.to(game.room).emit("game:status", {
            name: "FINISH",
            data: {
              subject: game.subject,
              top: game.players.slice(0, 3).sort((a, b) => b.points - a.points),
            },
          })
        }
        // Delay reset to allow podium display
        setTimeout(() => {
          game = deepClone(GAME_STATE_INIT)
        }, 5000) // Allow 5 seconds for podium to display
      }, 3000) // 3 seconds for result display
    }
  }

  game.playersAnswer = []
}
