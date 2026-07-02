const API_ENDPOINT = 'https://author-p10681-e1696505.adobeaemcloud.com/adobe/assets/search';
const API_KEY = ''; // TODO: add API key for local testing
const BEARER_TOKEN = ''; // TODO: add bearer token for local testing

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
  ],
  limit: 10,
  sort: [
    {
      field: 'repositoryMetadata.repo:size',
      order: 'DESC',
    },
  ],
};

async function fetchAssets() {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
    body: JSON.stringify(SEARCH_BODY),
  });

  if (!response.ok) {
    throw new Error(`AEM Assets search failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export default async function decorate(block) {
  block.textContent = 'Loading assets…';

  let data;
  try {
    data = await fetchAssets();
  } catch (err) {
    block.textContent = `Error: ${err.message}`;
    return;
  }

  const items = data?.items ?? data?.hits ?? data?.results ?? [];

  if (items.length === 0) {
    block.textContent = 'No assets found.';
    return;
  }

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(items, null, 2);
  block.replaceChildren(pre);
}
