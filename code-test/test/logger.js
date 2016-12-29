const expect = require('chai').expect;
const sinon = require('sinon');
const Logger = require('../logger').Logger;

// Disable no-unused-expressions because expect breaks that pattern
/* eslint-disable no-unused-expressions */
describe('Logger', () => {
  // Constructor
  describe('__constructor', () => {
    it('should be able to be instantiated with no config', () => {
      expect(() => {
        Logger();
      }).not.to.throw();
    });

    it('should not overwrite prototype methods if no config is passed in', () => {
      const result = new Logger();

      expect(typeof result.root === 'undefined');
      expect(typeof result.format === 'undefined');
      expect(typeof result.trasnport === 'undefined');
    });

    it('should overwrite prototype method format with the passed in function', () => {
      const config = {
        format: input => `hello ${input}`,
      };

      const inst = new Logger(config);
      expect(inst.format('world')).to.equal('hello world');
    });

    it('should overwrite the prototype method transport with passed in function', () => {
      const config = {
        root: 'custom_root',
        transport: input => `hello ${input}`,
      };

      const inst = new Logger(config);
      expect(inst.transport('world')).to.equal('hello world');
    });

    it('should set this.root to provided root', () => {
      const inst = new Logger({ root: 'custom root' });
      expect(inst.root).to.equal('custom root');
    });
  });

  // Logger.log
  describe('Logger.log:', () => {
    it('should throw error if no params are passed', () => {
      const inst = new Logger();
      expect(() => { inst.log(); }).to.throw();
    });

    it('should set local data and level vars, and call lower level functions', () => {
      const inst = new Logger();

      const spyCreateLogObject = sinon.spy(inst, 'createLogObject');
      const spyFormat = sinon.spy(inst, 'format');
      const spyTransport = sinon.spy(inst, 'transport');

      inst.log('data', 'level');

      // Make sure it sets local level, data
      expect(inst.level).to.equal('level');
      expect(inst.data).to.equal('data');

      // Make sure it calls lower order functions
      expect(spyCreateLogObject.called).true;
      expect(spyFormat.called).true;
      expect(spyTransport.called.true);
    });
  });

  // Logger.createLogObject
  describe('Logger.createLogObject', () => {
    it('should format and return logObj', () => {
      const context = {
        root: 'root',
        data: 'a string',
        level: 'mocked level',
      };

      const match = {
        root: 'root',
        level: 'mocked level',
      };

      const inst = new Logger();
      const result = inst.createLogObject.call(context);

      expect(result.root).to.equal(match.root);
      expect(result.level).to.equal(match.level);
    });

    it('should assign this.data equal to data if typeof data === string', () => {
      const context = {
        root: 'root',
        data: 'a string',
        level: 'mocked level',
      };

      const inst = new Logger();
      const result = inst.createLogObject.call(context);

      expect(result.message).to.equal('a string');
    });

    it('should assign this.data equal to the value passed in if typeof !== string', () => {
      const context = {
        root: 'root',
        data: { message: 'my custom message' },
        level: 'mocked level',
      };

      const inst = new Logger();
      const result = inst.createLogObject.call(context);

      expect(result.message).to.equal('my custom message');
    });

    it('should throw an error if typeof this.data !== string or object', () => {
      const context = {
        root: 'root',
        data: () => {},
        level: 'mocked level',
      };

      const inst = new Logger();

      expect(() => { inst.createLogObject.call(context); }).to.throw();

      const context2 = {
        root: 'root',
        data: 1,
        level: 'mocked level',
      };

      const inst2 = new Logger();

      expect(() => { inst2.createLogObject.call(context2); }).to.throw();
    });
  });

  // Logger.format
  describe('Logger.format:', () => {
    it('should JSON.stringify logObj param', () => {
      const inst = new Logger();
      const param = { hello: 'world', foo: 'bar' };
      const result = inst.format(param);
      expect(result).to.equal(JSON.stringify(param));
    });

    it('should return undefined if param is unable to be stringified', () => {
      const inst = new Logger();
      const param = () => {};
      const result = inst.format(param);
      expect(result).undefined;
    });
  });

  // Logger.transport
  describe('Logger.transport:', () => {
    // colors from https://github.com/chalk/ansi-styles/blob/master/index.js
    const values = {
      error: '\u001b[31mmessage\u001b[39m',
      warning: '\u001b[33mmessage\u001b[39m',
      debug: '\u001b[34mmessage\u001b[39m',
      default: '\u001b[32mmessage\u001b[39m',
    };

    it('should invoke chalk.red if level === "error"', () => {
      const inst = new Logger();
      const spy = sinon.spy(inst, 'writeout');
      inst.transport('error', 'message');

      expect(spy.calledWith(values.error)).true;
    });

    it('should invoke chalk.yellow if level === "warning"', () => {
      const inst = new Logger();
      const spy = sinon.spy(inst, 'writeout');
      inst.transport('warning', 'message');

      expect(spy.calledWith(values.warning)).true;
    });

    it('should invoke chalk.blue if level === "debug"', () => {
      const inst = new Logger();
      const spy = sinon.spy(inst, 'writeout');
      inst.transport('debug', 'message');

      expect(spy.calledWith(values.debug)).true;
    });

    it('should invoke chalk.green if level === "default"', () => {
      const inst = new Logger();
      const spy = sinon.spy(inst, 'writeout');
      inst.transport('default', 'message');

      expect(spy.calledWith(values.default)).true;
    });

    it('should invoke chalk.green if level === undefined', () => {
      const inst = new Logger();
      const spy = sinon.spy(inst, 'writeout');
      inst.transport(undefined, 'message');

      expect(spy.calledWith(values.default)).true;
    });
  });
});
