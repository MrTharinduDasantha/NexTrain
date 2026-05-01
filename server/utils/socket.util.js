let _io;

export const setIO = (io) => {
  _io = io;
};

export const getIO = () => _io;

/**
 * Emit seat availability change to everyone watching this schedule's seat map.
 * room name: `seatmap:<scheduleId>:<classId>`
 */
export const emitSeatUpdate = ({ scheduleId, classId, seatId, status }) => {
  if (!_io) return;

  const room = `seatmap:${scheduleId}:${classId}`;
  _io.to(room).emit("seat:update", { seatId, status });
};
