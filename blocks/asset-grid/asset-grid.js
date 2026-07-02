const SORT_OPTIONS = [
  { label: 'Name', key: 'name', getValue: (item) => item.repositoryMetadata['repo:name'] ?? '' },
  { label: 'Size', key: 'size', getValue: (item) => item.repositoryMetadata['repo:size'] ?? 0 },
  { label: 'Modified', key: 'modified', getValue: (item) => item.repositoryMetadata['repo:modifyDate'] ?? '' },
  { label: 'Published', key: 'published', getValue: (item) => item.repositoryMetadata['aem:published'] ?? '' },
];

const SEARCH_BODY = {
  query: [
    {
      term: {
        'repositoryMetadata.dc:format': [
          'image/jpeg',
          'image/png',
        ],
      },
    },
    {
      exists: {
        field: 'repositoryMetadata.aem:published',
      },
    },
  ],
  limit: 40,
  sort: [
    {
      field: 'repositoryMetadata.repo:size',
      order: 'DESC',
    },
  ],
};

function getConfig(block) {
  // Rows are positional: 0=title, 1=authorHost, 2=apiKey, 3=bearerToken, 4=aemPath
  const rows = [...block.children];
  const cell = (rowIndex) => rows[rowIndex]?.children[0]?.textContent?.trim() ?? '';

  const authorHost = cell(1);
  const publishHost = authorHost ? authorHost.replace(/^author-/, 'publish-') : '';

  return {
    title: cell(0),
    authorHost,
    publishHost,
    apiKey: cell(2),
    bearerToken: cell(3),
    aemPath: cell(4),
  };
}

