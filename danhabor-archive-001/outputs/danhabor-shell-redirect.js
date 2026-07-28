(() => {
  if (window.top !== window.self) return;
  if (/danhabor-shell\.html$/i.test(location.pathname)) return;
  if (new URLSearchParams(location.search).has("standalone")) return;

  const page = `${location.pathname.split("/").pop()}${location.search}${location.hash}`;
  const shell = new URL("./danhabor-shell.html", location.href);
  shell.searchParams.set("page", page);
  location.replace(shell.href);
})();
