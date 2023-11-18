const SIGNUP_URL = "http://localhost:3001/signup";
const SIGNIN_URL = "http://localhost:3001/signin";
const VALIDATE_TOKEN_URL = "http://localhost:3001/token/validate";
const { navigate } = require("./router");
const { validateCredentials, setLocalStorage } = require("./utils");

const AUTH_RESPONSES = {
  201: "User created",
  400: "Please enter a valid username and password",
  401: "Incorrect username or password",
  409: "Username taken",
  500: "Something went wrong. Please try again layer",
};

const getResponseMessage = (status) => {
  switch (status) {
    case 201:
      return AUTH_RESPONSES[201];
    case 400:
      return AUTH_RESPONSES[400];
    case 401:
      return AUTH_RESPONSES[401];
    case 409:
      return AUTH_RESPONSES[409];
    case 500:
      return AUTH_RESPONSES[500];
  }
};

const handleSignIn = async (credentials) => {
  if (!validateCredentials(credentials)) {
    throw new Error("missing username or password");
  }
  const res = await fetch(SIGNIN_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(credentials),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.ok) {
    const data = await res.json();
    setLocalStorage("accessToken", data.accessToken);
  }
  navigate("/");
  return getResponseMessage(res.status);
};

const handleSignUp = async (credentials) => {
  if (!validateCredentials(credentials)) {
    throw new Error("missing username or password");
  }
  const res = await fetch(SIGNUP_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(credentials),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return getResponseMessage(res.status);
};

const validateToken = async (token) => {
  const res = await fetch(VALIDATE_TOKEN_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify({ token }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data.valid;
};

module.exports = {
  handleSignIn,
  handleSignUp,
  validateToken,
};
