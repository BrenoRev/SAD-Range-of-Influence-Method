import { HttpError } from "./http";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const styles: Record<LogLevel, string> = {
  debug: "color:#9b9ba1;font-weight:600",
  info: "color:#5e6ad2;font-weight:600",
  warn: "color:#b08000;font-weight:600",
  error: "color:#dc2626;font-weight:600",
};

const isDev = import.meta.env.DEV;

function emit(level: LogLevel, scope: string, message: string, context?: LogContext): void {
  if (level === "debug" && !isDev) return;

  const tag = `%c[${level.toUpperCase()}] ${scope}`;
  const args: unknown[] = [tag, styles[level], message];
  if (context && Object.keys(context).length > 0) args.push(context);

  if (level === "error") console.error(...args);
  else if (level === "warn") console.warn(...args);
  else if (level === "debug") console.debug(...args);
  else console.log(...args);
}

function describe(err: unknown): { message: string; details: LogContext } {
  if (err instanceof HttpError) {
    return {
      message: `HTTP ${err.status} — ${err.message}`,
      details: { name: err.name, status: err.status, stack: err.stack },
    };
  }
  if (err instanceof Error) {
    return {
      message: err.message,
      details: { name: err.name, stack: err.stack },
    };
  }
  return { message: String(err), details: { raw: err } };
}

export const logger = {
  debug(scope: string, message: string, context?: LogContext): void {
    emit("debug", scope, message, context);
  },
  info(scope: string, message: string, context?: LogContext): void {
    emit("info", scope, message, context);
  },
  warn(scope: string, message: string, context?: LogContext): void {
    emit("warn", scope, message, context);
  },
  error(scope: string, message: string, context?: LogContext): void {
    emit("error", scope, message, context);
  },
  exception(scope: string, err: unknown, context?: LogContext): void {
    const { message, details } = describe(err);
    const isAbort = err instanceof Error && err.name === "AbortError";
    emit(isAbort ? "debug" : "error", scope, message, { ...details, ...context });
  },
};
