const LEVELS = {
  INFO: 'info',
  WARN: 'warning',
  ERROR: 'error',
  DEBUG: 'debug',
};

const chalk = require('chalk');

// Allow instantiation without params
function Logger(config = {}) {
  this.root = config.root || 'root';

  if (config.format) {
    this.format = config.format;
  }

  if (config.transport) {
    this.transport = config.transport;
  }
}

Logger.prototype = {
  log(data, level) {
    // Throw error if data is not provided
    if (typeof data === 'undefined') {
      throw new Error('Logger.log: Data must be defined');
    }

    this.level = level;
    this.data = data;

    const logObj = this.createLogObject();
    const message = this.format(logObj);

    this.transport(level, message);
  },

  createLogObject() {
    // ensure this.data is either string or object
    if (typeof this.data !== 'string' && typeof this.data !== 'object') {
      throw new Error('Logger.createLogObject: this.data is of an unexpected type');
    }

    let rootObj;

    if (this.root) {
      rootObj = { root: this.root };
    }

    const data = (typeof this.data === 'string') ? { message: this.data } : this.data;
    const logObj = Object.assign(rootObj, data, { level: this.level || 'info' });

    return logObj;
  },

  format(logObj) {
    return JSON.stringify(logObj);
  },

  // Putting this here to we can test the logic in transport.
  // Writeout only invokes console.log. Basically we can
  // now spy on this
  writeout(msg) {
    console.log(msg);
  },

  transport(level, message) {
    if (level === 'error') {
      this.writeout(chalk.red(message));
    } else if (level === 'warning') {
      this.writeout(chalk.yellow(message));
    } else if (level === 'debug') {
      this.writeout(chalk.blue(message));
    } else {
      // the default is info
      this.writeout(chalk.green(message));
    }
  },
};

module.exports = { Logger, LEVELS };
