const moment = require("moment");
const winston = require("winston");
require("winston-daily-rotate-file");
require("dotenv").config();
const { combine, timestamp, printf, colorize, align, json } = winston.format;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
var logger;


const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: `app/winston-logs/%DATE%-acms.log`,
  datePattern: "YYYY-MM-DD",
  maxFiles: "90d",
});

if (
  process.env.NODE_ENV == "production" ||
  process.env.NODE_ENV == "PRODUCTION"
) {
  logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "info",
    exitOnError: false,
    //   format: combine(timestamp(), json()),
    format: combine(
      // colorize({ all: true }),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      align(),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    defaultMeta: { service: "acms-service" },
    transports: [
      fileRotateTransport,
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `acms.log`
      //
      new winston.transports.File({
        filename: `app/winston-logs/error.log`,
        level: "error",
      }),
      // new winston.transports.File({
      //   filename: `app/winston-logs/${moment().format("YYYY-MM-DD")}-acms.log`,
      // }),
    ],
  });
} else {
  logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || "debug",
    exitOnError: false,
    //   format: combine(timestamp(), json()),
    format: combine(
      // colorize({ all: true }),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      align(),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    defaultMeta: { service: "acms-service" },
    transports: [
      fileRotateTransport,
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `acms.log`
      //
      new winston.transports.File({
        filename: `app/winston-logs/error.log`,
        level: "error",
      }),
      new winston.transports.File({
        filename: `app/winston-logs/debug/${moment().format("YYYY-MM-DD")}.log`,
        level: "debug",
      }),
      // new winston.transports.File({
      //   filename: `app/winston-logs/${moment().format("YYYY-MM-DD")}-acms.log`,
      // }),
    ],
  });
}

if (process.env.NODE_ENV.toUpperCase() != "testing" && process.env.NODE_ENV != "TESTING") {
  logger.add(
    new winston.transports.Console({
      //   format: winston.format.cli(),
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    })
  );
}

module.exports = {
  logger,
};
