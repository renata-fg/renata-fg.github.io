/**
 * @file sidebar.js
 * @description Componente da Barra Lateral (Versão Orientada a Classes).
 * Os links de navegação são gerados dinamicamente com base na localização da página atual.
 */
class Sidebar {
    /**
     * @param {object[]} pages - Array de objetos de página.
     * @param {string} containerId - ID do elemento HTML onde a sidebar será renderizada.
     */
    constructor(pages, containerId) {
        this.pages = pages;
        this.containerElement = document.getElementById(containerId);
        
        if (!this.containerElement) {
            console.error(`Elemento com o ID "${containerId}" não encontrado.`);
        }
    }

    /**
     * Determina o prefixo do caminho relativo para garantir que os links funcionem a partir de qualquer profundidade de pasta.
     * @returns {string} O prefixo relativo (ex: '../../' ou './').
     */
    getRelativePrefix() {
        const path = window.location.pathname;
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
    createSidebarItem({ name, iconClass, path }) {
        const currentPath = window.location.pathname;
        const relativePrefix = this.getRelativePrefix();
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
    render() {
        if (!this.containerElement) {
            return;
        }

        const sidebarItemsHTML = this.pages.map(page => this.createSidebarItem(page)).join('');

        const sidebarTemplate = `
            <nav class="p-3 h-100 sidebar-nav">
                <ul class="nav nav-pills flex-column gap-2">
                    ${sidebarItemsHTML}
                </ul>
            </nav>
        `;

        this.containerElement.innerHTML = sidebarTemplate;
    }
}