const Router = require("./router");
const { navigate } = require("./router");
const { initAuthApp } = require("./authApp");
const { validateToken } = require("./actions");
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
async function getHTML(htmlPath) {
  const res = await fetch(htmlPath);
  const html = await res.text();
  return html;
}
async function main() {
  const requireUser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/");
    }
    const valid = await validateToken(accessToken);
    if (!valid) {
      navigate("/auth");
    }
  };
  const router = new Router("#app");
  // ROUTES
  // PROTECTED ROUTES
  router
    .addRoute("/", await getHTML("./pages/index.html"), [requireUser])
    .addRoute("/auth", await getHTML("./pages/auth.html"), [], () => {
      initAuthApp();
    })
    .init();

  const header = await fetchHeader();
  prependHeaderToBody(header);
}
main();
window.addEventListener("popstate", () => {
  console.log("popping");
});
window.addEventListener("beforeunload", () => {
  console.log("before reload");
});
