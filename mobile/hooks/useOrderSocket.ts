import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/lib/api";

// Change this to your Render realtime service URL
const REALTIME_SERVICE_URL = "https://feasto-realtime.onrender.com";

interface Location {
  latitude: number;
  longitude: number;
}

export function useOrderSocket(orderId: string, isActive: boolean) {
  const [riderLocation, setRiderLocation] = useState<Location | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    // Only connect if the order is active
    if (!isActive) return;

    let socket: Socket | null = null;

    const connectSocket = async () => {
      const token = await getToken();
      if (!token) return;

      // Connect to Socket.io server
      socket = io(REALTIME_SERVICE_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Socket connected for order tracking:", socket?.id);
      });

      // Listen for the specific location event
      socket.on("rider:location", (payload: Location) => {
        setRiderLocation({
          latitude: payload.latitude,
          longitude: payload.longitude,
        });
      });

      // Listen for order status updates
      socket.on("order:status", (payload: { status: string }) => {
        console.log("Socket received order status update:", payload.status);
        setOrderStatus(payload.status);
      });

      socket.on("connect_error", (err) => {
        console.log("Socket connection error:", err.message);
      });
    };

    connectSocket();

    // Cleanup on unmount or when order becomes inactive
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [orderId, isActive]);

  return { riderLocation, orderStatus };
}
