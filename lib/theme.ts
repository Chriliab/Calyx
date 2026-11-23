export const THEME_STORAGE_KEY = "calyx-theme";
export type Theme = "light" | "dark";

/**
 * Runs in <head> before the first paint, so the page never flashes the wrong theme.
 * A saved choice wins; otherwise the operating system decides, and keeps deciding live.
 * Plain ES5 on purpose: Next.js injects it as-is, without compiling it.
 */
export const themeScript = `(function () {
  var key = "${THEME_STORAGE_KEY}";
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function saved() {
    try {
      var value = localStorage.getItem(key);
      return value === "dark" || value === "light" ? value : null;
    } catch (e) {
      return null;
    }
  }

  function apply() {
    document.documentElement.dataset.theme =
      saved() || (media.matches ? "dark" : "light");
  }

  apply();
  media.addEventListener("change", function () {
    if (!saved()) apply();
  });
})();`;