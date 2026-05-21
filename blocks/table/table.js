export default function decorate(block) {
  const table = document.createElement('table');
  const rows = [...block.children];

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const cells = [...row.children];
    cells.forEach((cell) => {
      const el = document.createElement(i === 0 ? 'th' : 'td');
      el.textContent = cell.textContent.trim();
      tr.append(el);
    });
    if (i === 0) {
      const thead = document.createElement('thead');
      thead.append(tr);
      table.append(thead);
    } else {
      let tbody = table.querySelector('tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        table.append(tbody);
      }
      tbody.append(tr);
    }
  });

  block.textContent = '';
  block.append(table);
}
