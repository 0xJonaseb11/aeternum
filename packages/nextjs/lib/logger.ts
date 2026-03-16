/**
 * Structured logger foundation for observability.
 * Replace with Pino/Winston or send to Sentry/Vercel in production.
 * Sentry: add @sentry/nextjs, sentry.client.config.ts, sentry.server.config.ts, instrumentation.ts when ready.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatPayload(level: LogLevel, message: string, meta?: Record<string, unknown>): LogPayload {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const payload = formatPayload(level, message, meta);
  const str = JSON.stringify(payload);
  switch (level) {
    case "error":
      console.error(str);
      break;
    case "warn":
      console.warn(str);
      break;
    default:
      console.log(str);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
