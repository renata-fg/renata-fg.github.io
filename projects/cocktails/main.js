/**
 * @file main.js
 * @description Classe principal para inicializar e gerenciar o dashboard da aplicação,
 * incluindo a busca de métricas e a renderização de gráficos dinâmicos da TheCocktailDB API.
 */
class Dashboard {
    constructor() {
        this.barChartInstance = null;
        this.lineChartInstance = null;
    }

    renderBars() {
        const sidebarPages = [
            { name: 'Dashboard', iconClass: 'bi-house-door', path: 'index.html' },
            { name: 'Cocktails', iconClass: 'bi-cup-straw', path: 'paginas/cocktails/cocktails.html' },
        ];
        const sidebarComponent = new Sidebar(sidebarPages, 'sidebar-container');
        sidebarComponent.render();

        const navbarActions = [];
        const navbarComponent = new Navbar(navbarActions, 'navbar-container');
        navbarComponent.render();
    }

    /**
     * Busca a contagem total de ingredientes, categorias e copos da API e atualiza os cards.
     */
    async fetchCocktailMetrics() {
        const metrics = [
            { id: 'metric-total-ingredients', url: 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list', label: 'Ingredientes' },
            { id: 'metric-total-categories', url: 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list', label: 'Categorias' },
            { id: 'metric-total-glasses', url: 'https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list', label: 'Copos' },
        ];

        for (const metric of metrics) {
            const element = document.getElementById(metric.id);
            if (!element) continue;

            try {
                const response = await fetch(metric.url);
                const data = await response.json();
                const count = data.drinks ? data.drinks.length : 'N/A';
                element.textContent = count;
            } catch (error) {
                console.error(`Falha ao buscar contagem de ${metric.label}:`, error);
                element.textContent = 'ERRO';
            }
        }
    }

    /**
     * Busca dados reais de contagem de cocktails por categoria e renderiza o gráfico de barras.
     */
    async initializeBarChart() {
        const canvas = document.getElementById('barChart');
        if (!canvas) {
            console.warn("Elemento 'barChart' não encontrado. O gráfico não será inicializado.");
            return;
        }

        if (this.barChartInstance) {
            this.barChartInstance.destroy();
        }

        let categories = [];
        let counts = [];

        try {
            const categoryListUrl = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
            const response = await fetch(categoryListUrl);
            const data = await response.json();
            if (data.drinks) {
                categories = data.drinks.slice(0, 8).map(c => c.strCategory);

                const categoryPromises = categories.map(category =>
                    fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`)
                        .then(res => res.json())
                        .then(d => d.drinks ? d.drinks.length : 0)
                        .catch(() => 0)
                );
                counts = await Promise.all(categoryPromises);
            }
        } catch (error) {
            console.error("Falha ao buscar dados para o gráfico de barras:", error);
            categories = ['Erro'];
            counts = [0];
        }

        const ctx = canvas.getContext('2d');
        this.barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Total de Cocktails',
                    data: counts,
                    backgroundColor: '#00bcd4',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: { callbacks: { footer: () => '(Dados Reais)' } }
                },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    /**
     * Busca dados de contagem de cocktails por letra e renderiza o gráfico de linha.
     */
    async initializeLineChart() {
        const canvas = document.getElementById('lineChart');
        if (!canvas) {
            console.warn("Elemento 'lineChart' não encontrado. O gráfico de linha não será inicializado.");
            return;
        }

        if (this.lineChartInstance) {
            this.lineChartInstance.destroy();
        }

        const labels = [];
        for (let i = 65; i <= 90; i++) {
            labels.push(String.fromCharCode(i));
        }

        const letterPromises = labels.map(letter =>
            fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`)
                .then(res => res.json())
                .then(d => d.drinks ? d.drinks.length : 0)
                .catch(() => 0)
        );

        const counts = await Promise.all(letterPromises);

        const ctx = canvas.getContext('2d');
        this.lineChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cocktails Encontrados',
                    data: counts,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: false },
                    tooltip: { callbacks: { title: (items) => `Letra: ${items[0].label}` } }
                },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    /**
     * Centraliza a configuração de todos os event listeners da página.
     */
    setupEventListeners() {
        const toggleButton = document.getElementById('toggleSidebar');
        const appWrapper = document.getElementById('app-wrapper');

        if (toggleButton && appWrapper) {
            toggleButton.addEventListener('click', () => {
                appWrapper.classList.toggle('sidebar-collapsed');
                // mixpanel.track("Sidebar Toggled", { state: appWrapper.classList.contains('sidebar-collapsed') ? 'collapsed' : 'expanded' });
            });
        }
    }

    /**
     * Inicializa a integração com a biblioteca de rastreamento de dados Mixpanel.
     */
    setupMixpanel() {
        if (typeof mixpanel !== 'undefined') {
            mixpanel.init("ea61f6dc11ecdf26335809ad4e452a22", {
                debug: true,
                track_pageview: true,
                persistence: "localStorage",
                record_sessions_percent: 1,
                record_heatmap_data: true,
            });
            console.log("Mixpanel inicializado");
        } else {
            console.warn("Mixpanel não foi inicializado: O script da biblioteca não foi carregado.");
        }
    }

    /**
     * O ponto de entrada da aplicação. Orquestra a inicialização de todos os componentes.
     * @returns {void}
     */
    init() {
        this.renderBars();
        this.setupMixpanel();
        this.setupEventListeners();

        this.fetchCocktailMetrics();
        this.initializeBarChart();
        this.initializeLineChart();
    }
}

// Cria uma nova instância da classe Dashboard
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.init();
    updateUser();
});

function updateUser(){ 
    if (!localStorage.getItem('user_id')) {
    // Se NÃO EXISTE (primeira visita), então cria e salva
    localStorage.setItem('user_id', uuidv4());
    localStorage.setItem('novo', 'true'); // Opcional: para rastrear se é a primeira vez
    } else {
        localStorage.setItem('novo', 'false');
    }
    const userId = localStorage.getItem('user_id');
    mixpanel.identify(userId);
    mixpanel.people.set({
        novo: localStorage.getItem('novo'),
        perfil_do_usuário: userId
    });
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}