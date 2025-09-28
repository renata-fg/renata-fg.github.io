/**
 * @file main.js
 * @description Ponto de entrada da aplicação. Orquestra a inicialização dos componentes, gráficos e eventos.
 * ESTA VERSÃO NÃO USA 'IMPORT' PARA GARANTIR A COMPATIBILIDADE.
 */

/**
 * Encapsula a lógica de inicialização do gráfico.
 */
function initializeChart() {
    const canvas = document.getElementById('barChart');
    // Verifica se o elemento canvas existe na página antes de tentar criar o gráfico.
    if (!canvas) {
        console.warn("Elemento 'barChart' não encontrado. O gráfico não será inicializado.");
        return;
    }

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
            datasets: [{
                label: 'Registos',
                data: [12, 19, 4, 7, 3],
                backgroundColor: '#4285f4',
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
};

/**
 * Centraliza a configuração de todos os event listeners da página.
 */
function setupEventListeners() {
    const toggleButton = document.getElementById('toggleSidebar');
    const appWrapper = document.getElementById('app-wrapper');

    // Garante que ambos os elementos existam antes de adicionar o evento.
    if (toggleButton && appWrapper) {
        toggleButton.addEventListener('click', () => {
            appWrapper.classList.toggle('sidebar-collapsed');
        });
    }
};

/**
 * Função de inicialização que é chamada quando o DOM está pronto.
 */
function initializeApp() {
    // As funções renderNavbar() e renderSidebar() são carregadas pelos
    // ficheiros navbar.js e sidebar.js antes deste script ser executado.
    renderNavbar();
    renderSidebar();
    
    // Depois que os componentes são renderizados, inicializamos o gráfico
    // e configuramos os eventos.
    initializeChart();
    setupEventListeners();
}

// O evento 'DOMContentLoaded' espera que todo o HTML seja carregado e lido
// antes de executar o script principal da aplicação.
document.addEventListener('DOMContentLoaded', initializeApp);

