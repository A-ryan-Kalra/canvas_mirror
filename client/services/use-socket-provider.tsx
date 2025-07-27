import { createContext, useContext, useRef } from "react";

const SocketContext = createContext<Map<string, WebSocket>>(new Map());
export function useSocket() {
  const socketProvider = useContext(SocketContext);
  return { socketProvider };
}

function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Map<string, WebSocket>>(new Map());

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketProvider;
