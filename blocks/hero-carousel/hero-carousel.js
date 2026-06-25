import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a single slide element from a block item row.
 * A slide row contains grouped sub-rows: image, title, subtitle, then optional link rows.
 * @param {Element} item  The block item div (data-aue-type="component")
 * @returns {Element} A fully-built slide div
 */
function buildSlide(item) {
  const rows = [...item.children];
  if (rows.length < 3) return null;

  const imageCell = rows[0].querySelector('div');
  const titleCell = rows[1].querySelector('div');
  const subtitleCell = rows[2].querySelector('div');

  const slide = document.createElement('div');
  slide.className = 'hero-carousel-slide';
  moveInstrumentation(item, slide);

  const hasImage = imageCell && imageCell.querySelector('picture');
  if (hasImage) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'hero-carousel-image';
    imageDiv.append(...imageCell.childNodes);
    slide.append(imageDiv);
  }

  const textDiv = document.createElement('div');
  textDiv.className = 'hero-carousel-text';

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

  if (rows.length > 3) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    rows.slice(3).forEach((row) => {
      const cells = row.querySelectorAll(':scope > div');
      const link = row.querySelector('a');
      if (link) {
        moveInstrumentation(row, link);
        link.classList.add('button');
        const iconCell = cells[1];
        if (iconCell) {
          const iconName = iconCell.textContent.trim();
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
        }
        buttonContainer.append(link);
      }
    });
    textDiv.append(buttonContainer);
  }

  slide.append(textDiv);
  return slide;
}

export default function decorate(block) {
  const items = [...block.children];
  if (!items.length) return;

  // Build track containing all slides
  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  const slides = items.map(buildSlide).filter(Boolean);
  if (!slides.length) return;
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
