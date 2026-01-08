/**
 * Logger utility with log levels and development mode detection
 *
 * Log Levels:
 * - DEBUG: Detailed debugging information
 * - INFO: General information about component operations
 * - WARN: Warning messages for potential issues
 * - ERROR: Error messages for failures
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

// Auto-detect development mode
const isDevelopment = () => {
    // Check for localhost or development indicators
    if (typeof window !== 'undefined') {
        const hostname = window.location?.hostname || '';
        return hostname === 'localhost' ||
               hostname === '127.0.0.1' ||
               hostname.includes('.local') ||
               hostname.includes('dev.');
    }
    return false;
};

export const Logger = {
    // Set log level based on environment
    level: isDevelopment() ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN,

    // Component prefix for easy filtering
    prefix: '[GMap]',

    // Styling for different log levels
    styles: {
        debug: 'background: #6c757d; color: white; padding: 2px 6px; border-radius: 2px;',
        info: 'background: #0d6efd; color: white; padding: 2px 6px; border-radius: 2px;',
        warn: 'background: #ffc107; color: black; padding: 2px 6px; border-radius: 2px;',
        error: 'background: #dc3545; color: white; padding: 2px 6px; border-radius: 2px;',
        action: 'background: #198754; color: white; padding: 2px 6px; border-radius: 2px;'
    },

    /**
     * Set the logging level
     * @param {string} level - 'DEBUG', 'INFO', 'WARN', 'ERROR', or 'NONE'
     */
    setLevel(level) {
        this.level = LOG_LEVELS[level] ?? LOG_LEVELS.WARN;
    },

    /**
     * Enable all logging (DEBUG level)
     */
    enableAll() {
        this.level = LOG_LEVELS.DEBUG;
    },

    /**
     * Disable all logging
     */
    disable() {
        this.level = LOG_LEVELS.NONE;
    },

    /**
     * Debug level logging - detailed debugging info
     */
    debug(message, ...args) {
        if (this.level <= LOG_LEVELS.DEBUG) {
            console.log(`%c${this.prefix} DEBUG`, this.styles.debug, message, ...args);
        }
    },

    /**
     * Info level logging - general information
     */
    info(message, ...args) {
        if (this.level <= LOG_LEVELS.INFO) {
            console.log(`%c${this.prefix} INFO`, this.styles.info, message, ...args);
        }
    },

    /**
     * Warn level logging - potential issues
     */
    warn(message, ...args) {
        if (this.level <= LOG_LEVELS.WARN) {
            console.warn(`%c${this.prefix} WARN`, this.styles.warn, message, ...args);
        }
    },

    /**
     * Error level logging - failures
     */
    error(message, ...args) {
        if (this.level <= LOG_LEVELS.ERROR) {
            console.error(`%c${this.prefix} ERROR`, this.styles.error, message, ...args);
        }
    },

    /**
     * Action logging - for tracking dispatched actions
     */
    action(actionName, payload = null) {
        if (this.level <= LOG_LEVELS.DEBUG) {
            if (payload !== null) {
                console.log(`%c${this.prefix} ACTION`, this.styles.action, actionName, payload);
            } else {
                console.log(`%c${this.prefix} ACTION`, this.styles.action, actionName);
            }
        }
    },

    /**
     * Group related logs together
     */
    group(label) {
        if (this.level <= LOG_LEVELS.DEBUG) {
            console.group(`${this.prefix} ${label}`);
        }
    },

    /**
     * End a log group
     */
    groupEnd() {
        if (this.level <= LOG_LEVELS.DEBUG) {
            console.groupEnd();
        }
    },

    /**
     * Legacy log method for backward compatibility
     */
    log(message, variable = null) {
        this.debug(message, variable);
    }
};

// Export log levels for external use
export { LOG_LEVELS };
