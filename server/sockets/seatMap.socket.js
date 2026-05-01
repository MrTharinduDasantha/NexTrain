const roomName = (scheduleId, classId) => `seatmap:${scheduleId}:${classId}`;

export const registerSeatMapSocket = (io) => {
  io.on("connection", (socket) => {
    // Optional client metadata for debugging
    const clientIp = socket.handshake.address;
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔌  Socket connected: ${socket.id} (${clientIp})`);
    }

    // Client joins a seat-map room.
    socket.on("seatmap:join", ({ scheduleId, classId } = {}) => {
      if (!scheduleId || !classId) return;
      const room = roomName(scheduleId, classId);
      socket.join(room);
      socket.emit("seatmap:joined", { room });
    });

    //  Client leaves a seat-map room (e.g. user navigated away).
    socket.on("seatmap:leave", ({ scheduleId, classId } = {}) => {
      if (!scheduleId || !classId) return;
      socket.leave(roomName(scheduleId, classId));
    });

    // Optional: lightweight peer "I'm hovering over seat X" indicator.
    socket.on(
      "seatmap:hover",
      ({ scheduleId, classId, seatId, hovering } = {}) => {
        if (!scheduleId || !classId || !seatId) return;
        socket.to(roomName(scheduleId, classId)).emit("seat:hover", {
          seatId,
          hovering: !!hovering,
          bySocket: socket.id,
        });
      },
    );

    socket.on("disconnect", () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`🔌  Socket disconnected: ${socket.id}`);
      }
    });
  });
};
