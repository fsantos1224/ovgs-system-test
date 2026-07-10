import pino from 'pino';

const isBrowser = typeof window !== 'undefined';

export const logger = pino({
  level: import.meta.env.DEV ? 'debug' : 'info',
  browser: isBrowser
    ? {
        asObject: true,
        write: {
          debug: (o) => console.debug(JSON.stringify(o)),
          info: (o) => console.info(JSON.stringify(o)),
          warn: (o) => console.warn(JSON.stringify(o)),
          error: (o) => console.error(JSON.stringify(o)),
          fatal: (o) => console.error(JSON.stringify(o)),
        },
      }
    : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
