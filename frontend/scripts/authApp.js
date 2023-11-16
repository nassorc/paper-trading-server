const { handleSignIn, handleSignUp } = require("./actions");
const { gatherInputs } = require("./utils");

const AUTH_EVENTS = {
  signin: "signin",
  signup: "signup",
};

const initAuthApp = () => {
  // CREATE CUSTOM AUTH EVENTS
  const inputIDS = { username: "#username", password: "#password" };
  const authBtns = { signin: "#signin-btn", signup: "#signup-btn" };

  const disableElms = (...elms) => {
    elms.forEach((elm) => {
      const t = document.querySelector(elm);
      if (t && "disabled" in t) {
        t.disabled = true;
      }
    });
  };
  const enableElms = (...elms) => {
    elms.forEach((elm) => {
      const t = document.querySelector(elm);
      if ("disabled" in t) {
        t.disabled = false;
      }
    });
  };
  const authInputController = (event, fn) => {
    const getAuthInputs = gatherInputs(...Object.values(inputIDS));
    return async (ev) => {
      // disable inputs
      try {
        disableElms(...Object.values(authBtns));
        const inputs = getAuthInputs();
        const message = await fn(inputs);
        enableElms(...Object.values(authBtns));
        const signupEvent = new CustomEvent(event, { detail: { message } });
        document.dispatchEvent(signupEvent);
      } catch (err) {
        enableElms(...Object.values(authBtns));
      }
    };
  };
  document.addEventListener(AUTH_EVENTS.signup, (e) => {
    const notification = document.querySelector("#auth-form__notification");
    notification.textContent = e.detail.message;
  });
  document.addEventListener(AUTH_EVENTS.signin, (e) => {
    const notification = document.querySelector("#auth-form__notification");
    notification.textContent = e.detail.message;
  });
  document
    .querySelector(authBtns.signin)
    .addEventListener(
      "click",
      authInputController(AUTH_EVENTS.signin, handleSignIn)
    );
  document
    .querySelector(authBtns.signup)
    .addEventListener(
      "click",
      authInputController(AUTH_EVENTS.signup, handleSignUp)
    );
};

module.exports = {
  initAuthApp,
};
