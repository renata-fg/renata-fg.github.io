import { useEffect, useMemo, useState } from 'react';
import { fetchPostsFromSheet } from './services/sheets.js';
import { PostCard } from './components/PostCard.jsx';

const FALLBACK_CSV_URL = '';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sheetUrl = useMemo(() => {
    return import.meta.env.VITE_SHEETS_CSV_URL || FALLBACK_CSV_URL;
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchPostsFromSheet(sheetUrl);
        setPosts(data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar artigos.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sheetUrl]);

  return (
    <main className="page">
      <header className="hero">
        <h1>Blog de Pesquisa</h1>
        <p>Publicações e atualizações da minha pesquisa.</p>
      </header>

      {!sheetUrl && (
        <section className="notice">
          <p>Configure <strong>VITE_SHEETS_CSV_URL</strong> para carregar artigos da planilha.</p>
        </section>
      )}

      {loading && <p className="status">Carregando artigos...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="status">Nenhum artigo publicado ainda.</p>
      )}

      <section className="grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </main>
  );
}
