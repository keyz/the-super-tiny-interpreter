import { statementInterp } from './Interp';
import { setLexical } from './Options';
import { parse } from './Parser';
import { emptyEnv } from './Environment';

const interp = (code) => statementInterp(parse(code), emptyEnv);

export {
  interp,
  setLexical,
};
