import decorateHero from '../hero/hero.js';

/**
 * Builds a single slide from a nested hero block.
 * Each carousel child item is a wrapper div containing a div.hero with its own rows.
 * @param {Element} item  One child div of the hero-carousel block (a hero wrapper)
 * @returns {Element|null} A div.hero-carousel-slide containing the decorated hero
 */
function buildSlide(item) {
  const heroBlock = item.querySelector(':scope > .hero');
  if (!heroBlock) return null;

  // The hero block already has its UE instrumentation from the pipeline.
  // Ensure the UE sees it as a container so the Add button appears for hero-links.
  heroBlock.setAttribute('data-aue-type', 'container');
  heroBlock.setAttribute('data-aue-behavior', 'component');

  decorateHero(heroBlock);

  const slide = document.createElement('div');
  slide.className = 'hero-carousel-slide';
  slide.append(heroBlock);
  return slide;
}

export default function decorate(block) {
  // First child is the block name row — skip it, hero wrappers start at index 1
  const items = [...block.children].slice(1);
  if (!items.length) return;

  const slides = items.map(buildSlide).filter(Boolean);
  if (!slides.length) return;

  // Clip: overflow:hidden, static — never moves
  const clip = document.createElement('div');
  clip.className = 'hero-carousel-clip';

  // Viewport: translates to reveal each slide
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

  block.replaceChildren(prevBtn, clip, nextBtn, dots);
}
