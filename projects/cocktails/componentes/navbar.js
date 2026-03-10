/**
 * @file navbar.js
 * @description Componente da Barra de Navegação (Versão Orientada a Classes).
 * O HTML é gerado dinamicamente a partir de dados passados ao construtor.
 */
class Navbar {
    /**
     * @param {object[]} actions - Array de objetos de ação para a barra de navegação.
     * @param {string} containerId - ID do elemento HTML onde a navbar será renderizada.
     */
    constructor(actions, containerId) {
        this.actions = actions;
        this.containerElement = document.getElementById(containerId);

        if (!this.containerElement) {
            console.error(`Elemento com o ID "${containerId}" não encontrado.`);
        }
    }

    /**
     * Cria o HTML para um único item da lista de ações.
     * @param {object} action - O objeto de dados para o item.
     * @returns {string} O template HTML para o <li>.
     */
    createActionItem({ href, ariaLabel, iconClass, notificationCount }) {
        const hasNotification = notificationCount > 0;
        const notificationBadge = hasNotification
            ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge">
                 ${notificationCount}
                 <span class="visually-hidden">notificações não lidas</span>
               </span>`
            : '';

        return `
            <li class="nav-item ${hasNotification ? 'position-relative' : ''}">
                <a href="${href}" class="nav-link text-dark" aria-label="${ariaLabel}">
                    <i class="bi ${iconClass} fs-5"></i>
                    ${notificationBadge}
                </a>
            </li>
        `;
    }

    /**
     * Renderiza o componente completo da navbar no container especificado.
     */
    render() {
        if (!this.containerElement) {
            return;
        }

        const actionItemsHTML = this.actions.map(action => this.createActionItem(action)).join('');

        const navbarTemplate = `
            <nav class="navbar navbar-expand-lg navbar-light bg-light px-4 py-2 shadow-sm">
                <div class="d-flex align-items-center">
                    <button id="toggleSidebar" class="btn btn-outline-secondary me-3" type="button" aria-label="Alternar barra lateral">
                        <i class="bi bi-list"></i>
                    </button>
                </div>

                <div class="w-100 d-flex justify-content-center">
                    <a href="#" class="navbar-title fw-bold text-dark px-3 py-2 rounded text-decoration-none">Analytics Bootcamp</a>
                </div>

                <ul class="navbar-nav ms-auto align-items-center flex-row gap-3">
                    ${actionItemsHTML}
                </ul>
            </nav>
        `;

        this.containerElement.innerHTML = navbarTemplate;
    }
}