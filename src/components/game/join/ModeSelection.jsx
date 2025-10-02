import Button from "../../Button.jsx"
import { useContext } from "react"
import { PlayerContext } from "../../../context/player.jsx"

export default function ModeSelection({ onSolo, onCompete }) {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center justify-center space-y-6 px-4">
      <h1 className="mb-4 text-3xl font-bold text-white drop-shadow-md text-center">
        Choose Your Play Mode
      </h1>
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <button
          onClick={() => onSolo()}
          className="rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 p-8 text-left transition-all hover:bg-white/30"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            🏆 Join the Mega Tournament
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Play solo quizzes and climb the leaderboard. Choose any subject and chapter!
          </p>
          <div className="mt-6 text-center">
            <span className="inline-block bg-white/20 text-white px-6 py-2 rounded-full font-semibold">
              Instant Play
            </span>
          </div>
        </button>

        <button
          onClick={() => onCompete()}
          className="rounded-xl bg-primary/25 backdrop-blur-sm border-2 border-primary/40 hover:border-primary/60 p-8 text-left transition-all hover:bg-primary/35"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            ⚡ Compete or Duel Live
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Join friends with a PIN and battle in live tournaments!
          </p>
          <div className="mt-6 text-center">
            <span className="inline-block bg-primary/30 text-white px-6 py-2 rounded-full font-semibold">
              Live Battle
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
