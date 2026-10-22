// =========================
// CAMION PIZZA — version simple
// =========================

(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);

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
      <div class="category category-${cat}" id="${cat}">
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

  render();
  setInterval(render, 60000);
})();
