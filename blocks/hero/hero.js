import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  const imageCell = rows[0].querySelector('div');
  const titleCell = rows[1].querySelector('div');
  const subtitleCell = rows[2].querySelector('div');

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

  // Remaining rows are link items
  if (rows.length > 3) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    rows.slice(3).forEach((row) => {
      const cells = row.querySelectorAll(':scope > div');
      const link = row.querySelector('a');
      if (link) {
        moveInstrumentation(row, link);
        link.classList.add('button');
        // Check for icon in second cell
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

  if (hasImage) {
    block.replaceChildren(imageDiv, textDiv);
  } else {
    block.replaceChildren(textDiv);
  }
}
