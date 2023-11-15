const validateCredentials = (credentials) => {
  if ("username" in credentials && "password" in credentials) return true;
  else return false;
};
const gatherInputs = (...args) => {
  return () => {
    const idToValueArr = args.map((arg) => {
      return [arg.slice(1), document.querySelector(arg).value];
    });
    return Object.fromEntries(idToValueArr);
  };
};
const setLocalStorage = (key, value) => {
  window.localStorage.setItem(key, value);
};
module.exports = {
  validateCredentials,
  gatherInputs,
  setLocalStorage,
};
