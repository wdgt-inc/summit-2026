export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length > 0) {
    const content = rows[0].querySelector('div');
    if (content) {
      const paragraphs = content.querySelectorAll('p:not(.button-container):not(:last-child)');
      paragraphs.forEach((p) => {
        if (!p.querySelector('strong') && !p.querySelector('a') && p.textContent.trim() && !p.closest('h3')) {
          const label = p.textContent.trim();
          if (label !== '') {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-field';

            const labelEl = document.createElement('label');
            labelEl.textContent = label;

            const input = document.createElement('input');
            input.type = label.toLowerCase().includes('email') ? 'email' : 'text';
            input.placeholder = `Enter your ${label.toLowerCase()}`;
            input.className = 'form-input';

            wrapper.append(labelEl, input);
            p.replaceWith(wrapper);
          }
        }
      });
    }
  }
}
