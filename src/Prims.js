import { makeClosure } from './Closure';
import { log } from './Writer';
import { emptyEnv } from './Environment';

const LogClosure = makeClosure(
  [ 'x' ], {
    type: 'NativeFuncCall',
    value: log,
  },
  emptyEnv,
);

const Prims = {
  log: LogClosure,
};

export {
  Prims,
};
