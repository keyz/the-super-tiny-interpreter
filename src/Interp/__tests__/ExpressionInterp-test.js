jest.unmock('../ExpressionInterp').unmock('../StatementInterp')
    .unmock('../../Parser')
    .unmock('../../Environment').unmock('../../Closure');

const { interp } = require('../ExpressionInterp');
const { parse } = require('../../Parser');
const {
  emptyEnv,
  // lookupEnv,
  extendEnv,
  // batchExtendEnv,
} = require('../../Environment');

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
    expect(interpExp('!true')).toBe(false);
    expect(interpExp('!false')).toBe(true);
    expect(interpExp('!!0')).toBe(false);
    expect(interpExp('!!3')).toBe(true);
  });

  it('BinaryExpression', () => {
    expect(interpExp('1 + 1')).toBe(1 + 1);
    expect(interpExp('15 - 4')).toBe(15 - 4);
    expect(interpExp('15 + 4 + 12')).toBe(15 + 4 + 12);

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
    expect(interpExpWithEnv('() => 3', emptyEnv)).toEqual({
      args: [],
      body: parseAndgetExp('3'),
      env: emptyEnv,
    });

    expect(interpExpWithEnv('() => 3 + 12', emptyEnv)).toEqual({
      args: [],
      body: parseAndgetExp('3 + 12'),
      env: emptyEnv,
    });

    expect(interpExpWithEnv('(x) => x + 12', emptyEnv)).toEqual({
      args: [ 'x' ],
      body: parseAndgetExp('x + 12'),
      env: emptyEnv,
    });
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

  it('should shadow variable bindings', () => {
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
  });

  it('should make correct closures', () => {
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
  });
});
