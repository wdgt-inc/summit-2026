export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 4) return;

  const imageRow = rows[0];
  const titleRow = rows[1];
  const subtitleRow = rows[2];
  const linksRow = rows[3];

  const imageDiv = document.createElement('div');
  imageDiv.className = 'hero-image';
  imageDiv.append(...imageRow.querySelector('div').childNodes);

  const textDiv = document.createElement('div');
  textDiv.className = 'hero-text';

  const h1 = document.createElement('h1');
  h1.textContent = titleRow.querySelector('div').textContent.trim();
  textDiv.append(h1);

  const p = document.createElement('p');
  p.textContent = subtitleRow.querySelector('div').textContent.trim();
  textDiv.append(p);

  const linksContent = linksRow.querySelector('div');
  if (linksContent) {
    const buttonContainer = document.createElement('p');
    buttonContainer.className = 'button-container';
    const links = linksContent.querySelectorAll('a');
    links.forEach((link, i) => {
      link.classList.add('button');
      if (i > 0) link.classList.add('secondary');
      buttonContainer.append(link);
    });
    textDiv.append(buttonContainer);
  }

  block.textContent = '';
  block.append(imageDiv, textDiv);
}
