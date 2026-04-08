/**
 * script.js — Mangalam HDPE Pipes
 * ─────────────────────────────────────────────────────────────
 * 1.  Modal system           – openModal / closeModal, keyboard, overlay click
 * 2.  Sticky product bar     – slides in after hero scrolls out of view
 * 3.  Hero gallery           – thumbnails + prev/next arrows + crossfade
 * 4.  Image carousel         – prev/next, responsive visible-count, translate
 * 5.  Carousel zoom preview  – fixed bubble that tracks mouse position
 * 6.  Process tabs           – content swap + fade, image arrows cycle tabs
 * 7.  Mobile hamburger       – toggle nav, close on outside click
 * 8.  Smooth anchor scroll   – offset by header height
 * 9.  Form handlers          – catalogue submit, quote submit
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     1. MODAL SYSTEM
     openModal('catalogue') | openModal('quote')
  ───────────────────────────────────────────────────────── */
  var modalCatalogue = document.getElementById('modalCatalogue');
  var modalQuote     = document.getElementById('modalQuote');
  var closeCatalogue = document.getElementById('closeCatalogue');
  var closeQuote     = document.getElementById('closeQuote');

  /**
   * Opens a modal by name ('catalogue' | 'quote').
   * Locks body scroll, sets focus on first input.
   */
  window.openModal = function (name) {
    var modal = name === 'catalogue' ? modalCatalogue : modalQuote;
    if (!modal) return;
    modal.hidden = false;
    modal.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    // Focus first input after animation
    setTimeout(function () {
      var first = modal.querySelector('input');
      if (first) first.focus();
    }, 60);
  };

  function closeModalEl(modal) {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeCatalogue) closeCatalogue.addEventListener('click', function () { closeModalEl(modalCatalogue); });
  if (closeQuote)     closeQuote.addEventListener('click',     function () { closeModalEl(modalQuote);     });

  // Close on overlay background click
  [modalCatalogue, modalQuote].forEach(function (overlay) {
    if (!overlay) return;
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModalEl(overlay);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModalEl(modalCatalogue);
      closeModalEl(modalQuote);
    }
  });

  /* ─────────────────────────────────────────────────────────
     9. FORM SUBMIT HANDLERS
  ───────────────────────────────────────────────────────── */
  window.handleCatSubmit = function () {
    var email = document.getElementById('catEmail');
    if (!email || !email.value.trim()) {
      email && email.focus();
      email && email.style.setProperty('border-color', '#EF4444');
      setTimeout(function () { email && email.style.removeProperty('border-color'); }, 1600);
      return;
    }
    closeModalEl(modalCatalogue);
    showToast('Catalogue will be sent to ' + email.value);
    email.value = '';
    var phone = document.getElementById('catPhone');
    if (phone) phone.value = '';
  };

  window.handleQuoteSubmit = function () {
    var name = document.getElementById('qName');
    if (!name || !name.value.trim()) {
      name && name.focus();
      name && name.style.setProperty('border-color', '#EF4444');
      setTimeout(function () { name && name.style.removeProperty('border-color'); }, 1600);
      return;
    }
    closeModalEl(modalQuote);
    showToast('Thank you! Our team will call you back soon.');
    ['qName','qCompany','qEmail','qPhone'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
  };

  /* Simple toast notification */
  function showToast(msg) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = [
      'position:fixed','bottom:24px','left:50%','transform:translateX(-50%) translateY(20px)',
      'background:#111827','color:#fff','padding:12px 22px','border-radius:8px',
      'font-size:.875rem','font-weight:500','z-index:9999',
      'box-shadow:0 8px 24px rgba(0,0,0,.18)','opacity:0',
      'transition:opacity .3s ease, transform .3s ease','white-space:nowrap'
    ].join(';');
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(12px)';
      setTimeout(function () { toast.remove(); }, 350);
    }, 3200);
  }


  /* ─────────────────────────────────────────────────────────
     2. STICKY PRODUCT BAR
     Appears when the hero section scrolls fully out of view.
  ───────────────────────────────────────────────────────── */
  var stickyBar = document.getElementById('stickyBar');
  var heroEl    = document.getElementById('hero');
  var ticking   = false;

  function updateSticky() {
    if (!stickyBar || !heroEl) return;
    var bottom = heroEl.getBoundingClientRect().bottom;
    if (bottom < 0) {
      stickyBar.classList.add('is-visible');
      stickyBar.removeAttribute('aria-hidden');
    } else {
      stickyBar.classList.remove('is-visible');
      stickyBar.setAttribute('aria-hidden', 'true');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(updateSticky); ticking = true; }
  }, { passive: true });


  /* ─────────────────────────────────────────────────────────
     3. HERO IMAGE GALLERY
  ───────────────────────────────────────────────────────── */
  var mainImg   = document.getElementById('mainImg');
  var galThumbs = document.getElementById('galThumbs');
  var galPrev   = document.getElementById('galPrev');
  var galNext   = document.getElementById('galNext');
  var thumbBtns = galThumbs ? Array.from(galThumbs.querySelectorAll('.gallery__thumb')) : [];
  var galIdx    = 0;

  function setGallerySlide(idx) {
    if (!thumbBtns.length || !mainImg) return;
    galIdx = ((idx % thumbBtns.length) + thumbBtns.length) % thumbBtns.length;
    var btn = thumbBtns[galIdx];
    // Crossfade
    mainImg.style.opacity    = '0';
    mainImg.style.transition = 'opacity .25s ease';
    setTimeout(function () {
      mainImg.src            = btn.dataset.full;
      mainImg.style.opacity  = '1';
    }, 130);
    thumbBtns.forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  thumbBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () { setGallerySlide(i); });
  });
  if (galPrev) galPrev.addEventListener('click', function () { setGallerySlide(galIdx - 1); });
  if (galNext) galNext.addEventListener('click', function () { setGallerySlide(galIdx + 1); });

  var galZoom = document.getElementById('galZoom');
  var zoomOverlay = document.getElementById('zoomOverlay');
  var zoomImg = document.getElementById('zoomImg');
  var zoomClose = document.getElementById('zoomClose');

  function openZoom() {
    if (!zoomOverlay || !zoomImg || !mainImg) return;
    zoomImg.src = mainImg.src;
    zoomOverlay.hidden = false;
    zoomOverlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeZoom() {
    if (!zoomOverlay) return;
    zoomOverlay.hidden = true;
    zoomOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (galZoom) galZoom.addEventListener('click', openZoom);
  if (mainImg) mainImg.addEventListener('click', openZoom);
  if (zoomClose) zoomClose.addEventListener('click', closeZoom);
  if (zoomOverlay) {
    zoomOverlay.addEventListener('click', function (e) {
      if (e.target === zoomOverlay) closeZoom();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeZoom();
  });


  /* ─────────────────────────────────────────────────────────
     4. IMAGE CAROUSEL (Versatile Applications)
  ───────────────────────────────────────────────────────── */
  var carTrack = document.getElementById('carTrack');
  var carPrev  = document.getElementById('carPrev');
  var carNext  = document.getElementById('carNext');
  var carIdx   = 0;

  function visibleCards() {
    var w = window.innerWidth;
    if (w <= 480)  return 1;
    if (w <= 768)  return 2;
    if (w <= 1024) return 3;
    return 4;
  }

  function cardSlideWidth() {
    var card = carTrack && carTrack.querySelector('.ccard');
    if (!card) return 0;
    return card.offsetWidth + 16; /* gap: 16px */
  }

  function maxCarIdx() {
    var total = carTrack ? carTrack.querySelectorAll('.ccard').length : 0;
    return Math.max(0, total - visibleCards());
  }

  function slideTo(idx) {
    carIdx = Math.max(0, Math.min(idx, maxCarIdx()));
    if (carTrack) carTrack.style.transform = 'translateX(-' + (carIdx * cardSlideWidth()) + 'px)';
    if (carPrev) carPrev.disabled = carIdx === 0;
    if (carNext) carNext.disabled = carIdx >= maxCarIdx();
  }

  if (carPrev) carPrev.addEventListener('click', function () { slideTo(carIdx - 1); });
  if (carNext) carNext.addEventListener('click', function () { slideTo(carIdx + 1); });
  window.addEventListener('resize', function () { slideTo(carIdx); });
  slideTo(0);

  /* Touch swipe on carousel */
  var touchStartX = 0;
  if (carTrack) {
    carTrack.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    carTrack.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) slideTo(dx < 0 ? carIdx + 1 : carIdx - 1);
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────────────────
     5. CAROUSEL ZOOM PREVIEW
     The .ccard__zoom element is position:fixed.
     We move it beside the cursor (never overlapping it) via JS.
  ───────────────────────────────────────────────────────── */
  var ccards = document.querySelectorAll('.ccard');

  ccards.forEach(function (card) {
    var zoom = card.querySelector('.ccard__zoom');
    if (!zoom) return;

    card.addEventListener('mousemove', function (e) {
      var vw = window.innerWidth, vh = window.innerHeight;
      var zW = 320, zH = 210, gap = 20;
      var x = e.clientX + gap;
      var y = e.clientY - zH / 2;
      if (x + zW > vw - 8) x = e.clientX - zW - gap;    // flip left
      if (y < 8)            y = 8;                        // clamp top
      if (y + zH > vh - 8) y = vh - zH - 8;              // clamp bottom
      zoom.style.left = x + 'px';
      zoom.style.top  = y + 'px';
    });

    card.addEventListener('mouseleave', function () {
      zoom.style.left = '';
      zoom.style.top  = '';
    });
  });


  /* ─────────────────────────────────────────────────────────
     6. MANUFACTURING PROCESS TABS
  ───────────────────────────────────────────────────────── */
  var procTabs   = document.getElementById('procTabs');
  var procCard   = document.getElementById('procCard');
  var procStepIdx = 0;

  var steps = [
    { title: 'High-Grade Raw Material Selection',
      desc:  'Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.',
      checks:['PE100 grade material', 'Optimal molecular weight distribution'],
      img:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { title: 'Precision Extrusion',
      desc:  'State-of-the-art twin-screw extruders melt and homogenise the HDPE compound at precisely controlled temperatures.',
      checks:['Temperature-controlled zones', 'Melt pressure monitoring'],
      img:   'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80' },
    { title: 'Rapid Cooling',
      desc:  'Water-bath cooling tanks solidify the pipe while maintaining strict dimensional tolerances throughout the run.',
      checks:['Multi-zone cooling baths', 'In-line diameter gauging'],
      img:   'https://images.unsplash.com/photo-1581092921461-7031e27a7e90?w=600&q=80' },
    { title: 'Dimensional Sizing',
      desc:  'Precision sizing sleeves and vacuum calibration tables ensure pipes meet exact outer diameter specifications.',
      checks:['±0.1mm diameter tolerance', 'Continuous wall thickness check'],
      img:   'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=600&q=80' },
    { title: 'Quality Control Testing',
      desc:  'Every batch undergoes hydrostatic pressure testing, impact tests, and dimensional verification before dispatch.',
      checks:['100% hydrostatic tested', 'ISO 4427 compliance'],
      img:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { title: 'Marking & Identification',
      desc:  'Permanent inkjet marking includes product standard, size, pressure rating, and production date for full traceability.',
      checks:['Permanent marking', 'Full traceability codes'],
      img:   'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80' },
    { title: 'Precision Cutting',
      desc:  'Automated cutters section pipes to exact lengths with clean, square ends ready for installation or coiling.',
      checks:['Automated cut-to-length', 'Square-end guarantee'],
      img:   'https://images.unsplash.com/photo-1581092921461-7031e27a7e90?w=600&q=80' },
    { title: 'Coiling & Packaging',
      desc:  'Automated coilers wind pipes to standard dimensions. Bundles are strapped, labelled, and palletised for safe transport.',
      checks:['Automated coiling', 'Protective stretch-wrap'],
      img:   'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=600&q=80' }
  ];

  function applyStep(idx) {
    if (!procCard) return;
    var s = steps[idx] || steps[0];
    procCard.classList.add('fading');
    setTimeout(function () {
      document.getElementById('procTitle').textContent = s.title;
      document.getElementById('procDesc').textContent  = s.desc;
      var cl = document.getElementById('procChecks');
      cl.innerHTML = s.checks.map(function (c) {
        return '<li><span class="dot"></span>' + c + '</li>';
      }).join('');
      document.getElementById('procImg').src = s.img;
      procCard.classList.remove('fading');
    }, 200);
  }

  function setTab(idx) {
    var tabs = procTabs ? procTabs.querySelectorAll('.proc-tab') : [];
    procStepIdx = Math.max(0, Math.min(idx, tabs.length - 1));
    tabs.forEach(function (t, i) {
      t.classList.toggle('active', i === procStepIdx);
      t.setAttribute('aria-selected', i === procStepIdx ? 'true' : 'false');
    });
    applyStep(procStepIdx);
  }

  if (procTabs) {
    procTabs.querySelectorAll('.proc-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { setTab(parseInt(tab.dataset.step, 10)); });
    });
  }

  var procImgPrev = document.getElementById('procImgPrev');
  var procImgNext = document.getElementById('procImgNext');
  if (procImgPrev) procImgPrev.addEventListener('click', function () { setTab(procStepIdx - 1); });
  if (procImgNext) procImgNext.addEventListener('click', function () { setTab(procStepIdx + 1); });


  /* ─────────────────────────────────────────────────────────
     7. MOBILE HAMBURGER NAV
  ───────────────────────────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var mainNav   = document.getElementById('mainNav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      var open = mainNav.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ─────────────────────────────────────────────────────────
     8. SMOOTH ANCHOR SCROLL
     Offset by sticky header height so headings aren't hidden.
  ───────────────────────────────────────────────────────── */
  var mainHeader = document.getElementById('mainHeader');

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerH = mainHeader ? mainHeader.offsetHeight : 0;
      var y = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

})();
