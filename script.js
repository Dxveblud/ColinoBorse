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

// Su touch: tocca la foto per vedere il retro della borsa
const isTouch = matchMedia('(hover: none)').matches;
if (isTouch) {
  document.querySelectorAll('.card-img--photo').forEach(img => {
    img.addEventListener('click', () => img.classList.toggle('show-alt'));
  });
}

// Tilt 3D sulla card al movimento del mouse (solo desktop)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && !isTouch) {
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
