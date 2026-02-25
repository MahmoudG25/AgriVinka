/**
 * Logger utility for development-aware logging
 * Logs are only shown in development mode
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (message, data) => {
    if (isDev) console.log(message, data);
  },
  error: (message, error) => {
    if (isDev) console.error(message, error);
  },
  warn: (message, data) => {
    if (isDev) console.warn(message, data);
  },
  info: (message, data) => {
    if (isDev) console.info(message, data);
  },
  debug: (message, data) => {
    if (isDev) console.debug(message, data);
  },
};

export default logger;
