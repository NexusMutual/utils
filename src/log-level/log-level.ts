type ConsoleMethod = 'trace' | 'debug' | 'info' | 'log' | 'warn' | 'error';
type LogLevel = 'all' | 'silence' | ConsoleMethod;

const _console = Object.assign({}, console); // clones the original console
const CONSOLE_METHODS: ConsoleMethod[] = ['trace', 'debug', 'info', 'log', 'warn', 'error'];
const LOG_LEVELS: LogLevel[] = ['all', 'trace', 'debug', 'info', 'log', 'warn', 'error', 'silence'];

/**
 * "log" and "info" are considered to be the same level
 * if "log", returns "info" otherwise returns the original level
 *
 * @param {LogLevel} - log level to be adjusted
 * @returns {LogLevel} - adjusted log level
 */
const normalizeLogLevel = (level: LogLevel) => (level === 'log' ? 'info' : level);

/**
 * Determines if the current log level should be displayed
 * Treats "log" and "info" as equivalent
 *
 * @param {LogLevel} level - The log level to check
 * @returns {boolean} True if the log should be displayed, false otherwise
 */
const shouldLog = (level: LogLevel, envLogLevel: LogLevel): boolean => {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(envLogLevel);
};

/**
 * Modifies global.console to include log levels
 *
 * Supported levels:
 * all - logs all methods (default)
 * trace
 * debug
 * info - same level as "log"
 * log - same level as "info"
 * warn
 * error
 * silence - disables all logging
 *
 * Usage:
 * logLevel("INFO") // only info, log, warn and error will log
 * logLevel("ErRoR") // case insensitive, only error will log
 *
 * @param {string} logLevelParam - Environment variable for log level
 *                               Defaults to 'all' for any value other than the valid log levels
 */
const setLogLevel = (logLevelParam: string = 'all') => {
  const lowerCaseLogLevel = typeof logLevelParam === 'string' ? logLevelParam.toLowerCase() : '';
  const normalizedLogLevel = lowerCaseLogLevel as LogLevel;
  const isValidLevel = LOG_LEVELS.includes(normalizedLogLevel);

  // Defaults to ALL if not a valid log level
  const effectiveLevel: LogLevel = isValidLevel ? normalizedLogLevel : 'all';

  // Log the level setting information
  const levelMessage = isValidLevel
    ? `Log level set to: ${effectiveLevel.toUpperCase()}`
    : `Invalid log level "${logLevelParam}" provided. Defaulting to: ${effectiveLevel.toUpperCase()}`;
  _console.info(levelMessage);

  for (const method of CONSOLE_METHODS) {
    const methodLevel = normalizeLogLevel(method);
    // replace the original method with the same one but with log level validation
    global.console[method] = (...params) => shouldLog(methodLevel, effectiveLevel) && _console[method]?.(...params);
  }
};

export {
  ConsoleMethod,
  LogLevel,
  CONSOLE_METHODS,
  setLogLevel,
  _console, // exposed for testing purposes
};
