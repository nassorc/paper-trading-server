const Router = require("./router");
const { navigate } = require("./router");
const { initAuthApp } = require("../authentication/authenticationApp");
const { validateToken } = require("./actions");
require("../userDashboard/userDashboardApp");
const app = document.querySelector("#app");

const fetchHeader = async () => {
  const res = await fetch("./components/header.html");
  const header = await res.text();
  return header;
};
const mountHeader = (header) => {
  const div = document.createElement("div");
  div.innerHTML = header;
  document.body.prepend(div.firstChild);
  return document.body.firstChild;
};
async function getHTML(htmlPath) {
  const res = await fetch(htmlPath);
  const html = await res.text();
  return html;
}

const initRouter = async () => {
  const requireUser = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/auth");
    }
    const valid = await validateToken(accessToken);
    if (!valid) {
      navigate("/auth");
    }
  };
  const router = new Router("#app");
  router
    .addRoute(
      "/",
      await getHTML("./pages/userDashboard/userDashboardPage.html"),
      [requireUser]
    )
    .addRoute(
      "/auth",
      await getHTML("./pages/authentication/authenticationPage.html"),
      [],
      () => {
        initAuthApp();
      }
    )
    .init();
};

async function main() {
  initRouter();
  const headerContent = await fetchHeader();
  const headerELM = mountHeader(headerContent);
  headerELM.addEventListener("click", (e) => {
    const BURGER_ITEM = "burger-item";
    const elm = e.target;
    const checkbox = document.querySelector("[data-target='burger-checkbox']");
    if ("target" in elm.dataset && elm.dataset.target === BURGER_ITEM) {
      checkbox.checked = false;
    }
  });

  let timer;
  document
    .querySelector("#searchbar__input")
    .addEventListener("input", async (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log(e.target.value);
      }, 1000);
    });
}
main();
