import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a single slide from a carousel item row.
 * The pipeline renders hero children as flat item rows: each item's direct children
 * are the hero cells — image, title, subtitle — followed by optional link rows.
 * @param {Element} item  One child div of the hero-carousel block (excluding the name row)
 * @returns {Element|null} A div.hero-carousel-slide containing a decorated hero div
 */
function buildSlide(item) {
  const rows = [...item.children];
  if (rows.length < 3) return null;

  // Each row is: div > div(cell). Grab the inner cell for image/title/subtitle rows.
  const imageCell = rows[0].querySelector(':scope > div') || rows[0];
  const titleCell = rows[1].querySelector(':scope > div') || rows[1];
  const subtitleCell = rows[2].querySelector(':scope > div') || rows[2];

  const heroBlock = document.createElement('div');
  heroBlock.className = 'hero block';

  // Move the UE instrumentation from the item onto the hero block,
  // then override the type to "container" so the UE Add button appears.
  moveInstrumentation(item, heroBlock);
  heroBlock.setAttribute('data-aue-type', 'container');
  heroBlock.setAttribute('data-aue-behavior', 'component');
  heroBlock.setAttribute('data-aue-filter', 'hero');

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
  moveInstrumentation(rows[1], h1);
  textDiv.append(h1);

  const subtitle = document.createElement('p');
  subtitle.textContent = subtitleCell.textContent.trim();
  subtitle.setAttribute('data-aue-prop', 'subtitle');
  subtitle.setAttribute('data-aue-type', 'text');
  moveInstrumentation(rows[2], subtitle);
  textDiv.append(subtitle);

  // rows[3+] are hero-link rows, each with two cells: link and icon name
  if (rows.length > 3) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    rows.slice(3).forEach((row) => {
      const cells = row.querySelectorAll(':scope > div');
      const link = row.querySelector('a');
      if (link) {
        moveInstrumentation(row, link);
        link.classList.add('button');
        const iconName = cells[1]?.textContent.trim();
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
  // First child is the block name row — skip it, slide rows start at index 1
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
