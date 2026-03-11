export function PostCard({ post }) {
  return (
    <article className="card">
      <p className="meta">{post.published_at || 'Sem data'}</p>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <div className="tags">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">#{tag}</span>
        ))}
      </div>
      <a href={post.url} target="_blank" rel="noreferrer">Ler artigo</a>
    </article>
  );
}
