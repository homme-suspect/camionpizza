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

  // Nom de la ville découpé en lettres pour l'animation d'entrée
  // (passage à la ligne possible après chaque tiret, nom lu en entier par les lecteurs d'écran)
  function renderTown(town) {
    const el = $("#today-location");
    if (el.dataset.town === town) return;
    el.dataset.town = town;
    let i = 0;
    const parts = town.split("-");
    const letters = parts
      .map((part, j) => {
        const seg = j < parts.length - 1 ? part + "-" : part;
        const chars = [...seg].map((c) => `<span class="ch" style="--i:${i++}">${c}</span>`).join("");
        return `<span class="seg">${chars}</span>`;
      })
      .join("​");
    el.innerHTML = `<span class="sr-only">${town}</span><span aria-hidden="true">${letters}</span>`;
    el.classList.add("is-split");
  }

  function render() {
    const st = getStatus();
    const box = $(".today");
    box.classList.toggle("is-open", st.state === "open");
    $("#today-kicker").textContent = st.label;
    renderTown(st.stop.town);
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
          <a class="day-map" href="${mapUrl(s)}" target="_blank" rel="noopener" aria-label="Itinéraire vers ${s.town}">
            <svg class="icon" aria-hidden="true"><use href="#i-pin" /></svg> Itinéraire
          </a>
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

  const titles = { tomate: "Base tomate", creme: "Base crème", pecheurs: "Pêcheurs" };
  const meat = /jambon|poulet|merguez|lardons|viande|chorizo|saumon|thon|anchois/i;

  $("#pizza-menu").innerHTML = Object.entries(pizzas)
    .map(
      ([cat, list]) => `
      <section class="category category-${cat} reveal" id="${cat}">
        <header class="category-head">
          <h3>${titles[cat]}</h3>
          <span>${list.length} pizzas</span>
        </header>
        <ul class="dishes">
          ${list
            .map(
              (p, i) => `
            <li class="dish" style="--i:${Math.min(i, 12)}">
              <div class="dish-top">
                <span class="dish-name">${p.name}</span>
                ${meat.test(p.ingredients) ? "" : '<span class="veg">Veggie</span>'}
                <span class="dish-price">${p.price}</span>
              </div>
              <p class="dish-ing">${p.ingredients}</p>
            </li>`
            )
            .join("")}
        </ul>
      </section>`
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

  // Pizza détaillée sur planche en bois. Chaque garniture est dans un groupe .top
  // pour pouvoir « tomber » sur la pizza à l'ouverture (voir style.css).
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
    // Place des points sans qu'ils se chevauchent trop
    const placed = [];
    const spot = (rMin, rMax, gap) => {
      for (let t = 0; t < 60; t++) {
        const p = polar(R(rMin, rMax), R(0, TAU));
        if (placed.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > gap)) {
          placed.push(p);
          return p;
        }
      }
      return polar(R(rMin, rMax), R(0, TAU));
    };

    let i = 0; // ordre d'apparition des garnitures
    let art = "";

    // Planche en bois
    art += `<circle r="306" fill="url(#pz-board)"/>`;
    for (let k = 0; k < 16; k++) {
      const r = 284 + k * 1.4;
      art += `<ellipse rx="${f(r)}" ry="${f(r * R(0.97, 1))}" transform="rotate(${f(R(0, 180))})" fill="none" stroke="#3a2210" stroke-opacity="${f(R(0.08, 0.2))}" stroke-width="${f(R(0.6, 1.6))}"/>`;
    }
    art += `<circle r="304" fill="none" stroke="#2c190b" stroke-opacity=".5" stroke-width="4"/>`;
    // farine sur la planche
    for (let k = 0; k < 70; k++) {
      const [x, y] = polar(R(272, 300), R(0, TAU));
      art += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R(0.6, 1.8))}" fill="#f4e6cc" opacity="${f(R(0.25, 0.6))}"/>`;
    }

    // Croûte
    art += `<path d="${blob(0, 0, 268, 4, 46)}" fill="url(#pz-crust)"/>`;
    art += `<path d="${blob(0, 0, 262, 3, 40)}" fill="none" stroke="#f7d79c" stroke-opacity=".35" stroke-width="5"/>`;
    // cloques de pâte avec le dessus grillé
    for (let k = 0; k < 22; k++) {
      const a = R(0, TAU);
      const [x, y] = polar(R(244, 262), a);
      const w = R(10, 22);
      const rot = f(deg(a) + 90);
      art += `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot})">
        <ellipse rx="${f(w)}" ry="${f(w * 0.45)}" fill="#f5cf8e" opacity=".55"/>
        <ellipse rx="${f(w * 0.45)}" ry="${f(w * 0.16)}" cy="${f(-w * 0.26)}" fill="url(#pz-char)" opacity=".7"/>
      </g>`;
    }
    // marques du feu de bois
    for (let k = 0; k < 46; k++) {
      const a = R(0, TAU);
      const [x, y] = polar(R(246, 268), a);
      const s = R(2.5, 8);
      art += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s)}" ry="${f(s * R(0.35, 0.6))}" opacity="${f(R(0.5, 0.85))}" transform="rotate(${f(deg(a) + 90)} ${f(x)} ${f(y)})" fill="url(#pz-char)"/>`;
    }
    // ombre au bord de la sauce
    art += `<circle r="234" fill="none" stroke="#5a2a0e" stroke-opacity=".45" stroke-width="12"/>`;

    // Sauce tomate
    art += `<path d="${blob(0, 0, 230, 6, 40)}" fill="url(#pz-sauce)"/>`;
    for (let k = 0; k < 14; k++) {
      const [x, y] = polar(R(20, 200), R(0, TAU));
      art += `<path d="M${f(x)} ${f(y)}q${f(R(-20, 20))} ${f(R(-12, 12))} ${f(R(-30, 30))} ${f(R(-10, 10))}" fill="none" stroke="#9a1a0c" stroke-opacity=".35" stroke-width="${f(R(2, 5))}" stroke-linecap="round"/>`;
    }
    for (let k = 0; k < 40; k++) {
      const [x, y] = polar(R(0, 222), R(0, TAU));
      art += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R(1.2, 3.8))}" fill="#e8553a" opacity=".5"/>`;
    }

    // Mozzarella fondue, dorée par endroits
    const cheeses = [[R(-8, 8), R(-8, 8), 44]];
    for (let k = 0; k < 6; k++) {
      const [x, y] = polar(R(100, 130), (k / 6) * TAU + R(-0.2, 0.2));
      cheeses.push([x, y, R(34, 44)]);
    }
    for (let k = 0; k < 7; k++) {
      const [x, y] = polar(R(178, 196), (k / 7) * TAU + 0.4 + R(-0.15, 0.15));
      cheeses.push([x, y, R(22, 30)]);
    }
    cheeses.forEach(([x, y, s]) => placed.push([x, y]));
    cheeses.forEach(([x, y, s]) => {
      let blisters = "";
      for (let j = 0; j < 4; j++) {
        blisters += `<circle cx="${f(x + R(-s / 1.8, s / 1.8))}" cy="${f(y + R(-s / 1.8, s / 1.8))}" r="${f(R(3, s / 3.2))}" fill="url(#pz-toast)"/>`;
      }
      art += `<g class="top" style="--i:${i++}">
        <path d="${blob(x, y, s + 3, s * 0.22, 10)}" fill="#e9c27a" opacity=".55"/>
        <path d="${blob(x, y, s, s * 0.2, 10)}" fill="url(#pz-cheese)"/>
        ${blisters}
        <path d="M${f(x - s * 0.45)} ${f(y - s * 0.3)}q${f(s * 0.3)} ${f(-s * 0.3)} ${f(s * 0.7)} ${f(-s * 0.15)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
      </g>`;
    });

    // Tomates cerises coupées en deux
    for (let k = 0; k < 7; k++) {
      const [x, y] = spot(60, 205, 46);
      let seeds = "";
      for (let j = 0; j < 3; j++) {
        const a = (j / 3) * TAU + 0.5;
        seeds += `<ellipse cx="${f(Math.cos(a) * 6)}" cy="${f(Math.sin(a) * 6)}" rx="3.6" ry="2.2" transform="rotate(${f(deg(a))} ${f(Math.cos(a) * 6)} ${f(Math.sin(a) * 6)})" fill="#ffd8a0" opacity=".9"/>`;
      }
      art += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(R(0, 360))})"><g class="top" style="--i:${i++}">
        <circle r="17" fill="#000" opacity=".18" cx="2" cy="3"/>
        <circle r="16" fill="url(#pz-tomato)"/>
        <circle r="12" fill="#f0603f"/>
        <circle r="4" fill="#ff8a6a"/>
        ${seeds}
        <path d="M-10 -9A14 14 0 0 1 4 -14" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>
      </g></g>`;
    }

    // Olives noires
    for (let k = 0; k < 8; k++) {
      const [x, y] = spot(40, 212, 34);
      art += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(R(0, 360))})"><g class="top" style="--i:${i++}">
        <circle r="11" fill="url(#pz-olive)"/>
        <ellipse rx="4.4" ry="3.8" fill="#6b1b0e"/>
        <path d="M-6 -5A8 8 0 0 1 3 -8" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/>
      </g></g>`;
    }

    // Feuilles de basilic
    const leaf = "M0 -32C18 -22 20 10 0 34C-20 10 -18 -22 0 -32Z";
    for (let k = 0; k < 8; k++) {
      const [x, y] = spot(30, 200, 40);
      art += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(R(0, 360))}) scale(${f(R(0.7, 1))})"><g class="top" style="--i:${i++}">
        <path d="${leaf}" fill="#000" opacity=".2" transform="translate(3 4)"/>
        <path d="${leaf}" fill="url(#pz-basil)"/>
        <path d="M0 -27V29M0 -14L9 -20M0 -4L-10 -11M0 7L10 0M0 17L-9 11" fill="none" stroke="#1b4a1f" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M-6 -18C-10 -6 -9 6 -4 16" fill="none" stroke="#b6e3a4" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/>
      </g></g>`;
    }

    // Origan
    let oregano = "";
    for (let k = 0; k < 90; k++) {
      const [x, y] = polar(R(0, 222), R(0, TAU));
      oregano += `<rect x="${f(x)}" y="${f(y)}" width="${f(R(1.5, 3.5))}" height="${f(R(1, 2))}" transform="rotate(${f(R(0, 180))} ${f(x)} ${f(y)})" fill="${rand() > 0.5 ? "#4a5a24" : "#6b7a32"}"/>`;
    }
    art += `<g class="herbs">${oregano}</g>`;

    // Filet d'huile d'olive
    for (let k = 0; k < 3; k++) {
      const [x, y] = polar(R(30, 120), R(0, TAU));
      art += `<path class="oil" d="M${f(x - 80)} ${f(y)}c30 -30 50 30 80 0s50 30 80 0" fill="none" stroke="#ffd25a" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" transform="rotate(${f(R(0, 180))} ${f(x)} ${f(y)})"/>`;
    }
    for (let k = 0; k < 16; k++) {
      const [x, y] = polar(R(20, 215), R(0, TAU));
      art += `<ellipse class="glint" cx="${f(x)}" cy="${f(y)}" rx="${f(R(2.5, 6))}" ry="${f(R(1.2, 2.4))}" transform="rotate(${f(R(0, 180))} ${f(x)} ${f(y)})" fill="#fff" opacity=".35"/>`;
    }

    // Découpe en 8 parts
    for (let k = 0; k < 8; k++) {
      const [x, y] = polar(236, ((22.5 + k * 45) * Math.PI) / 180);
      art += `<line x1="0" y1="0" x2="${f(x)}" y2="${f(y)}" stroke="#3d0f06" stroke-opacity=".3" stroke-width="2.4" stroke-linecap="round"/>`;
    }

    svg.innerHTML = `
      <defs>
        <radialGradient id="pz-board" cx="0" cy="0" r="306" gradientUnits="userSpaceOnUse">
          <stop offset=".85" stop-color="#9a6537"/><stop offset=".95" stop-color="#7a4b25"/><stop offset="1" stop-color="#4f2f15"/>
        </radialGradient>
        <radialGradient id="pz-crust" cx="0" cy="0" r="270" gradientUnits="userSpaceOnUse">
          <stop offset=".8" stop-color="#eebc72"/><stop offset=".88" stop-color="#dd9a50"/>
          <stop offset=".96" stop-color="#b86c2c"/><stop offset="1" stop-color="#7d3f17"/>
        </radialGradient>
        <radialGradient id="pz-sauce" cx="-.1" cy="-.1" r="1.05">
          <stop offset="0" stop-color="#e2492a"/><stop offset=".65" stop-color="#c72f19"/><stop offset="1" stop-color="#9a1d0f"/>
        </radialGradient>
        <radialGradient id="pz-cheese" cx=".4" cy=".35" r=".75">
          <stop offset="0" stop-color="#fffdf5"/><stop offset=".5" stop-color="#fdedc4"/><stop offset="1" stop-color="#efc57a"/>
        </radialGradient>
        <radialGradient id="pz-char">
          <stop offset="0" stop-color="#1c0b04" stop-opacity=".9"/><stop offset=".55" stop-color="#3b1a09" stop-opacity=".5"/>
          <stop offset="1" stop-color="#3b1a09" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="pz-toast">
          <stop offset="0" stop-color="#b8722c" stop-opacity=".75"/><stop offset=".6" stop-color="#d49a4c" stop-opacity=".35"/>
          <stop offset="1" stop-color="#d49a4c" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="pz-tomato" cx=".35" cy=".3" r=".8">
          <stop offset="0" stop-color="#ff5a3a"/><stop offset=".7" stop-color="#d9261a"/><stop offset="1" stop-color="#9c120b"/>
        </radialGradient>
        <linearGradient id="pz-basil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#67b85e"/><stop offset=".55" stop-color="#3a8a3c"/><stop offset="1" stop-color="#1c5422"/>
        </linearGradient>
        <radialGradient id="pz-olive" cx=".35" cy=".35" r=".75">
          <stop offset="0" stop-color="#55493f"/><stop offset="1" stop-color="#120f0d"/>
        </radialGradient>
      </defs>
      ${art}`;
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

  // =========================
  // AU SCROLL : la pizza tourne un peu plus, la barre de progression avance
  // =========================

  function initScroll() {
    const pizza = $(".hero-pizza");
    const bar = $(".progress");
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (pizza) pizza.style.setProperty("--r", (y * 0.15).toFixed(1));
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  // Grands titres découpés en lettres (elles montent une à une quand le titre apparaît)
  function splitTitle(h) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/( +)/).forEach((word) => {
          if (!word) return;
          if (!word.trim()) return frag.appendChild(document.createTextNode(" "));
          const w = document.createElement("span");
          w.className = "w";
          for (const c of word) {
            const ch = document.createElement("span");
            ch.className = "ch";
            ch.style.setProperty("--i", i++);
            ch.textContent = c;
            w.appendChild(ch);
          }
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      });
    };
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    walk(h);
    h.classList.add("split");
  }
  document.querySelectorAll("h2").forEach(splitTitle);

  // Le bandeau est doublé pour défiler sans trou, même sur grand écran
  const band = $(".band-track");
  if (band) band.innerHTML += band.innerHTML;

  buildPizza($("#pizza"));
  render();
  initReveal();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) initScroll();
  setInterval(render, 60000);
})();
