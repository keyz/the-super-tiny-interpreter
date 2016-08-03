import { NATIVE_FUNC_FLAG } from './typeFlags';

const wrapNativeFunc = (params, func) => ({
  type: NATIVE_FUNC_FLAG,
  params,
  func,
});

const logFunc = wrapNativeFunc(
  ['x'],
  (x) => { console.log(x); }, // eslint-disable-line no-console
);

const Prims = {
  log: logFunc,
};

export default Prims;
