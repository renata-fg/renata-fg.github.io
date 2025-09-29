/**
 * @file main.js
 * @description Ponto de entrada da aplicação. Orquestra a inicialização dos componentes, gráficos e eventos.
 * Agora focado em métricas da API TheCocktailDB.
 */

// Placeholder para o gráfico Chart.js (necessário para a função initializeChart)
let barChartInstance = null;
let lineChartInstance = null; // Nova instância para o gráfico de linha

/**
 * Busca a contagem total de ingredientes, categorias e copos na TheCocktailDB API
 * e atualiza os cards no dashboard.
 */
async function fetchCocktailMetrics() {
    const ingredientElement = document.getElementById('metric-total-ingredients');
    const categoryElement = document.getElementById('metric-total-categories');
    const glassElement = document.getElementById('metric-total-glasses');
    
    // Array de promessas de fetch
    const metricsPromises = [
        { id: 'metric-total-ingredients', url: 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list', element: ingredientElement, label: 'Ingredientes' },
        { id: 'metric-total-categories', url: 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list', element: categoryElement, label: 'Categorias' },
        { id: 'metric-total-glasses', url: 'https://www.thecocktaildb.com/api/json/v1/1/list.php?g=list', element: glassElement, label: 'Copos' },
    ];

    for (const metric of metricsPromises) {
        if (!metric.element) continue;
        
        try {
            const response = await fetch(metric.url);
            const data = await response.json();
            
            // A API usa 'drinks' como chave para a lista de ingredientes/categorais/etc
            const count = data.drinks ? data.drinks.length : 'N/A';
            
            // Todos os cards agora exibem apenas a contagem
            metric.element.textContent = count;
        } catch (error) {
            console.error(`Falha ao buscar contagem de ${metric.label}:`, error);
            metric.element.textContent = 'ERRO';
        }
    }
}

/**
 * Busca a contagem real de cocktails por categoria e inicializa o gráfico de BARRAS.
 */
async function initializeBarChart() {
    const canvas = document.getElementById('barChart');
    if (!canvas) {
        console.warn("Elemento 'barChart' não encontrado. O gráfico não será inicializado.");
        return;
    }
    
    // Se a instância já existir, destrói
    if (barChartInstance) {
        barChartInstance.destroy();
    }

    let categories = [];
    
    // 1. Fetch de Nomes de Categorias (REAL)
    const categoryListUrl = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
    try {
        const response = await fetch(categoryListUrl);
        const data = await response.json();
        if (data.drinks) {
            // Pega as 8 categorias com mais receitas para melhor visualização
            categories = data.drinks.slice(0, 8).map(c => c.strCategory);
        }
    } catch (error) {
        console.error("Falha ao buscar lista de categorias para o gráfico:", error);
        categories = ['Erro']; // Fallback
    }
    
    // 2. Fetch da Contagem Real por Categoria (REAL)
    const counts = [];
    const categoryPromises = categories.map(category => 
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`)
            .then(res => res.json())
            .then(data => data.drinks ? data.drinks.length : 0)
            .catch(() => 0) 
    );
    
    // Espera por todas as contagens
    const results = await Promise.all(categoryPromises);
    counts.push(...results);


    // 3. Criação do Gráfico
    const ctx = canvas.getContext('2d');
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories, 
            datasets: [{
                label: 'Total de Cocktails',
                data: counts, 
                backgroundColor: '#00bcd4', // Cor azul-ciano
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Gráfico de barras horizontal, como no layout
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        footer: () => '(Dados Reais)'
                    }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/**
 * Busca a contagem real de cocktails por letra e inicializa o gráfico de LINHA.
 */
async function initializeLineChart() {
    const canvas = document.getElementById('lineChart');
    if (!canvas) {
        console.warn("Elemento 'lineChart' não encontrado. O gráfico de linha não será inicializado.");
        return;
    }
    
    if (lineChartInstance) {
        lineChartInstance.destroy();
    }
    
    const labels = [];
    const counts = [];
    
    // Gera as 26 letras do alfabeto
    for (let i = 65; i <= 90; i++) {
        labels.push(String.fromCharCode(i));
    }
    
    // 1. Fetch da Contagem por Letra (REAL)
    const letterPromises = labels.map(letter => 
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`)
            .then(res => res.json())
            .then(data => data.drinks ? data.drinks.length : 0)
            .catch(() => 0) 
    );

    const results = await Promise.all(letterPromises);
    counts.push(...results);

    // 2. Criação do Gráfico de Linha
    const ctx = canvas.getContext('2d');
    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cocktails Encontrados',
                data: counts,
                borderColor: '#198754', // Cor verde
                backgroundColor: 'rgba(25, 135, 84, 0.2)', // Fundo sombreado verde claro
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
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => `Letra: ${tooltipItems[0].label}`,
                        label: (tooltipItem) => `Total: ${tooltipItem.raw}`
                    }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


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

function setupMixpanel() {
    // A biblioteca mixpanel deve estar carregada globalmente via CDN no HTML
    if (typeof mixpanel !== 'undefined') {
        mixpanel.init("c3ed75e468108b72c313749aa7b44c8e", {
            debug: true,
            track_pageview: true,
            persistence: "localStorage",
            record_sessions_percent: 1, //records 1% of all sessions
            record_heatmap_data: true,
        });
    } else {
        console.warn("Mixpanel não foi inicializado: O script da biblioteca não foi carregado.");
    }
}

/**
 * Função de inicialização que é chamada quando o DOM está pronto.
 */
function initializeApp() {
    setupMixpanel()

    // Inicializa componentes de navegação
    renderNavbar(); // Assumido que estas funções estão em outros scripts
    renderSidebar();

    // Busca e exibe métricas da API de Cocktails (Ingredientes, Categorias, Copos)
    fetchCocktailMetrics();
    
    // Inicializa o gráfico de barras (Categorias e Contagens Reais)
    initializeBarChart();
    
    // Inicializa o gráfico de linha (Distribuição Alfabética)
    initializeLineChart();

    // Configura eventos
    setupEventListeners();
}

// O evento 'DOMContentLoaded' espera que todo o HTML seja carregado e lido
// antes de executar o script principal da aplicação.
document.addEventListener('DOMContentLoaded', initializeApp);