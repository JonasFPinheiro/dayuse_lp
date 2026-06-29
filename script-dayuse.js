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

  /* ── STICKY BAR (context-aware: dia vs noite) ── */
  const stickyBar  = document.getElementById('stickyBar');
  const stickyMsg  = document.getElementById('stickyMsg');
  const stickyCta  = document.getElementById('stickyCta');
  const heroEl     = document.querySelector('.du-hero');
  const noiteEl    = document.getElementById('noite');
  if (stickyBar && heroEl) {
    new IntersectionObserver((entries) => {
      stickyBar.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(heroEl);
  }
  if (stickyBar && noiteEl) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (stickyMsg) stickyMsg.innerHTML = 'Vagas limitadas — <strong>Domingo de Praia · a partir das 14h</strong>';
        if (stickyCta) { stickyCta.textContent = 'Comprar ingresso →'; stickyCta.href = '#shows'; }
      } else {
        if (stickyMsg) stickyMsg.innerHTML = 'Vagas limitadas — <strong>Dia na Praia · Na Praia Parque</strong>';
        if (stickyCta) { stickyCta.textContent = 'Comprar ingresso →'; stickyCta.href = '#ingressos'; }
      }
    }, { threshold: 0.05 }).observe(noiteEl);
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
  let allCards      = Array.from(document.querySelectorAll('.du-card'));
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

  /* ── AUTO-EXPIRE: remove cards past 06:00 BRT the day after the event ── */
  (function () {
    function expUTC(s) {
      const [y, m, d] = s.split('-').map(Number);
      return Date.UTC(y, m - 1, d, 17, 0, 0); /* 14:00 BRT (UTC-3) = 17:00 UTC */
    }
    const now = Date.now();
    allCards = allCards.filter(card => {
      const mt = (card.dataset.search || '').match(/^(\d{2})\/(\d{2})/);
      if (mt && now >= expUTC(`2026-${mt[2]}-${mt[1]}`)) { card.remove(); return false; }
      return true;
    });
    /* Renumber weeks to always start at 1 */
    const sorted = [...new Set(allCards.map(c => +c.dataset.week))].sort((a, b) => a - b);
    const wMap   = Object.fromEntries(sorted.map((w, i) => [w, i + 1]));
    allCards.forEach(c => { c.dataset.week = wMap[+c.dataset.week]; });
    /* Reload when the next card should expire */
    const nextExp = allCards
      .map(c => { const mt = (c.dataset.search || '').match(/^(\d{2})\/(\d{2})/); return mt ? expUTC(`2026-${mt[2]}-${mt[1]}`) : Infinity; })
      .filter(t => t > now).sort((a, b) => a - b)[0];
    if (nextExp && isFinite(nextExp)) setTimeout(() => location.reload(), nextExp - now);
  })();
  if (!allCards.length) return;

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

  /* ── NAV-SWITCH: track dia/noite section visibility ── */
  (function () {
    const pills   = document.querySelectorAll('.nav-switch__opt');
    const noiteSec = document.getElementById('noite');
    function setActive(id) {
      pills.forEach(p => {
        const href = (p.getAttribute('href') || '').replace('#', '');
        p.classList.toggle('is-active', href === id);
        p.setAttribute('aria-selected', href === id ? 'true' : 'false');
      });
    }
    if (noiteSec) {
      new IntersectionObserver((entries) => {
        setActive(entries[0].isIntersecting ? 'noite' : 'dia');
      }, { threshold: 0.1 }).observe(noiteSec);
    }
  })();

  /* ── PRODUCT CHOOSER — AUTO-ATUALIZAÇÃO ── */
  (function () {
    const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    function expUTC(dateStr, type) {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (type === 'entardecer') return Date.UTC(y, m - 1, d + 1, 2, 0, 0);  /* 23:00 BRT = 02:00 UTC dia seguinte */
      return Date.UTC(y, m - 1, d, 17, 0, 0); /* 14:00 BRT = 17:00 UTC — sabado e domingo-dia */
    }

    function nextOccurrence(type, afterDateStr) {
      /* Retorna a próxima data (YYYY-MM-DD) de sábado ou domingo após a data dada */
      const [y, m, d] = afterDateStr.split('-').map(Number);
      const base = new Date(Date.UTC(y, m - 1, d));
      const target = type === 'sabado' ? 6 : 0; /* 6=Sáb, 0=Dom */
      const diff = ((target - base.getUTCDay() + 7) % 7) || 7;
      base.setUTCDate(base.getUTCDate() + diff);
      const ny = base.getUTCFullYear();
      const nm = String(base.getUTCMonth() + 1).padStart(2, '0');
      const nd = String(base.getUTCDate()).padStart(2, '0');
      return `${ny}-${nm}-${nd}`;
    }

    function applyCard(card, dateStr, soon) {
      const [, m, d] = dateStr.split('-').map(Number);
      const label = `${String(d).padStart(2,'0')} ${MONTHS[m - 1]}`;
      const dateEl = card.querySelector('.pc-card__event-date');
      if (dateEl) dateEl.textContent = soon ? `Próx. ${label}` : label;
      const cta = card.querySelector('.pc-card__cta');
      if (soon) {
        card.href = 'javascript:void(0)';
        card.classList.add('is-soon');
        if (cta) { cta.textContent = 'Em breve'; cta.classList.add('btn--disabled'); cta.classList.remove('btn--primary','btn--yellow'); }
      }
      /* When active: href stays exactly as set in HTML */
    }

    const now = Date.now();
    let nextExp = Infinity;

    document.querySelectorAll('.product-chooser__card[data-pc-date]').forEach(card => {
      const type    = card.dataset.pcType || 'domingo-dia';
      const dateStr = card.dataset.pcDate;
      const exp     = expUTC(dateStr, type);

      if (now >= exp) {
        /* Expirou — avança para a próxima ocorrência e mostra "Em breve" */
        const nextDate = nextOccurrence(type, dateStr);
        card.dataset.pcDate = nextDate;
        applyCard(card, nextDate, true);
      } else {
        /* Ainda ativo */
        applyCard(card, dateStr, false);
        nextExp = Math.min(nextExp, exp);
      }
    });

    if (isFinite(nextExp)) setTimeout(() => location.reload(), nextExp - now);
  })();

  /* ── SHOWS — AUTO-EXPIRE SUNDAY BLOCKS ── */
  (function () {
    function expUTC(s) {
      const [y, m, d] = s.split('-').map(Number);
      return Date.UTC(y, m - 1, d + 1, 3, 0, 0); /* 00:00 BRT = 03:00 UTC */
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
    const nextExp = [...document.querySelectorAll('.sunday-block')]
      .map(b => { const mt = (b.dataset.search || '').match(/^(\d{2})\/(\d{2})/); return mt ? expUTC(`2026-${mt[2]}-${mt[1]}`) : Infinity; })
      .filter(t => t > now).sort((a, b) => a - b)[0];
    if (nextExp && isFinite(nextExp)) setTimeout(() => location.reload(), nextExp - now);
  })();

})();
