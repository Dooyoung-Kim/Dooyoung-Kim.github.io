(function () {
  var targetDate = new Date("2026-06-20T14:00:00+09:00").getTime();
  var dayEl = document.getElementById("dayValue");
  var hourEl = document.getElementById("hourValue");
  var minuteEl = document.getElementById("minuteValue");

  function pad(num) {
    return String(num);
  }

  function updateCountdown() {
    if (!dayEl || !hourEl || !minuteEl) return;
    var now = Date.now();
    var diff = Math.max(targetDate - now, 0);

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var minutes = Math.floor((diff / (1000 * 60)) % 60);

    dayEl.textContent = pad(days);
    hourEl.textContent = pad(hours);
    minuteEl.textContent = pad(minutes);
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  var revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

  revealItems.forEach(function (el) {
    observer.observe(el);
  });
})();
