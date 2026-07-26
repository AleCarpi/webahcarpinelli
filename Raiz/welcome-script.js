const translations = {
  es: {
    text: "Bienvenido a mi CV. Si estás aquí es porque quieres saber más de mí.",
    ask: "¿En qué idioma quieres que hablemos?"
  },
  pt: {
    text: "Bem-vindo ao meu CV. Se você está aqui, é porque quer saber mais sobre mim.",
    ask: "Em qual idioma você prefere conversar?"
  },
  fr: {
    text: "Bienvenue sur mon CV. Si vous êtes ici, c'est que vous souhaitez en savoir plus sur moi.",
    ask: "Dans quelle langue souhaitez-vous échanger ?"
  },
  en: {
    text: "Welcome to my CV. If you are here, it's because you want to know more about me.",
    ask: "Which language would you like to speak?"
  }
};

const keys = ['es', 'pt', 'en', 'fr'];
let currentIndex = 0;
let autoRotateInterval = null;

const slider = document.getElementById('msg-slider');
const dynamicText = document.getElementById('dynamic-text');
const dynamicAsk = document.getElementById('dynamic-ask');
const langCards = document.querySelectorAll('.lang-card');

function updateMessage(langKey) {
  // 1. Deslizar hacia la izquierda y desaparecer
  slider.classList.add('slide-out');

  setTimeout(() => {
    // 2. Cambiar textos y posicionar invisible a la derecha
    dynamicText.textContent = translations[langKey].text;
    dynamicAsk.textContent = translations[langKey].ask;

    langCards.forEach(card => {
      if (card.dataset.lang === langKey) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    slider.classList.remove('slide-out');
    slider.classList.add('slide-prepare');

    // 3. Deslizar suavemente desde la derecha al centro
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slider.classList.remove('slide-prepare');
      });
    });
  }, 350);
}

function startAutoRotate() {
  stopAutoRotate();
  autoRotateInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % keys.length;
    updateMessage(keys[currentIndex]);
  }, 4000);
}

function stopAutoRotate() {
  if (autoRotateInterval) clearInterval(autoRotateInterval);
}

langCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    stopAutoRotate();
    const lang = card.dataset.lang;
    if (keys[currentIndex] !== lang) {
      currentIndex = keys.indexOf(lang);
      updateMessage(lang);
    }
  });

  card.addEventListener('mouseleave', () => {
    startAutoRotate();
  });
});

// Iniciar
startAutoRotate();