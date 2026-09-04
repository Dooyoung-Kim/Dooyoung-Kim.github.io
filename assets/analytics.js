(function () {
  "use strict";

  var MEASUREMENT_ID = "G-0E740LGTES";
  var CONSENT_KEY = "dooyoung-analytics-consent-v1";
  var localHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
  var googleTagLoaded = false;
  var consentState = readConsent();
  var initialAppViewSent = false;
  var engagementStartedAt = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  });

  window.SiteAnalytics = {
    track: track,
    consent: function () { return consentState; },
    openSettings: function () { showConsent(true); }
  };

  if (consentState === "granted") {
    enableAnalytics();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }

  function readConsent() {
    try {
      var value = window.localStorage.getItem(CONSENT_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // The choice applies to this page even when storage is unavailable.
    }
  }

  function sanitizedPageLocation() {
    return window.location.origin + window.location.pathname;
  }

  function sanitizedReferrer() {
    if (!document.referrer) return "";
    try {
      var referrer = new URL(document.referrer);
      return referrer.origin + referrer.pathname;
    } catch (error) {
      return "";
    }
  }

  function enableAnalytics() {
    consentState = "granted";
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted"
    });

    if (!googleTagLoaded && !localHost) {
      googleTagLoaded = true;
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
      document.head.appendChild(script);

      window.gtag("js", new Date());
      window.gtag("config", MEASUREMENT_ID, {
        page_location: sanitizedPageLocation(),
        page_referrer: sanitizedReferrer(),
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        transport_type: "beacon"
      });
    }

    if (document.body) {
      hideConsent();
      showSettingsButton();
      startEngagement();
      trackInitialAppView();
    }
  }

  function disableAnalytics() {
    consentState = "denied";
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied"
    });
    engagementStartedAt = null;
    removeAnalyticsCookies();
    hideConsent();
    showSettingsButton();
  }

  function removeAnalyticsCookies() {
    document.cookie.split(";").forEach(function (cookie) {
      var name = cookie.split("=")[0].trim();
      if (name !== "_ga" && name.indexOf("_ga_") !== 0) return;
      var expires = "Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = name + "=; expires=" + expires + "; path=/";
      if (window.location.hostname) {
        document.cookie = name + "=; expires=" + expires + "; path=/; domain=" + window.location.hostname;
        document.cookie = name + "=; expires=" + expires + "; path=/; domain=." + window.location.hostname;
      }
    });
  }

  function initializePage() {
    buildConsentUi();
    setupInteractionTracking();

    if (!consentState) {
      showConsent(false);
    } else {
      showSettingsButton();
      if (consentState === "granted") {
        startEngagement();
        trackInitialAppView();
      }
    }
  }

  function buildConsentUi() {
    if (document.getElementById("analyticsConsent")) return;

    var panel = document.createElement("section");
    panel.id = "analyticsConsent";
    panel.className = "analytics-consent";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-labelledby", "analyticsConsentTitle");
    panel.setAttribute("aria-describedby", "analyticsConsentDescription");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="analytics-consent-copy">' +
        '<strong id="analyticsConsentTitle">Help improve this site?</strong>' +
        '<p id="analyticsConsentDescription">With your permission, anonymous analytics measure page views and interactions. Names, email addresses, goals, quest text, and other form entries are never collected.</p>' +
        '<a href="/privacy.html">Privacy details</a>' +
      '</div>' +
      '<div class="analytics-consent-actions">' +
        '<button type="button" data-analytics-consent="denied">Decline</button>' +
        '<button class="analytics-consent-primary" type="button" data-analytics-consent="granted">Allow analytics</button>' +
      '</div>';

    var settings = document.createElement("button");
    settings.id = "analyticsSettings";
    settings.className = "analytics-settings";
    settings.type = "button";
    settings.textContent = "Analytics settings";
    settings.hidden = true;

    document.body.appendChild(panel);
    document.body.appendChild(settings);

    panel.addEventListener("click", function (event) {
      var button = event.target.closest("[data-analytics-consent]");
      if (!button) return;
      var value = button.getAttribute("data-analytics-consent");
      saveConsent(value);
      if (value === "granted") enableAnalytics();
      else disableAnalytics();
    });

    settings.addEventListener("click", function () {
      showConsent(true);
    });
  }

  function showConsent(moveFocus) {
    var panel = document.getElementById("analyticsConsent");
    var settings = document.getElementById("analyticsSettings");
    if (!panel) return;
    panel.hidden = false;
    if (settings) settings.hidden = true;
    if (moveFocus) {
      var primary = panel.querySelector(".analytics-consent-primary");
      if (primary) primary.focus();
    }
  }

  function hideConsent() {
    var panel = document.getElementById("analyticsConsent");
    if (panel) panel.hidden = true;
  }

  function showSettingsButton() {
    var settings = document.getElementById("analyticsSettings");
    if (settings) settings.hidden = false;
  }

  function pageArea() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("/wedding/") !== -1) return "wedding";
    if (path.indexOf("/lab/") !== -1) return "research";
    if (path.endsWith("/growth.html")) return "launchpad";
    if (path.endsWith("/life-quest.html")) return "app";
    return "portfolio";
  }

  function currentApp() {
    var bodyApp = document.body && document.body.getAttribute("data-analytics-app");
    return bodyApp || "";
  }

  function cleanValue(value) {
    if (typeof value === "number") return isFinite(value) ? value : 0;
    if (typeof value === "boolean") return value;
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 64);
  }

  function track(eventName, parameters) {
    if (consentState !== "granted" || localHost) return;

    var safeName = cleanValue(eventName).slice(0, 40);
    if (!safeName) return;

    var payload = {
      site_area: pageArea(),
      transport_type: "beacon"
    };
    var appName = currentApp();
    if (appName) payload.app_name = cleanValue(appName);

    Object.keys(parameters || {}).slice(0, 20).forEach(function (key) {
      var safeKey = cleanValue(key).slice(0, 40);
      if (!safeKey) return;
      payload[safeKey] = cleanValue(parameters[key]);
    });

    window.gtag("event", safeName, payload);
  }

  function trackInitialAppView() {
    var appName = currentApp();
    if (!appName || initialAppViewSent || consentState !== "granted") return;
    initialAppViewSent = true;
    track("app_view", { app_name: appName });
  }

  function setupInteractionTracking() {
    document.addEventListener("click", function (event) {
      var target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      var appLink = target.closest("[data-analytics-app-link]");
      if (appLink) {
        track("app_launch", {
          app_name: appLink.getAttribute("data-analytics-app-link"),
          source: "launchpad"
        });
        return;
      }

      var link = target.closest("a[href]");
      if (link) {
        var href = link.getAttribute("href") || "";
        if (/^(mailto:|tel:)/i.test(href)) {
          track("contact_click", { method: href.split(":")[0] });
          return;
        }
        try {
          var url = new URL(link.href, window.location.href);
          if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
            track("internal_link_click", { link_path: url.pathname });
          }
        } catch (error) {
          // Ignore malformed or unsupported links.
        }
      }

      if (!currentApp()) return;

      var button = target.closest("button");
      if (!button) return;

      if (button.classList.contains("check-cell")) {
        var cadence = button.classList.contains("weekly-bar") ? "weekly" :
          button.classList.contains("monthly-bar") ? "monthly" : "daily";
        track("quest_check_toggle", {
          cadence: cadence,
          next_state: button.getAttribute("aria-pressed") === "true" ? "incomplete" : "complete"
        });
        return;
      }

      var action = appControlName(button);
      if (action) track("app_button_click", { control_id: action });
    });

    document.addEventListener("submit", function (event) {
      if (!currentApp()) return;
      var form = event.target;
      if (!form || !form.id) return;

      if (form.id === "questForm") {
        var cadenceInput = document.getElementById("questCadence");
        var cadence = cadenceInput && /^(daily|weekly|monthly)$/.test(cadenceInput.value)
          ? cadenceInput.value : "unknown";
        track("quest_created", { cadence: cadence });
      } else if (form.id === "goalPlannerForm") {
        track("goal_plan_applied", {});
      } else if (form.id === "weeklyReviewForm") {
        var blocker = document.getElementById("weeklyReviewBlocker");
        var adaptation = document.getElementById("weeklyReviewAdaptation");
        track("weekly_review_saved", {
          blocker: blocker ? blocker.value : "unknown",
          adaptation: adaptation ? adaptation.value : "unknown"
        });
      } else if (form.id === "playerNameForm") {
        track("profile_name_saved", {});
      }
    });

    document.addEventListener("visibilitychange", function () {
      if (!currentApp()) return;
      if (document.visibilityState === "hidden") flushEngagement("hidden");
      else startEngagement();
    });

    window.addEventListener("pagehide", function () {
      flushEngagement("pagehide");
    });
  }

  function appControlName(button) {
    var idMap = {
      playerNameButton: "edit_character_name",
      playerNameCancel: "cancel_character_name",
      googleSignIn: "google_sign_in",
      googleSignOut: "google_sign_out",
      evolutionOpen: "open_evolution",
      evolutionClose: "close_evolution",
      resetDemo: "reset_local_data",
      goalPlanOpen: "open_goal_planner",
      questAxisButton: "open_axis_menu",
      axisToggle: "toggle_axis_form",
      axisAddButton: "add_axis",
      questCadenceButton: "open_cadence_menu",
      goalPlannerClose: "close_goal_planner",
      goalPlannerBack: "goal_planner_back",
      goalPlannerNext: "goal_planner_next",
      goalPlannerApply: "goal_planner_apply",
      weeklyReviewClose: "close_weekly_review",
      statisticsPeriodButton: "open_statistics_period"
    };

    if (button.id && idMap[button.id]) return idMap[button.id];
    if (button.hasAttribute("data-goal-plan-open")) return "open_goal_plan";
    if (button.hasAttribute("data-weekly-review-open")) return "open_weekly_review";
    if (button.hasAttribute("data-view")) return "view_" + cleanValue(button.getAttribute("data-view"));
    if (button.hasAttribute("data-cadence-option")) return "cadence_" + cleanValue(button.getAttribute("data-cadence-option"));
    if (button.hasAttribute("data-plan-adjust")) return "plan_adjust_" + cleanValue(button.getAttribute("data-plan-adjust"));
    if (button.hasAttribute("data-statistics-period")) return "statistics_" + cleanValue(button.getAttribute("data-statistics-period"));
    if (button.hasAttribute("data-evolution-path")) return "evolution_path_" + cleanValue(button.getAttribute("data-evolution-path"));
    if (button.hasAttribute("data-evolution-level")) return "evolution_level";
    return "";
  }

  function startEngagement() {
    if (!currentApp() || consentState !== "granted" || document.visibilityState === "hidden") return;
    if (engagementStartedAt === null) engagementStartedAt = Date.now();
  }

  function flushEngagement(reason) {
    if (engagementStartedAt === null) return;
    var seconds = Math.min(3600, Math.max(0, Math.round((Date.now() - engagementStartedAt) / 1000)));
    engagementStartedAt = null;
    if (seconds < 1) return;
    track("app_engagement", {
      active_seconds: seconds,
      exit_reason: reason
    });
  }
})();