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
    body.query = [
      ...SEARCH_BODY.query,
      {
        match: {
          text: aemPath,
          fields: ['repositoryMetadata.repo:path'],
          operator: 'startsWith',
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

  // Mutable sort state
  let sortKey = 'size';
  let sortAsc = false;

  const grid = document.createElement('div');
  grid.className = 'asset-grid-inner';

  function renderGrid() {
    const option = SORT_OPTIONS.find((o) => o.key === sortKey);
    const sorted = [...items].sort((a, b) => {
      const av = option.getValue(a);
      const bv = option.getValue(b);
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    grid.replaceChildren(...sorted.map((item) => buildCard(item, config.publishHost, drawer)));
  }

  // Sort bar
  const sortBar = document.createElement('div');
  sortBar.className = 'asset-grid-sort-bar';

  const sortLabel = document.createElement('label');
  sortLabel.className = 'asset-grid-sort-label';
  sortLabel.textContent = 'Sort by:';
  sortLabel.setAttribute('for', 'asset-grid-sort-field');

  const fieldSelect = document.createElement('select');
  fieldSelect.className = 'asset-grid-sort-select';
  fieldSelect.id = 'asset-grid-sort-field';
  SORT_OPTIONS.forEach(({ key, label }) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    opt.selected = key === sortKey;
    fieldSelect.append(opt);
  });

  const dirSelect = document.createElement('select');
  dirSelect.className = 'asset-grid-sort-select';
  dirSelect.setAttribute('aria-label', 'Sort direction');
  [['Descending', 'false'], ['Ascending', 'true']].forEach(([label, value]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    opt.selected = value === String(sortAsc);
    dirSelect.append(opt);
  });

  const onChange = () => {
    sortKey = fieldSelect.value;
    sortAsc = dirSelect.value === 'true';
    renderGrid();
  };

  fieldSelect.addEventListener('change', onChange);
  dirSelect.addEventListener('change', onChange);

  sortBar.append(sortLabel, fieldSelect, dirSelect);

  renderGrid();

  const children = [];
  if (config.title) {
    const h2 = document.createElement('h2');
    h2.textContent = config.title;
    children.push(h2);
  }
  children.push(sortBar, grid);
  block.replaceChildren(...children);
}
