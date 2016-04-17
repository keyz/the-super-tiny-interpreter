'use strict';

const { isObject, mapFilterObject } = require('../utils');

describe('isObject', () => {
  it('should work on trivial stuff', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject([ 1, 2, 3 ])).toBe(false);

    expect(isObject({})).toBe(true);
    expect(isObject({ a: 3 })).toBe(true);

    expect(isObject(() => {})).toBe(false);
    expect(isObject(function noop() {})).toBe(false); // eslint-disable-line prefer-arrow-callback
  });

  it('should work on class instances', () => {
    // because the AST produced by babylon is not a plain object
    class Foo {
      constructor(name) {
        this.name = name;
      }
    }

    expect(isObject(new Foo('James'))).toBe(true);
  });
});

describe('mapFilterObject', () => {
  it('should return an empty object when the predicate always return false', () => {
    expect(mapFilterObject({ a: 2 }, () => false)).toEqual({});
  });

  it('should map and filter correctly', () => {
    expect(mapFilterObject(
      { a: 2, b: 20 },
      (val, key) => (val > 10 ? [ key, val + 100 ] : false),
    )).toEqual({
      b: 120,
    });

    expect(mapFilterObject(
      { a: 2, b: 20 },
      (val, key) => (val > 10 ? [ `${key}-postfix`, val + 100 ] : [ key, val ]),
    )).toEqual({
      a: 2,
      'b-postfix': 120,
    });
  });
});
