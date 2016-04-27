import {
  emptyEnv,
  lookupEnv,
  extendEnv,
  batchExtendEnv,
} from '../Environment';

jest.unmock('../Environment');

describe('Environment', () => {
  it('has an empty env that contains `undefined`', () => {
    expect(lookupEnv('undefined', emptyEnv)).toBe(void 0);
    expect(emptyEnv.size).toBe(1);
  });

  it('should extend and lookup stuff correctly', () => {
    const env = extendEnv('foo', 999, emptyEnv);
    expect(lookupEnv('foo', env)).toBe(999);
  });

  it('should support shadowing correctly', () => {
    const data = [
      [ 'foo', 0 ],
      [ 'foo', 13 ],
    ];

    const env = data.reduce(
      (res, [ name, val ]) => extendEnv(name, val, res),
      emptyEnv,
    );

    expect(lookupEnv('foo', env)).toBe(13);
  });

  it('should batch extend stuff correctly', () => {
    const env = extendEnv('foo', 999, emptyEnv);
    const keys = [ 'foo', 'bar', 'james', 'huang' ];
    const vals = [ 1, 2, 3, 4 ];
    const extendedEnv = batchExtendEnv(keys, vals, env);

    expect(extendedEnv.size - emptyEnv.size).toBe(4);
    expect(lookupEnv('james', extendedEnv)).toBe(3);
    expect(lookupEnv('foo', extendedEnv)).toBe(1);
  });

  it('should throw when arguments.length !== parameters.length', () => {
    const env = extendEnv('foo', 999, emptyEnv);
    const keys = [ 'foo', 'bar', 'james', 'huang', 'yeah' ];
    const vals = [ 1, 2, 3 ];
    expect(() => { batchExtendEnv(keys, vals, env); }).toThrow();
  });
});
