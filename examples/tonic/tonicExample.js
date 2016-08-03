const { interp, setLexical } = require('the-super-tiny-interpreter');

const code = `
  const adder = (x) => (y) => x + y;
  const x = 100;
  const add3 = adder(3);
  log(add3(5));
`;

setLexical(true);

interp(code); // should log `8`

setLexical(false);

interp(code); // should log 105
