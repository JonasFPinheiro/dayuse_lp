/* ════════════════════════════════════════
   Dia na Praia — script-dayuse.js
════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── DAY USE HERO CAROUSEL + CAPTIONS ── */
  const duSlides   = document.querySelectorAll('.du-hero__slide');
  const duDots     = document.querySelectorAll('.du-hero__dot');
  const duTitle    = document.querySelector('.du-hero__title');
  const duCaptions = [
    'O litoral brasiliense é logo ali',
    'Movimente o corpo na areia',
    'Descanse, respire, aproveite o dia',
  ];
  let duI = 0, duCarouselTimer;

  function duHeroGo(n) {
    duSlides[duI].classList.remove('is-active');
    duDots[duI].classList.remove('is-active');
    duI = (n + duSlides.length) % duSlides.length;
    duSlides[duI].classList.add('is-active');
    duDots[duI].classList.add('is-active');
    if (duTitle) {
      duTitle.style.opacity = '0';
      setTimeout(() => { duTitle.textContent = duCaptions[duI]; duTitle.style.opacity = '1'; }, 250);
    }
  }
  function duHeroTimer() { clearInterval(duCarouselTimer); duCarouselTimer = setInterval(() => duHeroGo(duI + 1), 6000); }

  if (duSlides.length) {
    if (duTitle) duTitle.textContent = duCaptions[0];
    document.querySelector('.du-hero__arrow--prev')?.addEventListener('click', () => { duHeroGo(duI - 1); duHeroTimer(); });
    document.querySelector('.du-hero__arrow--next')?.addEventListener('click', () => { duHeroGo(duI + 1); duHeroTimer(); });
    duDots.forEach((d, i) => d.addEventListener('click', () => { duHeroGo(i); duHeroTimer(); }));
    duHeroTimer();
  }

  /* ── NAV SCROLL ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
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

  /* ── STICKY BAR ── */
  const stickyBar = document.getElementById('stickyBar');
  const heroEl    = document.querySelector('.du-hero');
  if (stickyBar && heroEl) {
    new IntersectionObserver((entries) => {
      stickyBar.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(heroEl);
  }

  /* ── SCROLL ANIMATIONS ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__a');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(open => {
        open.setAttribute('aria-expanded', 'false');
        open.closest('.faq__item').querySelector('.faq__a').setAttribute('hidden', '');
      });
      if (!isOpen) { btn.setAttribute('aria-expanded', 'true'); answer.removeAttribute('hidden'); }
    });
  });

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    });
  });

  /* ── DAYUSE TICKET WINDOW + SEARCH ── */
  const allCards    = Array.from(document.querySelectorAll('.du-card'));
  const grid        = document.getElementById('duGrid');
  const prevBtn     = document.getElementById('duPrev');
  const nextBtn     = document.getElementById('duNext');
  const weekLabel   = document.getElementById('duWeekLabel');
  const searchInput = document.getElementById('duSearch');
  const searchClear = document.getElementById('duSearchClear');
  const searchMeta  = document.getElementById('duSearchMeta');
  const emptyState  = document.getElementById('duEmpty');
  const termEl      = document.getElementById('duTerm');
  const clearBtn    = document.getElementById('duClearBtn');

  if (!grid || !allCards.length) return;

  const maxWeek  = Math.max(...allCards.map(c => +c.dataset.week));
  let currentWeek = 1;
  let isSearching = false;

  function cardsPerView() { return window.innerWidth < 720 ? 1 : 2; }

  function normalize(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function showWeek(week) {
    isSearching = false;
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.hidden = true;
    if (searchMeta)  searchMeta.textContent = '';
    if (emptyState)  emptyState.hidden = true;

    const n         = cardsPerView();
    const weekCards = allCards.filter(c => +c.dataset.week === week);

    allCards.forEach(c => { c.style.display = 'none'; });
    weekCards.forEach((c, i) => {
      c.style.display = '';
      c.style.opacity = '0';
      c.style.transform = 'translateY(10px)';
      setTimeout(() => {
        c.style.transition = 'opacity .3s ease, transform .3s ease';
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      }, i * 60 + 20);
    });

    if (prevBtn)   prevBtn.disabled   = week <= 1;
    if (nextBtn)   nextBtn.disabled   = week >= maxWeek;
    if (weekLabel) weekLabel.textContent = `Semana ${week} de ${maxWeek}`;
    currentWeek = week;
  }

  function filterCards() {
    const raw   = searchInput?.value.trim() ?? '';
    const query = normalize(raw);
    if (searchClear) searchClear.hidden = !raw;

    if (!query) { showWeek(currentWeek); return; }
    isSearching = true;

    let count = 0;
    allCards.forEach(c => {
      const hit = normalize(c.dataset.search || '').includes(query);
      c.style.display = hit ? '' : 'none';
      if (hit) count++;
    });

    if (emptyState) emptyState.hidden = count > 0;
    if (termEl)     termEl.textContent = raw;
    if (searchMeta) {
      searchMeta.textContent = count > 0
        ? `${count} data${count > 1 ? 's' : ''} encontrada${count > 1 ? 's' : ''}`
        : '';
    }
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (weekLabel) weekLabel.textContent = count > 0 ? `${count} data${count > 1 ? 's' : ''} encontrada${count > 1 ? 's' : ''}` : 'Sem resultados';
  }

  function clearSearch() {
    if (searchInput) searchInput.value = '';
    filterCards();
    showWeek(currentWeek);
    searchInput?.focus();
  }

  prevBtn?.addEventListener('click', () => showWeek(currentWeek - 1));
  nextBtn?.addEventListener('click', () => showWeek(currentWeek + 1));
  searchInput?.addEventListener('input', filterCards);
  searchClear?.addEventListener('click', clearSearch);
  clearBtn?.addEventListener('click', clearSearch);
  window.addEventListener('resize', () => { if (!isSearching) showWeek(currentWeek); });

  showWeek(1);

  /* ── NAV-SWITCH: hide when cross-sell is visible ── */
  const navSwitchEl  = document.getElementById('navSwitch');
  const crossSellEl  = document.getElementById('cross-sell');
  if (navSwitchEl && crossSellEl) {
    new IntersectionObserver((entries) => {
      navSwitchEl.classList.toggle('nav-switch--hidden', entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(crossSellEl);
  }

})();
