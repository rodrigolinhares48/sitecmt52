(() => {
  'use strict';

  const body = document.body;
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const dropdownButtons = document.querySelectorAll('[data-dropdown-toggle]');
  const backToTop = document.querySelector('[data-back-to-top]');
  const page = body.dataset.page || '';

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    body.classList.remove('menu-open');
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
      body.classList.toggle('menu-open', !expanded);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  dropdownButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      if (window.matchMedia('(max-width: 1060px)').matches) {
        event.preventDefault();
        const item = button.closest('.nav__item');
        if (!item) return;
        document.querySelectorAll('.nav__item.is-expanded').forEach((other) => {
          if (other !== item) {
            other.classList.remove('is-expanded');
            other.querySelector('[data-dropdown-toggle]')?.setAttribute('aria-expanded', 'false');
          }
        });
        const open = item.classList.toggle('is-expanded');
        button.setAttribute('aria-expanded', String(open));
      }
    });
  });

  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (!window.matchMedia('(max-width: 1060px)').matches) closeMenu(); });

  document.querySelectorAll('[data-nav-page]').forEach((link) => {
    const linkPage = link.dataset.navPage;
    const active = linkPage === page || (page.startsWith('institucional-') && linkPage === 'institucional') || (page.startsWith('organizacao-') && linkPage === 'organizacao');
    if (active) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  if (backToTop) {
    const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('.filter-bar').forEach((bar) => {
    const filterButtons = bar.querySelectorAll('[data-filter]');
    const scope = bar.parentElement || document;
    const filterItems = scope.querySelectorAll('[data-category]');
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;
        filterButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
        filterItems.forEach((item) => {
          item.hidden = !(filter === 'todos' || item.dataset.category === filter);
        });
      });
    });
  });

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const status = document.querySelector('[data-form-status]');
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      if (status) {
        status.textContent = 'Mensagem validada. Para realizar o envio, conecte este formulário a um serviço de formulários ou ao backend da escola.';
        status.classList.add('is-visible');
      }
    });
  }

  // Calendar viewer
  const calendarImage = document.querySelector('[data-calendar-image]');
  if (calendarImage) {
    const total = 15;
    let current = 1;
    const currentLabel = document.querySelector('[data-calendar-current]');
    const prev = document.querySelector('[data-calendar-prev]');
    const next = document.querySelector('[data-calendar-next]');
    const thumbs = [...document.querySelectorAll('[data-calendar-page]')];
    const update = (pageNumber) => {
      current = Math.min(total, Math.max(1, pageNumber));
      calendarImage.style.opacity = '0.25';
      window.setTimeout(() => {
        calendarImage.src = `assets/images/calendario/pagina-${String(current).padStart(2, '0')}.webp`;
        calendarImage.alt = `Página ${current} do calendário letivo`;
        calendarImage.style.opacity = '1';
      }, 120);
      if (currentLabel) currentLabel.textContent = String(current);
      if (prev) prev.disabled = current === 1;
      if (next) next.disabled = current === total;
      thumbs.forEach((thumb) => thumb.classList.toggle('is-active', Number(thumb.dataset.calendarPage) === current));
    };
    prev?.addEventListener('click', () => update(current - 1));
    next?.addEventListener('click', () => update(current + 1));
    thumbs.forEach((thumb) => thumb.addEventListener('click', () => update(Number(thumb.dataset.calendarPage))));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') update(current - 1);
      if (event.key === 'ArrowRight') update(current + 1);
    });
    update(1);
  }

  // Native share helpers for news pages
  document.querySelectorAll('[data-share]').forEach((button) => {
    button.addEventListener('click', async () => {
      const mode = button.dataset.share;
      const url = window.location.href;
      const title = document.title;
      if (mode === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank', 'noopener');
      } else if (mode === 'copy') {
        try {
          await navigator.clipboard.writeText(url);
          const original = button.textContent;
          button.textContent = 'Link copiado';
          window.setTimeout(() => { button.textContent = original; }, 1800);
        } catch (_) {
          window.prompt('Copie o link:', url);
        }
      }
    });
  });

  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
