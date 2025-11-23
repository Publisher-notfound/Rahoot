import convertTimeToPoint from "../utils/convertTimeToPoint.js"
import { abortCooldown } from "../utils/cooldown.js"
import { inviteCodeValidator, usernameValidator } from "../validator.js"

const Player = {
  checkRoom: async (game, io, socket, roomId) => {
    try {
      await inviteCodeValidator.validate(roomId)
    } catch (error) {
      socket.emit("game:errorMessage", error.errors[0])
      return
    }

    if (!game.room || roomId !== game.room) {
      socket.emit("game:errorMessage", "Room not found")
      return
    }

    socket.emit("game:successRoom", roomId)
  },

  join: async (game, io, socket, player) => {
    try {
      await usernameValidator.validate(player.username)
    } catch (error) {
      socket.emit("game:errorMessage", error.errors[0])
      return
    }

    if (!game.room || player.room !== game.room) {
      socket.emit("game:errorMessage", "Room not found")
      return
    }

    if (game.players.find((p) => p.username === player.username)) {
      socket.emit("game:errorMessage", "Username already exists")
      return
    }

    if (game.manager !== null && game.started) {
      socket.emit("game:errorMessage", "Game already started")
      return
    }

    console.log("New Player", player)

    socket.join(player.room)

    let playerData = {
      username: player.username,
      room: player.room,
      id: socket.id,
      points: 0,
      // Performance tracking
      answers: [], // Track all answers with timing and correctness
      startTime: Date.now(),
      correctAnswers: 0,
      totalTime: 0
    }
    socket.to(player.room).emit("manager:newPlayer", { ...playerData })

    game.players.push(playerData)

    socket.emit("game:successJoin")
  },

  selectedAnswer: (game, io, socket, answerKey) => {
    const player = game.players.find((player) => player.id === socket.id)
    const question = game.questions[game.currentQuestion]

    if (!player) {
      return
    }

    if (game.playersAnswer.find((p) => p.id === socket.id)) {
      return
    }

    const answerTime = Date.now()
    const timeTaken = (answerTime - game.roundStartTime) / 1000 // in seconds
    const isCorrect = answerKey === question.solution
    const points = convertTimeToPoint(game.roundStartTime, question.time)

    // Track performance data for analytics
    player.answers.push({
      questionIndex: game.currentQuestion,
      selectedAnswer: answerKey,
      correctAnswer: question.solution,
      isCorrect: isCorrect,
      timeTaken: timeTaken,
      points: isCorrect ? points : 0,
      category: question.category || "General",
      difficulty: question.difficulty || 3
    })

    if (isCorrect) {
      player.correctAnswers++
    }
    player.totalTime += timeTaken

    game.playersAnswer.push({
      id: socket.id,
      answer: answerKey,
      points: points,
    })

    const waitText = game.manager === null ? "Processing your answer..." : "Waiting for the players to answer"
    socket.emit("game:status", {
      name: "WAIT",
      data: { text: waitText },
    })
    socket.to(game.room).emit("game:playerAnswer", game.playersAnswer.length)

    if (game.playersAnswer.length === game.players.length) {
      abortCooldown()
    }
  },
}

export default Player
