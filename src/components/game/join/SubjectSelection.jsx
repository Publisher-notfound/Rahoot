import Button from "../../Button.jsx"
import { useContext, useState } from "react"
import { PlayerContext } from "../../../context/player.jsx"

export default function SubjectSelection({ onNext, onBack }) {
  const { player, dispatch } = useContext(PlayerContext)
  const [selectedSubject, setSelectedSubject] = useState(player?.subject || "")

  // For now, hardcoded subjects. Later, can be loaded from config
  const subjects = [
    {
      id: "mathematics",
      name: "Mathematics",
      desc: "Numbers, algebra, geometry",
      difficulty: 1.0
    },
    {
      id: "physics",
      name: "Physics",
      desc: "Mechanics, electricity, optics",
      difficulty: 1.2
    },
    {
      id: "chemistry",
      name: "Chemistry",
      desc: "Organic, inorganic, physical",
      difficulty: 1.2
    },
    {
      id: "biology",
      name: "Biology",
      desc: "Genetics, ecology, physiology",
      difficulty: 0.9
    },
  ]

  const handleSelect = (subj) => {
    setSelectedSubject(subj.id)
    dispatch({ type: "SET_SUBJECT", payload: subj.id })
  }

  const handleNext = () => {
    if (!selectedSubject) return
    onNext()
  }

  return (
    <section className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-2">
      <h1 className="mb-6 text-4xl font-bold text-white drop-shadow-md">
        Choose Your Subject
      </h1>
      <div className="grid w-full max-w-lg grid-cols-1 gap-4">
        {subjects.map((subj) => (
          <button
            key={subj.id}
            onClick={() => handleSelect(subj)}
            className={`rounded-lg border-2 p-6 text-left transition-all ${
              selectedSubject === subj.id
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                : "border-gray-300 bg-white/10 text-white hover:border-yellow-300 hover:bg-white/20"
            }`}
          >
            <h3 className="text-2xl font-bold">{subj.name}</h3>
            <p className="text-lg opacity-80">{subj.desc}</p>
          </button>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button
          disabled={!selectedSubject}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </section>
  )
}
