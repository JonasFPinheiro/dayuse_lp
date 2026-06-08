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
     SHOWS — SUNDAY BLOCKS CAROUSEL
  ────────────────────────────────────── */
  const showsGrid   = document.getElementById('showsGrid');
  const showsPrev   = document.getElementById('showsPrev');
  const showsNext   = document.getElementById('showsNext');
  const showsLabel  = document.getElementById('showsLabel');
  const showsSelect = document.getElementById('showsWeekSelect');

  if (showsGrid) {
    const allBlocks = Array.from(showsGrid.querySelectorAll('.sunday-block'));
    const TOTAL     = allBlocks.length;
    let winStart    = 0;

    function renderWindow(animate) {
      allBlocks.forEach((block, i) => {
        const visible = i === winStart;
        if (visible) {
          block.classList.add('is-visible');
          if (animate) {
            block.style.opacity = '0';
            block.style.transform = 'translateY(10px)';
            setTimeout(() => {
              block.style.transition = 'opacity .3s ease, transform .3s ease';
              block.style.opacity = '1';
              block.style.transform = 'translateY(0)';
            }, 20);
          } else {
            block.style.opacity = '1';
            block.style.transform = 'translateY(0)';
          }
        } else {
          block.classList.remove('is-visible');
        }
      });

      if (showsPrev) showsPrev.disabled = winStart === 0;
      if (showsNext) showsNext.disabled = winStart >= TOTAL - 1;
      if (showsLabel) showsLabel.textContent = `Domingo ${winStart + 1} de ${TOTAL}`;
      if (showsSelect) showsSelect.value = '';
    }

    showsPrev?.addEventListener('click', () => {
      if (winStart > 0) { winStart--; renderWindow(true); }
    });
    showsNext?.addEventListener('click', () => {
      if (winStart < TOTAL - 1) { winStart++; renderWindow(true); }
    });
    showsSelect?.addEventListener('change', () => {
      const val = showsSelect.value;
      if (val === '') return;
      const idx = parseInt(val, 10);
      if (!isNaN(idx)) { winStart = idx; renderWindow(true); }
    });

    renderWindow(false);
  }

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
