/* ═══════════════════════════════════════════════════════════════
   Thomas Cossio – DJ Landing Page · script.js
   Modules:
     0. Preloader
     1. Custom Cursor
     2. Navigation (scroll behaviour + mobile burger)
     3. Scroll Reveal (IntersectionObserver)
     4. Active Nav Link on scroll
     5. Counter Animations
     6. Video Modal
     7. Contact Form Validation
     8. Back-to-Top Button
     9. Footer Year
    10. Recursos Modal
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Helpers ─── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);


/* ═══ 0. PRELOADER ═══ */
(function initPreloader() {
  const loader   = qs('#preloader');
  const bar      = qs('#plBar');
  const pct      = qs('#plPct');
  const progress = qs('#plProgressBar');
  if (!loader) return;

  // Prevent scroll while loading
  document.body.style.overflow = 'hidden';

  let current = 0;
  const duration = 2200; // ms total
  const steps    = 80;
  const interval = duration / steps;

  // Ease-in-out curve so it feels natural — fast start, slight pause near end
  const easeInOut = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  let step = 0;
  const tick = setInterval(() => {
    step++;
    const t   = step / steps;
    current   = Math.round(easeInOut(t) * 100);
    const val = Math.min(current, 100);

    bar.style.width = val + '%';
    pct.textContent = val + '%';
    progress.setAttribute('aria-valuenow', val);

    if (step >= steps) {
      clearInterval(tick);
      // Small pause at 100% so the user sees it complete
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        // Reveal ambient DJ icons
        qsa('.dja').forEach((icon, i) => {
          setTimeout(() => icon.classList.add('visible'), i * 180);
        });
        // Remove from DOM after transition
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }, 300);
    }
  }, interval);
})();


/* ═══ 1. CUSTOM CURSOR ═══ */
(function initCursor() {
  const cursor = qs('#cursor');
  const trail  = qs('#cursorTrail');
  if (!cursor || !trail) return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, tx = 0, ty = 0;

  on(document, 'mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Smooth trail with rAF
  (function animateTrail() {
    tx += (mx - tx) * 0.3;
    ty += (my - ty) * 0.3;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animateTrail);
  })();

  // Hover state
  const hoverTargets = 'a, button, [tabindex="0"], input, select, textarea, label';
  on(document, 'mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.add('hovering');
      trail.classList.add('hovering');
    }
  });
  on(document, 'mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.remove('hovering');
      trail.classList.remove('hovering');
    }
  });

  // Hide when out of window
  on(document, 'mouseleave', () => {
    cursor.style.opacity = '0';
    trail.style.opacity  = '0';
  });
  on(document, 'mouseenter', () => {
    cursor.style.opacity = '1';
    trail.style.opacity  = '1';
  });
})();


/* ═══ 2. NAVIGATION ═══ */
/* ═══ 2. NAVIGATION ═══ */
(function initNav() {
  const nav       = qs('#nav');
  const burger    = qs('#navBurger');
  const drawer    = qs('#mobileDrawer');
  const backdrop  = qs('#drawerBackdrop');
  const closeBtn  = qs('#drawerClose');
  const links     = qsa('.drawer-link');

  // Scroll class en nav
  const updateNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  updateNav();
  on(window, 'scroll', updateNav, { passive: true });

  // Helpers open/close
  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger && burger.focus();
  }

  if (burger && drawer) {
    on(burger,   'click', openDrawer);
    on(closeBtn, 'click', closeDrawer);
    on(backdrop, 'click', closeDrawer);

    // Cierra al hacer click en un link
    links.forEach(link => on(link, 'click', closeDrawer));

    // Cierra con Escape
    on(document, 'keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  // Active link en drawer (sincronizado con scroll)
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        [...navLinks, ...links].forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => observer.observe(sec));
})();


