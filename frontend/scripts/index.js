const Router = require("./router");
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

async function main() {
  const res = await fetch("./pages/index.html");
  const html = await res.text();

  const rr = new Router("#app");
  rr.addRoute("/", html);
  rr.init();

  const header = await fetchHeader();
  prependHeaderToBody(header);
}
main();
window.addEventListener("popstate", () => {
  console.log("popping");
});
