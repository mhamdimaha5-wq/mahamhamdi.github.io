/* =========================================================
   Maha Mhamdi — interactions & animations
   ========================================================= */

/* ---- Edit your contact details here ---- */
const CONTACT = {
  email: "",          // e.g. "hello@mahamhamdi.com"
  instagram: "",      // e.g. "https://instagram.com/yourhandle"
  instagramHandle: "",// e.g. "@yourhandle"
  youtube: ""         // e.g. "https://youtube.com/@yourchannel"
};

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Contact details ---------- */
  $$('[data-social="instagram"]').forEach(a => { if (CONTACT.instagram) a.href = CONTACT.instagram; });
  $$('[data-social="youtube"]').forEach(a => { if (CONTACT.youtube) a.href = CONTACT.youtube; });
  const emailLink = $('[data-contact="email"]');
  if (CONTACT.email) {
    emailLink.href = "mailto:" + CONTACT.email;
    $('[data-contact-text="email"]').textContent = CONTACT.email;
  } else {
    emailLink.href = "#contact";
  }
  if (CONTACT.instagramHandle) $('[data-contact-text="instagram"]').textContent = CONTACT.instagramHandle;
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- Split hero title into letters ---------- */
  let i = 0;
  $$(".hero-title .split").forEach(word => {
    const text = word.textContent;
    word.textContent = "";
    [...text].forEach(ch => {
      const span = document.createElement("span");
      span.className = "char";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--i", i++);
      span.textContent = ch === " " ? " " : ch;
      word.appendChild(span);
    });
  });

  /* ---------- Header, progress, active link ---------- */
  const header = $(".site-header");
  const progress = $(".scroll-progress span");
  const navLinks = $$(".nav a");
  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => sectionObserver.observe(s));

  /* ---------- Mobile menu ---------- */
  const toggle = $(".menu-toggle");
  const setMenu = open => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  navLinks.forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("in");
      revealObserver.unobserve(el);
      // drop the stagger delay afterwards so hover effects respond instantly
      setTimeout(() => el.style.setProperty("--d", "0s"), 1400);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".hero .reveal").forEach(el => el.classList.add("in"));
  $$(".reveal, .reveal-side, .side").forEach(el => { if (!el.classList.contains("in")) revealObserver.observe(el); });

  /* ---------- Statement words + blood drips ---------- */
  const statement = $(".statement");
  if (statement) {
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { statement.classList.add("in"); obs.disconnect(); }
    }, { threshold: 0.35 }).observe(statement);
  }

  /* ---------- Counters ---------- */
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countObserver.unobserve(el);
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const start = performance.now();
      const dur = 1800;
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + (t === 1 ? suffix : "");
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => countObserver.observe(el));

  /* ---------- Scroll-linked effects (parallax, progress, timeline) ---------- */
  const parallaxEls = $$("[data-parallax]");
  const timeline = $(".timeline");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    header.classList.toggle("scrolled", y > 40);

    if (!reduceMotion) {
      parallaxEls.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const offset = (rect.top + rect.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / r.height));
      timeline.style.setProperty("--tl", t.toFixed(3));
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // spotlight that follows the cursor inside cards
    $$(".spotlight").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });

    // 3D tilt on the portrait
    $$("[data-tilt]").forEach(wrap => {
      const card = wrap.querySelector(".portrait-card");
      wrap.addEventListener("pointermove", e => {
        const r = wrap.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
        card.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
        card.style.setProperty("--sx", `${px * 100}%`);
        card.style.setProperty("--sy", `${py * 100}%`);
      });
      wrap.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });

    // brush cursor
    const cursor = $(".cursor");
    let cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; cursor.classList.add("on"); });
    document.addEventListener("pointerleave", () => cursor.classList.remove("on"));
    const follow = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(follow);
    };
    follow();
    $$("a, button, .work-item, .exp-card").forEach(el => {
      el.addEventListener("pointerenter", () => cursor.classList.add("hover"));
      el.addEventListener("pointerleave", () => cursor.classList.remove("hover"));
    });

    // magnetic buttons
    $$(".magnetic").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });

    // hero image follows the mouse slightly
    const heroFrame = $(".hero-face");
    $(".hero").addEventListener("pointermove", e => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      heroFrame.style.transform = `translate3d(${x * -26}px, ${y * -18}px, 0) rotate(${x * -1.5}deg)`;
    });
  }

  /* ---------- Hero embers / ash particles ---------- */
  const canvas = $(".hero-embers");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles = [], running = true;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 16000));
      particles = Array.from({ length: count }, () => spawn(true));
    };
    const spawn = initial => {
      const ember = Math.random() < 0.35;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: ember ? Math.random() * 1.8 + 0.6 : Math.random() * 1.4 + 0.3,
        vy: -(Math.random() * 0.5 + 0.15),
        vx: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        hue: ember ? (Math.random() < 0.5 ? "255,90,80" : "242,190,130") : "170,190,255"
      };
    };
    const draw = t => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(t / 1400 + p.phase) * 0.25;
        const flicker = 0.6 + 0.4 * Math.sin(t / 300 + p.phase);
        const alpha = p.a * flicker * Math.min(1, p.y / (h * 0.25));
        if (p.y < -10) Object.assign(p, spawn(false));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${alpha.toFixed(3)})`;
        ctx.shadowColor = `rgba(${p.hue},1)`;
        ctx.shadowBlur = p.r * 6;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    // pause when hero is off-screen
    new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) requestAnimationFrame(draw);
    }).observe(canvas);
    requestAnimationFrame(draw);
  }

  /* ---------- Work filter ---------- */
  const filters = $$(".filter");
  const indicator = $(".filter-indicator");
  const items = $$(".work-item");
  const moveIndicator = btn => {
    indicator.style.width = btn.offsetWidth + "px";
    indicator.style.height = btn.offsetHeight + "px";
    indicator.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
  };
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => { b.classList.toggle("active", b === btn); b.setAttribute("aria-selected", b === btn); });
      moveIndicator(btn);
      const f = btn.dataset.filter;
      items.forEach(item => {
        const show = f === "all" || item.dataset.cat === f;
        item.classList.toggle("is-hidden", !show);
        item.classList.remove("pop");
        if (show) { void item.offsetWidth; item.classList.add("pop", "in"); }
      });
    });
  });
  const placeIndicator = () => moveIndicator($(".filter.active"));
  window.addEventListener("resize", placeIndicator);
  document.fonts?.ready.then(placeIndicator);
  placeIndicator();

  /* ---------- Lightbox ---------- */
  const lightbox = $(".lightbox");
  const lbImg = $("img", lightbox);
  let lastFocus;
  const closeLb = () => {
    lightbox.classList.remove("open");
    setTimeout(() => (lightbox.hidden = true), 350);
    lastFocus?.focus();
  };
  $$("[data-lightbox]").forEach(btn => {
    btn.addEventListener("click", () => {
      lastFocus = btn;
      lbImg.src = btn.dataset.lightbox;
      lbImg.alt = btn.querySelector("img")?.alt || "";
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add("open"));
      $(".lightbox-close").focus();
    });
  });
  lightbox.addEventListener("click", e => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !lightbox.hidden) closeLb(); });

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  const form = $(".contact-form");
  const status = $(".form-status");
  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    $$("input, select, textarea", form).forEach(f => {
      const bad = !f.checkValidity();
      f.closest(".field").classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { status.textContent = "Please fill in all required fields."; return; }
    const d = new FormData(form);
    if (!CONTACT.email) {
      status.textContent = "Thank you! (The contact email hasn't been set up yet.)";
      return;
    }
    const subject = `${d.get("type")} inquiry from ${d.get("name")}`;
    const body = `${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Opening your email app…";
    form.reset();
  });
})();
