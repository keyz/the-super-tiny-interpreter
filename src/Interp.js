/*
 * Welcome to the interpreter!

 * It only supports the following expressions and statements:
 * - numbers
 * - booleans
 * - variables
 * - if statements
 * - function expression
 * - function calls
 * - `+`, `-`, `*`, `/`
 */

import {
  emptyEnv,
  lookupEnv,
  extendEnv,
} from './Environment';

import {
  makeClosure,
  applyClosure,
} from './Closure';

const expInterp = (exp, env) => {
  switch (exp.type) {
    case 'ArrowFunctionExpression': {
      const { expression, params, body } = exp;
      if (expression) { // () => exp
        const names = params.map((obj) => obj.name);
        const val = makeClosure(names, body, env);
        return { val, env };
      }
      // () => { BlockStatement stuff }
      // @TODO
      break;
    }
    case 'CallExpression': {
      const { callee, arguments: args } = exp;
      const { val: closure } = expInterp(callee, env);
      const vals = args.map((obj) => expInterp(obj, env).val);
      const { val } = applyClosure(expInterp, closure, vals, env);
      return { val, env };
    }
    case 'NumericLiteral': {
      const { value: val } = exp;
      return { val, env };
    }
    case 'BooleanLiteral': {
      const { value: val } = exp;
      return { val, env };
    }
    case 'Identifier': {
      const { name } = exp;
      const val = lookupEnv(name, env);
      return { val, env };
    }
    case 'BinaryExpression': {
      const { left, operator, right } = exp;
      const { val: leftVal } = expInterp(left, env);
      const { val: rightVal } = expInterp(right, env);
      switch (operator) {
        case '+': {
          return { val: leftVal + rightVal, env };
        }
        case '-': {
          return { val: leftVal - rightVal, env };
        }
        case '*': {
          return { val: leftVal * rightVal, env };
        }
        case '/': {
          return { val: leftVal / rightVal, env };
        }
        default: {
          throw new Error(`unsupported binary operator ${operator}`);
        }
      }
    }
    default: {
      throw new Error(`unsupported expression type ${exp.type}`);
    }
  }
};

const blockStatementInterp = (exp, env) => {
  switch (exp.type) {
    case 'VariableDeclaration': {
      const { id, init } = exp.declarations[0];

      const { name } = id;
      const { val: bindingVal } = expInterp(init, env);

      const newEnv = extendEnv(name, bindingVal, env);

      return { val: undefined, env: newEnv };
    }
    case 'ExpressionStatement': {
      const { expression } = exp;
      const { val } = expInterp(expression, env);
      return { val, env };
    }
    default: {
      throw new Error(`unsupported type ${exp.type}`);
    }
  }
};

const programInterp = (exp, env = emptyEnv) => {
  switch (exp.type) {
    case 'Program': {
      const { val } = exp.body.reduce(
        ({ env: lastEnv }, newTarget) => blockStatementInterp(newTarget, lastEnv),
        { val: undefined, env },
      );
      return val;
    }
    default: {
      throw new Error('top level program not found');
    }
  }
};

export { programInterp };
