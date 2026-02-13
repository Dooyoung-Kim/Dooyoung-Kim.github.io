(function () {
  var launchBtn = document.getElementById("launchArBtn");
  var viewer = document.getElementById("entranceModel");

  if (!launchBtn || !viewer) return;

  launchBtn.addEventListener("click", function () {
    if (typeof viewer.activateAR === "function") {
      viewer.activateAR();
    }
  });
})();
