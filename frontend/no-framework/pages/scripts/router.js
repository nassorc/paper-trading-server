class Router {
  #ROUTE_SELECTOR = "route";
  #app;
  #currentPath = "/";
  #routes = {};
  #handlers = {};
  #prehandlers = {};
  constructor(appSelector, initialPath = document.location.pathname) {
    if (typeof appSelector !== "string")
      throw new Error("Must pass a string selector to an html element.");
    if (typeof initialPath !== "string")
      throw new Error("initialPath must be a string");
    if (!appSelector || !initialPath) throw new Error("Missing arguments");

    // query the html element where we mount the templates
    const temp = document.querySelector(appSelector);
    if (!temp) throw new Error("appSelector must select an existing element.");
    this.#app = temp;

    // set initial url pathname
    this.#currentPath = initialPath;
  }

  init() {
    // add listeners
    this.#addListenders();
    this.#setURLPathname({}, "", this.#currentPath);
    this.#updateLocation();
  }
  addRoute(path, template, prehandlers = [], handler = () => {}) {
    if (typeof path !== "string") throw new Error("path must be a string");
    if (typeof path !== "string") throw new Error("template must be a string");
    this.#routes[path] = template;
    this.#handlers[path] = handler;
    this.#prehandlers[path] = prehandlers;
    return this;
  }
  route(route) {
    this.#routes[route.path] = route.template;
    this.#handlers[route.path] = route.handler;
    this.#prehandlers[route.path] = route.prehandlers;
    return this;
  }
  #addListenders() {
    document.body.addEventListener("click", (e) => {
      const elm = e.target;
      if (this.#ROUTE_SELECTOR in elm.dataset) {
        e.preventDefault();
        const isAtag = elm.tagName === "A";
        const href = isAtag
          ? elm.href
          : document.location.origin + elm.dataset[this.#ROUTE_SELECTOR];
        const path = new URL(href).pathname;
        this.#setURLPathname({}, "", path);
        this.#updateLocation();
      }
    });
    // when user refresh page, ensure we remain on the same page
    window.addEventListener("unload", (e) => {
      const path = document.location.pathname;
      this.#setURLPathname({}, "", path);
      this.#updateLocation();
    });
    window.addEventListener("popstate", (e) => {
      console.log("POPPING");
    });
  }
  #setURLPathname(data, unused, path) {
    this.#prehandlers[path].forEach((handler) => {
      handler();
    });
    window.history.pushState(data, unused, path);
    this.#currentPath = path;
  }
  #updateLocation() {
    const page = this.#routes[this.#currentPath];
    this.#mountTemplate(page);
  }
  #mountTemplate(template) {
    const div = document.createElement("div");
    div.innerHTML = template;
    this.#app.innerHTML = "";
    this.#app.appendChild(div.firstChild);
    this.#handlers[this.#currentPath]();
  }
}

function navigate(path) {
  window.history.pushState({}, "", path);
  location.reload();
}

module.exports = Router;
module.exports.navigate = navigate;
// export default Router;
