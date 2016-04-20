/*
 * https://github.com/estree/estree/blob/master/spec.md#statements
 */

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
          case 'ExpressionStatement': {
            expInterp(currentExp.expression, currentEnv); // stuff like `log(something)`
            continue;
          }

          case 'ReturnStatement': {
            const { argument } = currentExp;

            return expInterp(argument, currentEnv); // early return!
          }

          case 'VariableDeclaration': {
            const { kind, declarations } = currentExp;

            invariant(
              kind === 'const',
              `unsupported VariableDeclaration kind ${kind}`,
            );

            invariant(
              declarations.length === 1,
              `unsupported multiple (${declarations.length}) VariableDeclarations`,
            );

            const { id, init } = declarations[0];
            const { name } = id;

            if (init.type === 'ArrowFunctionExpression') {
              /*
               * TL;DR: it could be a `letrec`!
               *
               * A better way is to do a static analysis and to see whether the RHS
               * actually contains recursive definitions.
               * However, for the sake of simplicity,
               * we treat all RHS lambdas as potential self-referencing definitions,
               * a.k.a., `letrec`s.
               *
               * For more information, check the comments and definitions in `Closure.js`
               * and http://www.cs.indiana.edu/~dyb/papers/fixing-letrec.pdf
               */
              init.extra = { isLambda: true, name };
            }

            const val = expInterp(init, currentEnv);
            currentEnv = extendEnv(name, val, currentEnv);

            continue;
          }

          default: {
            throw new Error(`unsupported BlockStatement type ${currentExp.type}`);
          }
        }
      }

      return undefined; // `return` hasn't been called so we return `undefined`
    }

    default: {
      throw new Error(`unsupported statement type ${exp.type}`);
    }
  }
};

export {
  interp,
};
