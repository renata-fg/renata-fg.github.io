/**
 * @file navbar.js
 * @description Componente da Barra de Navegação (Versão Data-Driven).
 * O HTML é gerado a partir de uma lista de dados, tornando o código mais
 * limpo, reutilizável e fácil de manter.
 */

// 1. DADOS: Define os ícones de ação como uma lista de objetos.
// Para adicionar um novo ícone, basta adicionar um novo objeto a esta lista.
const navActions = [
    // { href: '#', ariaLabel: 'Ver repositório no GitHub', iconClass: 'bi-github' },
    // { href: '#', ariaLabel: 'Ver notificações', iconClass: 'bi-bell', notificationCount: 4 },
    // { href: '#', ariaLabel: 'Aceder ao perfil', iconClass: 'bi-person' }
];

/**
 * Cria o HTML para um único item da lista de ações.
 * @param {object} action - O objeto de dados para o item.
 * @returns {string} O template HTML para o <li>.
 */
function createActionItem({ href, ariaLabel, iconClass, notificationCount }) {
    const hasNotification = notificationCount > 0;

    // Gera o badge de notificação apenas se for necessário.
    const notificationBadge = hasNotification
        ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge">
             ${notificationCount}
             <span class="visually-hidden">notificações não lidas</span>
           </span>`
        : '';

    // Adiciona a classe 'position-relative' apenas ao item que tem uma notificação.
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
function renderNavbar() {
    // 2. CONSTRUÇÃO: Gera o HTML para todos os ícones de ação.
    const actionItemsHTML = navActions.map(createActionItem).join('');

    // 3. TEMPLATE: O template principal agora é mais limpo e apenas insere a lista de ações gerada.
    const navbarTemplate = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light px-4 py-2 shadow-sm">
            <!-- Botão de Toggle -->
            <div class="d-flex align-items-center">
                <button id="toggleSidebar" class="btn btn-outline-secondary me-3" type="button" aria-label="Alternar barra lateral">
                    <i class="bi bi-list"></i>
                </button>
            </div>

            <!-- Título Centralizado -->
            <div class="w-100 d-flex justify-content-center">
                <a href="#" class="navbar-title fw-bold text-dark px-3 py-2 rounded text-decoration-none">Analytics Bootcamp</a>
            </div>

            <!-- Ícones de Ação (Gerados dinamicamente) -->
            <ul class="navbar-nav ms-auto align-items-center flex-row gap-3">
                ${actionItemsHTML}
            </ul>
        </nav>
    `;

    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarTemplate;
    }
}