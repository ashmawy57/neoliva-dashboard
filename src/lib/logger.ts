import pino from "pino";
import { getTraceContextSync } from "./observability/context";

const isDev = process.env.NODE_ENV === "development";

const transport = isDev
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss Z",
      },
    }
  : undefined;

const baseLogger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA || "local",
  },
  transport,
});

/**
 * Structured logger that automatically injects trace context
 */
export const logger = {
  info: (msg: string, metadata?: object) => {
    const context = getTraceContextSync();
    baseLogger.info({ ...context, ...metadata }, msg);
  },
  error: (msg: string, error?: any, metadata?: object) => {
    const context = getTraceContextSync();
    const errorDetails = error instanceof Error 
      ? { 
          message: error.message, 
          stack: error.stack,
          name: error.name
        } 
      : { error };

    baseLogger.error({ 
      ...context, 
      ...errorDetails, 
      ...metadata 
    }, msg);
  },
  warn: (msg: string, metadata?: object) => {
    const context = getTraceContextSync();
    baseLogger.warn({ ...context, ...metadata }, msg);
  },
  debug: (msg: string, metadata?: object) => {
    const context = getTraceContextSync();
    baseLogger.debug({ ...context, ...metadata }, msg);
  },
  /**
   * Use this for specific modules to keep logs organized
   */
  child: (module: string) => {
    return {
      info: (msg: string, metadata?: object) => logger.info(msg, { module, ...metadata }),
      error: (msg: string, error?: any, metadata?: object) => logger.error(msg, error, { module, ...metadata }),
      warn: (msg: string, metadata?: object) => logger.warn(msg, { module, ...metadata }),
      debug: (msg: string, metadata?: object) => logger.debug(msg, { module, ...metadata }),
    };
  }
};
