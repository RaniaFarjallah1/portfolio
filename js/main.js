(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* language: EN by default, FR on request; every translatable element carries its French in data-fr */
  let lang = "en";
  const ROLES = { en: ["data_scientist", "ml_developer", "ai_ml_researcher"], fr: ["scientifique_de_données", "développeuse_ml", "chercheuse_ia_ml"] };
  const UI = { en: { copy: "Copy", copied: "Copied", stamp: "OPEN TO WORK · MONTRÉAL · ", menu: "Open menu" }, fr: { copy: "Copier", copied: "Copié", stamp: "DISPONIBLE · MONTRÉAL · ", menu: "Ouvrir le menu" } };
  let roles = ROLES.en;
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll("[data-fr]").forEach(el => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = l === "fr" ? el.dataset.fr : el.dataset.en;
    });
    document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("on", b.dataset.lang === l));
    document.getElementById("stampText").textContent = UI[l].stamp;
    document.getElementById("burger").setAttribute("aria-label", UI[l].menu);
    roles = ROLES[l];
    try { localStorage.setItem("lang", l); } catch (e) {}
  }
  document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
  try { if (localStorage.getItem("lang") === "fr") setLang("fr"); } catch (e) {}

  /* mobile menu */
  const burger = document.getElementById("burger"), linksEl = document.getElementById("links");
  burger.addEventListener("click", () => { const open = !linksEl.classList.contains("open"); linksEl.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); });
  linksEl.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { linksEl.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));

  /* typed roles */
  const typed = document.getElementById("typed");
  if (reduce) typed.textContent = roles[0];
  else {
    let r = 0, i = roles[0].length, del = true;
    setTimeout(function tick() {
      i += del ? -1 : 1;
      if (r >= roles.length) r = 0;
      i = Math.min(i, roles[r].length);
      typed.textContent = roles[r].slice(0, i);
      let wait = del ? 40 : 85;
      if (del && i === 0) { del = false; r = (r + 1) % roles.length; wait = 300; }
      else if (!del && i === roles[r].length) { del = true; wait = 1800; }
      setTimeout(tick, wait);
    }, 1800);
  }

  /* particle portrait: img/hero.png sampled into coloured dots that scatter under the mouse */
  (function () {
    const cv = document.getElementById("portrait"), img = new Image();
    let P = null; const m = { x: -999, y: -999 };
    cv.addEventListener("mousemove", e => { const b = cv.getBoundingClientRect(); m.x = e.clientX - b.left; m.y = e.clientY - b.top; });
    cv.addEventListener("mouseleave", () => m.x = m.y = -999);
    // touch: the dots scatter under the finger on phones and tablets
    const touch = e => { const t = e.touches[0], b = cv.getBoundingClientRect(); if (t) { m.x = t.clientX - b.left; m.y = t.clientY - b.top; } };
    cv.addEventListener("touchstart", touch, { passive: true });
    cv.addEventListener("touchmove", touch, { passive: true });
    cv.addEventListener("touchend", () => setTimeout(() => m.x = m.y = -999, 250));
    cv.addEventListener("click", () => P && P.forEach(p => { p.x = Math.random() * cv.clientWidth; p.y = Math.random() * cv.clientHeight; }));
    function fit() { const d = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== Math.round(w * d)) { cv.width = w * d; cv.height = h * d; P = null; } const c = cv.getContext("2d"); c.setTransform(d, 0, 0, d, 0, 0); return [c, w, h]; }
    function build(W, H) {
      const S = 110, off = document.createElement("canvas"); off.width = off.height = S;
      const o = off.getContext("2d"); o.drawImage(img, 0, 0, S, S);
      let d; try { d = o.getImageData(0, 0, S, S).data; } catch (e) { return "blocked"; }
      const s = W / S, out = [];
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const k = (y * S + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
        if ((r > 190 && g < 90 && b < 110) || Math.hypot(x - S / 2, y - S / 2) > S * .46 || (x + y) % 2) continue;
        out.push({ hx: x * s, hy: y * s, x: reduce ? x * s : Math.random() * W, y: reduce ? y * s : Math.random() * H, vx: 0, vy: 0, c: `rgb(${r},${g},${b})`, s: s * 1.25 });
      }
      return out;
    }
    function frame() {
      const [c, W, H] = fit();
      if (!P && img.complete && img.naturalWidth) P = build(W, H);
      if (P === "blocked") {  // file:// pages cannot read canvas pixels: show the plain photo instead
        const ph = document.createElement("img"); ph.src = "img/hero.png"; ph.alt = "Portrait of Rania Farjallah"; ph.className = "portrait-fallback";
        cv.replaceWith(ph); document.querySelector(".hint").hidden = true; return;
      }
      if (P) {
        c.clearRect(0, 0, W, H);
        for (const p of P) {
          const dx = p.x - m.x, dy = p.y - m.y, dd = Math.hypot(dx, dy);
          if (dd < 35 && dd > 0) { const f = (35 - dd) / 35 * 2.2; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (p.hx - p.x) * .06; p.vy += (p.hy - p.y) * .06; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
          c.fillStyle = p.c; c.fillRect(p.x, p.y, p.s, p.s);
        }
      }
      if (!reduce || !P) requestAnimationFrame(frame);
    }
    img.onload = () => requestAnimationFrame(frame);
    img.src = "img/hero.png";
  })();

  /* neural network canvas */
  function network(canvas, density) {
    const ctx = canvas.getContext("2d");
    let W, H, nodes = [], mouse = { x: -999, y: -999 }, pulses = [];
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(W * H / density);
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.2 + Math.random() * 2 }));
    }
    const host = canvas.parentElement;
    host.addEventListener("mousemove", e => { const b = canvas.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; });
    host.addEventListener("mouseleave", () => { mouse.x = mouse.y = -999; });
    addEventListener("resize", resize); resize();
    const LINK = 130;
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy; }
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 160 && d > 1) { n.x += dx / d * .6; n.y += dy / d * .6; }
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * .35})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (!reduce && Math.random() < .0008) pulses.push({ a, b, t: 0 });
        }
      }
      for (const n of nodes) {
        const near = Math.hypot(mouse.x - n.x, mouse.y - n.y) < 160;
        ctx.fillStyle = near ? "#ffffff" : "rgba(255,255,255,.7)";
        ctx.beginPath(); ctx.arc(n.x, n.y, near ? n.r + 1.2 : n.r, 0, 7); ctx.fill();
      }
      pulses = pulses.filter(p => (p.t += .02) < 1);
      for (const p of pulses) {
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = "#ffffff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    frame();
  }
  network(document.getElementById("net2"), 14000);

  /* 5G traffic imputation scope */
  (function () {
    const cv = document.getElementById("scope"), ctx = cv.getContext("2d"), out = document.getElementById("readout");
    let W, H; const STEP = 4; let s = [], t = 0, gapLeft = 0, cool = 30, filled = 0;
    function size() { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
    size(); addEventListener("resize", size);
    const val = k => .5 + .24 * Math.sin(k * .045) + .1 * Math.sin(k * .17 + 1.3) + .06 * Math.sin(k * .6) + (Math.random() - .5) * .08;
    function push() {
      const v = val(t++); let m = false;
      if (gapLeft > 0) { m = true; if (--gapLeft === 0) filled++; }
      else if (--cool <= 0 && Math.random() < .05) { gapLeft = 14 + (Math.random() * 16 | 0); cool = 45; m = true; }
      s.push({ v, m, e: v + (Math.random() - .5) * .03 });
      const max = Math.ceil(W / STEP) + 2; if (s.length > max) s.splice(0, s.length - max);
    }
    const Y = v => H - 10 - v * (H - 20);
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.06)";
      for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
      const x0 = W - s.length * STEP;
      ctx.fillStyle = "rgba(255,255,255,.07)";
      s.forEach((p, i) => p.m && ctx.fillRect(x0 + i * STEP, 0, STEP + .5, H));
      const line = (color, w, pick, show, glow) => {
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = "round"; ctx.beginPath(); let open = false;
        s.forEach((p, i) => { const x = x0 + i * STEP, y = Y(pick(p)); if (show(p, i)) { open ? ctx.lineTo(x, y) : ctx.moveTo(x, y); open = true; } else open = false; });
        if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 12; } ctx.stroke(); ctx.shadowBlur = 0;
      };
      line("#EF233C", 2.6, p => p.e, (p, i) => p.m || (s[i - 1] && s[i - 1].m) || (s[i + 1] && s[i + 1].m), true);
      line("#ffffff", 1.8, p => p.v, p => !p.m);
      const last = s[s.length - 1];
      if (last) { ctx.fillStyle = last.m ? "#EF233C" : "#fff"; ctx.beginPath(); ctx.arc(W - STEP, Y(last.m ? last.e : last.v), 4, 0, 7); ctx.fill(); }
      out.textContent = last && last.m ? (lang === "fr" ? "imputation…" : "imputing…") : (lang === "fr" ? `en direct · ${filled} trous comblés` : `live · ${filled} gaps filled`);
    }
    for (let i = 0; i < Math.ceil(W / STEP) + 2; i++) push();
    draw();
    if (!reduce) { let acc = 0, lt = performance.now(); (function loop(n) { acc += Math.min(n - lt, 500); lt = n; while (acc > 55) { push(); acc -= 55; } draw(); requestAnimationFrame(loop); })(lt); }
  })();

  /* scroll reveal + counters */
  const counted = new WeakSet();
  function count(el) {
    if (counted.has(el)) return; counted.add(el);
    const end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1400;
    (function step(n) { const k = Math.min((n - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
  }
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(count);
      io.unobserve(e.target);
    }), { threshold: .12 });
    let k = 0;
    document.querySelectorAll(".reveal").forEach(el => { if (el.matches(".skill, .proj")) el.style.transitionDelay = (k++ % 3) * 120 + "ms"; io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }

  /* scroll: progress bar, nav shadow, active link, timeline fill, back-to-top */
  const prog = document.getElementById("progress"), nav = document.getElementById("nav"), top = document.getElementById("toTop");
  const links = [...document.querySelectorAll(".links a")];
  const secs = links.map(a => document.querySelector(a.getAttribute("href")));
  const tls = [...document.querySelectorAll(".timeline")];
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (max > 0 ? y / max * 100 : 0) + "%";
    nav.classList.toggle("scrolled", y > 10);
    top.classList.toggle("show", y > 600);
    let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 140) cur = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === cur));
    tls.forEach(tl => {
      const r = tl.getBoundingClientRect(), p = Math.min(Math.max((innerHeight * .7 - r.top) / r.height, 0), 1);
      tl.querySelector(".fill").style.height = (p * 100) + "%";
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* 3D tilt on project cards */
  if (!reduce) document.querySelectorAll(".proj").forEach(c => {
    c.addEventListener("mousemove", e => { const b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5; c.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`; });
    c.addEventListener("mouseleave", () => { c.style.transform = ""; });
  });

  /* project filter */
  document.querySelectorAll(".filters button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach(x => x.classList.toggle("on", x === b));
    document.querySelectorAll(".proj").forEach(p => p.classList.toggle("hide", b.dataset.f !== "all" && p.dataset.cat !== b.dataset.f));
  }));

  /* activities carousel */
  const track = document.getElementById("track");
  const stepBy = dir => { const w = track.querySelector(".act").offsetWidth + 24; const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5; track.scrollTo({ left: dir > 0 && atEnd ? 0 : track.scrollLeft + dir * w, behavior: "smooth" }); };
  document.getElementById("prev").onclick = () => stepBy(-1);
  document.getElementById("next").onclick = () => stepBy(1);
  let hover = false; track.addEventListener("mouseenter", () => hover = true); track.addEventListener("mouseleave", () => hover = false);
  if (!reduce) setInterval(() => { if (!hover && track.getBoundingClientRect().top < innerHeight) stepBy(1); }, 4000);

  /* copy buttons */
  document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => {
    const ok = () => { b.textContent = UI[lang].copied; setTimeout(() => b.textContent = UI[lang].copy, 1500); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText(b.dataset.copy).then(ok, fallback); } catch (e) { fallback(); }
  }));
})();
