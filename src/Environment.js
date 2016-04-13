/*
 * An environment is just a mapping from names to values.
 * For instance, after we evaluate `const foo = 12;`,
 * the environment contains a mapping that looks like `{ foo: 12 }`.
 * Here we use the immutable map from Immutable.js (mostly because its api is pretty nice).
 */
import { Map as iMap } from 'immutable';

const emptyEnv = iMap();

const lookupEnv = (name, env) => {
  if (!env.has(name)) {
    throw new Error(`unbound variable ${name}`);
  }

  return env.get(name);
};

const extendEnv = (name, val, env) => env.set(name, val);

const batchExtendEnv = (names, vals, env) => {
  if (names.length !== vals.length) {
    throw new Error(`unmatched parameter vs. argument count: ${names}, ${vals}`);
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
