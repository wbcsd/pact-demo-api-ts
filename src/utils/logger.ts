import pino from "pino";

const pinoInstance = pino({
  ...(process.env.NODE_ENV !== "production"
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
});

const wrap =
  (method: "info" | "error" | "warn" | "debug") =>
  (message: string, meta?: any) => {
    if (meta) {
      pinoInstance[method](meta, message);
    } else {
      pinoInstance[method](message);
    }
  };

const logger = {
  info: wrap("info"),
  error: wrap("error"),
  warn: wrap("warn"),
  debug: wrap("debug"),
};

export { pinoInstance };
export default logger;
