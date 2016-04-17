(() => {
  const adder = (x) => (y) => x + y;
  const add3 = adder(3);
  return add3(39);
})();
