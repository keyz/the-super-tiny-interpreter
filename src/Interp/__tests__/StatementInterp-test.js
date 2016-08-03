/* eslint-disable no-console */

import { statementInterp } from '../index';
import { parse } from '../../Parser';

import {
  emptyEnv,
} from '../../Environment';

import { setLexical } from '../../Options';

const evalScript = (code) => statementInterp(parse(code), emptyEnv);

describe('StatementInterp', () => {
  it('should print out all `log`s', () => {
    spyOn(console, 'log');

    expect(evalScript(`
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      log(fact(5));
      log(256);
      const foo = 12;
      const bar = 140;
      log(bar);
    `)).toBe(undefined);

    expect(console.log.calls.count()).toEqual(3);
    expect(console.log.calls.argsFor(0)).toEqual([120]);
    expect(console.log.calls.argsFor(1)).toEqual([256]);
    expect(console.log.calls.argsFor(2)).toEqual([140]);
  });

  it('should support dynamic scope', () => {
    spyOn(console, 'log');

    setLexical(false);

    evalScript(`(() => {
      const adder = (x) => (y) => x + y;
      const x = 100;
      const add3ButActuallyAdd100 = adder(3);
      log(add3ButActuallyAdd100(5));
    })()`);
    expect(console.log.calls.argsFor(0)).toEqual([100 + 5]);

    evalScript(`(() => {
      const x = 100;
      const y = 200;
      const adder = (x) => (y) => x + y;
      const add3 = adder(3);
      log(add3(39));
    })()`);
    expect(console.log.calls.argsFor(1)).toEqual([100 + 39]);

    expect(console.log.calls.count()).toEqual(2);

    setLexical(true);
  });
});
