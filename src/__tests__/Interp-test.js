jest.disableAutomock();

const { programInterp } = require('../Interp');
const { parse } = require('../Parser');

const parseAndEval = (code) => programInterp(parse(code));

describe('Interp', () => {
  it('should support trivial prim types', () => {
    expect(parseAndEval('3;')).toBe(3);
    expect(parseAndEval('true;')).toBe(true);
  });

  it('should support arrow function expressions', () => {
    expect(parseAndEval('const foo = (x, y) => 3; foo(100, 200)')).toBe(3);
    expect(parseAndEval('const foo = (x) => (y) => x + y; foo(12)(24)')).toBe(36);
  });
});
