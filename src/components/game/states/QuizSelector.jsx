import Button from "../../Button.jsx"
import { useState, useEffect } from "react"
import { useSocketContext } from "../../../context/socket"

export default function QuizSelector({ onNext }) {
  const { socket } = useSocketContext()
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [availableQuizzes, setAvailableQuizzes] = useState({})

  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => setAvailableQuizzes(data))
      .catch(err => console.error('Failed to load quizzes:', err))
  }, [])

  // Flatten quizzes for selection
  const quizzes = []
  Object.entries(availableQuizzes).forEach(([subject, classes]) => {
    Object.entries(classes).forEach(([cls, chapters]) => {
      chapters.forEach(chapter => {
        quizzes.push({
          id: `${subject}-${cls}-${chapter}`,
          subject,
          class: cls,
          chapter,
          label: `${subject} ${cls} - ${chapter}`
        })
      })
    })
  })

  const handleSelect = (quiz) => {
    setSelectedQuiz(quiz)
  }

  const handleConfirm = () => {
    if (!selectedQuiz) return
    socket.emit("manager:selectQuiz", {
      subject: selectedQuiz.subject,
      class: selectedQuiz.class,
      chapter: selectedQuiz.chapter
    })
  }

  // Listen for quizSelected
  useEffect(() => {
    const handleQuizSelected = () => {
      onNext() // Proceed to room display
    }

    socket.on("manager:quizSelected", handleQuizSelected)

    return () => {
      socket.off("manager:quizSelected", handleQuizSelected)
    }
  }, [socket, onNext])

  return (
    <section className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-2">
      <h1 className="mb-6 text-4xl font-bold text-white drop-shadow-md">
        Select Quiz to Host
      </h1>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {quizzes.map((quiz) => (
          <button
            key={quiz.id}
            onClick={() => handleSelect(quiz)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedQuiz?.id === quiz.id
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                : "border-gray-300 bg-white/10 text-white hover:border-yellow-300 hover:bg-white/20"
            }`}
          >
            <h3 className="text-xl font-bold capitalize">{quiz.label}</h3>
          </button>
        ))}
        {quizzes.length === 0 && (
          <div className="rounded-lg border-2 border-gray-300 bg-white/10 p-6 text-center text-white">
            <p>No quizzes available. Please add quiz files.</p>
          </div>
        )}
      </div>
      {selectedQuiz && (
        <Button
          className="mt-6"
          onClick={handleConfirm}
        >
          Host Selected Quiz
        </Button>
      )}
    </section>
  )
}
