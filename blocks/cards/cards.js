import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const cells = [...row.children];

    if (cells.length >= 4) {
      // New model: image, heading, text, link
      const imageCell = cells[0];
      const headingCell = cells[1];
      const textCell = cells[2];
      const linkCell = cells[3];

      if (imageCell.querySelector('picture')) {
        imageCell.className = 'cards-card-image';
        li.append(imageCell);
      }

      const body = document.createElement('div');
      body.className = 'cards-card-body';

      const headingText = headingCell.textContent.trim();
      if (headingText) {
        const heading = document.createElement('p');
        heading.innerHTML = `<strong>${headingText}</strong>`;
        body.append(heading);
      }

      const textContent = textCell.innerHTML.trim();
      if (textContent) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = textContent;
        while (wrapper.firstChild) body.append(wrapper.firstChild);
      }

      const link = linkCell.querySelector('a');
      if (link) {
        link.classList.add('button');
        const btnContainer = document.createElement('p');
        btnContainer.className = 'button-container';
        btnContainer.append(link);
        body.append(btnContainer);
      }

      li.append(body);
    } else {
      // Legacy 2-cell model: image + body
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
        else div.className = 'cards-card-body';
      });
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
