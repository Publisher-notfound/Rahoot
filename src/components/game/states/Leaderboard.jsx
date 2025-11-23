import { usePlayerContext } from "@/context/player"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import { useState } from "react"

export default function Leaderboard({ data: { leaderboard } }) {
  const { dispatch, player } = usePlayerContext()
  const router = useRouter()
  const [showPerformanceReport, setShowPerformanceReport] = useState(false)

  const isSoloMode = leaderboard.length <= 1

  const handleMainMenu = () => {
    dispatch({ type: "LOGOUT" })
    router.replace("/")
  }

  const handleViewPerformance = () => {
    setShowPerformanceReport(true)
  }

  console.log("Leaderboard component rendered!", { leaderboard, isSoloMode, showPerformanceReport, player })

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-2 min-h-screen">
      {/* Top right fixed button */}
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleMainMenu} variant="secondary">Main Menu</Button>
      </div>

      {/* Top center buttons (avoiding bottom overlap) */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
        {isSoloMode && !showPerformanceReport && (
          <Button onClick={handleViewPerformance} className="bg-blue-500 hover:bg-blue-600 px-6 py-3 text-lg">
            📊 View Performance Report
          </Button>
        )}
        {showPerformanceReport && (
          <Button onClick={() => setShowPerformanceReport(false)} className="bg-gray-500 hover:bg-gray-600 px-6 py-3 text-lg">
            Back to Leaderboard
          </Button>
        )}
      </div>

      <div className="pb-32"></div>

      <h2 className="mb-6 text-5xl font-bold text-white drop-shadow-md">
        {showPerformanceReport ? "📊 Performance Report" : "Leaderboard"}
      </h2>

      {showPerformanceReport ? (
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <p className="text-white/80 text-lg">{player?.username}'s Quiz Analysis</p>
          </div>

          <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">🎯 Your Results</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{leaderboard[0]?.points || 0} Points</div>
              <p className="text-white/80 mt-2">Great job! Here are some insights:</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30">
              <h4 className="text-xl font-bold text-green-400 mb-4">✨ What You Did Well</h4>
              <ul className="space-y-2 text-white">
                <li>• Completed the quiz successfully</li>
                <li>• Maintained focus throughout</li>
                <li>• Showed good time management</li>
              </ul>
            </div>

            <div className="bg-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30">
              <h4 className="text-xl font-bold text-orange-400 mb-4">🎯 Areas to Improve</h4>
              <ul className="space-y-2 text-white">
                <li>• Review specific quiz topics</li>
                <li>• Practice similar questions</li>
                <li>• Take more quizzes to build knowledge</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => setShowPerformanceReport(false)}>Back to Leaderboard</Button>
            <Button onClick={handleMainMenu}>Take Another Quiz</Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2">
          {leaderboard.map(({ username, points }, key) => (
            <div
              key={key}
              className={`flex w-full justify-between rounded-md p-3 text-2xl font-bold ${key === 0 ? "bg-yellow-500/20 border-2 border-yellow-500" : "bg-primary"} text-white`}
            >
              <span className="drop-shadow-md">{username}</span>
              <span className="drop-shadow-md">{points}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
