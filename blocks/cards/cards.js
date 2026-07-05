import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function decoratePackageCard(body) {
  // Skip the heading <p> (contains <strong>) — only process the text paragraphs
  const paragraphs = [...body.querySelectorAll('p')].filter((p) => !p.querySelector('strong'));
  const dl = document.createElement('dl');
  dl.className = 'cards-package-rows';
  const outputSection = document.createElement('div');
  outputSection.className = 'cards-package-output';

  let inOutput = false;
  paragraphs.forEach((p) => {
    if (!inOutput && p.textContent.includes('|')) {
      const [label, value] = p.textContent.split('|').map((s) => s.trim());
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dl.append(dt, dd);
      p.remove();
    } else {
      inOutput = true;
      outputSection.append(p);
    }
  });

  // Insert dl after the heading (first child) if present, otherwise prepend
  const firstChild = body.firstChild;
  if (firstChild) {
    firstChild.after(dl);
  } else {
    body.append(dl);
  }
  if (outputSection.childElementCount) body.append(outputSection);
}

export default function decorate(block) {
  const isPackage = block.classList.contains('package');
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const cells = [...row.children];

    const imageCell = cells[0];
    const headingCell = cells[1];
    const textCell = cells[2];
    const linkCell = cells[3];
    const targetCell = cells[4];

    if (imageCell && imageCell.querySelector('picture')) {
      imageCell.className = 'cards-card-image';
      li.append(imageCell);
    }

    const body = document.createElement('div');
    body.className = 'cards-card-body';

    if (headingCell) {
      const headingText = headingCell.textContent.trim();
      if (headingText) {
        const heading = document.createElement('p');
        heading.innerHTML = `<strong>${headingText}</strong>`;
        heading.setAttribute('data-aue-prop', 'heading');
        heading.setAttribute('data-aue-type', 'text');
        moveInstrumentation(headingCell, heading);
        body.append(heading);
      }
    }

    if (textCell) {
      const textContent = textCell.innerHTML.trim();
      if (textContent) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = textContent;
        while (wrapper.firstChild) body.append(wrapper.firstChild);
      }
    }

    if (isPackage) decoratePackageCard(body);

    if (linkCell) {
      const link = linkCell.querySelector('a');
      if (link) {
        link.classList.add('button');
        const linkTarget = targetCell && targetCell.textContent.trim();
        if (linkTarget) {
          link.target = linkTarget;
          if (linkTarget === '_blank') link.rel = 'noopener noreferrer';
        }
        const btnContainer = document.createElement('p');
        btnContainer.className = 'button-container';
        btnContainer.append(link);
        body.append(btnContainer);
      }
    }

    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
