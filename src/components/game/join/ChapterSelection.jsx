import Button from "../../Button.jsx"
import { useContext, useState, useEffect } from "react"
import { PlayerContext } from "../../../context/player.jsx"

export default function ChapterSelection({ onNext, onBack, availableChapters }) {
  const { player, dispatch } = useContext(PlayerContext)
  const [selectedChapter, setSelectedChapter] = useState(player.chapter || "")
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    if (availableChapters && availableChapters.length > 0) {
      setChapters(availableChapters)
    }
  }, [availableChapters])

  const handleSelect = (chap) => {
    setSelectedChapter(chap)
    dispatch({ type: "SET_CHAPTER", payload: chap })
  }

  const handleNext = () => {
    if (!selectedChapter) return
    onNext()
  }

  return (
    <section className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-2">
      <h1 className="mb-6 text-4xl font-bold text-white drop-shadow-md">
        Choose Your Chapter
      </h1>
      <div className="grid w-full max-w-lg grid-cols-1 gap-4">
        {chapters.map((chap) => (
          <button
            key={chap}
            onClick={() => handleSelect(chap)}
            className={`rounded-lg border-2 p-6 text-left transition-all ${
              selectedChapter === chap
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                : "border-gray-300 bg-white/10 text-white hover:border-yellow-300 hover:bg-white/20"
            }`}
          >
            <h3 className="text-2xl font-bold capitalize">{chap}</h3>
          </button>
        ))}
        {chapters.length === 0 && (
          <div className="rounded-lg border-2 border-gray-300 bg-white/10 p-6 text-center text-white">
            <p>No chapters available for selected subject and class.</p>
          </div>
        )}
      </div>
      <div className="mt-8 flex gap-4">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button
          disabled={!selectedChapter || chapters.length === 0}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </section>
  )
}
