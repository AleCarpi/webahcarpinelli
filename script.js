document.addEventListener('DOMContentLoaded', () => {

  // 1. INICIALIZAR EMAILJS DE FORMA SEGURA
  if (typeof emailjs !== 'undefined') {
    emailjs.init({
      publicKey: "CXBpX082XDWf9BDPi",
    });
    console.log("EmailJS inicializado correctamente.");
  } else {
    console.error("EmailJS SDK no se encuentra cargado en la página.");
  }

  // Seleccionamos TODOS los botones que tengan la clase .btn-contacto-modal
  const botonesContacto = document.querySelectorAll('.btn-contacto-modal');
  const modalContacto = document.getElementById('modal-contacto');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');
  const pageContent = document.getElementById('page-content');

  const step1 = document.getElementById('modal-step-1');
  const step2 = document.getElementById('modal-step-2');
  const step3 = document.getElementById('modal-step-3');

  const btnOpcionEmail = document.getElementById('btn-opcion-email');
  const btnVolverModal = document.getElementById('btn-volver-modal');
  const contactForm = document.getElementById('contact-form');
  const countdownTimer = document.getElementById('countdown-timer');

  let countdownInterval = null;

  // Resetea el modal y limpia el formulario
  const resetModal = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    if (contactForm) contactForm.reset();
       
    if (step1) step1.classList.add('active');
    if (step2) step2.classList.remove('active');
    if (step3) step3.classList.remove('active');
  };

  // Abrir Modal
  const abrirModal = () => {
    resetModal();
    if (modalContacto) modalContacto.classList.add('active');
    if (pageContent) pageContent.classList.add('blurred');
  };

  // Cerrar Modal
  const cerrarModal = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    if (modalContacto) modalContacto.classList.remove('active');
    if (pageContent) pageContent.classList.remove('blurred');
  };

  // Evento para cerrar el modal desde el botón X
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
  }

  // ASIGNAR EVENTO A TODOS LOS BOTONES DE CONTACTO DE LA PÁGINA (INCLUIDA LA BARRA MÓVIL)
  botonesContacto.forEach(boton => {
    boton.addEventListener('click', abrirModal);
  });

  // Navegación entre pasos
  if (btnOpcionEmail) {
    btnOpcionEmail.addEventListener('click', () => {
      if (step1) step1.classList.remove('active');
      if (step2) step2.classList.add('active');
    });
  }

  if (btnVolverModal) {
    btnVolverModal.addEventListener('click', () => {
      if (step2) step2.classList.remove('active');
      if (step1) step1.classList.add('active');
    });
  }

  // Manejo del Envío del Formulario con EmailJS
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("Formulario enviado. Iniciando proceso con EmailJS...");

      const btnSubmit = contactForm.querySelector('.btn-submit-form');
      const textoOriginalBtn = btnSubmit ? btnSubmit.textContent : 'Enviar Email';
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Enviando...';
      }

      // Parámetros capturados directamente
      const templateParams = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        empresa: document.getElementById('empresa').value,
        mensaje: document.getElementById('mensaje').value,
      };

      emailjs.send('service_tcbitno', 'template_y5n82i7', templateParams)
        .then((response) => {
          console.log('¡ÉXITO al enviar con EmailJS!', response.status, response.text);
          if (step2) step2.classList.remove('active');
          if (step3) step3.classList.add('active');

          let secondsLeft = 3;
          if (countdownTimer) countdownTimer.textContent = secondsLeft;

          countdownInterval = setInterval(() => {
            secondsLeft--;
            if (countdownTimer) countdownTimer.textContent = secondsLeft;

            if (secondsLeft <= 0) {
              clearInterval(countdownInterval);
              cerrarModal();
            }
          }, 1000);
        })
        .catch((error) => {
          console.error('Error capturado en EmailJS:', error);
          alert('Hubo un error al enviar el correo. Revisa la consola para más detalle.');
        })
        .finally(() => {
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginalBtn;
          }
        });
    });
  }

  // ==========================================
  // SCROLLSPY DUAL (ESCRITORIO + MOBILE)
  // ==========================================

  const sections = document.querySelectorAll('.cv-section-card');
  const desktopLinks = document.querySelectorAll('.cv-menu-link');
  const mobileLinks = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item');

  const updateActiveMenu = () => {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    // Limpiar clases activas
    desktopLinks.forEach(link => link.classList.remove('active'));
    mobileLinks.forEach(link => {
      if (!link.classList.contains('btn-contacto-modal')) {
        link.classList.remove('active');
      }
    });

    let currentSectionId = '';

    // 1. SI ESTAMOS AL FINAL DE LA PÁGINA
    if (scrollPosition + windowHeight >= fullHeight - 100) {
      currentSectionId = 'contacto-final';
    } else {
      // 2. BUSCAR QUÉ SECCIÓN ESTÁ EN PANTALLA
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 140;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });
    }

    if (currentSectionId) {
      // Activar menú de escritorio
      desktopLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });

      // Activar menú de mobile según corresponda
      mobileLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentSectionId === 'sobre-mi' && href === '#sobre-mi') {
          link.classList.add('active');
        } else if ((currentSectionId === 'brasil' || currentSectionId === 'francia' || currentSectionId === 'argentina') && href === '#brasil') {
          link.classList.add('active');
        } else if (currentSectionId === 'intereses' && href === '#intereses') {
          link.classList.add('active');
        }
      });
    }
  };

  // Escuchar evento de scroll
  window.addEventListener('scroll', updateActiveMenu, { passive: true });
  updateActiveMenu();

});