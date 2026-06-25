import { moveInstrumentation } from '../../scripts/scripts.js';
import decorateHero from '../hero/hero.js';

/**
 * Wraps each child item in a temporary hero block, runs the hero decorator on it,
 * then returns the resulting hero element as a carousel slide.
 * @param {Element} item  One child div of the hero-carousel block
 * @returns {Element} A div.hero slide element
 */
function buildSlide(item) {
  // Create a throw-away hero block with the same row structure as the item
  const heroBlock = document.createElement('div');
  heroBlock.className = 'hero block';
  heroBlock.dataset.blockName = 'hero';
  moveInstrumentation(item, heroBlock);
  heroBlock.append(...item.childNodes);

  // Run the standard hero decorator — it calls replaceChildren internally
  decorateHero(heroBlock);

  const slide = document.createElement('div');
  slide.className = 'hero-carousel-slide';
  slide.append(heroBlock);
  return slide;
}

export default function decorate(block) {
  const items = [...block.children];
  if (!items.length) return;

  const slides = items.map(buildSlide);

  // Track
  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  slides.forEach((slide) => track.append(slide));

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
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.hero-carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  block.replaceChildren(prevBtn, track, nextBtn, dots);
}
