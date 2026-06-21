/* ════════════════════════════════════════
   Domingos de Praia — script.js
════════════════════════════════════════ */
(function () {
  'use strict';

  /* ──────────────────────────────────────
     HERO CAROUSEL + CAPTIONS
  ────────────────────────────────────── */
  const hSlides   = document.querySelectorAll('.hero__slide');
  const hDots     = document.querySelectorAll('.hero__dot');
  const hTitle    = document.querySelector('.hero__title');
  const hCaptions = [
    'A roda de pagode que aquece a tarde',
    'Quando a luz cai, a praia continua viva',
    'O Palco Praia — só nos dias mais especiais',
  ];
  let hi = 0, hTimer;

  function heroGo(n) {
    hSlides[hi].classList.remove('is-active');
    hDots[hi].classList.remove('is-active');
    hi = (n + hSlides.length) % hSlides.length;
    hSlides[hi].classList.add('is-active');
    hDots[hi].classList.add('is-active');
    if (hTitle) {
      hTitle.style.opacity = '0';
      setTimeout(() => { hTitle.textContent = hCaptions[hi]; hTitle.style.opacity = '1'; }, 250);
    }
  }

  function heroTimer() { clearInterval(hTimer); hTimer = setInterval(() => heroGo(hi + 1), 6000); }

  if (hSlides.length) {
    if (hTitle) hTitle.textContent = hCaptions[0];
    document.querySelector('.hero__arrow--prev')?.addEventListener('click', () => { heroGo(hi - 1); heroTimer(); });
    document.querySelector('.hero__arrow--next')?.addEventListener('click', () => { heroGo(hi + 1); heroTimer(); });
    hDots.forEach((d, i) => d.addEventListener('click', () => { heroGo(i); heroTimer(); }));
    heroTimer();
  }

  /* ──────────────────────────────────────
     NAV — scroll + mobile toggle
  ────────────────────────────────────── */
  const nav      = document.getElementById('nav');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ──────────────────────────────────────
     STICKY BAR
  ────────────────────────────────────── */
  const stickyBar   = document.getElementById('stickyBar');
  const heroSection = document.getElementById('hero');
  if (stickyBar && heroSection) {
    new IntersectionObserver((entries) => {
      stickyBar.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(heroSection);
  }

  /* ──────────────────────────────────────
     SCROLL ANIMATIONS
  ────────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  /* ──────────────────────────────────────
     ATIVIDADES STAGGER
  ────────────────────────────────────── */
  const atividadesGrid = document.querySelector('.atividades__grid');
  if (atividadesGrid) {
    const atvEls = atividadesGrid.querySelectorAll('.atividade');
    atvEls.forEach(a => {
      a.style.opacity = '0';
      a.style.transform = 'translateY(14px)';
      a.style.transition = 'opacity .45s ease, transform .45s ease';
    });
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        atvEls.forEach((a, i) => setTimeout(() => {
          a.style.opacity = '1';
          a.style.transform = 'translateY(0)';
        }, i * 70));
      }
    }, { threshold: 0.1 }).observe(atividadesGrid);
  }

  /* ──────────────────────────────────────
     SHOWS — AUTO-EXPIRE SUNDAY BLOCKS
  ────────────────────────────────────── */
  (function () {
    function expUTC(s) {
      const [y, m, d] = s.split('-').map(Number);
      return Date.UTC(y, m - 1, d + 1, 3, 0, 0); /* 00:00 BRT (UTC-3) = 03:00 UTC */
    }
    const now = Date.now();
    let remaining = 0;
    document.querySelectorAll('.sunday-block').forEach(block => {
      const mt = (block.dataset.search || '').match(/^(\d{2})\/(\d{2})/);
      if (!mt) return;
      if (now >= expUTC(`2026-${mt[2]}-${mt[1]}`)) {
        block.remove();
      } else {
        remaining++;
      }
    });
    const showsGrid = document.querySelector('.shows__grid');
    if (showsGrid && remaining === 1) showsGrid.classList.add('shows__grid--solo');
    /* Reload when the next block expires */
    const nextExp = [...document.querySelectorAll('.sunday-block')]
      .map(b => { const mt = (b.dataset.search || '').match(/^(\d{2})\/(\d{2})/); return mt ? expUTC(`2026-${mt[2]}-${mt[1]}`) : Infinity; })
      .filter(t => t > now).sort((a, b) => a - b)[0];
    if (nextExp && isFinite(nextExp)) setTimeout(() => location.reload(), nextExp - now);
  })();

  /* ──────────────────────────────────────
     FAQ ACCORDION
  ────────────────────────────────────── */
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__a');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(open => {
        open.setAttribute('aria-expanded', 'false');
        open.closest('.faq__item').querySelector('.faq__a').setAttribute('hidden', '');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });

  /* ──────────────────────────────────────
     SMOOTH SCROLL
  ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id     = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    });
  });

  /* ── NAV-SWITCH: hide when cross-sell is visible ── */
  const navSwitchEl = document.getElementById('navSwitch');
  const crossSellEl = document.getElementById('cross-sell');
  if (navSwitchEl && crossSellEl) {
    new IntersectionObserver((entries) => {
      navSwitchEl.classList.toggle('nav-switch--hidden', entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(crossSellEl);
  }

})();
