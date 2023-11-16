const { initAuthApp } = require("./authApp");
const app = document.querySelector("#app");

async function fetchHeader() {
  const res = await fetch("./components/header.html");
  const header = await res.text();
  return header;
}
function prependHeaderToBody(header) {
  const div = document.createElement("div");
  div.innerHTML = header;
  document.body.prepend(div.firstChild);
}

const routes = {
  "/": "./pages/index.html",
  "/auth": "./pages/auth.html",
};

const dispatchRouteEvent = () => {
  const event = new Event("route");
  document.dispatchEvent(event);
};

const updateLocation = async () => {
  const path = document.location.pathname;
  const rpath = routes[path];
  const res = await fetch(rpath);
  const html = await res.text();

  const div = document.createElement("div");
  div.innerHTML = html;
  app.innerHTML = "";
  app.appendChild(div.firstChild);
  dispatchRouteEvent();

  if (path === "/auth") {
    initAuthApp();
  }
};

const addRouteListeners = () => {
  const routeElms = document.querySelectorAll(".route");
  routeElms.forEach((elm) => {
    elm.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.pushState({}, "", e.target.href);
      updateLocation();
    });
  });
};

const fetchPage = async (path) => {
  const res = await fetch(path);
  const html = await res.text();

  return html;
};
const appendPage = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div.firstChild);
};

async function main() {
  const res = await fetch("./pages/index.html");
  const html = await res.text();

  const div = document.createElement("div");
  div.innerHTML = html;
  app.innerHTML = "";
  app.appendChild(div.firstChild);
  const header = await fetchHeader();
  prependHeaderToBody(header);
  // addRouteListeners();
  const e = new Event("route");
  document.dispatchEvent(e);
}
main();
window.addEventListener("popstate", () => {
  console.log("popping");
});
document.addEventListener("route", addRouteListeners);

// document.addEventListener("route", () => {
//   console.log("ROUTE EVENT INVOKED");
//   const path = document.location.pathname;
//   if (path === "/auth") {
//     initAuthApp();
//   }
// });

// n the page loads
// get current path
// find in the path to relative path map
// use the relative path to display the correct html
