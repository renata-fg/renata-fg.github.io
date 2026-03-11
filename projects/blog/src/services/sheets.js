import Papa from 'papaparse';

function normalizePost(row, index) {
  const tags = (row.tags || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: row.id || String(index + 1),
    title: row.title || 'Sem título',
    excerpt: row.excerpt || '',
    url: row.url || '#',
    published_at: row.published_at || '',
    status: (row.status || '').toLowerCase(),
    tags
  };
}

export async function fetchPostsFromSheet(csvUrl) {
  if (!csvUrl) {
    return [];
  }

  // Adiciona timestamp para evitar cache do Google e garantir dados frescos
  const url = new URL(csvUrl);
  url.searchParams.set('cachebust', Date.now());

  const result = await new Promise((resolve, reject) => {
    Papa.parse(url.toString(), {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject
    });
  });

  if (!result?.data) {
    return [];
  }

  return result.data
    .map(normalizePost)
    .filter((post) => post.status === 'published' && post.url !== '#')
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
}
