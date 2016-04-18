'use strict';

jest.unmock('../../Parser')
    .unmock('../ExpressionInterp').unmock('../StatementInterp')
    .unmock('../../Environment').unmock('../../Closure');

const { interp } = require('../ExpressionInterp');
const { parse } = require('../../Parser');
const {
  emptyEnv,
  extendEnv,
} = require('../../Environment');

import { makeClosure } from '../../Closure';

const parseAndgetExp = (code) => parse(code).body[0].expression;

const interpExp = (code) => interp(parseAndgetExp(code), emptyEnv);
const interpExpWithEnv = (code, env) => interp(parseAndgetExp(code), env);

describe('Interp', () => {
  it('NullLiteral', () => {
    expect(interpExp('null')).toBe(null);
  });

  it('undefined', () => {
    expect(interpExp('undefined')).toBe(void 0);
  });


  it('NumericLiteral', () => {
    expect(interpExp('3.123')).toBe(3.123);
    expect(interpExp('424')).toBe(424);
  });

  it('BooleanLiteral', () => {
    expect(interpExp('true')).toBe(true);
    expect(interpExp('false')).toBe(false);
  });

  it('UnaryExpression', () => {
    expect(interpExp('!true')).toBe(!true);
    expect(interpExp('!false')).toBe(!false);
    expect(interpExp('!!0')).toBe(!!0);
    expect(interpExp('!!3')).toBe(!!3);
    expect(interpExp('-12')).toBe(-12);
  });

  it('BinaryExpression', () => {
    expect(interpExp('1 + 1')).toBe(1 + 1);
    expect(interpExp('15 - 4')).toBe(15 - 4);
    expect(interpExp('15 * 4')).toBe(15 * 4);
    expect(interpExp('15 / 4')).toBe(15 / 4);
    expect(interpExp('15 + 4 + 12')).toBe(15 + 4 + 12);
    expect(interpExp('15 + 4 * 12 - 28 / 15')).toBe(15 + 4 * 12 - 28 / 15);

    expect(interpExp('3 < 12')).toBe(3 < 12);
    expect(interpExp('3 > 12')).toBe(3 > 12);
    expect(interpExp('3 <= 12')).toBe(3 <= 12);
    expect(interpExp('3 >= 12')).toBe(3 >= 12);

    expect(interpExp('3 === 3')).toBe(3 === 3); // eslint-disable-line no-self-compare
    expect(interpExp('3 === 1 + 2')).toBe(3 === 1 + 2); // eslint-disable-line yoda
    expect(interpExp('1 == true')).toBe(1 == true); // eslint-disable-line eqeqeq
    expect(interpExp('100 == true')).toBe(100 == true); // eslint-disable-line eqeqeq

    expect(interpExp('100 != false')).toBe(100 != false); // eslint-disable-line eqeqeq
    expect(interpExp('100 !== false')).toBe(100 !== false);
    expect(interpExp('100 !== 12')).toBe(100 !== 12);
  });

  it('ConditionalExpression', () => {
    expect(interpExp('3 > 4 ? 12 : 0'))
      .toBe(3 > 4 ? 12 : 0); // eslint-disable-line no-constant-condition
  });

  it('Identifier', () => {
    // @TODO figure out a consistent way to match specific error messages
    expect(() => { interpExp('x'); }).toThrow();
    expect(() => { interpExpWithEnv('x', emptyEnv); }).toThrow();

    const env0 = extendEnv('x', 12, emptyEnv);
    expect(interpExpWithEnv('x', env0)).toBe(12);

    expect(interpExpWithEnv('x + 3', env0)).toBe(12 + 3);
  });

  it('ArrowFunctionExpression', () => {
    expect(interpExpWithEnv('() => 3', emptyEnv)).toEqual(makeClosure(
      [],
      parseAndgetExp('3'),
      emptyEnv,
    ));

    expect(interpExpWithEnv('() => 3 + 12', emptyEnv)).toEqual(makeClosure(
      [],
      parseAndgetExp('3 + 12'),
      emptyEnv,
    ));

    expect(interpExpWithEnv('(x) => fact(x + 12)', emptyEnv)).toEqual(makeClosure(
      [ 'x' ],
      parseAndgetExp('fact(x + 12)'),
      emptyEnv,
    ));
  });

  it('CallExpression', () => {
    const env0 = extendEnv('x', 12, emptyEnv);
    expect(interpExpWithEnv('((x) => x + 12)(12)', env0)).toBe(((x) => x + 12)(12));
  });

  it('arrow block', () => {
    const env0 = extendEnv('x', 24, emptyEnv);
    expect(interpExpWithEnv('((x) => { return x + 12; })(12)', env0))
      .toBe(((x) => { return x + 12; })(12)); // eslint-disable-line arrow-body-style
    expect(interpExp('(() => {})()'))
      .toBe((() => {})()); // eslint-disable-line arrow-body-style
    expect(interpExp('((x) => {})(12)'))
      .toBe(((x) => {})(12)); // eslint-disable-line arrow-body-style, no-unused-vars

    expect(interpExp('((x) => { 123; return x + 12; })(12)'))
      .toBe(((x) => { 123; return x + 12; })(12)); // eslint-disable-line no-unused-expressions
  });

  it('should shadow variable bindings currently', () => {
    const env0 = extendEnv('x', 24, emptyEnv);
    expect(interpExpWithEnv('((x) => { return x + 12; })(12)', env0))
      .toBe(((x) => { return x + 12; })(12)); // eslint-disable-line arrow-body-style

    expect(interpExpWithEnv('(() => { const x = 120; return x + 12; })()', env0))
      .toBe((() => { const x = 120; return x + 12; })()); // eslint-disable-line arrow-body-style

    expect(interpExpWithEnv('(() => { const x = 120; const y = 24; return y + 12; })()', env0))
      .toBe((() => {
        const x = 120; // eslint-disable-line no-unused-vars
        const y = 24;
        return y + 12;
      })()); // eslint-disable-line arrow-body-style
  });

  it('should make correct closures', () => {
    expect(interpExp(`(() => {
      const adder = (x) => (y) => x + y;
      const add3 = adder(3);
      return add3(39);
    })()`)).toBe((() => {
      const adder = (x) => (y) => x + y;
      const add3 = adder(3);
      return add3(39);
    })());

    expect(interpExp(`(() => {
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

    expect(interpExp(`(() => {
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
    expect(interpExp(`(() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      return fact(5);
    })()`)).toBe((() => {
      const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));
      return fact(5);
    })());
  });

  it('should support early return statements', () => {
    expect(interpExp(`(() => {
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


  // it('IfStatement', () => {
  //   expect(interpExp(`(() => {
  //     const foo = 12;
  //     if (foo > 24) {
  //       return -20;
  //     } else if (foo < 25) {
  //       return -12;
  //     } else { // eslint-disable-line no-else-return
  //       return 1000;
  //     }
  //   })()`)).toBe((() => {
  //     const foo = 12;
  //     if (foo > 24) {
  //       return -20;
  //     } else if (foo < 25) {
  //       return -12;
  //     } else { // eslint-disable-line no-else-return
  //       return 1000;
  //     }
  //   })());
  // });
});
