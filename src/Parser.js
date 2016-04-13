/*
 * Writing a parser is way beyond the scope of this interpreter.
 * Let's just borrow it from babel.
 */
import { parse as bParse } from 'babylon';
import { isObject } from './utils';

const defaultOptions = {
  sourceType: 'script',
};

const astStripList = [
  'start',
  'end',
  'loc',
  'comments',
  'tokens',
  'extra',
  'directives',
  'generator',
];

/*
 * We don't care about line numbers and source locations for now -- let's clean them up.
 * The correct way to implement this AST traversal is to use the visitor pattern.
 * See https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/plugin-handbook.md#traversal
 */
const cleanupAst = (target) => {
  if (isObject(target)) {
    const fields = Object.keys(target);

    return fields.reduce(
      (res, fieldName) => {
        if (astStripList.indexOf(fieldName) === -1) {
          res[fieldName] = cleanupAst(target[fieldName]); // eslint-disable-line no-param-reassign
        }

        return res;
      },
      {},
    );
  } else if (Array.isArray(target)) {
    return target.map(cleanupAst);
  }

  return target;
};

const parse = (code, options = defaultOptions) => {
  const originalAst = bParse(code, options);
  return cleanupAst(originalAst).program; // we don't care about `File` type, too
};

export { parse };
