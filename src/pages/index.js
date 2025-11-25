import Image from "next/image"
import { Montserrat } from "next/font/google"
import Form from "@/components/Form"
import Button from "@/components/Button"
import Input from "@/components/Input"
import logo from "@/assets/logo.svg"
import { useEffect, useState } from "react"
import Loader from "@/components/Loader"
import { usePlayerContext } from "@/context/player"
import Room from "@/components/game/join/Room"
import Username from "@/components/game/join/Username"
import ModeSelection from "@/components/game/join/ModeSelection"
import { useSocketContext } from "@/context/socket"
import toast from "react-hot-toast"

export default function Home() {
  const { player, dispatch } = usePlayerContext()
  const { socket } = useSocketContext()
  const [mode, setMode] = useState(null) // 'solo' or 'compete'

  useEffect(() => {
    socket.on("game:errorMessage", (message) => {
      toast.error(message)
    })

    return () => {
      socket.off("game:errorMessage")
    }
  }, [])

  const handleSolo = () => setMode('solo')
  const handleCompete = () => setMode('compete')

  if (!player) {
    if (!mode) {
      return (
        <section className="relative flex min-h-screen flex-col items-center justify-center">
          <div className="absolute h-full w-full overflow-hidden">
            <div className="absolute -left-[15vmin] -top-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full bg-primary/15"></div>
            <div className="absolute -bottom-[15vmin] -right-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45 bg-primary/15"></div>
          </div>
          {/* Admin panel button hidden for production */}
          <h1 className="mb-6 text-6xl font-bold text-yellow-500 shadow-lg">ADHYAYAN</h1>
          {mode ? (
            <button
              onClick={() => setMode(null)}
              className="mb-4 px-4 py-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-all"
            >
              ← Back to Menu
            </button>
          ) : null}
          <ModeSelection onSolo={handleSolo} onCompete={handleCompete} />
        </section>
      )
    }
    return mode === 'compete' ? (
      <section className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="absolute h-full w-full overflow-hidden">
          <div className="absolute -left-[15vmin] -top-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full bg-primary/15"></div>
          <div className="absolute -bottom-[15vmin] -right-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45 bg-primary/15"></div>
        </div>
        {/* Admin panel button hidden for production */}
        <h1 className="mb-6 mt-4 text-4xl font-bold text-yellow-500 shadow-lg">ADHYAYAN</h1>
        <Room />
      </section>
    ) : (
      <section className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="absolute h-full w-full overflow-hidden">
          <div className="absolute -left-[15vmin] -top-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full bg-primary/15"></div>
          <div className="absolute -bottom-[15vmin] -right-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45 bg-primary/15"></div>
        </div>
        {/* Admin panel button hidden for production */}
        <h1 className="mb-6 mt-4 text-4xl font-bold text-yellow-500 shadow-lg">ADHYAYAN</h1>
        <Username />
      </section>
    )
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute h-full w-full overflow-hidden">
        <div className="absolute -left-[15vmin] -top-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full bg-primary/15"></div>
        <div className="absolute -bottom-[15vmin] -right-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45 bg-primary/15"></div>
      </div>
      {/* Admin panel button hidden for production */}
      <h1 className="mb-6 text-4xl font-bold text-yellow-500 shadow-lg">ADHYAYAN</h1>
      <Username />
    </section>
  )
}
