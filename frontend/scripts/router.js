class Router {
  #app;
  #currentPath;
  #routes = {};
  #handlers = {};
  constructor(appSelector) {
    if (typeof appSelector !== "string")
      throw new Error("Must pass a string selector to an html element.");
    const temp = document.querySelector(appSelector);
    if (!temp) throw new Error("appSelector must select an existing element.");
    this.#app = temp;
  }
  init() {
    // add listeners
    this.#addListenders();
  }
  addRoute(path, template) {
    if (typeof path !== "string") throw new Error("path must be a string");
    if (typeof path !== "string") throw new Error("template must be a string");
    this.#routes[path] = template;
  }
  addHandler(path, fn) {
    if (!(path instanceof String)) throw new Error("path must be a string");
    if (!(fn instanceof Function)) throw new Error("path must be a string");
    this.#handlers[path] = fn;
  }
  #addListenders() {
    // const routes = document.querySelectorAll("[data-route]");
    // routes.forEach(route => () => {})
    document.body.addEventListener("click", (e) => {
      const elm = e.target;
      if ("route" in elm.dataset) {
        const isAtag = elm.tagName === "A";
        const path = isAtag ? elm.href : elm.dataset["route"];
        window.history.pushState({}, "", path);
        this.#currentPath = path;
        this.#updateLocation();
      }
    });
  }
  #updateLocation() {
    const page = this.#routes[this.#currentPath];
    this.#mountTemplate(page);
  }
  #mountTemplate(template) {
    const div = document.createElement("div");
    div.innerHTML = template;
    app.innerHTML = "";
    app.appendChild(div.firstChild);
  }
}

module.exports = Router;
