import invariant from 'fbjs/lib/invariant';

import { batchExtendEnv, extendEnv } from './Environment';
import { CLOSURE_TYPE_FLAG } from './typeFlags';

/*
 * As we've said,
 * a closure is just a combination of a function definition and an environment snapshot.
 * Here we represent a closure simply as a plain object.
 */
const makeClosure = (params, body, defineTimeEnv) => ({
  type: CLOSURE_TYPE_FLAG,
  params,
  body,
  env: defineTimeEnv,
});

/*
 * This is a little bit tricky and please feel free to ignore this part.
 *
 * Our arrow functions can be recursively defined. For instance,
 * in `const fact = (x) => (x < 2 ? 1 : x * fact(x - 1));`
 * we need to reference `fact` in the body of `fact` itself.
 *
 * If we create a "normal" closure for the function above, the `fact` (pun intended)
 * in the body will be unbound.
 *
 * A quick fix is to update the environment with a reference to the closure itself.
 * For more information, check http://www.cs.indiana.edu/~dyb/papers/fixing-letrec.pdf
 */
const makeRecClosure = (id, params, body, defineTimeEnv) => {
  const closure = makeClosure(params, body, defineTimeEnv);
  const updatedEnvWithSelfRef = extendEnv(id, closure, defineTimeEnv);
  closure.env = updatedEnvWithSelfRef;
  return closure;
};

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

  const { params, body, env: defineTimeEnv } = closure;

  if (!isLexical) {
    // Dynamic scope.
    // `callTimeEnv` is the latest binding information.
    const envForTheEvaluator = batchExtendEnv(params, vals, /* 🙋 HEY LOOK AT ME 🙋 */ callTimeEnv);
    return evaluator(body, envForTheEvaluator);
  }

  // Lexical closure yo.
  // `defineTimeEnv` is the one that got extracted from the closure.
  const envForTheEvaluator = batchExtendEnv(params, vals, /* 🙋 HEY LOOK AT ME 🙋 */ defineTimeEnv);
  return evaluator(body, envForTheEvaluator);
};

export {
  makeClosure,
  makeRecClosure,
  applyClosure,
};
