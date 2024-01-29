import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
// Create a logger instance
export const logger = winston.createLogger({
  level: "info", // Set the default logging level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.simple(),
    winston.format.printf((info) => {
      if (info.stack) {
        return `${info.timestamp} [${info.level.toUpperCase()}]: ${
          info.message
        }\n${info.stack}`;
      }
      return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
    })
  ),
  transports: [
    // new winston.transports.Console({ level: 'debug', format: winston.format.simple() }), // Output debug logs to the console
    // new winston.transports.File({ filename: 'logs/logfile.log' }), // Output logs to a file
    new DailyRotateFile({
      filename: "logs/logfile-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m", // Optional: Rotate to a new file when the current file exceeds 20 MB
      maxFiles: "30d", // Optional: Retain log files for 30 days
    }),
  ],
});

export const morganStream = {
  write: (message: any) => {
    // Use your Winston logger to log Morgan messages
    logger.info(message);
  },
};
