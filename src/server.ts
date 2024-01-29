import express from 'express';
import cors from 'cors';
import { ErrorRequestHandler } from 'express';
import { connect } from 'mongoose';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { ApiError } from './errors/ApiError';
import { logger } from './config/winston';
import { apiRoutes } from './routes';
import { startBackup } from './utils/mongoBackup';
import { handleSocket } from './socket/connection';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('uncaughtException ', error);
});

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' }, transports: ['websocket'] });
handleSocket(io);
app.set('socket', io);
app.use(express.json());
app.use(cors({ origin: env.environment === 'development' ? '*' : env.url.base }));
app.use(express.static('public_html'));
app.use('/api', apiRoutes);
const globalError: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err);
  if (err instanceof ApiError) return res.status(err.statusCode).json({ reason: err.message });
  if (err.name === 'MongoServerError' && err.code == '11000')
    return res.status(400).json({
      reason: `${Object.keys(err.keyPattern)} is already exists`,
    });
  return res.status(500).json({ reason: 'server error!' });
};
app.use(globalError);
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'index.html'));
});
connect(env.db.url)
  .then(() => {
    server.listen(env.port, () => {
      const msg = `server runs on port ${env.port}`;
      logger.warn(msg);
      console.log(msg);
    });
    // startBackup({
    //   backupContinuouslyDB: true,
    //   backupOnceDB: false,
    //   restoreBackupDB: true,
    // });
  })
  .catch(() => {
    const msg = `error in database connection to ${env.db.url}`;
    console.error(msg);
    logger.error(msg);
  });
