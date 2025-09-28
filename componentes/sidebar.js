/**
 * @file sidebar.js
 * @description Componente da Barra Lateral (Versão Data-Driven).
 * Os links de navegação são gerados dinamicamente com base na localização da página atual.
 */

// 1. DADOS: Define as páginas da aplicação. A página de Agências foi trocada pela de Obras de Arte.
const pages = [
    { name: 'Dashboard', iconClass: 'bi-house-door', path: 'index.html' },
    { name: 'Personagens', iconClass: 'bi-magic', path: 'paginas/personagens/personagens.html' },
    // { name: 'Obras de Arte', iconClass: 'bi-palette', path: 'paginas/arte/arte.html' },
];

/**
 * Determina o prefixo do caminho relativo para garantir que os links funcionem a partir de qualquer profundidade de pasta.
 * @returns {string} O prefixo relativo (ex: '../../' ou './').
 */
function getRelativePrefix() {
    const path = window.location.pathname;
    // Adicionado o novo caminho para a lógica de prefixo relativo.
    if (path.includes('/paginas/')) {
        return '../../';
    }
    return './';
}

/**
 * Cria o HTML para um único item de navegação da sidebar.
 * @param {object} page - O objeto de dados da página.
 * @returns {string} O template HTML para o <li>.
 */
function createSidebarItem({ name, iconClass, path }) {
    const currentPath = window.location.pathname;
    const relativePrefix = getRelativePrefix();
    const href = relativePrefix + path;

    const isRootPage = path === 'index.html';
    const onRootPath = currentPath === '/' || currentPath.endsWith('/index.html');
    const isActive = (isRootPage && onRootPath) || (!isRootPage && currentPath.endsWith(path));
    const activeClass = isActive ? 'active' : '';

    return `
        <li class="nav-item">
            <a href="${href}" class="nav-link ${activeClass}">
                <i class="bi ${iconClass} me-2"></i>${name}
            </a>
        </li>
    `;
}

/**
 * Renderiza o componente completo da sidebar no container especificado.
 */
function renderSidebar() {
    const sidebarItemsHTML = pages.map(createSidebarItem).join('');

    const sidebarTemplate = `
        <nav class="p-3 h-100 sidebar-nav">
            <ul class="nav flex-column gap-2">
                ${sidebarItemsHTML}
            </ul>
        </nav>
    `;

    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarTemplate;
    }
}

