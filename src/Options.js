/*
 * This guy allows us to toggle the lexical/dynamic behavior at runtime.
 */

const Options = {
  isLexical: true,
};

const setLexical = (x) => {
  Options.isLexical = !!x;
};

export { setLexical };
export default Options;
