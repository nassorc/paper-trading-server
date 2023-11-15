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
  const header = await fetchHeader();
  prependHeaderToBody(header);
}

main();
