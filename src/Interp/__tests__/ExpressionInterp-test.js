import { expInterp } from '../index';
import { parse } from '../../Parser';

import {
  emptyEnv,
  extendEnv,
} from '../../Environment';

import { makeClosure } from '../../Closure';
import { setLexical } from '../../Options';

const parseAndGet1stExp = (code) => parse(code).body[0].expression;

const evalCode = (code) => expInterp(parseAndGet1stExp(code), emptyEnv);
const evalCodeWithEnv = (code, env) => expInterp(parseAndGet1stExp(code), env);

describe('ExpressionInterp', () => {
  it('NullLiteral', () => {
    expect(evalCode('null')).toBe(null);
  });

  it('undefined', () => {
    expect(evalCode('undefined')).toBe(void 0);
  });


  it('NumericLiteral', () => {
    expect(evalCode('3.123')).toBe(3.123);
    expect(evalCode('424')).toBe(424);
  });

  it('BooleanLiteral', () => {
    expect(evalCode('true')).toBe(true);
    expect(evalCode('false')).toBe(false);
  });

  it('UnaryExpression', () => {
    expect(evalCode('!true')).toBe(!true);
    expect(evalCode('!false')).toBe(!false);
    expect(evalCode('!!0')).toBe(!!0);
    expect(evalCode('!!3')).toBe(!!3);
    expect(evalCode('-12')).toBe(-12);
  });

  it('BinaryExpression', () => {
    expect(evalCode('1 + 1')).toBe(1 + 1);
    expect(evalCode('15 - 4')).toBe(15 - 4);
    expect(evalCode('15 * 4')).toBe(15 * 4);
    expect(evalCode('15 / 4')).toBe(15 / 4);
    expect(evalCode('15 + 4 + 12')).toBe(15 + 4 + 12);
    expect(evalCode('15 + 4 * 12 - 28 / 15')).toBe(15 + 4 * 12 - 28 / 15);

    expect(evalCode('3 < 12')).toBe(3 < 12);
    expect(evalCode('3 > 12')).toBe(3 > 12);
    expect(evalCode('3 <= 12')).toBe(3 <= 12);
    expect(evalCode('3 >= 12')).toBe(3 >= 12);

    expect(evalCode('3 === 3')).toBe(3 === 3); // eslint-disable-line no-self-compare
    expect(evalCode('3 === 1 + 2')).toBe(3 === 1 + 2); // eslint-disable-line yoda
    expect(evalCode('1 == true')).toBe(1 == true); // eslint-disable-line eqeqeq
    expect(evalCode('100 == true')).toBe(100 == true); // eslint-disable-line eqeqeq

    expect(evalCode('100 != false')).toBe(100 != false); // eslint-disable-line eqeqeq
    expect(evalCode('100 !== false')).toBe(100 !== false);
    expect(evalCode('100 !== 12')).toBe(100 !== 12);
  });

  it('ConditionalExpression', () => {
    expect(evalCode('3 > 4 ? 12 : 0'))
      .toBe(3 > 4 ? 12 : 0); // eslint-disable-line no-constant-condition
  });

  it('Identifier', () => {
    // @TODO figure out a consistent way to match specific error messages
    expect(() => { evalCode('x'); }).toThrow();
    expect(() => { evalCodeWithEnv('x', emptyEnv); }).toThrow();

    const env0 = extendEnv('x', 12, emptyEnv);
    expect(evalCodeWithEnv('x', env0)).toBe(12);

    expect(evalCodeWithEnv('x + 3', env0)).toBe(12 + 3);
  });

  it('ArrowFunctionExpression', () => {
    expect(evalCodeWithEnv('() => 3', emptyEnv)).toEqual(makeClosure(
      [],
      parseAndGet1stExp('3'),
      emptyEnv,
    ));

    expect(evalCodeWithEnv('() => 3 + 12', emptyEnv)).toEqual(makeClosure(
      [],
      parseAndGet1stExp('3 + 12'),
      emptyEnv,
    ));

    expect(evalCodeWithEnv('(x) => fact(x + 12)', emptyEnv)).toEqual(makeClosure(
      ['x'],
      parseAndGet1stExp('fact(x + 12)'),
      emptyEnv,
    ));
  });

  it('CallExpression', () => {
    const env0 = extendEnv('x', 12, emptyEnv);
    expect(evalCodeWithEnv('((x) => x + 12)(12)', env0)).toBe(((x) => x + 12)(12));
  });

  it('arrow block', () => {
    const env0 = extendEnv('x', 24, emptyEnv);
    expect(evalCodeWithEnv('((x) => { return x + 12; })(12)', env0))
      .toBe(((x) => { return x + 12; })(12)); // eslint-disable-line arrow-body-style
    expect(evalCode('(() => {})()'))
      .toBe((() => {})()); // eslint-disable-line arrow-body-style
    expect(evalCode('((x) => {})(12)'))
      .toBe(((x) => {})(12)); // eslint-disable-line arrow-body-style, no-unused-vars

    expect(evalCode('((x) => { 123; return x + 12; })(12)'))
      .toBe(((x) => { 123; return x + 12; })(12)); // eslint-disable-line no-unused-expressions
  });

  it('should shadow variable bindings currently', () => {
    const env0 = extendEnv('x', 24, emptyEnv);
    expect(evalCodeWithEnv('((x) => { return x + 12; })(12)', env0))
      .toBe(((x) => { return x + 12; })(12)); // eslint-disable-line arrow-body-style

    expect(evalCodeWithEnv('(() => { const x = 120; return x + 12; })()', env0))
      .toBe((() => { const x = 120; return x + 12; })()); // eslint-disable-line arrow-body-style

    expect(evalCodeWithEnv('(() => { const x = 120; const y = 24; return y + 12; })()', env0))
      .toBe((() => {
        const x = 120; // eslint-disable-line no-unused-vars
        const y = 24;
        return y + 12;
      })()); // eslint-disable-line arrow-body-style
  });

  it('should make correct closures', () => {
    expect(evalCode(`(() => {
      const adder = (x) => (y) => x + y;
      const add3 = adder(3);
      return add3(39);
    })()`)).toBe((() => {
      const adder = (x) => (y) => x + y;
      const add3 = adder(3);
      return add3(39);
    })());

    expect(evalCode(`(() => {
      const x = 100;
      const y = 200;
      const adder = (x) => (y) => x + y;
      const add3 = adder(3);
      return add3(39);
    })()`)).toBe((() => {
      const x = 100; // eslint-disable-line no-unused-vars
      const y = 200; // eslint-disable-line no-unused-vars
      const adder = (x) => (y) => x + y; // eslint-disable-line no-shadow
      const add3 = adder(3);
      return add3(39);
    })());

    expect(evalCode(`(() => {
      const times2 = (x) => x * 2;
      const times4 = (x) => times2(times2(x));
      const times4Add1 = (x) => times4(x) + 1;

      return times4Add1(39);
    })()`)).toBe((() => {
      const times2 = (x) => x * 2;
      const times4 = (x) => times2(times2(x));
      const times4Add1 = (x) => times4(x) + 1;

      return times4Add1(39);
    })());
  });

  it('should support recursion (letrec)', () => {
    expect(evalCode(`(() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      return fact(5);
    })()`)).toBe((() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      return fact(5);
    })());
  });

  it('should support early return statements', () => {
    expect(evalCode(`(() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      return fact(5);
      const foo = 12;
      const bar = 140;
      return foo + bar;
    })()`)).toBe((() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      return fact(5);
      const foo = 12; // eslint-disable-line no-unreachable
      const bar = 140; // eslint-disable-line no-unreachable
      return foo + bar; // eslint-disable-line no-unreachable
    })());
  });

  it('should return undefined when there\'s no return', () => {
    expect(evalCode(`(() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      const bar = 140;
      bar;
    })()`)).toBe((() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      const bar = 140;
      bar; // eslint-disable-line no-unused-expressions
    })());
  });

  it('should support dynamic scope', () => {
    setLexical(false);

    expect(evalCode(`(() => {
      const adder = (x) => (y) => x + y;
      const x = 100;
      const add3ButActuallyAdd100 = adder(3);
      return add3ButActuallyAdd100(5);
    })()`)).toBe(100 + 5);

    expect(evalCode(`(() => {
      const x = 100;
      const y = 200;
      const adder = (x) => (y) => x + y;
      const add3 = adder(3);
      return add3(39);
    })()`)).toBe(100 + 39);

    setLexical(true);
  });

  it('should support `log` as a native func call', () => {
    spyOn(console, 'log');

    expect(evalCode(`(() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      log(fact(5));
      log(256);
      const foo = 12;
      const bar = 140;
      log(bar);
      return foo + bar;
    })()`)).toBe((() => {
      const foo = 12;
      const bar = 140;
      return foo + bar;
    })());

    expect(console.log.calls.count()).toEqual(3); // eslint-disable-line no-console
    expect(console.log.calls.argsFor(0)).toEqual([120]); // eslint-disable-line no-console
    expect(console.log.calls.argsFor(1)).toEqual([256]); // eslint-disable-line no-console
    expect(console.log.calls.argsFor(2)).toEqual([140]); // eslint-disable-line no-console
  });
});
