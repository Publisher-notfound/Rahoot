import { usePlayerContext } from "@/context/player"
import { useRouter } from "next/router"
import Button from "@/components/Button"

export default function Leaderboard({ data: { leaderboard } }) {
  const { dispatch } = usePlayerContext()
  const router = useRouter()

  const handleMainMenu = () => {
    dispatch({ type: "LOGOUT" })
    router.replace("/")
  }

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-2">
      <h2 className="mb-6 text-5xl font-bold text-white drop-shadow-md">
        Leaderboard
      </h2>
      <div className="flex w-full flex-col gap-2 mb-8">
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
      <Button onClick={handleMainMenu}>Main Menu</Button>
    </section>
  )
}
