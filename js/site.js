'use strict';
(() => {
  const menu = document.querySelector('.mobile-menu-button');
  const nav = document.getElementById('rx-main-menu');
  if (menu && nav) menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  document.querySelectorAll('.fcard').forEach(card => {
    const toggle = () => {
      const open = !card.classList.contains('open');
      card.classList.toggle('open', open);
      card.setAttribute('aria-expanded', String(open));
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
    });
  });
  document.querySelectorAll('.journey').forEach(journey => {
    const steps = Array.from(journey.querySelectorAll('[data-tstep]'));
    const path = journey.querySelector('[data-mappath]');
    const dot = journey.querySelector('[data-mapdot]');
    const bar = journey.querySelector('[data-tbar]');
    const title = journey.querySelector('[data-ttitle]');
    const message = journey.querySelector('[data-tmsg]');
    const next = journey.querySelector('.ref-next');
    let selected = 0;
    const set = index => {
      selected = index;
      steps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
        step.setAttribute('aria-pressed', String(i === index));
      });
      const step = steps[index];
      if (bar) bar.style.width = step.dataset.pct + '%';
      if (title) title.textContent = step.dataset.title;
      if (message) message.textContent = step.dataset.msg;
      if (path && dot) {
        const point = path.getPointAtLength(path.getTotalLength() * index / (steps.length - 1));
        dot.style.transition = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'cx .55s, cy .55s';
        dot.setAttribute('cx', String(point.x)); dot.setAttribute('cy', String(point.y));
      }
      if (next) next.textContent = index === steps.length - 1 ? 'Replay journey ↻' : 'Next step →';
    };
    steps.forEach((step, index) => step.addEventListener('click', () => set(index)));
    if (next) next.addEventListener('click', () => set((selected + 1) % steps.length));
    if (steps.length) set(0);
  });
  const quote = document.getElementById('rx-quote-form');
  if (quote) {
    const steps = Array.from(quote.querySelectorAll('[data-step]'));
    const labels = Array.from(document.querySelectorAll('[data-step-label]'));
    let selected = 0;
    const validate = index => {
      for (const field of steps[index].querySelectorAll('input, select, textarea')) {
        if (!field.reportValidity()) return false;
      }
      return true;
    };
    const set = index => {
      selected = index;
      steps.forEach((step, i) => { step.hidden = i !== index; });
      labels.forEach((label, i) => label.classList.toggle('on', i <= index));
      if (index === 2) {
        const summary = document.getElementById('rx-summary'); summary.replaceChildren();
        const values = [
          ['Pharmacy', quote.elements.pharmacy.value],
          ['Contact', quote.elements.contact.value],
          ['Work email', quote.elements.email.value],
          ['Pickup ZIP code', quote.elements.zip.value],
          ['Daily deliveries', quote.elements.volume.value],
          ['Schedule', quote.elements.schedule.value],
          ['Delivery locations', quote.elements.destinations.value || 'To be discussed']
        ];
        values.forEach(([label, value]) => {
          const row = document.createElement('div'); const heading = document.createElement('small');
          heading.textContent = label; row.append(heading, document.createTextNode(value)); summary.append(row);
        });
      }
      const heading = steps[index].querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    };
    quote.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
      if (validate(selected)) set(Math.min(steps.length - 1, selected + 1));
    }));
    quote.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => set(Math.max(0, selected - 1))));
    quote.addEventListener('keydown', event => {
      if (event.key === 'Enter' && selected < steps.length - 1 && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault(); if (validate(selected)) set(selected + 1);
      }
    });
    quote.addEventListener('submit', event => {
      if (selected !== steps.length - 1) { event.preventDefault(); if (validate(selected)) set(selected + 1); return; }
      for (let index = 0; index < steps.length; index++) {
        const invalid = Array.from(steps[index].querySelectorAll('input,select,textarea')).find(field => !field.checkValidity());
        if (invalid) { event.preventDefault(); set(index); invalid.reportValidity(); return; }
      }
      if (quote.elements._honey.value) { event.preventDefault(); return; }
      const send = quote.querySelector('[type="submit"]'); if (send) send.textContent = 'Sending your request…';
    });
    const deliveryZip = new URLSearchParams(location.search).get('deliveryZip');
    if (deliveryZip && /^[0-9]{5}$/.test(deliveryZip)) quote.elements.destinations.value = deliveryZip;
    // Leave field focus untouched on initial page load.
    steps.forEach((step, i) => { step.hidden = i !== 0; });
  }
  const application = document.getElementById('driver-apply');
  if (application) {
    const upload = application.querySelector('#driver-resume');
    const status = application.querySelector('#resume-status');
    const remove = application.querySelector('#resume-remove');
    upload.addEventListener('change', () => {
      const file = upload.files[0]; upload.setCustomValidity('');
      if (!file) { status.textContent = 'Choose a file to attach to your application.'; remove.hidden = true; return; }
      remove.hidden = false;
      if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
        upload.setCustomValidity('Choose a PDF, DOC, or DOCX résumé.'); status.textContent = 'Please choose a PDF, DOC, or DOCX file.';
      } else if (file.size > 5 * 1024 * 1024) {
        upload.setCustomValidity('Choose a file no larger than 5 MB.'); status.textContent = 'This file is over 5 MB. Choose a smaller résumé.';
      } else {
        const size = file.size < 1024 * 1024 ? Math.max(1, Math.round(file.size / 1024)) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        status.textContent = 'Ready to attach: ' + file.name + ' · ' + size;
      }
    });
    remove.addEventListener('click', () => {
      upload.value = ''; upload.setCustomValidity(''); remove.hidden = true; status.textContent = 'Résumé removed.';
    });
    application.addEventListener('submit', event => {
      if (!application.reportValidity() || application.elements._honey.value) { event.preventDefault(); return; }
      application.querySelector('[type="submit"]').textContent = 'Sending your application…';
    });
  }
  const coverageForm = document.getElementById('rx-coverage');
  if (coverageForm && window.DashRxCoverage) {
    const data = window.DashRxCoverage;
    const known = new Set();
    for (const [start, end] of data.knownRanges) for (let number = start; number <= end; number++) known.add(String(number).padStart(5, '0'));
    const input = document.getElementById('rx-zip-check');
    const result = document.getElementById('rx-coverage-result');
    const title = document.getElementById('rx-area-title');
    const message = document.getElementById('rx-coverage-message');
    const next = result.querySelector('a');
    const check = () => {
      if (!input.reportValidity()) return;
      const zip = input.value.trim(); const counties = data.covered[zip]; result.hidden = false;
      result.style.background = '#edf7f3'; result.style.borderColor = '#d0e7dd';
      next.href = 'quote.html?deliveryZip=' + encodeURIComponent(zip);
      if (counties && data.shared[zip]) {
        title.textContent = zip + ' includes covered areas.';
        message.textContent = 'We serve addresses in ' + counties.join(' / ') + ' County within this ZIP. This ZIP also crosses outside our three-county service area. Confirm the delivery address’s county with dispatch.';
        next.textContent = 'Confirm my delivery location →';
      } else if (counties) {
        title.textContent = 'Yes — ' + zip + ' is in our coverage area.';
        message.textContent = counties.join(' / ') + ' County. DashRx serves delivery addresses throughout Wayne, Oakland, and Macomb counties.';
        next.textContent = 'Build my delivery plan →';
      } else if (known.has(zip)) {
        title.textContent = zip + ' is outside our current coverage.';
        message.textContent = 'Our delivery area is Wayne, Oakland, and Macomb counties. Contact our team to discuss your needs.';
        next.textContent = 'Ask about this area →'; result.style.background = '#f4f7f7'; result.style.borderColor = '#dce7e8';
      } else {
        title.textContent = 'We couldn’t confirm ' + zip + '.';
        message.textContent = 'This ZIP is not in our reference list. Contact dispatch@mydashrx.com to confirm whether the delivery address is in Wayne, Oakland, or Macomb County.';
        next.textContent = 'Request area confirmation →';
      }
    };
    coverageForm.addEventListener('submit', event => { event.preventDefault(); check(); });
    coverageForm.querySelector('.zip-preview').addEventListener('click', check);
    input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); check(); } });
  }
})();
