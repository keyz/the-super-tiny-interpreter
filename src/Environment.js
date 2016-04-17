/*
 * An environment is just a mapping from names to values.
 *
 * For instance, after we evaluate `const foo = 12;`,
 * the environment contains a mapping that looks like `{ foo: 12 }`.
 *
 * Here we use the immutable map from Immutable.js. The immutable model fits with
 * our implementation and its API is pretty nice.
 */
import { Map as iMap } from 'immutable';

/*
 * An empty map to start with.
 */
const emptyEnv = iMap({
  undefined: void 0,
});

/*
 * get(name)
 * throws if the name cannot be found
 */
const lookupEnv = (name, env) => {
  if (!env.has(name)) {
    throw new Error(
      `* Uncaught ReferenceError: ${name} is not defined. env snapshot: ${env.toString()}`,
    );
  }

  return env.get(name);
};

/*
 * set(name, value)
 */
const extendEnv = (name, val, env) => env.set(name, val);

/*
 * Batch set. Nothing fancy.
 */
const batchExtendEnv = (names, vals, env) => {
  if (names.length !== vals.length) {
    throw new Error(
      `unmatched argument count: parameters are [${names}] and arguments are [${vals}]`,
    );
  }

  return names.reduce(
    (newEnv, name, idx) => {
      const val = vals[idx];
      return extendEnv(name, val, newEnv);
    },
    env,
  );
};

export {
  emptyEnv,
  lookupEnv,
  extendEnv,
  batchExtendEnv,
};
