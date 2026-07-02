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
  // Values are stored in block cells by Universal Editor as plain text rows
  const rows = [...block.children];
  const get = (label) => {
    const row = rows.find((r) => r.children[0]?.textContent?.trim().toLowerCase() === label);
    return row?.children[1]?.textContent?.trim() ?? '';
  };

  const authorHost = get('authorhost');
  const publishHost = authorHost
    ? authorHost.replace(/^author-/, 'publish-')
    : '';

  return {
    authorHost,
    publishHost,
    apiKey: get('apikey'),
    bearerToken: get('bearertoken'),
  };
}

async function fetchAssets({ authorHost, apiKey, bearerToken }) {
  const endpoint = `https://${authorHost}/adobe/assets/search`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify(SEARCH_BODY),
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

function buildCard(item, publishHost) {
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

  const grid = document.createElement('div');
  grid.className = 'asset-grid-inner';
  items.forEach((item) => grid.append(buildCard(item, config.publishHost)));
  block.replaceChildren(grid);
}
