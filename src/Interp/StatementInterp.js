import invariant from 'fbjs/lib/invariant';

import { interp as expInterp } from './ExpressionInterp';
import { extendEnv } from '../Environment';

const interp = (exp, env) => {
  switch (exp.type) {
    case 'BlockStatement': {
      let currentEnv = env;
      for (let i = 0; i < exp.body.length; i++) {
        const currentExp = exp.body[i];
        switch (currentExp.type) {
          case 'ReturnStatement': {
            const { argument } = currentExp;

            return expInterp(argument, currentEnv); // return!
          }

          case 'VariableDeclaration': {
            const { kind, declarations } = currentExp;

            invariant(
              kind === 'const',
              `unsupported VariableDeclaration kind ${kind}`,
            );

            for (let j = 0; j < declarations.length; j++) {
              const { id, init } = declarations[j];
              const { name } = id;
              const val = expInterp(init, currentEnv);
              currentEnv = extendEnv(name, val, currentEnv);
            }
            continue;
          }

          case 'ExpressionStatement': {
            expInterp(currentExp.expression, currentEnv);
            continue;
          }

          default: {
            throw new Error(`unsupported BlockStatement type ${currentExp.type}`);
          }
        }
      }

      return undefined;
    }
    default: {
      throw new Error(`unsupported statement type ${exp.type}`);
    }
  }
};

export {
  interp,
};
