// Reveal on scroll, con effetto cascata per elementi vicini
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.setProperty('--d', `${(i % 4) * .12}s`);
  io.observe(el);
});

// Ombra alla nav dopo lo scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Retro della borsa (seconda foto)
const isTouch = matchMedia('(hover: none)').matches;
const photoCards = document.querySelectorAll('.card-img--photo');
if (isTouch) {
  // Su mobile la seconda foto si rivela da sola quando la card è al centro dello schermo mentre si scorre
  const flipIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('show-alt', e.isIntersecting));
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
  photoCards.forEach(c => flipIO.observe(c));
} else {
  // Su desktop resta il click per fissare il retro (oltre all'hover)
  photoCards.forEach(img => img.addEventListener('click', () => img.classList.toggle('show-alt')));
}

// Form contatto (solo pagina contatti)
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.disabled = true;
    status.textContent = 'Invio in corso…';
    status.className = 'form-status';
    // indirizzo spezzato per non esporlo agli spam-bot che leggono il sorgente
    const dest = ['dxve', '97', '@gm', 'ail.com'].join('');
    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch(`https://formsubmit.co/ajax/${dest}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          ...data,
          _subject: `Nuovo messaggio dal sito — ${data.nome}`,
          _captcha: 'false',
          _template: 'table'
        })
      });
      if (!res.ok) throw new Error();
      status.textContent = 'Messaggio inviato! Ti risponderò al più presto ♥';
      status.className = 'form-status ok';
      form.reset();
    } catch {
      status.textContent = 'Ops, qualcosa è andato storto. Riprova tra poco.';
      status.className = 'form-status err';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Barra di avanzamento scroll
const progress = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}, { passive: true });

// Tilt 3D sulla card al movimento del mouse (solo desktop)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Particelle fluttuanti nella hero (puntini che salgono lentamente)
if (!reduceMotion) {
  const hero = document.querySelector('header');
  for (let i = 0; i < 16; i++) {
    const d = document.createElement('span');
    d.className = 'dot';
    const size = 3 + Math.random() * 5;
    d.style.width = d.style.height = `${size}px`;
    d.style.left = `${Math.random() * 100}%`;
    d.style.bottom = `-${5 + Math.random() * 10}vh`;
    d.style.animationDuration = `${14 + Math.random() * 18}s`;
    d.style.animationDelay = `-${Math.random() * 20}s`;
    hero.appendChild(d);
  }
}

if (!reduceMotion && !isTouch) {
  // Bottoni magnetici: seguono leggermente il mouse
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .18}px, ${y * .3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform =
        `translateY(-6px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Parallax leggero sulla hero
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < innerHeight) {
        heroInner.style.transform = `translateY(${y * .25}px)`;
        heroInner.style.opacity = 1 - y / (innerHeight * .9);
      }
    }, { passive: true });
  }
}
