import { usePlayerContext } from "@/context/player"
import Form from "@/components/Form"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { useEffect, useState } from "react"
import { useSocketContext } from "@/context/socket"
import { useRouter } from "next/router"
import ClassSelection from "./ClassSelection"
import SubjectSelection from "./SubjectSelection"
import ChapterSelection from "./ChapterSelection"

const STEPS = {
  USERNAME: 0,
  CLASS: 1,
  SUBJECT: 2,
  CHAPTER: 3,
}

export default function Username() {
  const { socket } = useSocketContext()
  const { player, dispatch } = usePlayerContext()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [currentStep, setCurrentStep] = useState(STEPS.USERNAME)
  const [availableQuizzes, setAvailableQuizzes] = useState({})
  const [availableChapters, setAvailableChapters] = useState([])
  const [isRoomCreated, setIsRoomCreated] = useState(false)

  const isCompeteMode = !!player?.room

  useEffect(() => {
    // Load available quizzes on mount
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded quizzes:', data)
        setAvailableQuizzes(data)
      })
      .catch(err => console.error('Failed to load quizzes:', err))
  }, [])

  const handleJoin = () => {
    if (!player.room) {
      // Create room for solo mode
      console.log('Creating solo room with:', { genre: player.class, topic: player.subject, quizName: player.chapter })
      if (!player.class || !player.subject || !player.chapter) {
        console.error('Missing required quiz info:', { class: player.class, subject: player.subject, chapter: player.chapter })
        return
      }
      socket.emit("player:createSolo", { genre: player.class, topic: player.subject, quizName: player.chapter })
    } else {
      socket.emit("player:join", { username: username, room: player.room })
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && player.room) {
      handleJoin()
    }
  }

  useEffect(() => {
    socket.on("game:successJoin", () => {
      dispatch({
        type: "LOGIN",
        payload: username,
      })

      if (isCompeteMode) {
        router.replace("/game")
      }
      // For solo mode, wait for game:status SHOW_START before navigating
    })

    return () => {
      socket.off("game:successJoin")
    }
  }, [username, isCompeteMode, router])

  useEffect(() => {
    socket.on("player:soloRoomCreated", (roomId) => {
      dispatch({ type: "JOIN", payload: roomId })
      socket.emit("player:join", { username: username, room: roomId })
    })

    return () => {
      socket.off("player:soloRoomCreated")
    }
  }, [username])

  useEffect(() => {
    // For solo mode, navigate to game when quiz starts
    const handleGameStatus = (status) => {
      if (status.name === "SHOW_START" && !isCompeteMode) {
        router.replace("/game")
      }
    }

    socket.on("game:status", handleGameStatus)

    return () => {
      socket.off("game:status", handleGameStatus)
    }
  }, [isCompeteMode, router])

  const handleClassNext = () => setCurrentStep(STEPS.SUBJECT)
  const handleSubjectNext = () => setCurrentStep(STEPS.CHAPTER)
  const handleChapterNext = () => setCurrentStep(STEPS.USERNAME)

  const handleBack = () => {
    if (currentStep === STEPS.USERNAME && !isCompeteMode) {
      setCurrentStep(STEPS.CHAPTER)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    setCurrentStep(isCompeteMode ? STEPS.USERNAME : STEPS.CLASS)
  }, [isCompeteMode])

  useEffect(() => {
    if (player?.subject && player?.class) {
      const chapters = availableQuizzes[player.class]?.[player.subject] || []
      console.log('Available chapters for', player.class, '/', player.subject, ':', chapters)
      setAvailableChapters(chapters)
    }
  }, [player?.subject, player?.class, availableQuizzes])

  if (currentStep === STEPS.USERNAME) {
    return (
      <Form>
        <Input
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Username here"
        />
        <Button onClick={() => handleJoin()}>Submit</Button>
      </Form>
    )
  }

  if (currentStep === STEPS.CLASS) {
    return <ClassSelection onNext={handleClassNext} onBack={() => { dispatch({ type: "LOGOUT" }); router.replace("/") }} />
  }

  if (currentStep === STEPS.SUBJECT) {
    return <SubjectSelection onNext={handleSubjectNext} onBack={handleBack} />
  }

  if (currentStep === STEPS.CHAPTER) {
    return <ChapterSelection
      onNext={handleChapterNext}
      onBack={handleBack}
      availableChapters={availableChapters}
    />
  }

  return null
}
