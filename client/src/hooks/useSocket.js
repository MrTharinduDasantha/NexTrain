import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

/**
 * Singleton client. We keep a single socket per page to avoid duplicate
 * connections when multiple components subscribe to the seat map.
 */
let _socket = null;

const getSocket = () => {
  if (_socket) return _socket;

  const url =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  _socket = io(url || "/", {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return _socket;
};

/**
 * Subscribe to a seat-map room and react to seat updates.
 *
 * @param {Object} params
 *   scheduleId, classId — required to join the room.
 *   onSeatUpdate({ seatId, status })  — called when another user holds/books/releases a seat.
 *   onSeatHover({ seatId, hovering, bySocket }) — optional peer-cursor effect.
 *
 * Returns: the socket instance (for emitting hover events, etc.)
 */
export const useSocket = ({
  scheduleId,
  classId,
  onSeatUpdate,
  onSeatHover,
} = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!scheduleId || !classId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const join = () => socket.emit("seatmap:join", { scheduleId, classId });

    if (socket.connected) join();
    socket.on("connect", join);

    if (onSeatUpdate) socket.on("seat:update", onSeatUpdate);
    if (onSeatHover) socket.on("seat:hover", onSeatHover);

    return () => {
      socket.emit("seatmap:leave", { scheduleId, classId });
      socket.off("connect", join);
      if (onSeatUpdate) socket.off("seat:update", onSeatUpdate);
      if (onSeatHover) socket.off("seat:hover", onSeatHover);
    };
  }, [scheduleId, classId, onSeatUpdate, onSeatHover]);

  return socketRef.current;
};

export default useSocket;
