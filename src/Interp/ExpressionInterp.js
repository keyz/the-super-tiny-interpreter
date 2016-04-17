/*
 * https://github.com/estree/estree/blob/master/spec.md#expressions
 */
import {
  // emptyEnv,
  lookupEnv,
  // extendEnv,
} from '../Environment';

import {
  makeClosure,
  applyClosure,
} from '../Closure';

import { interp as statementInterp } from './StatementInterp';

const interp = (exp, env) => {
  switch (exp.type) {
    case 'NullLiteral': {
      return null;
    }

    case 'NumericLiteral':
    case 'BooleanLiteral': {
      return exp.value;
    }

    case 'BlockStatement': {
      return statementInterp(exp, env);
    }

    case 'Identifier': {
      const { name } = exp;
      return lookupEnv(name, env);
    }

    case 'ArrowFunctionExpression': {
      /*
       * @TODO double check the logic,
       * but for now we don't need to dispatch based on `expression` here
       */
      const { body, params } = exp;

      const names = params.map((obj) => obj.name);
      const val = makeClosure(names, body, env);
      return val;
    }

    case 'CallExpression': {
      const { callee, arguments: rawArgs } = exp;

      // here we recur on both sides
      const closure = interp(callee, env);
      const vals = rawArgs.map((obj) => interp(obj, env));

      const val = applyClosure(interp, closure, vals, env);
      return val;
    }

    case 'UnaryExpression': {
      const { argument, operator } = exp;
      // @TODO what's the `prefix` property here?

      switch (operator) {
        case '!': {
          return !interp(argument, env);
        }
        default: {
          throw new Error(`unsupported UnaryExpression operator ${operator}`);
        }
      }
    }

    case 'BinaryExpression': {
      const { left, operator, right } = exp;
      switch (operator) {
        case '+': {
          return interp(left, env) + interp(right, env);
        }
        case '-': {
          return interp(left, env) - interp(right, env);
        }
        case '*': {
          return interp(left, env) * interp(right, env);
        }
        case '/': {
          return interp(left, env) / interp(right, env);
        }
        case '==': {
          return interp(left, env) == interp(right, env); // eslint-disable-line eqeqeq
        }
        case '===': {
          return interp(left, env) === interp(right, env);
        }
        case '!=': {
          return interp(left, env) != interp(right, env); // eslint-disable-line eqeqeq
        }
        case '!==': {
          return interp(left, env) !== interp(right, env);
        }
        case '<': {
          return interp(left, env) < interp(right, env); // eslint-disable-line eqeqeq
        }
        case '<=': {
          return interp(left, env) <= interp(right, env);
        }
        case '>': {
          return interp(left, env) > interp(right, env); // eslint-disable-line eqeqeq
        }
        case '>=': {
          return interp(left, env) >= interp(right, env);
        }
        default: {
          throw new Error(`unsupported BinaryExpression operator ${operator}`);
        }
      }
    }

    case 'ConditionalExpression': {
      const { alternate, consequent, test } = exp;
      return interp(test, env) ? interp(consequent, env) : interp(alternate, env);
    }

    default: {
      throw new Error(`unsupported expression type ${exp.type}`);
    }
  }
};

export {
  interp,
};
