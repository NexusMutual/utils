import { expect } from 'chai';
import sinon from 'sinon';

import { _console, setLogLevel, CONSOLE_METHODS, ConsoleMethod, LogLevel } from './log-level';

describe('setLogLevel', () => {
  let consoleSpies: { [key: string]: sinon.SinonSpy } = {};

  beforeEach(() => {
    // Create spies for all console methods
    consoleSpies = CONSOLE_METHODS.reduce((acc, method) => {
      acc[method] = sinon.spy(_console, method);
      return acc;
    }, consoleSpies);

    CONSOLE_METHODS.forEach(method => {
      consoleSpies[method].resetHistory();
    });
  });

  afterEach(() => {
    // Restore all spies
    CONSOLE_METHODS.forEach(method => {
      consoleSpies[method].restore();
    });
  });

  const assertConsoleCalls = (level: LogLevel, activeFrom: ConsoleMethod | null) => {
    // if activeFrom is null (i.e. all levels are disabled) set methodIndex to > CONSOLE_METHODS last index
    const methodIndex = activeFrom === null ? CONSOLE_METHODS.length : CONSOLE_METHODS.indexOf(activeFrom);
    const activeMethods = CONSOLE_METHODS.slice(methodIndex);
    const inactiveMethods = CONSOLE_METHODS.slice(0, methodIndex);

    // Test inactive methods first
    inactiveMethods.forEach(method => {
      const testMessage = `${level.toUpperCase()} - testing console.${method}`;
      // reset history before calling console methods as .trace uses .error under the hood
      consoleSpies[method].resetHistory();
      console[method](testMessage);
      expect(consoleSpies[method].called, `${method} should not be called when level is ${level}`).to.equal(false);
    });

    activeMethods.forEach(method => {
      const testMessage = `${level.toUpperCase()} testing console.${method}`;
      // reset history before calling console methods as .trace uses .error under the hood
      consoleSpies[method].resetHistory();
      console[method](testMessage);
      expect(
        consoleSpies[method].calledOnceWith(testMessage),
        `${method} should be called when level is ${level}`,
      ).to.equal(true);
    });
  };

  it('should enable all logging methods when level is "all"', () => {
    setLogLevel('all');

    CONSOLE_METHODS.forEach(method => {
      const testMessage = `ALL - testing console.${method}`;
      // reset history before calling console methods as .trace uses .error under the hood
      consoleSpies[method].resetHistory();
      console[method](testMessage);
      const wasCalled = consoleSpies[method].calledOnceWith(testMessage);
      expect(wasCalled, `${method} should be called when level is all`).to.equal(true);
    });
  });

  it('should disable all logging methods when level is "silence"', () => {
    setLogLevel('silence');

    CONSOLE_METHODS.forEach(method => {
      const testMessage = `SILENCE - testing console.${method}`;
      consoleSpies[method].resetHistory();
      console[method](testMessage);
      expect(consoleSpies[method].called, `${method} should not be called when level is silence`).to.equal(false);
    });
  });

  it('should handle case-insensitive log levels', () => {
    const errorLevel = 'ERROR' as LogLevel;
    const activeFromLevel = 'error';
    setLogLevel(errorLevel);
    assertConsoleCalls(errorLevel, activeFromLevel);
  });

  it('should treat "log" and "info" as the same level', () => {
    setLogLevel('info');

    // reset console.info spy as it is used to print log level settings
    consoleSpies.info.resetHistory();

    // Both log and info should work
    console.log('INFO - testing console.log');
    console.info('INFO - testing console.info');

    expect(consoleSpies.log.calledOnceWith('INFO - testing console.log')).to.equal(true);
    expect(consoleSpies.info.calledOnceWith('INFO - testing console.info')).to.equal(true);

    // Debug and trace should not work
    expect(consoleSpies.debug.called).to.equal(false);
    expect(consoleSpies.trace.called).to.equal(false);

    setLogLevel('log');

    // reset spies
    consoleSpies.info.resetHistory();
    consoleSpies.log.resetHistory();

    // Both log and info should work
    console.log('INFO - testing console.log');
    console.info('INFO - testing console.info');

    expect(consoleSpies.log.calledOnceWith('INFO - testing console.log')).to.equal(true);
    expect(consoleSpies.info.calledOnceWith('INFO - testing console.info')).to.equal(true);

    // Debug and trace should not work
    expect(consoleSpies.debug.called).to.equal(false);
    expect(consoleSpies.trace.called).to.equal(false);
  });

  it('should handle log/info equivalence when level is explicitly set to "log"', () => {
    setLogLevel('log');

    // Reset all spies
    CONSOLE_METHODS.forEach(method => {
      consoleSpies[method].resetHistory();
    });

    const testMessage = 'Testing log level equivalence';

    // Test both log and info methods
    console.log(testMessage);
    console.info(testMessage);

    const enabledLogs = ['log', 'info'];
    enabledLogs.forEach(method => {
      const errorMessage = `console.${method} should work when level is "log"`;
      expect(consoleSpies[method].calledOnceWith(testMessage), errorMessage).to.equal(true);
    });

    const disabledLogs = ['debug', 'trace'];
    disabledLogs.forEach(method => {
      expect(consoleSpies[method].called, `console.${method} should not work when level is "log"`).to.equal(false);
    });
  });

  type LevelTest = {
    level: LogLevel;
    activeFrom: ConsoleMethod | null;
  };

  const levelTests: LevelTest[] = [
    { level: 'all', activeFrom: 'trace' },
    { level: 'trace', activeFrom: 'trace' },
    { level: 'debug', activeFrom: 'debug' },
    { level: 'info', activeFrom: 'info' },
    { level: 'log', activeFrom: 'info' }, // log and info are same level
    { level: 'warn', activeFrom: 'warn' },
    { level: 'error', activeFrom: 'error' },
    { level: 'silence', activeFrom: null },
  ];

  levelTests.forEach(({ level, activeFrom }) => {
    const testDescription = activeFrom
      ? `should only log ${activeFrom.toUpperCase()} level and above`
      : `should disable all log levels`;

    it(`${testDescription} when level is "${level}"`, () => {
      setLogLevel(level);
      assertConsoleCalls(level, activeFrom);
    });
  });

  describe('invalid log levels', () => {
    const invalidInputs = [
      { input: undefined, desc: 'undefined' },
      { input: null, desc: 'null' },
      { input: '', desc: 'empty string' },
      { input: 123, desc: 'number' },
      { input: 'INVALID_LEVEL', desc: 'random string' },
      { input: {}, desc: 'object' },
      { input: [], desc: 'array' },
    ];

    invalidInputs.forEach(({ input, desc }) => {
      it(`should default to "all" when input is ${desc}`, () => {
        setLogLevel(input as unknown as LogLevel);

        // Test all methods in order from lowest to highest level
        CONSOLE_METHODS.forEach(method => {
          const testMessage = `Default ALL - testing console.${method}`;
          // reset history before calling console methods as .trace uses .error under the hood
          consoleSpies[method].resetHistory();
          console[method](testMessage);
          expect(
            consoleSpies[method].calledOnceWith(testMessage),
            `${method} should be called when level is invalid (${desc})`,
          ).to.equal(true);
        });
      });
    });
  });
});
