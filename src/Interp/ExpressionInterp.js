/*
 * https://github.com/estree/estree/blob/master/spec.md#expressions
 */

import {
  lookupEnv,
} from '../Environment';

import {
  makeClosure,
  makeRecClosure,
  applyClosure,
} from '../Closure';

import { CLOSURE_TYPE_FLAG, NATIVE_FUNC_FLAG } from '../typeFlags';

import Prims from '../Prims';

import Options from '../Options';

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

      // @TODO document this
      if (Object.keys(Prims).includes(name)) {
        return Prims[name];
      }

      return lookupEnv(name, env);
    }

    case 'ArrowFunctionExpression': {
      const { body, params } = exp;
      const names = params.map((obj) => obj.name);

      if (exp.extra && exp.extra.isLambda) {
        const { name: selfId } = exp.extra;
        return makeRecClosure(selfId, names, body, env);
      }

      return makeClosure(names, body, env);
    }

    case 'CallExpression': {
      const { callee, arguments: rawArgs } = exp;
      // here we recur on both sides
      const vals = rawArgs.map((obj) => interp(obj, env));
      const closureOrFunc = interp(callee, env);

      // @TODO document this
      switch (closureOrFunc.type) {
        case CLOSURE_TYPE_FLAG: {
          return applyClosure(interp, closureOrFunc, vals, env, Options.isLexical);
        }
        case NATIVE_FUNC_FLAG: {
          return closureOrFunc.func.apply(null, vals);
        }
        default: {
          throw new Error(`unsupported ~closure type ${closureOrFunc.type}`);
        }
      }
    }

    case 'UnaryExpression': {
      const { argument, operator } = exp;
      // @TODO what's the `prefix` property here?

      switch (operator) {
        case '!': {
          return !interp(argument, env);
        }
        case '-': {
          return -interp(argument, env);
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
