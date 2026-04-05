
(function(){
  const page = document.querySelector('.page');
  requestAnimationFrame(()=> page && page.classList.add('ready'));

  // Smooth transitions between pages
  document.querySelectorAll('a[href$=".html"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(!href || href.startsWith('#')) return;
      e.preventDefault();
      if(page) page.classList.add('leaving');
      setTimeout(()=>{ window.location.href = href; }, 180);
    });
  });

  // Mobile drawer
  const navBtn = document.querySelector('[data-navbtn]');
  const drawer = document.querySelector('[data-drawer]');
  if(navBtn && drawer){
    navBtn.addEventListener('click', ()=>{
      const open = drawer.getAttribute('data-open') === 'true';
      drawer.setAttribute('data-open', String(!open));
      drawer.style.display = open ? 'none' : 'block';
      navBtn.setAttribute('aria-expanded', String(!open));
    });
  }

  // Expandable cards
  document.querySelectorAll('.fcard').forEach(card=>{
    card.addEventListener('click', ()=> card.classList.toggle('open'));
  });

  // Animated counters
  function animateCounter(el){
    const target = Number(el.getAttribute('data-target') || 0);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = Number(el.getAttribute('data-duration') || 1200);
    const start = performance.now();
    function tick(now){
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.floor(target * eased);
      el.textContent = val.toLocaleString() + suffix;
      if(t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  if(counters.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const el = entry.target;
          if(el.getAttribute('data-animated') === 'true') return;
          el.setAttribute('data-animated','true');
          animateCounter(el);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el=> io.observe(el));
  }

  // Map route animation
  const dot = document.querySelector('[data-mapdot]');
  const path = document.querySelector('[data-mappath]');
  if(dot && path && path.getTotalLength){
    const len = path.getTotalLength();
    let t = 0;
    function move(){
      t = (t + 0.0032) % 1;
      const p = path.getPointAtLength(len * t);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      requestAnimationFrame(move);
    }
    move();
  }

  // Step-by-step quote form
  const stepper = document.querySelector('[data-stepper]');
  if(stepper){
    const steps = Array.from(stepper.querySelectorAll('.step'));
    const pills = Array.from(stepper.querySelectorAll('[data-step-pill]'));
    const bar = stepper.querySelector('[data-progress]');
    const nextBtn = stepper.querySelector('[data-next]');
    const backBtn = stepper.querySelector('[data-back]');
    const submitBtn = stepper.querySelector('[data-submit]');
    let idx = 0;

    function setActive(i){
      idx = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach((s, k)=> s.classList.toggle('active', k === idx));
      pills.forEach((p, k)=> p.classList.toggle('active', k === idx));
      const pct = Math.round((idx) / (steps.length - 1) * 100);
      if(bar) bar.style.width = pct + '%';
      if(backBtn) backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
      if(nextBtn) nextBtn.style.display = idx === steps.length - 1 ? 'none' : 'inline-flex';
      if(submitBtn) submitBtn.style.display = idx === steps.length - 1 ? 'inline-flex' : 'none';
    }

    function validateCurrent(){
      const required = Array.from(steps[idx].querySelectorAll('[required]'));
      for(const input of required){
        if(!input.checkValidity()){
          input.reportValidity();
          return false;
        }
      }
      return true;
    }

    if(nextBtn) nextBtn.addEventListener('click', ()=>{
      if(!validateCurrent()) return;
      setActive(idx + 1);
    });
    if(backBtn) backBtn.addEventListener('click', ()=> setActive(idx - 1));
    setActive(0);

    // Spam protection on submit
    const form = stepper.querySelector('form');
    const started = Date.now();
    if(form){
      form.addEventListener('submit', (e)=>{
        const elapsed = Date.now() - started;
        const hp = form.querySelector('input[name="company"]');
        const math = form.querySelector('input[name="math_check"]');
        const expected = form.getAttribute('data-math');
        if(hp && hp.value.trim().length){ e.preventDefault(); alert('Submission blocked.'); return; }
        if(elapsed < 2500){ e.preventDefault(); alert('Please wait a moment and try again.'); return; }
        if(math && expected && math.value.trim() !== expected){ e.preventDefault(); alert('Spam check failed. Please answer correctly.'); return; }
        if(!validateCurrent()){ e.preventDefault(); return; }
      });
    }
  }

  
// Delivery timeline click animation
const timeline = document.querySelector('[data-timeline]');
if(timeline){
  const steps = Array.from(timeline.querySelectorAll('[data-tstep]'));
  const bar = timeline.querySelector('[data-tbar]');
  const title = timeline.querySelector('[data-ttitle]');
  const msg = timeline.querySelector('[data-tmsg]');

  const data = steps.map(s => ({
    pct: Number(s.getAttribute('data-pct') || 0),
    title: s.getAttribute('data-title') || s.textContent.trim(),
    msg: s.getAttribute('data-msg') || ''
  }));

  function set(i){
    steps.forEach((s, k)=> s.classList.toggle('active', k === i));
    const d = data[i];
    if(bar) bar.style.width = d.pct + '%';
    if(title) title.textContent = d.title;
    if(msg) msg.textContent = d.msg;
  }
  steps.forEach((s, i)=> s.addEventListener('click', ()=> set(i)));
  set(0);
}

// Floating particles (canvas)
const canvas = document.querySelector('[data-particles]');
if(canvas){
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let w=0, h=0;
  function resize(){
    const rect = canvas.getBoundingClientRect();
    w = Math.floor(rect.width); h = Math.floor(rect.height);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  window.addEventListener('resize', resize);

  const N = 60;
  const dots = Array.from({length:N}, ()=> ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: 0.7 + Math.random()*2.2,
    vx: -0.15 + Math.random()*0.30,
    vy: -0.12 + Math.random()*0.24,
    a: 0.18 + Math.random()*0.35
  }));

  function step(){
    ctx.clearRect(0,0,w,h);
    // dots
    for(const d of dots){
      d.x += d.vx; d.y += d.vy;
      if(d.x < -10) d.x = w + 10;
      if(d.x > w + 10) d.x = -10;
      if(d.y < -10) d.y = h + 10;
      if(d.y > h + 10) d.y = -10;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${d.a})`;
      ctx.fill();
    }
    // soft connecting lines
    for(let i=0;i<dots.length;i++){
      for(let j=i+1;j<dots.length;j++){
        const a = dots[i], b = dots[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 120){
          const op = (1 - dist/120) * 0.12;
          ctx.strokeStyle = `rgba(255,255,255,${op})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}
})();
