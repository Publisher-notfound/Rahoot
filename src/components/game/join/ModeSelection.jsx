import Button from "../../Button.jsx"
import { useContext } from "react"
import { PlayerContext } from "../../../context/player.jsx"

export default function ModeSelection({ onSolo, onCompete }) {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center justify-center space-y-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
          Choose Your Adventure
        </h1>
        <p className="text-white/70 text-lg">Pick your preferred way to play and test your knowledge</p>
      </div>
      
      <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        {/* Solo Mode Card */}
        <button
          onClick={() => onSolo()}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border-2 border-blue-400/30 hover:border-blue-400/60 p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="text-5xl">🎯</div>
              <div className="bg-blue-400/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                Solo Play
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Practice & Learn
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
              Challenge yourself with solo quizzes. Choose from various subjects and difficulty levels to improve your knowledge at your own pace.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <span className="text-white/60 text-sm">Features:</span>
                <div className="flex space-x-2 text-xs">
                  <span className="bg-white/10 text-white px-2 py-1 rounded">No Time Pressure</span>
                  <span className="bg-white/10 text-white px-2 py-1 rounded">All Subjects</span>
                </div>
              </div>
              <div className="text-white/60 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Compete Mode Card */}
        <button
          onClick={() => onCompete()}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border-2 border-orange-400/30 hover:border-orange-400/60 p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="text-5xl">⚔️</div>
              <div className="bg-orange-400/20 text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                Live Battle
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Compete Live
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
              Join live tournaments with friends using a room PIN. Battle in real-time and see who comes out on top in exciting multiplayer quizzes.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <span className="text-white/60 text-sm">Features:</span>
                <div className="flex space-x-2 text-xs">
                  <span className="bg-white/10 text-white px-2 py-1 rounded">Real-time</span>
                  <span className="bg-white/10 text-white px-2 py-1 rounded">Multiplayer</span>
                </div>
              </div>
              <div className="text-white/60 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      </div>
      
      <div className="text-center text-white/50 text-sm">
        <p>Both modes offer engaging quizzes to test and expand your knowledge</p>
      </div>
    </div>
  )
}
