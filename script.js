// =========================
// EMPLACEMENT DU JOUR
// =========================

const locations = {
  0: {
    location: "Aujourd'hui à Pont-Sainte-Maxence",
    hours: "18h – 22h",
  },

  1: {
    location: "Pas de passage aujourd'hui",
    hours: "Retrouvez-nous mercredi !",
  },

  2: {
    location: "Pas de passage aujourd'hui",
    hours: "Retrouvez-nous mercredi !",
  },

  3: {
    location: "Aujourd'hui à Béthisy-Saint-Martin",
    hours: "17h – 21h",
  },

  4: {
    location: "Aujourd'hui à Moru",
    hours: "18h – 21h",
  },

  5: {
    location: "Aujourd'hui à Cinqueux",
    hours: "17h – 21h",
  },

  6: {
    location: "Aujourd'hui à Saint-Sauveur",
    hours: "17h – 21h",
  },
};

const today = new Date().getDay();

const todayLocation = document.getElementById("today-location");
const todayHours = document.getElementById("today-hours");

todayLocation.textContent = locations[today].location;
todayHours.textContent = locations[today].hours;

// =========================
// CARTE DES PIZZAS
// =========================

const pizzas = {
  tomate: [
    {
      name: "Margherita",
      price: "8,50 €",
      ingredients: "Sauce tomate, mozzarella.",
    },
    {
      name: "Reine",
      price: "10 €",
      ingredients: "Sauce tomate, mozzarella, jambon, champignons.",
    },
    {
      name: "4 Fromages",
      price: "10 €",
      ingredients: "Sauce tomate, mozzarella, chèvre, bleu, emmental.",
    },
    {
      name: "Calzone (Soufflée)",
      price: "11 €",
      ingredients: "Sauce tomate, mozzarella, jambon, œuf.",
    },
    {
      name: "4 Saisons",
      price: "11 €",
      ingredients:
        "Sauce tomate, mozzarella, jambon, champignons, artichauts, olives noires, câpres.",
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
      ingredients:
        "Sauce tomate, mozzarella, chèvre, olives, crème fraîche, miel.",
    },
    {
      name: "Fermière",
      price: "11 €",
      ingredients: "Sauce tomate, mozzarella, pommes de terre, poulet.",
    },
    {
      name: "Orientale",
      price: "11,50 €",
      ingredients: "Sauce tomate, mozzarella, merguez, champignons, œuf.",
    },
    {
      name: "Campione",
      price: "11,50 €",
      ingredients: "Sauce tomate, mozzarella, lardons, œuf, viande hachée.",
    },
    {
      name: "Paysanne",
      price: "11,50 €",
      ingredients: "Sauce tomate, mozzarella, jambon, lardons, oignons, œuf.",
    },
    {
      name: "Espagnole",
      price: "11,50 €",
      ingredients: "Sauce tomate, mozzarella, chorizo, poivrons, olives.",
    },
    {
      name: "Mexicaine",
      price: "11,50 €",
      ingredients: "Sauce tomate, mozzarella, poulet, poivrons, champignons.",
    },
    {
      name: "Bolognaise",
      price: "11,50 €",
      ingredients:
        "Sauce tomate, mozzarella, viande hachée, pommes de terre, crème fraîche.",
    },
    {
      name: "Chef",
      price: "12 €",
      ingredients: "Sauce tomate, mozzarella, jambon, merguez, œuf.",
    },
    {
      name: "Royale",
      price: "12,50 €",
      ingredients:
        "Sauce tomate, mozzarella, jambon, merguez, poivrons, artichauts, œuf, olives.",
    },
    {
      name: "Spéciale",
      price: "12,50 €",
      ingredients:
        "Sauce tomate, mozzarella, chorizo, viande hachée, chèvre, poivrons, crème fraîche.",
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
      ingredients:
        "Sauce tomate, mozzarella, maroilles, lardons, oignons, pommes de terre, crème fraîche.",
    },
    {
      name: "Gourmande",
      price: "12,50 €",
      ingredients:
        "Sauce tomate, mozzarella, jambon, merguez, lardons, chorizo.",
    },
    {
      name: "Suprême BBQ",
      price: "13,50 €",
      ingredients:
        "Sauce tomate, mozzarella, pommes de terre, viande hachée, chorizo, merguez, poulet, sauce barbecue.",
    },
  ],

  creme: [
    {
      name: "Normande",
      price: "11 €",
      ingredients: "Crème fraîche, mozzarella, jambon, pommes de terre, œuf.",
    },
    {
      name: "Chicken",
      price: "11 €",
      ingredients: "Crème fraîche, mozzarella, pommes de terre, poulet.",
    },
    {
      name: "Milano",
      price: "11 €",
      ingredients: "Crème fraîche, mozzarella, poulet, chèvre.",
    },
    {
      name: "Norvégienne",
      price: "12 €",
      ingredients: "Crème fraîche, mozzarella, saumon fumé.",
    },
    {
      name: "Chèvre Lardons",
      price: "12,50 €",
      ingredients: "Crème fraîche, mozzarella, chèvre, lardons, oignons.",
    },
    {
      name: "Raclette",
      price: "12,50 €",
      ingredients:
        "Crème fraîche, mozzarella, jambon, chorizo, fromage à raclette, pommes de terre.",
    },
  ],

  pecheurs: [
    {
      name: "Napolitaine",
      price: "11 €",
      ingredients: "Sauce tomate, mozzarella, anchois, olives, câpres.",
    },
    {
      name: "Neptune",
      price: "11 €",
      ingredients: "Sauce tomate, mozzarella, thon, champignons, olives.",
    },
    {
      name: "Océane",
      price: "12 €",
      ingredients:
        "Sauce tomate, mozzarella, saumon fumé, crème fraîche, olives.",
    },
    {
      name: "Sicilienne",
      price: "13 €",
      ingredients:
        "Sauce tomate, mozzarella, anchois, saumon fumé, olives, câpres.",
    },
  ],
};

// =========================
// AFFICHAGE DES PIZZAS
// =========================

const pizzaMenu = document.getElementById("pizza-menu");
const menuTabs = document.querySelectorAll(".menu-tab");

function displayPizzas(category) {
  pizzaMenu.innerHTML = "";

  pizzas[category].forEach((pizza) => {
    const pizzaCard = document.createElement("div");

    pizzaCard.classList.add("pizza-card", category);

    pizzaCard.innerHTML = `
      <div class="pizza-top">
        <h3>${pizza.name}</h3>
        <span>${pizza.price}</span>
      </div>

      <p>${pizza.ingredients}</p>
    `;

    pizzaMenu.appendChild(pizzaCard);
  });
}

// Base tomate affichée au chargement
displayPizzas("tomate");

// =========================
// CHANGEMENT DE CATÉGORIE
// =========================

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    menuTabs.forEach((button) => {
      button.classList.remove("active");
    });

    tab.classList.add("active");

    const category = tab.dataset.category;

    displayPizzas(category);
  });
});
