import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { realtimeService } from "../main";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppData();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    if (socketRef.current) {
      setSocket(socketRef.current);
      return;
    }

    const nextSocket = io(realtimeService, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
    });

    socketRef.current = nextSocket;
    setSocket(nextSocket);

    nextSocket.on("connect", () => {
      console.log("Socket Connected", nextSocket.id);
    });

    nextSocket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });

    nextSocket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
    });

    return () => {
      nextSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuth, localStorage.getItem("token")]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
