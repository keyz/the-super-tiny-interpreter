jest.unmock('../Environment').unmock('immutable');

const {
  emptyEnv,
  lookupEnv,
  extendEnv,
  batchExtendEnv,
} = require('../Environment');

describe('Environment', () => {
  it('has an empty env that contains nothing', () => {
    expect(emptyEnv.size).toBe(0);
  });

  it('should extend and lookup stuff correctly', () => {
    const env = extendEnv('foo', 999, emptyEnv);
    expect(lookupEnv('foo', env)).toBe(999);
  });

  it('should batch extend stuff correctly', () => {
    const env = extendEnv('foo', 999, emptyEnv);
    const keys = [ 'foo', 'bar', 'james', 'huang' ];
    const vals = [ 1, 2, 3, 4 ];
    const extendedEnv = batchExtendEnv(keys, vals, env);

    expect(extendedEnv.size).toBe(4);
    expect(lookupEnv('james', extendedEnv)).toBe(3);
    expect(lookupEnv('foo', extendedEnv)).toBe(1);
  });

  it('should throw when the argument count is not correct', () => {
    const env = extendEnv('foo', 999, emptyEnv);
    const keys = [ 'foo', 'bar', 'james', 'huang', 'yeah' ];
    const vals = [ 1, 2, 3 ];
    expect(() => { batchExtendEnv(keys, vals, env); }).toThrow();
  });
});
