export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  const imageCell = rows[0].querySelector('div');
  const titleCell = rows[1].querySelector('div');
  const subtitleCell = rows[2].querySelector('div');

  const imageDiv = document.createElement('div');
  imageDiv.append(...imageCell.childNodes);

  const textDiv = document.createElement('div');

  const h1 = document.createElement('h1');
  h1.textContent = titleCell.textContent.trim();
  textDiv.append(h1);

  const subtitle = document.createElement('p');
  subtitle.textContent = subtitleCell.textContent.trim();
  textDiv.append(subtitle);

  // Remaining rows are link items
  if (rows.length > 3) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    rows.slice(3).forEach((row, idx) => {
      const link = row.querySelector('a');
      if (link) {
        link.classList.add('button');
        if (idx > 0) link.classList.add('secondary');
        buttonContainer.append(link);
      }
    });
    textDiv.append(buttonContainer);
  }

  block.textContent = '';
  block.append(imageDiv, textDiv);
}
