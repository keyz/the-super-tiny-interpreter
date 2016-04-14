const isObject = (x) => x && typeof x === 'object' && !Array.isArray(x);

/*
 * fn acts as both a mapFn and a predicate
 */
const mapFilterObject = (obj, fn) => {
  const keys = Object.keys(obj);
  const result = {};

  keys.forEach((key) => {
    const val = obj[key];
    const fnResult = fn(val, key); // `fn` return `false` for removal, or a tuple of `[ key, val ]`
    if (fnResult) {
      const [ newKey, newVal ] = fnResult;
      result[newKey] = newVal;
    }
  });

  return result;
};

export {
  isObject,
  mapFilterObject,
};
