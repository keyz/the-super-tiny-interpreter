import { batchExtendEnv } from './Environment';

const makeClosure = (args, body, defineTimeEnv) => ({
  args,
  body,
  env: defineTimeEnv,
});

const applyClosure = (interp, closure, vals, callTimeEnv, isLexical = true) => {
  const { args, body, env: defineTimeEnv } = closure;

  if (isLexical) {
    const newEnv = batchExtendEnv(args, vals, defineTimeEnv);
    return interp(body, newEnv);
  }

  const newEnv = batchExtendEnv(args, vals, callTimeEnv);
  return interp(body, newEnv);
};

export {
  makeClosure,
  applyClosure,
};
