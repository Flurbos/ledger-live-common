// @flow
import invariant from "invariant";

let networkFn = null;

export const setNetwork = (fn: *) => {
  networkFn = fn;
};

export default (...args: *) => {
  invariant(
    networkFn,
    "live-common: no network function defined. need to call setNetwork()"
  );
  return networkFn(...args);
};
