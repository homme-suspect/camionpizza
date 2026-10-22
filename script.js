// =========================
// CAMION PIZZA — La Maison de la Pizza
// =========================

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const root = document.documentElement;

  const reduced = root.classList.contains("reduced");
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduced;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const f = (v) => Math.round(v * 10) / 10;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };

  // =========================
  // LA TOURNÉE
  // =========================

  // spot : où se gare le camion · map : recherche envoyée à Google Maps
  const schedule = [
    {
      day: 3,
      name: "Mercredi",
      town: "Béthisy-Saint-Martin",
      open: 17,
      close: 21,
      spot: "Rue de Crépy, en face de L'Atelier de Coiffure",
      map: "89 Rue de Crépy, 60320 Béthisy-Saint-Martin",
    },
    {
      day: 4,
      name: "Jeudi",
      town: "Moru",
      open: 18,
      close: 21,
      spot: "Hameau de Moru, Pontpoint",
      map: "Moru, 60700 Pontpoint",
    },
    {
      day: 5,
      name: "Vendredi",
      town: "Cinqueux",
      open: 17,
      close: 21,
      spot: "Place de la Mairie",
      map: "Mairie de Cinqueux, 10 Place Georges Tainturier, 60940 Cinqueux",
    },
    {
      day: 6,
      name: "Samedi",
      town: "Saint-Sauveur",
      open: 17,
      close: 21,
      spot: "Place de l'Église",
      map: "Place de l'Église, 60320 Saint-Sauveur",
    },
    {
      day: 0,
      name: "Dimanche",
      town: "Pont-Sainte-Maxence",
      open: 18,
      close: 22,
      spot: "Parking devant la laverie du pont, rue de la République",
      map: "1 Rue de la République, 60700 Pont-Sainte-Maxence",
    },
  ];

  const hoursOf = (s) => `${s.open}h – ${s.close}h`;
  const mapUrl = (s) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.map);

  function getStatus(now = new Date()) {
    const d = now.getDay();
    const h = now.getHours() + now.getMinutes() / 60;
    const today = schedule.find((s) => s.day === d);

    if (today && h < today.close) {
      if (h >= today.open) {
        return {
          state: "open",
          stop: today,
          kicker: "En ce moment",
          place: today.town,
          detail: `Jusqu'à ${today.close}h`,
          badge: "En ce moment",
          short: `Ouvert maintenant à ${today.town}, jusqu'à ${today.close}h`,
        };
      }
      return {
        state: "tonight",
        stop: today,
        kicker: "Ce soir",
        place: today.town,
        detail: hoursOf(today),
        badge: "Ce soir",
        short: `Ce soir à ${today.town} · ${hoursOf(today)}`,
      };
    }

    for (let i = 1; i <= 7; i++) {
      const s = schedule.find((x) => x.day === (d + i) % 7);
      if (!s) continue;
      const kicker = i === 1 ? "Demain soir" : `Prochain passage · ${s.name}`;
      return {
        state: "next",
        stop: s,
        kicker,
        place: s.town,
        detail: hoursOf(s),
        badge: i === 1 ? "Demain" : "Prochain arrêt",
        short: `${kicker} : ${s.town} · ${hoursOf(s)}`,
      };
    }
  }

  let status = getStatus();

  function renderStatus() {
    status = getStatus();
    const box = $(".today");
    box.classList.remove("is-open", "is-tonight", "is-next");
    box.classList.add(`is-${status.state}`);
    $("#today-kicker").textContent = status.kicker;
    $("#today-location").textContent = status.place;
    $("#today-hours").textContent = status.detail;
    $("#today-spot").textContent = status.stop.spot;
    const map = $("#today-map");
    map.href = mapUrl(status.stop);
    map.setAttribute("aria-label", `Itinéraire vers ${status.stop.town}, ${status.stop.spot}`);
    const short = $("[data-status-short]");
    if (short) short.textContent = status.short;
  }

  function renderStops() {
    $("#stops").innerHTML =
      schedule
        .map((s) => {
          const hot = s === status.stop;
          return `
        <li class="stop${hot ? " is-today" : ""}">
          ${hot ? `<span class="stop-badge">${status.badge}</span>` : ""}
          <p class="stop-day">${s.name}</p>
          <h3 class="stop-town">${s.town}</h3>
          <p class="stop-hours">${hoursOf(s)}</p>
          <p class="stop-spot"><svg class="icon" aria-hidden="true"><use href="#i-pin" /></svg>${s.spot}</p>
          <a class="stop-map" href="${mapUrl(s)}" target="_blank" rel="noopener">
            Itinéraire <svg class="icon"><use href="#i-arrow" /></svg>
          </a>
        </li>`;
        })
        .join("") + `<li class="stops-fill" role="presentation" aria-hidden="true"></li>`;

    $("#footer-week").innerHTML = schedule
      .map((s) => `<li${s === status.stop ? ' class="is-today"' : ""}><span>${s.name}</span><b>${s.town}</b></li>`)
      .join("");
  }

  // =========================
  // CARTE DES PIZZAS
  // =========================

  const pizzas = {
    tomate: [
      { name: "Margherita", price: "8,50 €", ingredients: "Sauce tomate, mozzarella." },
      { name: "Reine", price: "10 €", ingredients: "Sauce tomate, mozzarella, jambon, champignons." },
      { name: "4 Fromages", price: "10 €", ingredients: "Sauce tomate, mozzarella, chèvre, bleu, emmental." },
      { name: "Calzone (Soufflée)", price: "11 €", ingredients: "Sauce tomate, mozzarella, jambon, œuf." },
      {
        name: "4 Saisons",
        price: "11 €",
        ingredients: "Sauce tomate, mozzarella, jambon, champignons, artichauts, olives noires, câpres.",
      },
      {
        name: "Végétarienne",
        price: "11 €",
        ingredients:
          "Sauce tomate, mozzarella, champignons, poivrons, artichauts, olives noires, oignons, pommes de terre.",
      },
      {
        name: "Chèvre Miel",
        price: "11 €",
        ingredients: "Sauce tomate, mozzarella, chèvre, olives, crème fraîche, miel.",
      },
      { name: "Fermière", price: "11 €", ingredients: "Sauce tomate, mozzarella, pommes de terre, poulet." },
      { name: "Orientale", price: "11,50 €", ingredients: "Sauce tomate, mozzarella, merguez, champignons, œuf." },
      { name: "Campione", price: "11,50 €", ingredients: "Sauce tomate, mozzarella, lardons, œuf, viande hachée." },
      { name: "Paysanne", price: "11,50 €", ingredients: "Sauce tomate, mozzarella, jambon, lardons, oignons, œuf." },
      { name: "Espagnole", price: "11,50 €", ingredients: "Sauce tomate, mozzarella, chorizo, poivrons, olives." },
      { name: "Mexicaine", price: "11,50 €", ingredients: "Sauce tomate, mozzarella, poulet, poivrons, champignons." },
      {
        name: "Bolognaise",
        price: "11,50 €",
        ingredients: "Sauce tomate, mozzarella, viande hachée, pommes de terre, crème fraîche.",
      },
      { name: "Chef", price: "12 €", ingredients: "Sauce tomate, mozzarella, jambon, merguez, œuf." },
      {
        name: "Royale",
        price: "12,50 €",
        ingredients: "Sauce tomate, mozzarella, jambon, merguez, poivrons, artichauts, œuf, olives.",
      },
      {
        name: "Spéciale",
        price: "12,50 €",
        ingredients: "Sauce tomate, mozzarella, chorizo, viande hachée, chèvre, poivrons, crème fraîche.",
      },
      {
        name: "Tartiflette",
        price: "12,50 €",
        ingredients:
          "Sauce tomate, mozzarella, jambon, pommes de terre, crème fraîche, fromage à tartiflette, oignons.",
      },
      {
        name: "Picarde",
        price: "12,50 €",
        ingredients: "Sauce tomate, mozzarella, maroilles, lardons, oignons, pommes de terre, crème fraîche.",
      },
      {
        name: "Gourmande",
        price: "12,50 €",
        ingredients: "Sauce tomate, mozzarella, jambon, merguez, lardons, chorizo.",
      },
      {
        name: "Suprême BBQ",
        price: "13,50 €",
        ingredients:
          "Sauce tomate, mozzarella, pommes de terre, viande hachée, chorizo, merguez, poulet, sauce barbecue.",
      },
    ],

    creme: [
      { name: "Normande", price: "11 €", ingredients: "Crème fraîche, mozzarella, jambon, pommes de terre, œuf." },
      { name: "Chicken", price: "11 €", ingredients: "Crème fraîche, mozzarella, pommes de terre, poulet." },
      { name: "Milano", price: "11 €", ingredients: "Crème fraîche, mozzarella, poulet, chèvre." },
      { name: "Norvégienne", price: "12 €", ingredients: "Crème fraîche, mozzarella, saumon fumé." },
      { name: "Chèvre Lardons", price: "12,50 €", ingredients: "Crème fraîche, mozzarella, chèvre, lardons, oignons." },
      {
        name: "Raclette",
        price: "12,50 €",
        ingredients: "Crème fraîche, mozzarella, jambon, chorizo, fromage à raclette, pommes de terre.",
      },
    ],

    pecheurs: [
      { name: "Napolitaine", price: "11 €", ingredients: "Sauce tomate, mozzarella, anchois, olives, câpres." },
      { name: "Neptune", price: "11 €", ingredients: "Sauce tomate, mozzarella, thon, champignons, olives." },
      { name: "Océane", price: "12 €", ingredients: "Sauce tomate, mozzarella, saumon fumé, crème fraîche, olives." },
      {
        name: "Sicilienne",
        price: "13 €",
        ingredients: "Sauce tomate, mozzarella, anchois, saumon fumé, olives, câpres.",
      },
    ],
  };

  const catColor = { tomate: "#e31e24", creme: "#1797cf", pecheurs: "#0b5a92" };
  const meat = /jambon|poulet|merguez|lardons|viande|chorizo|saumon|thon|anchois/i;

  const list = $("#pizza-menu");
  const tabsEl = $(".tabs");
  const tabs = $$(".tab");
  const indicator = $(".tabs-indicator");
  const menuBlob = $(".menu-blob");
  let current = "tomate";

  function renderMenu(cat) {
    const items = pizzas[cat];
    const rows = Math.ceil(items.length / 2);
    list.dataset.cat = cat;
    list.style.setProperty("--rows", rows);
    list.innerHTML = items
      .map(
        (p, i) => `
      <li class="dish${i === 0 || i === rows ? " col-top" : ""}">
        <div class="dish-top">
          <h3 class="dish-name">${p.name}</h3>
          ${meat.test(p.ingredients) ? "" : '<span class="veg"><svg class="icon"><use href="#i-leaf" /></svg>Veggie</span>'}
          <span class="dish-dots" aria-hidden="true"></span>
          <span class="dish-price">${p.price}</span>
        </div>
        <p class="dish-ing">${p.ingredients}</p>
      </li>`
      )
      .join("");
  }

  function moveIndicator() {
    const t = tabs.find((x) => x.dataset.category === current);
    indicator.style.width = t.offsetWidth + "px";
    indicator.style.transform = `translateX(${t.offsetLeft}px)`;
    indicator.style.backgroundColor = catColor[current];
  }

  function selectTab(tab, focus) {
    const cat = tab.dataset.category;
    if (focus) tab.focus();
    if (cat === current) return;
    current = cat;

    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
    });
    moveIndicator();
    menuBlob.style.backgroundColor = catColor[cat];

    if (!motion) {
      renderMenu(cat);
      return;
    }

    gsap.to(list.children, {
      y: -14,
      opacity: 0,
      duration: 0.22,
      stagger: 0.008,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => {
        renderMenu(cat);
        gsap.from(list.children, { y: 30, opacity: 0, duration: 0.8, stagger: 0.03, ease: "expo.out" });
        ScrollTrigger.refresh();
      },
    });
  }

  tabs.forEach((t, i) => {
    t.tabIndex = t.classList.contains("is-active") ? 0 : -1;
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const step = e.key === "ArrowRight" ? 1 : tabs.length - 1;
      selectTab(tabs[(i + step) % tabs.length], true);
    });
  });

  // =========================
  // PIZZA (SVG généré)
  // =========================

  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Courbe fermée lisse passant par tous les points (Catmull-Rom)
  function smoothPath(pts) {
    const n = pts.length;
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(
        p2[1] - (p3[1] - p1[1]) / 6
      )} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + "Z";
  }

  function buildPizza(svg) {
    const rand = rng(11);
    const R = (a, b) => a + rand() * (b - a);
    const TAU = Math.PI * 2;
    const polar = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
    const deg = (a) => (a * 180) / Math.PI;
    const blob = (cx, cy, r, amp, n) => {
      const off = rand() * TAU;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * TAU;
        const rr = r + (rand() - 0.5) * 2 * amp;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      return smoothPath(pts);
    };

    let art = "";

    // Pâte
    art += `<path d="${blob(0, 0, 288, 3.5, 44)}" fill="url(#pz-crust)"/>`;
    for (let i = 0; i < 16; i++) {
      const a = R(0, TAU);
      const [x, y] = polar(R(266, 280), a);
      art += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(R(9, 18))}" ry="${f(R(5, 8))}" transform="rotate(${f(
        deg(a) + 90
      )} ${f(x)} ${f(y)})" fill="#f6cf91" opacity=".5"/>`;
    }
    // Marques du feu de bois
    for (let i = 0; i < 40; i++) {
      const a = R(0, TAU);
      const [x, y] = polar(R(256, 287), a);
      const s = R(4, 14);
      art += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s)}" ry="${f(s * R(0.45, 0.8))}" transform="rotate(${f(
        deg(a) + 90
      )} ${f(x)} ${f(y)})" fill="url(#pz-char)"/>`;
    }
    art += `<circle r="252" fill="none" stroke="#6b3311" stroke-opacity=".4" stroke-width="10"/>`;

    // Sauce tomate
    art += `<path d="${blob(0, 0, 248, 5, 40)}" fill="url(#pz-sauce)"/>`;
    for (let i = 0; i < 28; i++) {
      const [x, y] = polar(R(0, 236), R(0, TAU));
      art += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R(1.5, 4.5))}" fill="#8e180b" opacity=".45"/>`;
    }

    // Mozzarella
    const cheeses = [[R(-10, 10), R(-10, 10), 48]];
    for (let k = 0; k < 7; k++) {
      const [x, y] = polar(R(120, 160), (k / 7) * TAU + R(-0.2, 0.2));
      cheeses.push([x, y, R(36, 50)]);
    }
    for (let k = 0; k < 6; k++) {
      const [x, y] = polar(R(200, 210), (k / 6) * TAU + 0.45 + R(-0.15, 0.15));
      cheeses.push([x, y, R(18, 25)]);
    }
    cheeses.forEach(([x, y, s]) => {
      art += `<path d="${blob(x, y, s, s * 0.2, 9)}" fill="url(#pz-cheese)"/>`;
      for (let j = 0; j < 2; j++) {
        art += `<circle cx="${f(x + R(-s / 2, s / 2))}" cy="${f(y + R(-s / 2, s / 2))}" r="${f(
          R(5, s / 3.5)
        )}" fill="url(#pz-toast)"/>`;
      }
    });

    // Olives
    for (let i = 0; i < 9; i++) {
      const [x, y] = polar(R(45, 215), (i / 9) * TAU + R(-0.3, 0.3));
      art += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(R(0, 360))})">
        <circle r="11" fill="url(#pz-olive)"/>
        <ellipse rx="4.2" ry="3.6" fill="#7a2011"/>
        <path d="M-6 -5A8 8 0 0 1 3 -8" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>`;
    }

    // Basilic
    const leaf = "M0 -27C15 -19 17 9 0 29C-17 9 -15 -19 0 -27Z";
    for (let i = 0; i < 7; i++) {
      const [x, y] = polar(R(55, 200), (i / 7) * TAU + R(0, 0.7));
      art += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(R(0, 360))}) scale(${f(R(0.75, 1.05))})">
        <path d="${leaf}" fill="url(#pz-basil)"/>
        <path d="M0 -22V24M0 -6L8 -12M0 4L-9 -3M0 13L8 7" stroke="#1d4f22" stroke-opacity=".55" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      </g>`;
    }

    // Brillance de l'huile
    for (let i = 0; i < 12; i++) {
      const [x, y] = polar(R(20, 230), R(0, TAU));
      art += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(R(3, 8))}" ry="${f(R(1.5, 3))}" transform="rotate(${f(
        R(0, 180)
      )} ${f(x)} ${f(y)})" fill="#fff" opacity=".18"/>`;
    }

    // Découpe en 8 parts
    for (let k = 0; k < 8; k++) {
      const [x, y] = polar(256, ((112.5 + k * 45) * Math.PI) / 180);
      art += `<line x1="0" y1="0" x2="${f(x)}" y2="${f(y)}" stroke="#4d1408" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"/>`;
    }

    const rad = (d) => (d * Math.PI) / 180;
    const wedge = (r, from = 112.5, to = 157.5) => {
      const a0 = rad(from);
      const a1 = rad(to);
      return `M0 0L${f(Math.cos(a0) * r)} ${f(Math.sin(a0) * r)}A${r} ${r} 0 0 1 ${f(Math.cos(a1) * r)} ${f(
        Math.sin(a1) * r
      )}Z`;
    };

    svg.innerHTML = `
      <defs>
        <radialGradient id="pz-crust" cx="0" cy="0" r="292" gradientUnits="userSpaceOnUse">
          <stop offset=".78" stop-color="#ecb66d"/><stop offset=".87" stop-color="#d9924a"/>
          <stop offset=".95" stop-color="#b4682b"/><stop offset="1" stop-color="#7d3f17"/>
        </radialGradient>
        <radialGradient id="pz-sauce" cx="0" cy="0" r="250" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#dc3d22"/><stop offset=".7" stop-color="#c52c18"/><stop offset="1" stop-color="#981c0f"/>
        </radialGradient>
        <radialGradient id="pz-cheese" cx=".4" cy=".36" r=".72">
          <stop offset="0" stop-color="#fffbf1"/><stop offset=".55" stop-color="#fbe8b8"/><stop offset="1" stop-color="#eec377"/>
        </radialGradient>
        <radialGradient id="pz-char">
          <stop offset="0" stop-color="#1c0b04" stop-opacity=".9"/><stop offset=".55" stop-color="#3b1a09" stop-opacity=".55"/>
          <stop offset="1" stop-color="#3b1a09" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="pz-toast">
          <stop offset="0" stop-color="#c3843a" stop-opacity=".6"/><stop offset="1" stop-color="#c3843a" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="pz-basil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#5aa857"/><stop offset="1" stop-color="#1e5a25"/>
        </linearGradient>
        <radialGradient id="pz-olive" cx=".35" cy=".35" r=".75">
          <stop offset="0" stop-color="#4d453f"/><stop offset="1" stop-color="#141110"/>
        </radialGradient>
        <g id="pz-art">${art}</g>
        <clipPath id="pz-rest"><path clip-rule="evenodd" d="M-340 -340H340V340H-340Z${wedge(330, 113.2, 156.8)}"/></clipPath>
        <clipPath id="pz-cut"><path d="${wedge(330)}"/></clipPath>
      </defs>
      <use href="#pz-art" clip-path="url(#pz-rest)"/>
      <g class="pz-slice">
        <path class="pz-slice-shadow" d="${wedge(289)}" fill="#000" opacity="0" transform="translate(5 12)"/>
        <use href="#pz-art" clip-path="url(#pz-cut)"/>
      </g>`;
  }

  // =========================
  // BRAISES (canvas)
  // =========================

  class Embers {
    constructor(canvas, opts = {}) {
      this.c = canvas;
      this.ctx = canvas.getContext("2d");
      this.density = opts.density || 1;
      this.parts = [];
      this.running = false;
      this.visible = false;
      this.mx = null;
      this.sprite = Embers.sprite();
      this.loop = this.loop.bind(this);

      this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas);
      new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        this.toggle();
      }).observe(canvas);
      document.addEventListener("visibilitychange", () => this.toggle());

      if (opts.interactive) {
        const host = canvas.parentElement;
        host.addEventListener("pointermove", (e) => {
          const r = canvas.getBoundingClientRect();
          this.mx = e.clientX - r.left;
          this.my = e.clientY - r.top;
        });
        host.addEventListener("pointerleave", () => (this.mx = null));
      }
    }

    static sprite() {
      if (Embers.cache) return Embers.cache;
      const s = document.createElement("canvas");
      s.width = s.height = 64;
      const g = s.getContext("2d");
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,244,214,1)");
      gr.addColorStop(0.18, "rgba(255,190,90,.95)");
      gr.addColorStop(0.42, "rgba(255,106,26,.42)");
      gr.addColorStop(1, "rgba(227,30,36,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return (Embers.cache = s);
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      this.w = this.c.clientWidth;
      this.h = this.c.clientHeight;
      this.c.width = Math.round(this.w * dpr);
      this.c.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(110, Math.max(24, (this.w * this.h) / 15000)) * this.density);
      while (this.parts.length < target) this.parts.push(this.spawn({}, true));
      this.parts.length = target;
    }

    spawn(p, initial) {
      p.x = Math.random() * this.w;
      p.y = initial ? Math.random() * this.h : this.h + 10 + Math.random() * 40;
      p.vx = (Math.random() - 0.5) * 0.25;
      p.vy = -(0.35 + Math.random() * 1.1);
      p.s = 4 + Math.random() * Math.random() * 15;
      p.life = initial ? Math.random() : 0;
      p.speed = 0.0025 + Math.random() * 0.004;
      p.ph = Math.random() * 6.28;
      p.fl = 2 + Math.random() * 6;
      return p;
    }

    toggle() {
      const on = this.visible && !document.hidden;
      if (on && !this.running) {
        this.running = true;
        this.last = performance.now();
        requestAnimationFrame(this.loop);
      } else if (!on) {
        this.running = false;
      }
    }

    loop(t) {
      if (!this.running) return;
      const dt = Math.min((t - this.last) / 16.67, 3);
      this.last = t;
      this.frame(dt);
      requestAnimationFrame(this.loop);
    }

    frame(dt) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of this.parts) {
        p.life += p.speed * dt;
        if (p.life >= 1 || p.y < -20) this.spawn(p, false);
        p.ph += 0.03 * dt;

        let vx = p.vx + Math.sin(p.ph) * 0.25;
        if (this.mx !== null) {
          const dx = p.x - this.mx;
          const dy = p.y - this.my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 18000) {
            const d = Math.sqrt(d2) + 1;
            const k = (1 - d2 / 18000) * 2.2;
            vx += (dx / d) * k;
            p.y += (dy / d) * k * dt * 0.6;
          }
        }
        p.x += vx * dt;
        p.y += p.vy * dt;

        const a = Math.sin(Math.PI * p.life) * (0.65 + 0.35 * Math.sin(p.ph * p.fl));
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(this.sprite, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    }
  }

  // =========================
  // DÉCOUPAGE DU TEXTE
  // =========================

  function splitChars(el) {
    const words = el.textContent.trim().split(/ +/);
    el.textContent = "";
    words.forEach((w, i) => {
      const word = document.createElement("span");
      word.className = "word";
      for (const c of w) {
        const ch = document.createElement("span");
        ch.className = "char";
        ch.textContent = c;
        word.appendChild(ch);
      }
      el.appendChild(word);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.classList.add("is-split");
    return $$(".char", el);
  }

  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
            if (!part) return;
            if (/^[ \t\n\r]+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
            } else {
              const s = document.createElement("span");
              s.className = "w";
              s.textContent = part;
              frag.appendChild(s);
            }
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    };
    walk(el);
    return $$(".w", el);
  }

  // =========================
  // ROUTE DU CAMION
  // =========================

  function initRoad() {
    const path = $("#road");
    const total = path.getTotalLength();
    const trail = $(".road-trail");
    const truck = $("#truck");
    const wheels = $$(".wheel", truck);
    const pinsG = $(".road-stops");
    const cards = $$(".stop");

    // Longueur du tracé au droit de chaque étape (centre des 5 colonnes)
    const samples = [];
    for (let i = 0; i <= 600; i++) {
      const L = (total * i) / 600;
      samples.push([L, path.getPointAtLength(L).x]);
    }
    const lens = [120, 360, 600, 840, 1080].map(
      (x) => samples.reduce((best, s) => (Math.abs(s[1] - x) < Math.abs(best[1] - x) ? s : best))[0]
    );

    const pins = lens.map((L) => {
      const p = path.getPointAtLength(L);
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "road-pin");
      g.setAttribute("transform", `translate(${f(p.x)} ${f(p.y)})`);
      g.innerHTML = `<circle class="pin-pulse" r="13"/><circle class="pin-ring" r="13"/><circle class="pin-core" r="4.5"/>`;
      pinsG.appendChild(g);
      return g;
    });

    trail.style.strokeDasharray = `${total} ${total}`;
    const endL = lens[lens.length - 1] + 40;

    function set(L) {
      const a = path.getPointAtLength(L);
      const b = path.getPointAtLength(Math.min(L + 3, total));
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      truck.setAttribute(
        "transform",
        `translate(${f(a.x)} ${f(a.y)}) rotate(${f(ang)}) scale(.82) translate(-80 -92)`
      );
      const spin = f((L / (2 * Math.PI * 12)) * 360);
      wheels[0].setAttribute("transform", `translate(38 86) rotate(${spin})`);
      wheels[1].setAttribute("transform", `translate(118 86) rotate(${spin})`);
      trail.style.strokeDashoffset = f(total - L);
      lens.forEach((sl, i) => {
        const on = L >= sl - 4;
        pins[i].classList.toggle("is-on", on);
        if (cards[i]) cards[i].classList.toggle("is-on", on);
      });
    }

    return { set, endL, cards };
  }

  // =========================
  // DÉFILEMENT, EN-TÊTE, MENU MOBILE
  // =========================

  const header = $(".site-header");
  const progress = $(".progress");
  const floatCall = $(".float-call");
  const hero = $(".hero");
  const burger = $(".burger");
  const overlay = $("#menu-overlay");

  let lenis = null;
  let scrollVel = 0;
  let scrollDir = 1;
  let lastY = 0;

  function onScroll(y) {
    const dir = y > lastY ? 1 : y < lastY ? -1 : 0;
    header.classList.toggle("is-scrolled", y > 30);
    if (!root.classList.contains("menu-open")) {
      if (dir === 1 && y > 260) header.classList.add("is-hidden");
      else if (dir === -1) header.classList.remove("is-hidden");
    }
    const max = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    floatCall.classList.toggle("is-visible", y > hero.offsetHeight * 0.6);
    lastY = y;
  }

  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    overlay.setAttribute("aria-hidden", !open);
    if (open) header.classList.remove("is-hidden");
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? "hidden" : "";
  }

  const closeMenu = () => root.classList.contains("menu-open") && setMenu(false);

  burger.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // Ancres : défilement doux
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#" || id === "#accueil" ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.6 });
    } else if (target === 0) {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    } else {
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }
  });

  // =========================
  // EFFET MAGNÉTIQUE
  // =========================

  function initMagnetic() {
    $$(".magnetic").forEach((el) => {
      const k = el.classList.contains("call") ? 0.4 : 0.28;
      const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease: "elastic.out(1, 0.35)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease: "elastic.out(1, 0.35)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * k);
        yTo((e.clientY - r.top - r.height / 2) * k);
      });
      el.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  // =========================
  // BANDEAUX DÉFILANTS
  // =========================

  function initMarquees() {
    const items = $$("[data-marquee]").map((m) => {
      const track = $(".marquee-track", m);
      return { m, track, html: track.innerHTML, dir: +m.dataset.marquee, x: 0, period: 1 };
    });

    const measure = () =>
      items.forEach((it) => {
        it.track.innerHTML = it.html;
        it.period = it.track.offsetWidth || 1;
        const copies = Math.ceil((it.m.offsetWidth * 2) / it.period) + 1;
        it.track.innerHTML = it.html.repeat(copies);
      });

    measure();
    window.addEventListener("resize", debounce(measure, 200));
    if (document.fonts) document.fonts.ready.then(measure);

    gsap.ticker.add((time, delta) => {
      const boost = 1 + Math.min(Math.abs(scrollVel) * 0.08, 6);
      items.forEach((it) => {
        it.x -= it.dir * scrollDir * 0.9 * boost * (delta / 16.67);
        if (it.x <= -it.period) it.x += it.period;
        else if (it.x > 0) it.x -= it.period;
        it.track.style.transform = `translate3d(${f(it.x)}px,0,0)`;
      });
    });
  }

  // =========================
  // CHORÉGRAPHIE
  // =========================

  function heroIntro() {
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    tl.from(".site-header > :not(.nav)", { y: -40, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.1)
      .from(".nav a", { y: -30, opacity: 0, duration: 1.2, stagger: 0.06 }, 0.2)
      .from(".pizza-wrap", { scale: 0.45, rotate: -150, opacity: 0, duration: 2.4 }, 0)
      .from(".hero-title .char", { yPercent: 118, rotate: 7, duration: 1.5, stagger: 0.05 }, 0.15)
      .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 1.1 }, 0.35)
      .from([".hero-text", ".today", ".hero-actions > *"], { y: 34, opacity: 0, duration: 1.3, stagger: 0.09 }, 0.5)
      .from(".badge", { scale: 0, rotate: -200, duration: 1.6 }, 0.8)
      .from(".scroll-hint", { opacity: 0, y: -10, duration: 1 }, 1.2);
    return tl;
  }

  // Entrée directe, sans écran de chargement : on attend juste les polices (1,2 s max)
  function startIntro(intro) {
    const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(1200)]) : Promise.resolve();
    fontsReady.then(() => {
      root.classList.remove("intro");
      ScrollTrigger.refresh();
      intro.play();
      if (lenis) lenis.start();

      // Lien direct vers une section (ex. camionpizza.net/#carte)
      const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
      if (target && target !== hero) {
        if (lenis) lenis.scrollTo(target, { duration: 1.6 });
        else target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function initScrollScenes(road) {
    const fadeUp = (targets, trigger, extra = {}) =>
      gsap.from(targets, {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: trigger || targets, start: "top 88%" },
        ...extra,
      });

    // Accueil : la pizza tourne, une part se détache
    gsap.set(".pizza", { transformOrigin: "50% 50%" });
    gsap.set(".pz-slice", { x: 0, y: 0 });
    const pull = () => (window.innerWidth > 860 ? 62 : 26);
    gsap
      .timeline({
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      })
      .to(".pizza", { rotate: 110, ease: "none" }, 0)
      .to(".pz-slice", { x: () => -pull(), y: () => pull(), ease: "none" }, 0)
      .to(".pz-slice-shadow", { opacity: 0.45, ease: "none" }, 0)
      .to(".hero-visual", { yPercent: 16, ease: "none" }, 0);

    gsap.to(".scroll-hint > *", {
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "+=160", scrub: true },
    });

    // Titres lettre par lettre
    $$(".menu-title, .tour-title, .cta-title").forEach((title) => {
      gsap.from($$(".char", title), {
        yPercent: 118,
        rotate: 6,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.035,
        scrollTrigger: { trigger: title, start: "top 85%" },
      });
    });

    const giant = $(".footer-giant");
    gsap.from($$(".char", giant), {
      yPercent: 105,
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.025,
      scrollTrigger: { trigger: giant, start: "top 98%" },
    });

    $$(".manifesto .section-label, .menu .section-label, .tour .section-label, .cta .section-label").forEach((l) =>
      fadeUp(l)
    );

    // Manifeste : les mots s'allument au fil du scroll
    const words = $$(".manifesto-text .w");
    gsap.fromTo(
      words,
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: ".manifesto-text", start: "top 78%", end: "bottom 50%", scrub: true },
      }
    );

    fadeUp(".stats li", ".stats");

    // Compteurs
    $$("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = +(el.dataset.decimals || 0);
      const fmt = (v) => (dec ? v.toFixed(dec).replace(".", ",") : String(Math.round(v)));
      const o = { v: 0 };
      el.textContent = fmt(0);
      gsap.to(o, {
        v: end,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%" },
        onUpdate: () => (el.textContent = fmt(o.v)),
      });
    });

    // Carte
    fadeUp([".menu-aside", ".tabs"], ".menu-head");
    gsap.from(list.children, {
      y: 30,
      opacity: 0,
      duration: 0.9,
      stagger: 0.03,
      ease: "expo.out",
      scrollTrigger: { trigger: list, start: "top 85%" },
    });

    // Tournée
    fadeUp(".tour-intro");

    // Contact
    fadeUp([".cta-text", ".cta-phone"], ".cta-text");
    gsap.from(".call", {
      scale: 0,
      rotate: -120,
      duration: 1.5,
      ease: "expo.out",
      scrollTrigger: { trigger: ".call", start: "top 92%" },
    });

    fadeUp(".footer-grid > *", ".footer-grid");

    const mm = gsap.matchMedia();

    mm.add("(min-width: 861px)", () => {
      // Le texte d'accueil s'efface en remontant
      gsap.to(".hero-content", {
        yPercent: -14,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      // Les panneaux s'élargissent en arrivant
      [".menu", ".tour"].forEach((sel) => {
        gsap.fromTo(
          sel,
          { clipPath: "inset(5% 3.5% 0% 3.5% round 56px 56px 0px 0px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 56px 56px 0px 0px)",
            ease: "none",
            scrollTrigger: { trigger: sel, start: "top bottom", end: "top 30%", scrub: true },
          }
        );
      });

      // Le camion roule au fil du scroll
      const state = { L: 0 };
      road.set(0);
      gsap.to(state, {
        L: road.endL,
        ease: "none",
        scrollTrigger: { trigger: ".road-wrap", start: "top 80%", end: "bottom 15%", scrub: 0.8 },
        onUpdate: () => road.set(state.L),
      });

      // Légère inclinaison de la pizza suivant la souris
      if (finePointer) {
        const hv = $(".hero-visual");
        gsap.set(hv, { transformPerspective: 1400 });
        const tx = gsap.quickTo(hv, "rotationY", { duration: 1.4, ease: "power3" });
        const ty = gsap.quickTo(hv, "rotationX", { duration: 1.4, ease: "power3" });
        const move = (e) => {
          tx((e.clientX / window.innerWidth - 0.5) * 16);
          ty(-(e.clientY / window.innerHeight - 0.5) * 16);
        };
        hero.addEventListener("pointermove", move);
        return () => hero.removeEventListener("pointermove", move);
      }
    });

    mm.add("(max-width: 860px)", () => {
      gsap.fromTo(
        ".stops-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "#stops", start: "top 70%", end: "bottom 70%", scrub: 0.6 },
        }
      );
      const cards = road.cards;
      cards.forEach((c) => c.classList.remove("is-on"));
      cards.forEach((c) =>
        ScrollTrigger.create({
          trigger: c,
          start: "top 72%",
          onEnter: () => c.classList.add("is-on"),
          onLeaveBack: () => c.classList.remove("is-on"),
        })
      );
      return () => cards.forEach((c) => c.classList.remove("is-on"));
    });
  }

  // =========================
  // DÉMARRAGE
  // =========================

  renderStatus();
  renderStops();
  renderMenu(current);
  buildPizza($("#pizza"));
  $$("[data-split]").forEach(splitChars);
  splitWords($(".manifesto-text"));
  setInterval(renderStatus, 60000);

  const road = initRoad();

  moveIndicator();
  requestAnimationFrame(() => tabsEl.classList.add("is-ready"));
  menuBlob.style.backgroundColor = catColor[current];
  window.addEventListener("resize", debounce(moveIndicator, 120));
  if (document.fonts) document.fonts.ready.then(moveIndicator);

  if (!motion) {
    // Version sans animation : tout est visible, le camion est garé à la dernière étape
    road.set(road.endL);
    root.classList.remove("intro");
    window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
    onScroll(window.scrollY);
    return;
  }

  root.classList.add("motion-on");
  gsap.registerPlugin(ScrollTrigger);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", (l) => {
      ScrollTrigger.update();
      onScroll(l.scroll);
      scrollVel = l.velocity;
      if (Math.abs(l.velocity) > 0.3 && l.direction) scrollDir = l.direction;
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  } else {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        scrollVel = y - lastY;
        if (y !== lastY) scrollDir = y > lastY ? 1 : -1;
        onScroll(y);
      },
      { passive: true }
    );
  }

  new Embers($('[data-embers="hero"]'), { interactive: finePointer, density: 0.55 });

  initMarquees();
  if (finePointer) initMagnetic();

  const intro = heroIntro();
  initScrollScenes(road);
  startIntro(intro);
})();
