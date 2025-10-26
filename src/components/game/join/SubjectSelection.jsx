import Button from "../../Button.jsx"
import { useContext, useState } from "react"
import { PlayerContext } from "../../../context/player.jsx"

export default function SubjectSelection({ onNext, onBack }) {
  const { player, dispatch } = useContext(PlayerContext)
  const [selectedSubject, setSelectedSubject] = useState(player?.subject || "")

  // Dynamic topics based on selected genre (player.class)
  const getSubjectsForGenre = (genre) => {
    switch (genre) {
      case "entertainment":
        return [
          { id: "movies", name: "Movies & Cinema", desc: "Hollywood, Bollywood, Blockbusters" },
          { id: "music", name: "Music & Artists", desc: "Songs, Albums, K-Pop, Indie" },
          { id: "tv_shows", name: "TV Shows & Series", desc: "Netflix, Netflixflix, Dramas, Sitcoms" },
          { id: "gaming", name: "Gaming & Esports", desc: "Mobile Games, Esports, Console" },
        ]
      case "knowledge":
        return [
          { id: "history", name: "History & Timelines", desc: "Ancient, Modern, Inventions" },
          { id: "science", name: "Science & Innovations", desc: "Physics, Biology, Tech" },
          { id: "geography", name: "Geography & World Facts", desc: "Countries, Continents, Places" },
          { id: "current_affairs", name: "Current Affairs", desc: "News, Politics, Viral Events" },
        ]
      case "fun_trivia":
        return [
          { id: "riddles", name: "Riddles & Logic", desc: "Brain Teasers, Puzzles" },
          { id: "memes", name: "Meme Culture", desc: "Viral Memes, Trends" },
          { id: "puzzles", name: "Puzzles & Challenges", desc: "Trivia, Online Challenges" },
          { id: "life_hacks", name: "Life Hacks", desc: "Daily Tips, Funny Hacks" },
        ]
      case "test":
        return [
          { id: "dev", name: "Developer Test", desc: "Quick test quiz" },
        ]
      default:
        return []
    }
  }

  const subjects = getSubjectsForGenre(player?.class)

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
        Choose Your Topic
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
