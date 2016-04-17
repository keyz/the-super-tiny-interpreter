import invariant from 'fbjs/lib/invariant';

import { batchExtendEnv } from './Environment';
const CLOSURE_TYPE_FLAG = Symbol('CLOSURE_TYPE_FLAG');

/*
 * As we've said,
 * a closure is just a combination of a function definition and an environment snapshot.
 * Here we represent a closure simply as a plain object.
 */
const makeClosure = (args, body, defineTimeEnv) => ({
  type: CLOSURE_TYPE_FLAG,
  args,
  body,
  env: defineTimeEnv,
});

/*
 * `applyClosure` is where the function invocation (computation) happens.
 * For demonstration purposes, we pass an additional `callTimeEnv` and an `isLexical` flag
 * so you can toggle the behavior between lexical and dynamic bindings.
 *
 * As you can see, there's no black magic™. The resolving behavior is simply determined
 * by which environment you want the interpreter to use.
 *
 * Some people call dynamic binding "late binding". That makes sense, cuz `callTimeEnv`
 * is definitely fresher than `defineTimeEnv`. We just have too many names though.
 */
const applyClosure = (evaluator, closure, vals, callTimeEnv, isLexical = true) => {
  invariant(closure.type === CLOSURE_TYPE_FLAG, `${closure} is not a closure`);

  const { args, body, env: defineTimeEnv } = closure;

  if (!isLexical) {
    // Dynamic scope.
    // `callTimeEnv` is the latest binding information.
    const envForTheEvaluator = batchExtendEnv(args, vals, callTimeEnv);
    return evaluator(body, envForTheEvaluator);
  }

  // Lexical closure yo.
  // `defineTimeEnv` is the one that got extracted from the closure.
  const envForTheEvaluator = batchExtendEnv(args, vals, defineTimeEnv);
  return evaluator(body, envForTheEvaluator);
};

export {
  makeClosure,
  applyClosure,
};
