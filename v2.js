/* ahcarpinelli.me v2 */
document.addEventListener('DOMContentLoaded', () => {
  const cfgEl = document.getElementById('page-data');
  const cfg = cfgEl ? JSON.parse(cfgEl.textContent) : { faq: [], ui: {} };

  // --- Chat de preguntas ---
  const chips = document.querySelectorAll('.chip[data-q]');
  const qBubble = document.getElementById('chat-q');
  const aText = document.getElementById('chat-a');
  const aTag = document.getElementById('chat-tag');
  const showQ = (i) => {
    const item = cfg.faq[i];
    if (!item) return;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(Number(c.dataset.q) === i)));
    if (qBubble) qBubble.textContent = item.q;
    if (aText) aText.innerHTML = item.a;
    if (aTag) aTag.textContent = item.tag;
  };
  chips.forEach((c) => c.addEventListener('click', () => showQ(Number(c.dataset.q))));

  // --- Secciones con botones que siguen el scroll ---
  // Todas las secciones están una debajo de la otra: el scroll es 100 % nativo
  // y la barra de botones marca en cuál estás (y la centra en el celular).
  const tabs = Array.from(document.querySelectorAll('.tab[data-panel]'));
  const panels = Array.from(document.querySelectorAll('.panel'));
  const tabbar = document.querySelector('.tabbar');
  const tabRow = tabbar ? tabbar.querySelector('.wrap') : null;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  panels.forEach((p) => { p.hidden = false; });
  let current = -1;
  let lockSpyUntil = 0;

  const barH = () => (tabbar ? tabbar.offsetHeight : 0);
  const centerTab = (i) => {
    const t = tabs[i];
    if (!tabRow || !t || tabRow.scrollWidth <= tabRow.clientWidth) return;
    const left = t.offsetLeft - (tabRow.clientWidth / 2) + (t.clientWidth / 2);
    tabRow.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const setActive = (i) => {
    if (i === current || i < 0) return;
    current = i;
    const id = panels[i].id;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.panel === id)));
    centerTab(i);
  };
  const goTo = (id, smooth) => {
    const i = panels.findIndex((p) => p.id === id);
    if (i < 0) return;
    setActive(i);
    lockSpyUntil = Date.now() + (smooth ? 900 : 100);
    const top = panels[i].getBoundingClientRect().top + window.scrollY - barH() + 1;
    window.scrollTo({ top, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    try { history.replaceState(null, '', '#' + id); } catch (_) {}
  };
  tabs.forEach((t) => t.addEventListener('click', () => goTo(t.dataset.panel, true)));
  document.querySelectorAll('a[data-open]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    goTo(a.dataset.open, true);
  }));

  // Sección activa = la última cuyo inicio ya pasó por debajo de la barra (con un margen de un tercio de pantalla)
  const spy = () => {
    if (Date.now() < lockSpyUntil) return;
    const line = barH() + window.innerHeight * 0.33;
    let idx = 0;
    panels.forEach((p, k) => { if (p.getBoundingClientRect().top <= line) idx = k; });
    // Si llegaste al final de la página, el último botón queda activo
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = panels.length - 1;
    setActive(idx);
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; spy(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('scrollend', () => { lockSpyUntil = 0; spy(); });

  const initial = location.hash.replace('#', '');
  if (initial && panels.some((p) => p.id === initial)) {
    requestAnimationFrame(() => goTo(initial, false));
  } else {
    setActive(0);
    spy();
  }

  // Aparición suave de cada sección al entrar en pantalla
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    document.querySelectorAll('.panel-head, .stage, .proj-feat, .proj, .tb-card, .personal').forEach((el) => io.observe(el));
  }

  // --- Formulario "Abrir un ticket" (EmailJS) ---
  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: 'CXBpX082XDWf9BDPi' });
  const form = document.getElementById('ticket-form');
  const msg = document.getElementById('ticket-msg');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = cfg.ui.sending || '...'; }
      if (msg) { msg.textContent = ''; msg.className = 'ticket-msg'; }
      const params = {
        nombre: form.nombre.value,
        email: form.email.value,
        telefono: form.telefono.value || '-',
        empresa: form.empresa.value || '-',
        mensaje: form.mensaje.value
      };
      const send = typeof emailjs !== 'undefined'
        ? emailjs.send('service_tcbitno', 'template_y5n82i7', params)
        : Promise.reject(new Error('emailjs no cargó'));
      send.then(() => {
        form.reset();
        if (msg) { msg.textContent = cfg.ui.sent || 'OK'; msg.className = 'ticket-msg ok'; }
      }).catch((err) => {
        console.error(err);
        if (msg) { msg.textContent = cfg.ui.error || 'Error'; msg.className = 'ticket-msg err'; }
      }).finally(() => {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  }
});
