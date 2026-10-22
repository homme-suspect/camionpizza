// =========================
// CAMION PIZZA — version simple
// =========================

(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const f = (v) => Math.round(v * 10) / 10;

  // =========================
  // LA TOURNÉE
  // spot : où se gare le camion · map : adresse ouverte par le bouton Itinéraire
  // =========================

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

  // Où est le camion maintenant, ce soir, ou au prochain passage
  function getStatus(now = new Date()) {
    const d = now.getDay();
    const h = now.getHours() + now.getMinutes() / 60;
    const today = schedule.find((s) => s.day === d);

    if (today && h < today.close) {
      if (h >= today.open) {
        return { state: "open", stop: today, label: "Le camion est ouvert", hours: `Jusqu’à ${today.close}h` };
      }
      return { state: "tonight", stop: today, label: "Ce soir", hours: hoursOf(today) };
    }
    for (let i = 1; i <= 7; i++) {
      const s = schedule.find((x) => x.day === (d + i) % 7);
      if (s) {
        const label = i === 1 ? "Demain soir" : `Prochain passage : ${s.name.toLowerCase()}`;
        return { state: "next", stop: s, label, hours: hoursOf(s) };
      }
    }
  }

  function render() {
    const st = getStatus();
    const box = $(".today");
    box.classList.toggle("is-open", st.state === "open");
    $("#today-kicker").textContent = st.label;
    $("#today-location").textContent = st.stop.town;
    $("#today-hours").textContent = st.hours;
    const map = $("#today-map");
    map.href = mapUrl(st.stop);
    map.setAttribute("aria-label", `Itinéraire vers ${st.stop.town}`);

    $("#week").innerHTML = schedule
      .map((s) => {
        const hot = s === st.stop;
        const tag = hot ? (st.state === "next" ? "Prochain" : "Aujourd’hui") : "";
        return `
        <li class="day${hot ? " is-today" : ""}">
          <p class="day-name">${s.name}${tag ? ` <strong>${tag}</strong>` : ""}</p>
          <p class="day-town">${s.town}</p>
          <p class="day-hours">${hoursOf(s)}</p>
          <a class="day-map" href="${mapUrl(s)}" target="_blank" rel="noopener" aria-label="Itinéraire vers ${s.town}">📍 Itinéraire</a>
        </li>`;
      })
      .join("");
  }

  // =========================
  // LA CARTE
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

  const titles = { tomate: "Base tomate", creme: "Base crème", pecheurs: "Pizzas pêcheurs" };

  $("#pizza-menu").innerHTML = Object.entries(pizzas)
    .map(
      ([cat, list]) => `
      <div class="category category-${cat} reveal" id="${cat}">
        <h3>${titles[cat]}</h3>
        <ul class="dishes">
          ${list
            .map(
              (p) => `
            <li class="dish">
              <div class="dish-top"><span class="dish-name">${p.name}</span><span class="dish-price">${p.price}</span></div>
              <p class="dish-ing">${p.ingredients}</p>
            </li>`
            )
            .join("")}
        </ul>
      </div>`
    )
    .join("");

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
  // APPARITIONS DOUCES AU SCROLL
  // =========================

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  buildPizza($("#pizza"));
  render();
  initReveal();
  setInterval(render, 60000);
})();
