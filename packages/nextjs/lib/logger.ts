type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  [key: string]: unknown;
}

const SERVICE_NAME = "aeternum";

function formatPayload(level: LogLevel, message: string, meta?: Record<string, unknown>): LogPayload {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
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
