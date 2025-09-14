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

  useEffect(() => {
    // Load available quizzes on mount
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => setAvailableQuizzes(data))
      .catch(err => console.error('Failed to load quizzes:', err))
  }, [])

  const handleJoin = () => {
    socket.emit("player:join", { username: username, room: player.room })
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleJoin()
    }
  }

  useEffect(() => {
    socket.on("game:successJoin", () => {
      dispatch({
        type: "LOGIN",
        payload: username,
      })

      setCurrentStep(STEPS.CLASS) // Go to class selection
    })

    return () => {
      socket.off("game:successJoin")
    }
  }, [username])

  const handleClassNext = () => setCurrentStep(STEPS.SUBJECT)
  const handleSubjectNext = () => setCurrentStep(STEPS.CHAPTER)
  const handleChapterNext = () => router.replace("/game")

  const handleBack = () => {
    if (currentStep > STEPS.USERNAME) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    if (player.subject && player.class) {
      const chapters = availableQuizzes[player.subject]?.[player.class] || []
      setAvailableChapters(chapters)
    }
  }, [player.subject, player.class, availableQuizzes])

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
    return <ClassSelection onNext={handleClassNext} />
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
