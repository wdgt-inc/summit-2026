import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const cells = [...row.children];

    const imageCell = cells[0];
    const headingCell = cells[1];
    const textCell = cells[2];
    const linkCell = cells[3];

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

    if (linkCell) {
      const link = linkCell.querySelector('a');
      if (link) {
        link.classList.add('button');
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
