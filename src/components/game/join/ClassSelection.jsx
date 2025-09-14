import Button from "../../Button.jsx"
import { useContext, useState, useEffect } from "react"
import { PlayerContext } from "../../../context/player.jsx"

export default function ClassSelection({ onNext }) {
  const { player, dispatch } = useContext(PlayerContext)
  const [selectedClass, setSelectedClass] = useState(player.class || "")

  const classes = [
    { id: "11th", name: "11th Grade", desc: "Class XI" },
    { id: "12th", name: "12th Grade", desc: "Class XII" },
  ]

  const handleSelect = (cls) => {
    setSelectedClass(cls.id)
    dispatch({ type: "SET_CLASS", payload: cls.id })
  }

  const handleNext = () => {
    if (!selectedClass) return
    onNext()
  }

  return (
    <section className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-2">
      <h1 className="mb-6 text-4xl font-bold text-white drop-shadow-md">
        Choose Your Class
      </h1>
      <div className="grid w-full max-w-lg grid-cols-1 gap-4">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => handleSelect(cls)}
            className={`rounded-lg border-2 p-6 text-left transition-all ${
              selectedClass === cls.id
                ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                : "border-gray-300 bg-white/10 text-white hover:border-yellow-300 hover:bg-white/20"
            }`}
          >
            <h3 className="text-2xl font-bold">{cls.name}</h3>
            <p className="text-lg opacity-80">{cls.desc}</p>
          </button>
        ))}
      </div>
      <Button
        className="mt-8"
        disabled={!selectedClass}
        onClick={handleNext}
      >
        Next
      </Button>
    </section>
  )
}
