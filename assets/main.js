(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // Scroll reveal
  var targets = document.querySelectorAll(".rv");
  function reveal(el) {
    el.classList.add("in");
    setTimeout(function () { el.classList.add("done"); }, 1300);
  }
  if (reduce || !hasIO) {
    targets.forEach(function (el) { el.classList.add("in", "done"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Header state + scroll progress
  var header = document.querySelector(".site-header");
  var bar = document.getElementById("scrollbar");
  function onScroll() {
    var d = document.documentElement;
    var max = d.scrollHeight - d.clientHeight;
    bar.style.width = (max > 0 ? (d.scrollTop / max) * 100 : 0) + "%";
    header.classList.toggle("scrolled", d.scrollTop > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Active nav link
  var links = document.querySelectorAll(".nav a[href^='#']");
  if (hasIO) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) {
      var s = document.getElementById(a.getAttribute("href").slice(1));
      if (s) navIo.observe(s);
    });
  }

  // Mobile menu
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileNav");
  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  // Product mock spotlight + hero mark parallax
  var mock = document.querySelector(".mock");
  if (mock) {
    mock.addEventListener("mousemove", function (e) {
      var r = mock.getBoundingClientRect();
      mock.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      mock.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  }
  var mark = document.querySelector(".hero-mark");
  var hero = document.querySelector(".hero");
  if (mark && hero && !reduce) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      mark.style.transform = "translate(" + x * -28 + "px," + y * -20 + "px)";
    });
  }

  // Contact form (Formspree)
  var form = document.getElementById("contactForm");
  var status = document.getElementById("contactStatus");
  var btn = document.getElementById("contactSubmit");
  if (form && window.fetch) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      btn.disabled = true;
      btn.style.opacity = "0.6";
      status.textContent = "Sending…";
      status.style.color = "";
      fetch(form.getAttribute("action"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status");
        status.textContent = "Thanks — we received your message and will be in touch shortly.";
        status.style.color = "#4CD9A0";
        form.reset();
      }).catch(function () {
        status.textContent = "Something went wrong sending that — please try again, or email us directly at talk@tavien.ai.";
        status.style.color = "#FF7A7A";
      }).finally(function () {
        btn.disabled = false;
        btn.style.opacity = "1";
      });
    });
  }
})();
