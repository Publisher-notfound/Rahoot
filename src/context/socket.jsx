import { createContext, useContext } from "react"
import { io } from "socket.io-client"

// Get WebSocket URL directly from environment variable, fallback to localhost
const getWebSocketURL = () => {
  const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:5506/"
  console.log("🔍 WebSocket URL being used:", url)
  console.log("🔍 Environment variable NEXT_PUBLIC_WEBSOCKET_URL:", process.env.NEXT_PUBLIC_WEBSOCKET_URL)
  return url
}

export const socket = io(getWebSocketURL(), {
  transports: ["websocket"],
})

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)

  return { socket: context }
}