/* ═══ 3. SCROLL REVEAL ═══ */
(function initReveal() {
  const elements = qsa('.reveal-up');
  if (!elements.length) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ═══ 4. ACTIVE NAV LINK ═══ */
(function initActiveLink() {
  const sections = qsa('section[id]');
  const links    = qsa('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => observer.observe(sec));
})();


/* ═══ 5. COUNTER ANIMATIONS ═══ */
(function initCounters() {
  const nums = qsa('.stat-num[data-target]');
  if (!nums.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(el => observer.observe(el));
})();


/* ═══ 6. VIDEO MODAL ═══ */
(function initVideoModal() {
  const modal    = qs('#videoModal');
  const backdrop = qs('#modalBackdrop');
  const closeBtn = qs('#modalClose');
  const embed    = qs('#modalEmbed');

  if (!modal || !embed) return;

  function openModal(src) {
    embed.innerHTML = `<iframe src="${src}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    embed.innerHTML = '';
    document.body.style.overflow = '';
  }

  // Open on thumbnail click / keyboard
  qsa('.video-thumb').forEach(thumb => {
    const handler = () => {
      const src = thumb.dataset.src;
      if (src) openModal(src);
    };
    on(thumb, 'click', handler);
    on(thumb, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });

  on(closeBtn,   'click', closeModal);
  on(backdrop,   'click', closeModal);
  on(document,   'keydown', e => { if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal(); });
})();


/* ═══ 7. CONTACT FORM VALIDATION ═══ */
(function initContactForm() {
  const form    = qs('#contactForm');
  const success = qs('#formSuccess');
  if (!form) return;

  const rules = {
    nombre:  { required: true, minLen: 2,   msg: 'Por favor ingresa tu nombre (mínimo 2 caracteres).' },
    email:   { required: true, email: true,  msg: 'Por favor ingresa un correo electrónico válido.' },
    evento:  { required: true,               msg: 'Por favor selecciona el tipo de evento.' },
    mensaje: { required: true, minLen: 10,  msg: 'Cuéntanos más sobre tu evento (mínimo 10 caracteres).' },
  };

  function isEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validate(name, val) {
    const r = rules[name];
    if (!r) return null;
    if (r.required && !val.trim()) return r.msg;
    if (r.email    && !isEmail(val)) return r.msg;
    if (r.minLen   && val.trim().length < r.minLen) return r.msg;
    return null;
  }

  function showError(group, msg) {
    group.classList.add('error');
    const err = qs('.form-err', group);
    if (err) err.textContent = msg;
  }

  function clearError(group) {
    group.classList.remove('error');
    const err = qs('.form-err', group);
    if (err) err.textContent = '';
  }

  // Live validation on blur
  qsa('[name]', form).forEach(field => {
    on(field, 'blur', () => {
      const group = field.closest('.form-group');
      const err   = validate(field.name, field.value);
      err ? showError(group, err) : clearError(group);
    });
    on(field, 'input', () => {
      const group = field.closest('.form-group');
      if (group.classList.contains('error')) {
        const err = validate(field.name, field.value);
        err ? showError(group, err) : clearError(group);
      }
    });
  });

  // Submit
  on(form, 'submit', e => {
    e.preventDefault();
    let valid = true;

    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const group = field.closest('.form-group');
      const err   = validate(name, field.value);
      if (err) { showError(group, err); valid = false; }
      else      { clearError(group); }
    });

    if (!valid) {
      // Focus first error
      const firstErr = qs('.form-group.error input, .form-group.error select, .form-group.error textarea', form);
      firstErr && firstErr.focus();
      return;
    }

    // Simulate async submit
    const btn = qs('button[type="submit"]', form);
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      form.reset();
      success && (success.hidden = false);

      // Hide success message after 6 s
      setTimeout(() => {
        success && (success.hidden = true);
      }, 6000);
    }, 1800);
  });
})();


/* ═══ 8. BACK-TO-TOP ═══ */
(function initBackTop() {
  const btn = qs('#backTop');
  if (!btn) return;

  on(window, 'scroll', () => {
    const show = window.scrollY > 500;
    btn.hidden = !show;
  }, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ═══ 9. FOOTER YEAR ═══ */
(function setYear() {
  const el = qs('#year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ═══ 10. RECURSOS MODAL ═══ */
(function initRecursosModal() {

  /* ── DOM references ── */
  const openBtn  = qs('#openRecursos');
  const modal    = qs('#recursosModal');
  const backdrop = qs('#rmBackdrop');
  const closeBtn = qs('#rmClose');
  const grid     = qs('#rmGrid');
  const selText  = qs('#rmSelText');
  const dlOne    = qs('#rmDlOne');
  const dlZip    = qs('#rmDlZip');
  const selAll   = qs('#rmSelectAll');
  const filters  = qsa('.rm-filter');

  if (!modal || !grid) return;

  /* ── State ── */
  let currentFilter = 'all';
  let allSelected   = false;

  /* ── Open / Close ── */
  function openModal() {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn && closeBtn.focus();
  }
  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    openBtn && openBtn.focus();
  }

  on(openBtn,  'click',   openModal);
  on(closeBtn, 'click',   closeModal);
  on(backdrop, 'click',   closeModal);
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
  });

  /* ── Filter ── */
  filters.forEach(btn => {
    on(btn, 'click', () => {
      filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      currentFilter = btn.dataset.filter;
      applyFilter();
      // reset select-all when filter changes
      allSelected = false;
      updateSelectAllLabel();
    });
  });

  function applyFilter() {
    qsa('.rm-file', grid).forEach(file => {
      const show = currentFilter === 'all' || file.dataset.type === currentFilter;
      file.dataset.hidden = show ? 'false' : 'true';
    });
  }

  /* ── Checkbox selection ── */
  on(grid, 'change', e => {
    const cb = e.target.closest('.rm-check');
    if (!cb) return;
    const fileEl = cb.closest('.rm-file');
    fileEl.classList.toggle('selected', cb.checked);
    updateFooter();
  });

  function getSelectedFiles() {
    return qsa('.rm-file.selected', grid).map(el => ({
      id:   el.dataset.id,
      name: el.dataset.name,
      size: el.dataset.size,
      type: el.dataset.type,
    }));
  }

  function updateFooter() {
    const sel = getSelectedFiles();
    const n   = sel.length;
    if (n === 0) {
      selText.textContent = 'Selecciona uno o más archivos para descargar';
      dlOne.disabled = true;
      dlZip.disabled = true;
    } else if (n === 1) {
      selText.textContent = `1 archivo seleccionado`;
      dlOne.disabled = false;
      dlZip.disabled = true;  // ZIP needs 2+
      dlOne.textContent = '';
      dlOne.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Descargar`;
    } else {
      selText.textContent = `${n} archivos seleccionados`;
      dlOne.disabled = true;
      dlZip.disabled = false;
      dlZip.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/><path d="M3 9h18"/></svg> Descargar ${n} archivos (.ZIP)`;
    }
  }

  /* ── Select All ── */
  on(selAll, 'click', () => {
    allSelected = !allSelected;
    const visible = qsa('.rm-file:not([data-hidden="true"])', grid);
    visible.forEach(file => {
      const cb = qs('.rm-check', file);
      cb.checked = allSelected;
      file.classList.toggle('selected', allSelected);
    });
    updateFooter();
    updateSelectAllLabel();
  });

  function updateSelectAllLabel() {
    selAll.innerHTML = allSelected
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> Deseleccionar todo`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg> Seleccionar todo`;
  }

  /* ── Per-card single download ── */
  on(grid, 'click', e => {
    const singleBtn = e.target.closest('.rm-dl-single');
    if (!singleBtn) return;
    e.preventDefault();
    const fileEl = singleBtn.closest('.rm-file');
    const name   = fileEl.dataset.name;
    const type   = fileEl.dataset.type;
    downloadSingle(name, type);
  });

  /* ── Footer download buttons ── */
  on(dlOne, 'click', () => {
    const sel = getSelectedFiles();
    if (sel.length !== 1) return;
    downloadSingle(sel[0].name, sel[0].type);
  });

  on(dlZip, 'click', async () => {
    const sel = getSelectedFiles();
    if (sel.length < 2) return;

    // Show loading state
    dlZip.disabled = true;
    const orig = dlZip.innerHTML;
    dlZip.innerHTML = `<svg style="animation:spin .6s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Generando ZIP…`;

    try {
      const zipBytes = await buildZip(sel);
      triggerDownload(zipBytes, 'ThomasCossio_Kit.zip', 'application/zip');
    } catch(err) {
      console.error('ZIP error:', err);
    }

    dlZip.disabled = false;
    dlZip.innerHTML = orig;
  });


  /* ════════════════════════════════════════════════
     PURE JS ZIP GENERATOR (STORE method – no libs)
  ════════════════════════════════════════════════ */

  function crc32(data) {
    /* CRC-32 table (lazily built) */
    if (!crc32.table) {
      crc32.table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        crc32.table[i] = c;
      }
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) crc = crc32.table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function u16(val) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0,val,true); return b; }
  function u32(val) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0,val,true); return b; }

  function concat(...arrays) {
    const total  = arrays.reduce((s,a) => s + a.length, 0);
    const result = new Uint8Array(total);
    let pos = 0;
    for (const a of arrays) { result.set(a, pos); pos += a.length; }
    return result;
  }

  /** Build a fake file blob for demo purposes */
  function makeDemoContent(name, type) {
    if (type === 'pdf') {
      // Minimal valid PDF with the file name embedded
      const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF
% Thomas Cossio – ${name}`;
      return new TextEncoder().encode(content);
    } else {
      // Minimal valid PNG (1×1 purple pixel)
      const png = new Uint8Array([
        0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A, // PNG signature
        0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52, // IHDR chunk length + type
        0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01, // 1×1
        0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53, // 8-bit RGB
        0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41, // IDAT
        0x54,0x08,0xD7,0x63,0xF8,0xCF,0xC0,0x00, // compressed data
        0x00,0x00,0x02,0x00,0x01,0xE2,0x21,0xBC, // CRC
        0x33,0x00,0x00,0x00,0x00,0x49,0x45,0x4E, // IEND
        0x44,0xAE,0x42,0x60,0x82               // IEND CRC
      ]);
      return png;
    }
  }

  async function buildZip(files) {
    const enc       = new TextEncoder();
    const localRecs = [];
    const cdRecs    = [];
    let   offset    = 0;

    for (const file of files) {
      const nameBytes = enc.encode(file.name);
      const data      = makeDemoContent(file.name, file.type);
      const crc       = crc32(data);
      const size      = data.length;

      /* Local file header */
      const lh = concat(
        new Uint8Array([0x50,0x4B,0x03,0x04]), // signature
        u16(20), u16(0), u16(0),               // version, flags, compression(STORE)
        u16(0), u16(0),                        // mod time, mod date
        u32(crc), u32(size), u32(size),        // CRC, compressed, uncompressed sizes
        u16(nameBytes.length), u16(0),         // filename len, extra len
        nameBytes
      );

      /* Central directory entry */
      const cd = concat(
        new Uint8Array([0x50,0x4B,0x01,0x02]), // signature
        u16(20), u16(20),                      // version made by, needed
        u16(0), u16(0),                        // flags, compression
        u16(0), u16(0),                        // mod time, mod date
        u32(crc), u32(size), u32(size),
        u16(nameBytes.length), u16(0), u16(0), // name len, extra len, comment len
        u16(0), u16(0),                        // disk start, internal attrs
        u32(0),                                // external attrs
        u32(offset),                           // offset of local header
        nameBytes
      );

      localRecs.push({ lh, data });
      cdRecs.push(cd);
      offset += lh.length + data.length;
    }

    const cdSize  = cdRecs.reduce((s,c) => s + c.length, 0);
    const cdStart = offset;

    const eocd = concat(
      new Uint8Array([0x50,0x4B,0x05,0x06]), // signature
      u16(0), u16(0),                        // disk, disk with cd
      u16(files.length), u16(files.length),  // entries on disk, total entries
      u32(cdSize), u32(cdStart),             // CD size, CD offset
      u16(0)                                 // comment length
    );

    const parts = [];
    for (const { lh, data } of localRecs) parts.push(lh, data);
    for (const cd of cdRecs) parts.push(cd);
    parts.push(eocd);

    return concat(...parts);
  }


  /* ── Helper: trigger a file download ── */
  function triggerDownload(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function downloadSingle(name, type) {
    const data = makeDemoContent(name, type);
    const mime = type === 'pdf' ? 'application/pdf' : 'image/png';
    triggerDownload(data, name, mime);
  }

})();


/* ═══ BONUS: Parallax orbs on mouse move ═══ */
(function initParallax() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = qs('.hero');
  if (!hero) return;

  const orb1 = qs('.orb-1', hero);
  const orb2 = qs('.orb-2', hero);
  const orb3 = qs('.orb-3', hero);

  on(hero, 'mousemove', e => {
    const { width, height, left, top } = hero.getBoundingClientRect();
    const cx = (e.clientX - left - width  / 2) / width;
    const cy = (e.clientY - top  - height / 2) / height;

    orb1 && (orb1.style.transform = `translate(${cx * 30}px, ${cy * 20}px)`);
    orb2 && (orb2.style.transform = `translate(${cx * -25}px, ${cy * -15}px)`);
    orb3 && (orb3.style.transform = `translate(${cx * 15}px, ${cy * 25}px)`);
  });

  on(hero, 'mouseleave', () => {
    [orb1, orb2, orb3].forEach(o => o && (o.style.transform = ''));
  });
})();


/* ═══ BONUS: Smooth scroll with offset for nav ═══ */
(function initSmoothScroll() {
  const NAV_HEIGHT = 80;

  qsa('a[href^="#"]').forEach(link => {
    on(link, 'click', e => {
      const target = qs(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ═══ 11. GALERÍA CAROUSEL ═══ */
(function initGaleriaCarousel() {
  const track    = qs('#gcTrack');
  if (!track) return;

  const slides   = qsa('.gc-slide', track);
  const dots     = qsa('.gc-dot');
  const prevBtn  = qs('#gcPrev');
  const nextBtn  = qs('#gcNext');
  const bar      = qs('#gcProgressBar');
  const current  = qs('#gcCurrent');

  const TOTAL    = slides.length;
  const INTERVAL = 5000; // ms entre slides

  let idx        = 0;
  let timer      = null;
  let progTimer  = null;
  let paused     = false;
  let startX     = 0;

  /* ── Ir a slide ── */
  function goTo(next) {
    const prev = idx;
    if (next === prev) return;

    // Salida del slide actual
    slides[prev].classList.add('leaving');
    slides[prev].classList.remove('active');

    // Entrada del nuevo
    idx = (next + TOTAL) % TOTAL;
    slides[idx].classList.add('active');

    // Limpiar leaving después de la transición
    setTimeout(() => {
      slides[prev].classList.remove('leaving');
    }, 1000);

    // Actualizar dots
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.setAttribute('aria-selected', i === idx);
    });

    // Actualizar contador
    if (current) {
      current.textContent = String(idx + 1).padStart(2, '0');
    }

    // Reiniciar progreso
    resetProgress();
  }

  /* ── Progreso ── */
  function resetProgress() {
    if (!bar) return;
    clearTimeout(progTimer);
    bar.style.transition = 'none';
    bar.style.width = '0%';
    // Pequeño delay para que el browser pinte el reset
    progTimer = setTimeout(() => {
      bar.style.transition = `width ${INTERVAL}ms linear`;
      bar.style.width = '100%';
    }, 30);
  }

  /* ── Autoplay ── */
  function startAutoplay() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!paused) goTo(idx + 1);
    }, INTERVAL);
    resetProgress();
  }

  function stopAutoplay() {
    clearInterval(timer);
    clearTimeout(progTimer);
    if (bar) {
      bar.style.transition = 'none';
    }
  }

  /* ── Controles ── */
  on(nextBtn, 'click', () => { goTo(idx + 1); startAutoplay(); });
  on(prevBtn, 'click', () => { goTo(idx - 1); startAutoplay(); });

  dots.forEach(dot => {
    on(dot, 'click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      startAutoplay();
    });
  });

  /* ── Pausar en hover ── */
  const carousel = track.closest('.galeria-carousel');
  on(carousel, 'mouseenter', () => {
    paused = true;
    if (bar) bar.style.animationPlayState = 'paused';
  });
  on(carousel, 'mouseleave', () => {
    paused = false;
    if (bar) bar.style.animationPlayState = 'running';
  });

  /* ── Swipe táctil ── */
  on(carousel, 'touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  on(carousel, 'touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(idx + 1) : goTo(idx - 1);
      startAutoplay();
    }
  }, { passive: true });

  /* ── Teclado (accesibilidad) ── */
  on(document, 'keydown', e => {
    if (e.key === 'ArrowRight') { goTo(idx + 1); startAutoplay(); }
    if (e.key === 'ArrowLeft')  { goTo(idx - 1); startAutoplay(); }
  });

  /* ── Pausa si el tab no está visible ── */
  on(document, 'visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  /* ── Init ── */
  startAutoplay();
})();