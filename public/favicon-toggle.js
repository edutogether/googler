(() => {
  const activeIcon = "/favicon/gemini-star-active.png?v=20260803-1";
  const inactiveIcon = "/favicon/gemini-star-inactive.png?v=20260803-1";

  const updateFavicon = () => {
    const favicon = document.getElementById("googler-favicon");
    if (!favicon) return;

    const isActive =
      document.visibilityState === "visible" && document.hasFocus();
    favicon.href = isActive ? activeIcon : inactiveIcon;
  };

  document.addEventListener("visibilitychange", updateFavicon);
  window.addEventListener("focus", updateFavicon);
  window.addEventListener("blur", updateFavicon);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateFavicon, {
      once: true,
    });
  } else {
    updateFavicon();
  }
})();
