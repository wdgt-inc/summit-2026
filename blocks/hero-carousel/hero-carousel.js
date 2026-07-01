import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a single slide from a hero-carousel-slide item row.
 * Cell order: image, title, subtitle, link (href), linkText
 * @param {Element} item  One child div of the hero-carousel block
 * @returns {Element|null}
 */
function buildSlide(item) {
  const cells = [...item.children];
  if (cells.length < 3) return null;

  const picture = cells[0].querySelector('picture');
  const title = cells[1].textContent.trim();
  const subtitle = cells[2].textContent.trim();
  const linkAnchor = cells[3]?.querySelector('a');
  const linkHref = linkAnchor?.href || cells[3]?.textContent.trim();
  const linkText = linkAnchor?.textContent.trim() || cells[4]?.textContent.trim();

  const slide = document.createElement('div');
  slide.className = 'hero-carousel-slide';
  moveInstrumentation(item, slide);

  if (picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'hero-carousel-slide-image';
    imgWrap.append(picture);
    slide.append(imgWrap);
  }

  const overlay = document.createElement('div');
  overlay.className = 'hero-carousel-slide-overlay';

  const textWrap = document.createElement('div');
  textWrap.className = 'hero-carousel-slide-overlay-text';

  const h2 = document.createElement('h2');
  h2.textContent = title;
  h2.setAttribute('data-aue-prop', 'title');
  h2.setAttribute('data-aue-type', 'text');
  moveInstrumentation(cells[1], h2);
  textWrap.append(h2);

  if (subtitle) {
    const p = document.createElement('p');
    p.textContent = subtitle;
    p.setAttribute('data-aue-prop', 'subtitle');
    p.setAttribute('data-aue-type', 'text');
    moveInstrumentation(cells[2], p);
    textWrap.append(p);
  }

  overlay.append(textWrap);

  if (linkHref && linkText) {
    const cta = document.createElement('div');
    cta.className = 'hero-carousel-slide-overlay-cta';
    const a = document.createElement('a');
    a.href = linkHref;
    a.textContent = linkText;
    a.className = 'button primary';
    moveInstrumentation(cells[3], a);
    cta.append(a);
    overlay.append(cta);
  }

  slide.append(overlay);
  return slide;
}

export default function decorate(block) {
  const rows = [...block.children];
  // First two rows are positional config: autoTransition, transitionInterval
  const autoTransition = rows[0]?.children[0]?.textContent.trim() === 'true';
  const transitionInterval = parseInt(rows[1]?.children[0]?.textContent.trim(), 10) || 5;
  const items = rows.slice(2);
  if (!items.length) return;

  const slides = items.map(buildSlide).filter(Boolean);
  if (!slides.length) return;

  // Clip: static overflow:hidden window
  const clip = document.createElement('div');
  clip.className = 'hero-carousel-clip';

  // Viewport: the full-width strip that translates
  const viewport = document.createElement('div');
  viewport.className = 'hero-carousel-viewport';
  slides.forEach((slide) => viewport.append(slide));
  clip.append(viewport);

  // Prev / Next buttons
  const prevBtn = document.createElement('button');
  prevBtn.className = 'hero-carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 13L5 8l5-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'hero-carousel-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Dot indicators
  const dots = document.createElement('div');
  dots.className = 'hero-carousel-dots';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i)); // eslint-disable-line no-use-before-define
    dots.append(dot);
  });

  let current = 0;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    viewport.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.hero-carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  if (autoTransition && slides.length > 1) {
    setInterval(() => goTo(current + 1), transitionInterval * 1000);
  }

  block.replaceChildren(prevBtn, clip, nextBtn, dots);
}
