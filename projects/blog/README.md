# Blog (React + Vite)

Usa Google Sheets como CMS. Você edita a planilha e o blog reflete as mudanças automaticamente na próxima visita.

---

## 1. Criar a planilha no Google Sheets

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha nova.
2. Renomeie a aba inferior para **Posts** (clique duas vezes no nome da aba).
3. Na primeira linha, adicione exatamente estes cabeçalhos (uma coluna cada):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| id | title | excerpt | url | published_at | status | tags |

4. Preencha as próximas linhas com seus artigos. Exemplo:

| id | title | excerpt | url | published_at | status | tags |
|----|-------|---------|-----|--------------|--------|------|
| post-001 | Meu primeiro artigo | Resumo breve do artigo | https://medium.com/... | 2026-03-11 | published | pesquisa, ux |
| post-002 | Rascunho em andamento | ... | https://... | 2026-03-20 | draft | produto |

> Só aparecem no blog linhas com `status = published` e `url` preenchida.

---

## 2. Publicar a planilha como CSV

1. Na planilha, vá em **Arquivo → Compartilhar → Publicar na web**
2. Mude o primeiro dropdown para a aba **Posts**
3. Mude o segundo dropdown para **Valores separados por vírgula (.csv)**
4. Clique em **Publicar** e confirme
5. Copie o link gerado — ele vai parecer com:
   ```
   https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/pub?gid=0&single=true&output=csv
   ```

---

## 3. Configurar o projeto

Crie o arquivo `.env` dentro de `projects/blog`:

```
VITE_SHEETS_CSV_URL=COLE_O_LINK_CSV_AQUI
```

Ou copie o modelo:
```bash
cp .env.example .env
```

---

## 4. Rodar localmente

```bash
cd projects/blog
npm install   # só na primeira vez
npm run dev
```

Acesse em: `http://localhost:5173`

---

## Como atualizar o blog

Basta editar a planilha no Google Sheets e recarregar a página. Não precisa mexer em código.

- Para **publicar** um artigo: coloque `published` na coluna `status`
- Para **despublicar**: troque para `draft`
- Para **adicionar tags**: separe por vírgula na coluna `tags`

---

## Colunas da planilha

| Coluna | Obrigatório | Descrição |
|--------|-------------|-----------|
| `id` | sim | Texto único, ex: `post-001` |
| `title` | sim | Título do artigo |
| `excerpt` | não | Resumo curto exibido no card |
| `url` | sim | Link do artigo (Medium, PDF, etc.) |
| `published_at` | não | Data, ex: `2026-03-11` |
| `status` | sim | `published` ou `draft` |
| `tags` | não | Separadas por vírgula |
