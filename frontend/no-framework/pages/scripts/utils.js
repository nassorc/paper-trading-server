const { validateToken } = require("./actions");

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
const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};
const isAuthenticated = async () => {
  const token = getAccessToken();
  if (!token) return false;
  const isValid = await validateToken(token);
  if (isValid) return true;
  else return false;
};
module.exports = {
  validateCredentials,
  gatherInputs,
  setLocalStorage,
  getAccessToken,
  isAuthenticated,
};
