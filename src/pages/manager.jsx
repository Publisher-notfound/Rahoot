import Button from "@/components/Button"
import GameWrapper from "@/components/game/GameWrapper"
import ManagerPassword from "@/components/ManagerPassword"
import { GAME_STATES, GAME_STATE_COMPONENTS_MANAGER } from "@/constants"
import { usePlayerContext } from "@/context/player"
import { useSocketContext } from "@/context/socket"
import { useRouter } from "next/router"
import { createElement, useEffect, useState } from "react"

export default function Manager() {
  const { socket } = useSocketContext()

  const [nextText, setNextText] = useState("Start")

  // Function to get appropriate button text based on current state
  const getButtonText = () => {
    switch (state.status.name) {
      case "SHOW_ROOM":
        return "Start Game"
      case "SELECT_ANSWER":
        return "Skip Question"
      case "SHOW_RESPONSES":
        const currentQ = state.question?.current || 1
        const totalQ = state.question?.total || 0
        return currentQ < totalQ ? "Next Question" : "Show Final Results"
      case "SHOW_LEADERBOARD":
        const currentQuestion = state.question?.current || 1
        const totalQuestions = state.question?.total || 0
        return currentQuestion < totalQuestions ? "Next Question" : "Finish"
      default:
        return "Next"
    }
  }
  const [state, setState] = useState({
    ...GAME_STATES,
    status: {
      ...GAME_STATES.status,
      name: "SHOW_QUIZ_SELECTOR",
    },
  })

  useEffect(() => {
    socket.on("game:status", (status) => {
      setState({
        ...state,
        status: status,
        question: {
          ...state.question,
          current: status.question,
        },
      })
    })

    socket.on("manager:inviteCode", (inviteCode) => {
      setState({
        ...state,
        created: true,
        status: {
          ...state.status,
          data: {
            ...state.status.data,
            inviteCode: inviteCode,
          },
        },
      })
    })

    return () => {
      socket.off("game:status")
      socket.off("manager:inviteCode")
    }
  }, [state])

  const handleCreate = () => {
    socket.emit("manager:createRoom")
  }

  const handleSkip = () => {
    switch (state.status.name) {
      case "SHOW_ROOM":
        setNextText("Skip")
        socket.emit("manager:startGame")
        break

      case "SELECT_ANSWER":
        setNextText("Skip")
        socket.emit("manager:abortQuiz")
        break

      case "SHOW_RESPONSES":
        // Check if there are more questions
        const currentQ = state.question?.current || 1
        const totalQ = state.question?.total || 0
        
        if (currentQ < totalQ) {
          setNextText("Next Question")
          socket.emit("manager:nextQuestion")
        } else {
          setNextText("Show Final Results")
          socket.emit("manager:showLeaderboard")
        }
        break

      case "SHOW_LEADERBOARD":
        // This should only show for intermediate leaderboards
        const currentQuestion = state.question?.current || 1
        const totalQuestions = state.question?.total || 0
        
        if (currentQuestion < totalQuestions) {
          setNextText("Next Question")
          socket.emit("manager:nextQuestion")
        }
        break
    }
  }

  return (
    <>
      {!state.created ? (
        <div>
          <ManagerPassword />
        </div>
      ) : (
        <>
          <GameWrapper textNext={getButtonText()} onNext={handleSkip} manager>
            {GAME_STATE_COMPONENTS_MANAGER[state.status.name] &&
              createElement(GAME_STATE_COMPONENTS_MANAGER[state.status.name], {
                data: state.status.data,
                onNext: () => setState({...state, status: { ...state.status, name: "SHOW_ROOM" }}),
              })}
          </GameWrapper>
        </>
      )}
    </>
  )
}
