/*
 * Writing a parser is way beyond the scope of this interpreter.
 * Let's just borrow it from babel.
 */
import { parse as babylonParse } from 'babylon';
import { isObject, mapFilterObject } from './utils';

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
  'async',
];

/*
 * We don't care about line numbers nor source locations for now -- let's clean them up.
 * The correct way to implement this AST traversal is to use the visitor pattern.
 * See https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/plugin-handbook.md#traversal
 */
const cleanupAst = (target) => {
  if (isObject(target)) {
    return mapFilterObject(target, (val, key) => {
      if (astStripList.includes(key)) {
        return false;
      }

      const newVal = cleanupAst(val);
      return [ key, newVal ];
    });
  } else if (Array.isArray(target)) {
    return target.map(cleanupAst);
  }

  return target;
};

const parse = (code, options = defaultOptions) => {
  const originalAst = babylonParse(code, options);
  return cleanupAst(originalAst).program; // we don't care about `File` type, too
};

export { parse };
