# Renata Faria - Portfolio

Portfólio profissional bilíngue (Português/Inglês) com arquitetura modular e design inspirado no Ant Design.

## 🏗️ Arquitetura Modular

### Padrões de Projeto Implementados
- **MVC (Model-View-Controller)**: Separação clara de responsabilidades
- **Module Pattern**: Código organizado em módulos independentes
- **Observer Pattern**: Event-driven para interações da UI
- **Factory Pattern**: Criação padronizada de componentes
- **Singleton Pattern**: Instâncias únicas para gerenciadores

### Estrutura de Arquivos
```
├── index.html                 # View principal (único arquivo)
├── controllers/
│   └── app.js                # Controller principal
├── models/
│   ├── profile.json          # Dados PT (Model)
│   └── profile_en.json       # Dados EN (Model)
├── assets/
│   ├── css/styles.css        # CSS com variáveis (DRY)
│   └── js/
│       ├── config.js         # Configurações centralizadas
│       ├── utils.js          # Utilitários e helpers
│       ├── languageDetector.js # Detecção de idioma
│       ├── dataManager.js    # Gerenciamento de dados
│       ├── uiManager.js      # Gerenciamento da UI
│       └── localization.js   # Textos localizados
├── package.json              # Metadados do projeto
└── README.md                 # Esta documentação
```

## 🚀 Como executar

```bash
# Instalar dependências (futuro)
npm install

# Executar servidor de desenvolvimento
npm start
# ou
python3 -m http.server 8080

# Acessar:
# Português: http://localhost:8080/
# Inglês: http://localhost:8080/?lang=en
```

## 📦 Módulos

### `config.js`
- Constantes centralizadas
- Selectors CSS
- Breakpoints responsivos
- Thresholds de interação

### `utils.js`
- Funções utilitárias (`debounce`, `throttle`)
- Detecção de dispositivo
- Formatação de dados
- Sanitização de HTML

### `languageDetector.js`
- Detecção automática de idioma
- Suporte a query parameters e caminhos
- Atualização do documento HTML

### `dataManager.js`
- Carregamento assíncrono de dados
- Validação de dados
- Tratamento de erros

### `uiManager.js`
- Renderização otimizada da UI
- Criação de componentes
- Gerenciamento de eventos
- Performance com throttling

### `localization.js`
- Textos em múltiplos idiomas
- Estrutura organizada por seções
- Fácil manutenção e expansão

## 🎨 Design System

### CSS Variables (Design Tokens)
```css
:root {
  --primary-color: #1890ff;
  --text-primary: rgba(0, 0, 0, 0.85);
  --spacing-md: 16px;
  /* +40 outras variáveis */
}
```

### Benefícios
- **Consistência**: Mesmo visual em todo o site
- **Manutenibilidade**: Mudanças globais em um lugar
- **Escalabilidade**: Novos componentes usam tokens existentes
- **Temas**: Fácil criação de dark mode

## 🔧 Desenvolvimento

### Padrões de Código
- **ES6+**: Classes, arrow functions, async/await
- **Modular**: Cada arquivo tem responsabilidade única
- **Performance**: Throttling, passive events, lazy loading
- **Acessibilidade**: ARIA labels, semantic HTML

### Boas Práticas
- ✅ Separação de responsabilidades
- ✅ DRY (Don't Repeat Yourself)
- ✅ Error handling robusto
- ✅ Performance otimizada
- ✅ Código legível e documentado

## 🧪 Testes (Futuro)

```bash
# Executar testes
npm test

# Cobertura de código
npm run test:coverage
```

## 📦 Build (Futuro)

```bash
# Build para produção
npm run build

# Otimizações incluídas:
# - Minificação CSS/JS
# - Compressão de imagens
# - Bundle splitting
# - Code splitting
```

## 🌍 Internacionalização

### Adicionar Novo Idioma
1. Criar `models/profile_[lang].json`
2. Adicionar seção em `localization.js`
3. Atualizar links: `?lang=[lang]`

### Estrutura de Localização
```javascript
{
  "pt": {
    "nav": { "brand": "Renata Faria" },
    "hero": { "exploreBtn": "Explorar" }
  }
}
```

## 📱 Responsividade

- **Mobile-first**: Design começa no mobile
- **Breakpoints**: 768px, 992px, 1200px
- **Performance**: Imagens otimizadas
- **Touch-friendly**: Botões adequados para toque

## 🔒 Segurança

- **CSP**: Content Security Policy
- **Sanitização**: HTML sanitizado
- **Validação**: Dados validados antes do uso
- **HTTPS**: Recomendado para produção

## 📈 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Throttling**: Eventos de scroll otimizados
- **Bundle Size**: Código modular minimiza carregamento
- **Caching**: Estratégia de cache inteligente

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.