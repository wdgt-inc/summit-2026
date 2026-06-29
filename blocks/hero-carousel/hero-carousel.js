import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a single slide from one carousel item.
 * Each item's direct children are the hero cells: image, title, subtitle,
 * then optional link cells — matching the flat cell structure in the raw DOM.
 * @param {Element} item  One child div of the hero-carousel block (excluding the name row)
 * @returns {Element} A div.hero-carousel-slide containing a decorated .hero element
 */
function buildSlide(item) {
  const cells = [...item.children];
  if (cells.length < 3) return null;

  const imageCell = cells[0];
  const titleCell = cells[1];
  const subtitleCell = cells[2];

  const heroBlock = document.createElement('div');
  heroBlock.className = 'hero block';
  moveInstrumentation(item, heroBlock);
  // Make the UE treat this as a container so the Add button appears
  heroBlock.setAttribute('data-aue-type', 'container');
  heroBlock.setAttribute('data-aue-behavior', 'component');
  heroBlock.setAttribute('data-aue-filter', 'hero-carousel-slide');

  const hasImage = imageCell.querySelector('picture');
  const imageDiv = document.createElement('div');
  if (hasImage) {
    imageDiv.append(...imageCell.childNodes);
  }

  const textDiv = document.createElement('div');

  const h1 = document.createElement('h1');
  h1.textContent = titleCell.textContent.trim();
  h1.setAttribute('data-aue-prop', 'title');
  h1.setAttribute('data-aue-type', 'text');
  moveInstrumentation(titleCell, h1);
  textDiv.append(h1);

  const subtitle = document.createElement('p');
  subtitle.textContent = subtitleCell.textContent.trim();
  subtitle.setAttribute('data-aue-prop', 'subtitle');
  subtitle.setAttribute('data-aue-type', 'text');
  moveInstrumentation(subtitleCell, subtitle);
  textDiv.append(subtitle);

  // Remaining cells are link items
  if (cells.length > 3) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    cells.slice(3).forEach((cell) => {
      const link = cell.querySelector('a');
      if (link) {
        moveInstrumentation(cell, link);
        link.classList.add('button');
        const iconName = cell.children[1]?.textContent.trim();
        if (iconName) {
          const iconSpan = document.createElement('span');
          iconSpan.className = `icon icon-${iconName}`;
          const img = document.createElement('img');
          img.src = `/icons/${iconName}.svg`;
          img.alt = '';
          img.loading = 'lazy';
          iconSpan.append(img);
          link.append(iconSpan);
        }
        buttonContainer.append(link);
      }
    });
    textDiv.append(buttonContainer);
  }

  if (hasImage) {
    heroBlock.replaceChildren(imageDiv, textDiv);
  } else {
    heroBlock.replaceChildren(textDiv);
  }

  const slide = document.createElement('div');
  slide.className = 'hero-carousel-slide';
  slide.append(heroBlock);
  return slide;
}

export default function decorate(block) {
  // First child is the block name row — skip it, slides start at index 1
  const items = [...block.children].slice(1);
  if (!items.length) return;

  const slides = items.map(buildSlide).filter(Boolean);
  if (!slides.length) return;

  // Clip: overflow:hidden, static — never moves
  const clip = document.createElement('div');
  clip.className = 'hero-carousel-clip';

  // Track: translates to reveal each slide
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
