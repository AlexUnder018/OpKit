import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useTasks } from "@/contexts/TasksContext";
import { TaskUpdatedEvent } from "@/types";

const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8000";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { applySocketUpdate } = useTasks();
  // Keep applySocketUpdate in a ref so the socket effect only runs once
  const applyRef = useRef(applySocketUpdate);
  applyRef.current = applySocketUpdate;

  useEffect(() => {
    console.log("Connecting to WebSocket at:", BASE_URL);

    const newSocket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err.message);
    });

    newSocket.on("task:updated", (event: TaskUpdatedEvent) => {
      console.log("Task updated via WebSocket:", event);
      applyRef.current(event.taskId, event.status);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); // runs once on mount

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
