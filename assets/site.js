/* ===========================================================
   IXRI Lab — Shared site script
   - Mobile nav toggle
   - rAF-throttled scroll state
   - Anchor smooth-scroll with fixed-nav offset
   - IntersectionObserver-driven fade-in
   =========================================================== */
(function () {
  'use strict';

  var doc = document;
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mobile nav toggle --- */
  var navToggle = doc.querySelector('.nav-toggle');
  var navLinks = doc.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* --- Smooth anchor scroll with fixed-nav offset ---
     CSS scroll-margin-top handles the offset for native scroll.
     This handler ensures `behavior:smooth` plays nice and closes nav. */
  doc.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    a.addEventListener('click', function (e) {
      var target = doc.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      if (navLinks) navLinks.classList.remove('open');
      if (navToggle) {
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      // Update hash without re-triggering scroll
      if (history.replaceState) history.replaceState(null, '', href);
    });
  });

  /* --- rAF-throttled scroll state for nav --- */
  var nav = doc.querySelector('.nav');
  if (nav) {
    var ticking = false;
    var lastScrolled = false;
    var update = function () {
      var scrolled = window.scrollY > 8;
      if (scrolled !== lastScrolled) {
        nav.classList.toggle('scrolled', scrolled);
        lastScrolled = scrolled;
      }
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* --- Scrollspy ---
     A container with [data-spy="links"] holds anchor-style buttons/links;
     each link's data-spy-target is a CSS selector for the section it tracks.
     The link nearest to the top of the viewport (within scroll-padding-top)
     gets `.is-active`. The container also exposes the active key on itself
     via `data-active`.

     Usage:
       <div data-spy="links">
         <a data-spy-target="#proj-selfie">Selfie</a>
         <a data-spy-target="#xrmemory">XRMemory</a>
       </div>
   */
  (function setupScrollspy() {
    var containers = doc.querySelectorAll('[data-spy="links"]');
    if (!containers.length || !('IntersectionObserver' in window)) return;

    containers.forEach(function (container) {
      var links = Array.prototype.slice.call(
        container.querySelectorAll('[data-spy-target]')
      );
      var pairs = links
        .map(function (link) {
          var sel = link.getAttribute('data-spy-target');
          var section = sel ? doc.querySelector(sel) : null;
          return section ? { link: link, section: section, key: sel } : null;
        })
        .filter(Boolean);
      if (!pairs.length) return;

      var inView = new Set();

      function pickActive() {
        if (!inView.size) return;
        // Of all currently-intersecting sections, pick the one whose top is
        // closest to (just below) the top of the viewport.
        var topGuard = (window.innerWidth < 735 ? 56 : 48) + 8;
        var best = null;
        var bestScore = Infinity;
        pairs.forEach(function (p) {
          if (!inView.has(p.section)) return;
          var rect = p.section.getBoundingClientRect();
          // Distance from desired anchor line to section top, preferring
          // sections whose top is at-or-just-above the line.
          var d = Math.abs(rect.top - topGuard);
          if (d < bestScore) { bestScore = d; best = p; }
        });
        if (!best) return;
        pairs.forEach(function (p) {
          p.link.classList.toggle('is-active', p === best);
        });
        container.setAttribute('data-active', best.key);
      }

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) inView.add(e.target);
            else inView.delete(e.target);
          });
          pickActive();
        },
        {
          // A band near the top of the viewport — active when section is here.
          rootMargin: '-12% 0px -55% 0px',
          threshold: 0,
        }
      );
      pairs.forEach(function (p) { io.observe(p.section); });
    });
  })();

  /* --- Shared reveal rules ---
     Keep page-to-page motion consistent even when a page does not manually
     add .fade-in to every heading, card, or list item. */
  (function applyRevealClasses() {
    var selectors = [
      '.page-header h1',
      '.page-header p',
      '.section-heading',
      '.profile-panel',
      '.focus-card',
      '.collab-subtitle',
      '.collab-card',
      '.collab-list-item',
      '.resume-section > .profile-kicker',
      '.resume-section > h2',
      '.resume-item',
      '.news-card',
      '.section-title',
      '.pub-year-header',
      '.pub-item',
      '.value-card',
      '.project-showcase'
    ];

    selectors.forEach(function (selector) {
      doc.querySelectorAll(selector).forEach(function (el, index) {
        if (!el.classList.contains('fade-in') &&
            !el.classList.contains('fade-in-scale')) {
          el.classList.add('fade-in');
        }
        if (selector === '.focus-card' ||
            selector === '.collab-card' ||
            selector === '.collab-list-item' ||
            selector === '.resume-item' ||
            selector === '.news-card' ||
            selector === '.pub-item' ||
            selector === '.value-card') {
          var delay = index % 4;
          if (delay === 1) el.classList.add('fade-in-d1');
          if (delay === 2) el.classList.add('fade-in-d2');
          if (delay === 3) el.classList.add('fade-in-d3');
        }
      });
    });
  })();

  /* --- News carousel controls --- */
  (function setupNewsCarousels() {
    doc.querySelectorAll('.news-ticker').forEach(function (section) {
      var track = section.querySelector('.news-ticker-track');
      if (!track) return;

      var prev = section.querySelector('[data-news-scroll="prev"]');
      var next = section.querySelector('[data-news-scroll="next"]');
      var canSmooth = !prefersReducedMotion;

      function maxScroll() {
        return Math.max(0, track.scrollWidth - track.clientWidth);
      }

      function updateControls() {
        var max = maxScroll();
        var hasOverflow = max > 2;
        section.classList.toggle('has-news-overflow', hasOverflow);
        if (prev) prev.disabled = !hasOverflow || track.scrollLeft <= 2;
        if (next) next.disabled = !hasOverflow || track.scrollLeft >= max - 2;
      }

      function scrollByPage(direction) {
        var amount = Math.min(track.clientWidth * 0.86, 720);
        track.scrollBy({
          left: direction * amount,
          behavior: canSmooth ? 'smooth' : 'auto'
        });
      }

      if (prev) prev.addEventListener('click', function () { scrollByPage(-1); });
      if (next) next.addEventListener('click', function () { scrollByPage(1); });

      var isDown = false;
      var startX = 0;
      var startScroll = 0;
      var didDrag = false;

      track.classList.add('is-draggable');
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        isDown = true;
        didDrag = false;
        startX = e.clientX;
        startScroll = track.scrollLeft;
        track.classList.add('is-dragging');
        track.setPointerCapture(e.pointerId);
      });

      track.addEventListener('pointermove', function (e) {
        if (!isDown) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) didDrag = true;
        track.scrollLeft = startScroll - dx;
        e.preventDefault();
      });

      function endDrag(e) {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('is-dragging');
        if (track.hasPointerCapture && track.hasPointerCapture(e.pointerId)) {
          track.releasePointerCapture(e.pointerId);
        }
      }

      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.addEventListener('click', function (e) {
        if (!didDrag) return;
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }, true);

      track.addEventListener('scroll', updateControls, { passive: true });
      window.addEventListener('resize', updateControls, { passive: true });
      updateControls();
    });
  })();

  /* --- Fade-in observer ---
     Uses unobserve after first reveal to keep cost low.
     `prefers-reduced-motion` removes the offset transform. */
  var fadeEls = doc.querySelectorAll('.fade-in, .fade-in-scale');
  if (fadeEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      // Reveal immediately, no transform
      fadeEls.forEach(function (el) {
        el.classList.add('visible');
      });
    } else {
      var io = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
      );
      fadeEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }
})();