async function fetchAssets({ authorHost, apiKey, bearerToken, aemPath }) {
  const endpoint = `https://${authorHost}/adobe/assets/search`;

  const body = { ...SEARCH_BODY };
  if (aemPath) {
    const ancestorUrn = `urn:aaid:aem:${aemPath.replace(/\//g, '*')}`;
    body.query = [
      ...SEARCH_BODY.query,
      {
        term: {
          'repositoryMetadata.repo:ancestors': [ancestorUrn],
        },
      },
    ];
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`AEM Assets search failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function buildImageUrl(item, publishHost) {
  const uuid = item.assetId.replace('urn:aaid:aem:', '');
  const name = encodeURIComponent(item.repositoryMetadata['repo:name'] ?? 'asset');
  return `https://${publishHost}/adobe/dynamicmedia/deliver/dm-aid--${uuid}/${name}?preferwebp=true&quality=85&width=400`;
}

function buildDrawer() {
  const overlay = document.createElement('div');
  overlay.className = 'asset-drawer-overlay';

  const drawer = document.createElement('aside');
  drawer.className = 'asset-drawer';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'asset-drawer-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕';

  const content = document.createElement('div');
  content.className = 'asset-drawer-content';

  drawer.append(closeBtn, content);
  overlay.append(drawer);

  const close = () => {
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  overlay.open = (item, publishHost) => {
    const rm = item.repositoryMetadata;
    const am = item.assetMetadata ?? {};
    const name = rm['repo:name'] ?? '';
    const title = am['autogen:title'] ?? name;
    const description = am['autogen:description'] ?? '';

    const repoFields = [
      ['Name', rm['repo:name']],
      ['Format', rm['dc:format']],
      ['Dimensions', (rm['tiff:imageWidth'] && rm['tiff:imageLength']) ? `${rm['tiff:imageWidth']} × ${rm['tiff:imageLength']}` : null],
      ['Size', rm['repo:size'] != null ? formatBytes(rm['repo:size']) : null],
      ['Path', rm['repo:path']],
      ['Created', rm['repo:createDate'] ? formatDate(rm['repo:createDate']) : null],
      ['Modified', rm['repo:modifyDate'] ? formatDate(rm['repo:modifyDate']) : null],
      ['Published', rm['aem:published'] ? formatDate(rm['aem:published']) : null],
      ['Created by', rm['repo:createdBy']],
      ['Modified by', rm['repo:modifiedBy']],
      ['Asset state', rm['aem:assetState']],
    ].filter(([, v]) => v);

    const subjects = am['autogen:subject'] ?? [];

    const uuid = item.assetId.replace('urn:aaid:aem:', '');
    const imgSrc = buildImageUrl(item, publishHost);

    content.innerHTML = '';

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.className = 'asset-drawer-image';

    const h2 = document.createElement('h2');
    h2.className = 'asset-drawer-title';
    h2.textContent = title;

    content.append(img, h2);

    if (description) {
      const p = document.createElement('p');
      p.className = 'asset-drawer-description';
      p.textContent = description;
      content.append(p);
    }

    if (subjects.length) {
      const tagWrap = document.createElement('div');
      tagWrap.className = 'asset-drawer-tags';
      subjects.forEach((s) => {
        const tag = document.createElement('span');
        tag.className = 'asset-drawer-tag';
        tag.textContent = s;
        tagWrap.append(tag);
      });
      content.append(tagWrap);
    }

    const table = document.createElement('table');
    table.className = 'asset-drawer-meta';
    repoFields.forEach(([label, value]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<th>${label}</th><td>${value}</td>`;
      table.append(tr);
    });
    content.append(table);

    overlay.classList.add('is-open');
    document.addEventListener('keydown', onKey);
  };

  return overlay;
}

function buildCard(item, publishHost, drawer) {
  const rm = item.repositoryMetadata;
  const am = item.assetMetadata ?? {};

  const name = rm['repo:name'] ?? '';
  const format = rm['dc:format'] ?? '';
  const width = rm['tiff:imageWidth'] ?? '';
  const height = rm['tiff:imageLength'] ?? '';
  const size = rm['repo:size'] != null ? formatBytes(rm['repo:size']) : '';
  const modified = rm['repo:modifyDate'] ? formatDate(rm['repo:modifyDate']) : '';
  const title = am['autogen:title'] ?? '';
  const description = am['autogen:description'] ?? '';

  const card = document.createElement('div');
  card.className = 'asset-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('click', () => drawer.open(item, publishHost));
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') drawer.open(item, publishHost); });

  // Image
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'asset-card-image';
  const img = document.createElement('img');
  img.src = buildImageUrl(item, publishHost);
  img.alt = title || name;
  img.loading = 'lazy';
  imgWrapper.append(img);

  // Body
  const body = document.createElement('div');
  body.className = 'asset-card-body';

  const heading = document.createElement('p');
  heading.className = 'asset-card-name';
  heading.textContent = name;
  body.append(heading);

  if (title) {
    const titleEl = document.createElement('p');
    titleEl.className = 'asset-card-title';
    titleEl.textContent = title;
    body.append(titleEl);
  }

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'asset-card-description';
    desc.textContent = description;
    body.append(desc);
  }

  const meta = document.createElement('ul');
  meta.className = 'asset-card-meta';
  const metaItems = [
    ['Format', format],
    ['Dimensions', width && height ? `${width} × ${height}` : ''],
    ['Size', size],
    ['Modified', modified],
  ].filter(([, v]) => v);

  metaItems.forEach(([label, value]) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="asset-card-meta-label">${label}</span> ${value}`;
    meta.append(li);
  });
  body.append(meta);

  card.append(imgWrapper, body);
  return card;
}

export default async function decorate(block) {
  const config = getConfig(block);

  if (!config.authorHost || !config.apiKey || !config.bearerToken) {
    block.textContent = 'Asset Grid: authorHost, apiKey and bearerToken must be configured.';
    return;
  }

  block.textContent = 'Loading assets…';

  let data;
  try {
    data = await fetchAssets(config);
  } catch (err) {
    block.textContent = `Error: ${err.message}`;
    return;
  }

  const items = (data?.hits?.results ?? []).filter((item) => item.repositoryMetadata?.['aem:published']);

  if (items.length === 0) {
    block.textContent = 'No assets found.';
    return;
  }

  const drawer = buildDrawer();
  document.body.append(drawer);

  const PAGE_SIZE = 12;

  // Mutable sort/page state
  let sortKey = 'size';
  let sortAsc = false;
  let currentPage = 0;

  const grid = document.createElement('div');
  grid.className = 'asset-grid-inner';

  const pagination = document.createElement('div');
  pagination.className = 'asset-grid-pagination';

  function renderGrid() {
    const option = SORT_OPTIONS.find((o) => o.key === sortKey);
    const sorted = [...items].sort((a, b) => {
      const av = option.getValue(a);
      const bv = option.getValue(b);
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    // Clamp page in case sort reduced total
    if (currentPage >= totalPages) currentPage = Math.max(0, totalPages - 1);

    const pageItems = sorted.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
    grid.replaceChildren(...pageItems.map((item) => buildCard(item, config.publishHost, drawer)));

    // Pagination controls
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'asset-grid-page-btn';
    prevBtn.textContent = '←';
    prevBtn.setAttribute('aria-label', 'Previous page');
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener('click', () => { currentPage -= 1; renderGrid(); });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'asset-grid-page-btn';
    nextBtn.textContent = '→';
    nextBtn.setAttribute('aria-label', 'Next page');
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.addEventListener('click', () => { currentPage += 1; renderGrid(); });

    const pageInfo = document.createElement('span');
    pageInfo.className = 'asset-grid-page-info';
    pageInfo.textContent = `${currentPage + 1} / ${totalPages}`;

    pagination.append(prevBtn, pageInfo, nextBtn);
  }

  // Custom dropdown helper — fully styled, keyboard accessible
  function buildCustomSelect(options, selectedValue, ariaLabel, onChangeFn) {
    const wrapper = document.createElement('div');
    wrapper.className = 'asset-grid-custom-select';
    wrapper.setAttribute('role', 'combobox');
    wrapper.setAttribute('aria-haspopup', 'listbox');
    wrapper.setAttribute('aria-expanded', 'false');
    wrapper.setAttribute('aria-label', ariaLabel);
    wrapper.setAttribute('tabindex', '0');

    const trigger = document.createElement('div');
    trigger.className = 'asset-grid-custom-select-trigger';

    const triggerText = document.createElement('span');
    const currentOption = options.find(([, v]) => v === selectedValue) ?? options[0];
    triggerText.textContent = currentOption[0];
    trigger.append(triggerText);

    const chevron = document.createElement('span');
    chevron.className = 'asset-grid-custom-select-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    trigger.append(chevron);

    const listbox = document.createElement('ul');
    listbox.className = 'asset-grid-custom-select-listbox';
    listbox.setAttribute('role', 'listbox');

    let currentValue = selectedValue ?? options[0][1];

    options.forEach(([label, value]) => {
      const item = document.createElement('li');
      item.className = 'asset-grid-custom-select-option';
      item.setAttribute('role', 'option');
      item.setAttribute('data-value', value);
      item.setAttribute('aria-selected', String(value === currentValue));
      item.textContent = label;
      if (value === currentValue) item.classList.add('is-selected');

      item.addEventListener('click', () => {
        if (value === currentValue) { close(); return; }
        currentValue = value;
        triggerText.textContent = label;
        listbox.querySelectorAll('.asset-grid-custom-select-option').forEach((o) => {
          const sel = o.dataset.value === currentValue;
          o.setAttribute('aria-selected', String(sel));
          o.classList.toggle('is-selected', sel);
        });
        close();
        onChangeFn(currentValue);
      });

      listbox.append(item);
    });

    wrapper.append(trigger, listbox);

    const open = () => {
      wrapper.classList.add('is-open');
      wrapper.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      wrapper.classList.remove('is-open');
      wrapper.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', () => (wrapper.classList.contains('is-open') ? close() : open()));
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wrapper.classList.contains('is-open') ? close() : open(); }
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = [...listbox.querySelectorAll('.asset-grid-custom-select-option')];
        const idx = items.findIndex((o) => o.dataset.value === currentValue);
        const next = e.key === 'ArrowDown' ? items[idx + 1] : items[idx - 1];
        if (next) next.click();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => { if (!wrapper.contains(e.target)) close(); }, true);

    wrapper.getValue = () => currentValue;
    return wrapper;
  }

  // Sort bar
  const sortBar = document.createElement('div');
  sortBar.className = 'asset-grid-sort-bar';

  const sortLabel = document.createElement('span');
  sortLabel.className = 'asset-grid-sort-label';
  sortLabel.textContent = 'Sort by:';

  const fieldDropdown = buildCustomSelect(
    SORT_OPTIONS.map(({ key, label }) => [label, key]),
    sortKey,
    'Sort field',
    (value) => { sortKey = value; currentPage = 0; renderGrid(); },
  );

  const dirDropdown = buildCustomSelect(
    [['Descending', 'false'], ['Ascending', 'true']],
    String(sortAsc),
    'Sort direction',
    (value) => { sortAsc = value === 'true'; currentPage = 0; renderGrid(); },
  );

  const sortControls = document.createElement('div');
  sortControls.className = 'asset-grid-sort-controls';
  sortControls.append(sortLabel, fieldDropdown, dirDropdown);
  sortBar.append(sortControls);

  renderGrid();

  const children = [];
  if (config.title) {
    const h2 = document.createElement('h2');
    h2.textContent = config.title;
    children.push(h2);
  }
  const toolbar = document.createElement('div');
  toolbar.className = 'asset-grid-toolbar';

  const pathEl = document.createElement('p');
  pathEl.className = 'asset-grid-path';
  if (config.aemPath) {
    pathEl.innerHTML = `<span class="asset-grid-path-label">DAM Path</span> ${config.aemPath}`;
  }
  toolbar.append(pathEl, sortBar);

  children.push(toolbar, grid, pagination);
  block.replaceChildren(...children);
}
