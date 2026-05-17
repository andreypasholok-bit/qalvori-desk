const cartKey = "qalvoriCart";
const cookieKey = "qalvoriCookieChoice";
const analyticsKey = "qalvoriAnalyticsLocal";

const money = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(cartKey, JSON.stringify(items));
}

function updateCartUi() {
  const list = document.querySelector("#cart-items");
  const total = document.querySelector("#cart-total");
  const status = document.querySelector("#cart-status");

  if (!list || !total || !status) {
    return;
  }

  const items = getCart();
  list.innerHTML = "";

  if (items.length === 0) {
    status.textContent = "Noch kein Produkt ausgewählt.";
  } else {
    status.textContent = `${items.length} Produkt${items.length === 1 ? "" : "e"} im Warenkorb.`;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name}: ${money.format(item.price)}`;
    list.append(li);
  });

  const sum = items.reduce((totalPrice, item) => totalPrice + Number(item.price), 0);
  total.textContent = money.format(sum);
}

function markInvalid(field, invalid) {
  field.setAttribute("aria-invalid", invalid ? "true" : "false");
}

function validateForm(form) {
  const requiredFields = [...form.querySelectorAll("[required]")];
  let isValid = true;

  requiredFields.forEach((field) => {
    const invalid = field.type === "checkbox" ? !field.checked : !field.value.trim();
    markInvalid(field, invalid);
    if (invalid) {
      isValid = false;
    }
  });

  const email = form.querySelector('input[type="email"]');
  if (email && email.value.trim() && !email.checkValidity()) {
    markInvalid(email, true);
    isValid = false;
  }

  return isValid;
}

function playBrandSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const status = document.querySelector("#sound-status");

  if (!AudioContext) {
    if (status) {
      status.textContent = "Audio wird von diesem Browser nicht unterstützt.";
    }
    return;
  }

  const context = new AudioContext();
  const notes = [440, 554.37, 659.25, 880];
  const now = context.currentTime;

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(context.destination);

    const start = now + index * 0.13;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
    oscillator.start(start);
    oscillator.stop(start + 0.14);
  });

  if (status) {
    status.textContent = "Markenklang wurde abgespielt.";
  }
}

function initNavigation() {
  const nav = document.querySelector(".main-nav");
  const toggle = document.querySelector(".nav-toggle");

  if (!nav || !toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function initCart() {
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const items = getCart();
      items.push({
        name: button.dataset.name,
        price: Number(button.dataset.price)
      });
      setCart(items);
      updateCartUi();
    });
  });

  const clear = document.querySelector("#clear-cart");
  if (clear) {
    clear.addEventListener("click", () => {
      setCart([]);
      updateCartUi();
    });
  }

  const checkout = document.querySelector("#checkout-form");
  if (checkout) {
    checkout.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = document.querySelector("#checkout-message");
      const cart = getCart();

      if (cart.length === 0) {
        message.textContent = "Bitte wählen Sie zuerst ein Produkt aus.";
        return;
      }

      if (!validateForm(checkout)) {
        message.textContent = "Bitte füllen Sie die Pflichtfelder korrekt aus.";
        return;
      }

      message.textContent = "Bestellung erfolgreich simuliert. Es wurden keine Daten versendet.";
      setCart([]);
      updateCartUi();
      checkout.reset();
    });
  }

  updateCartUi();
}

function initContactForm() {
  const form = document.querySelector("#contact-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.querySelector("#contact-message");

    if (!validateForm(form)) {
      message.textContent = "Bitte füllen Sie die Pflichtfelder korrekt aus.";
      return;
    }

    message.textContent = "Nachricht wurde simuliert. Es wurden keine Daten versendet.";
    form.reset();
  });
}

function initCookieBanner() {
  const banner = document.querySelector("#cookie-banner");

  if (!banner || localStorage.getItem(cookieKey)) {
    return;
  }

  banner.hidden = false;

  banner.querySelectorAll("[data-cookie-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.cookieChoice;
      localStorage.setItem(cookieKey, choice);
      if (choice === "analytics") {
        localStorage.setItem(analyticsKey, JSON.stringify({ enabled: true, date: new Date().toISOString() }));
      }
      banner.hidden = true;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initCart();
  initContactForm();
  initCookieBanner();

  document.querySelectorAll("#brand-sound").forEach((button) => {
    button.addEventListener("click", playBrandSound);
  });
});
