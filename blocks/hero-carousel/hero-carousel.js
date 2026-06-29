import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a single slide from a carousel item row and its associated link rows.
 * @param {Element} item   The hero slide row
 * @param {Element[]} links  Sibling hero-link rows that belong to this slide
 * @returns {Element|null} A div.hero-carousel-slide containing a decorated hero div
 */
function buildSlide(item, links) {
  const rows = [...item.children];
  if (rows.length < 3) return null;

  // Each row is: div > div(cell). Grab the inner cell for image/title/subtitle rows.
  const imageCell = rows[0].querySelector(':scope > div') || rows[0];
  const titleCell = rows[1].querySelector(':scope > div') || rows[1];
  const subtitleCell = rows[2].querySelector(':scope > div') || rows[2];

  const heroBlock = document.createElement('div');
  heroBlock.className = 'hero block';

  // Move UE instrumentation from the item; override type so Add button appears
  moveInstrumentation(item, heroBlock);
  heroBlock.setAttribute('data-aue-type', 'container');
  heroBlock.setAttribute('data-aue-behavior', 'component');
  heroBlock.setAttribute('data-aue-filter', 'hero-carousel');

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

  // Render the sibling hero-link rows as buttons
  if (links.length) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    links.forEach((linkRow) => {
      const cells = linkRow.querySelectorAll(':scope > div');
      const link = linkRow.querySelector('a');
      if (link) {
        moveInstrumentation(linkRow, link);
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
  // Skip any name row — identified as a row whose cells are all empty
  const isNameRow = (el) => [...el.querySelectorAll(':scope > div')].every((c) => !c.textContent.trim() && !c.querySelector('picture'));
  const allItems = [...block.children].filter((item) => !isNameRow(item));
  if (!allItems.length) return;

  // Group hero-link rows with the preceding hero slide row
  const grouped = [];
  allItems.forEach((item) => {
    const isLink = item.querySelector('a');
    if (isLink && grouped.length) {
      grouped[grouped.length - 1].links.push(item);
    } else {
      grouped.push({ slide: item, links: [] });
    }
  });

  const slides = grouped.map(({ slide, links }) => buildSlide(slide, links)).filter(Boolean);
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
