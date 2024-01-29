import { Server, Socket } from 'socket.io';
import { logger } from '../config/winston';

export const handleSocket = (io: Server) => {
  io.on('connection', (socket) => {
    socket.emit('response', { message: 'hello world' });
    logger.info(`new connection at ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`disconnected ${socket.id}`);
    });
  });
};
