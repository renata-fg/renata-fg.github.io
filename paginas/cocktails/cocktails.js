/**
 * @file cocktails.js
 * @description Lida com a busca de receitas de cocktails da TheCocktailDB API,
 * renderização em tabela, paginação e filtros avançados.
 */

// Elementos do DOM
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('cocktails-results-container');
const loadingIndicator = document.getElementById('loading-indicator');
const paginationContainer = document.getElementById('pagination-container'); 

// Elementos do Drawer de Filtros
const categoryFilter = document.getElementById('category-filter');
const glassFilter = document.getElementById('glass-filter');
const ingredientFilter = document.getElementById('ingredient-filter');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

// Estado da Aplicação
let allCocktails = [];
let currentPage = 1;
const itemsPerPage = 12; // Número de linhas por página
let cocktailModalInstance = null; 

let searchTimeout;
const SEARCH_DEBOUNCE_DELAY = 500; 

// ----------------------------------------------------
// Lógica de Obtenção de Listas de Filtros
// ----------------------------------------------------

/**
 * Busca uma lista de valores (categorias, copos, ingredientes) e popula um dropdown.
 * @param {string} listType - O tipo de lista a buscar ('c' para categoria, 'g' para copo, 'i' para ingrediente).
 * @param {HTMLElement} selectElement - O elemento <select> a popular.
 * @param {string} placeholder - O texto inicial da opção de placeholder.
 */
async function fetchAndPopulateFilter(listType, selectElement, placeholder) {
    const url = `https://www.thecocktaildb.com/api/json/v1/1/list.php?${listType}=list`;

    selectElement.innerHTML = `<option value="">${placeholder}</option>`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao buscar lista de filtros: ${url}`);
        const data = await response.json();

        // O nome da lista varia na API (drinks, ingredients, glasses, categories)
        const listKey = Object.keys(data).find(key => Array.isArray(data[key]));
        
        if (listKey) {
            const list = data[listKey];
            list.forEach(item => {
                let value;
                if (listType === 'c') value = item.strCategory;
                else if (listType === 'g') value = item.strGlass;
                else if (listType === 'i') value = item.strIngredient1;

                if (value) {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    selectElement.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error(`Falha ao carregar o filtro ${listType}:`, error);
        selectElement.innerHTML = `<option value="">Erro ao carregar</option>`;
    }
}

/**
 * Inicializa todos os dropdowns de filtro.
 */
function initializeFilters() {
    fetchAndPopulateFilter('c', categoryFilter, 'Filtrar por Categoria...');
    fetchAndPopulateFilter('g', glassFilter, 'Filtrar por Copo...');
    fetchAndPopulateFilter('i', ingredientFilter, 'Filtrar por Ingrediente...');
}


// ----------------------------------------------------
// Lógica de Busca Principal (Unificada)
// ----------------------------------------------------

/**
 * Determina se algum filtro avançado está ativo.
 * @returns {boolean}
 */
function isAdvancedFilterActive() {
    return categoryFilter?.value || glassFilter?.value || ingredientFilter?.value;
}

/**
 * Busca cocktails na TheCocktailDB API. Usa Pesquisa por Nome OU Filtros Avançados.
 * @param {string} [searchTerm='a'] - O termo de pesquisa do input principal.
 */
async function fetchAndSetupCocktails(searchTerm = 'a') {
    loadingIndicator.classList.remove('d-none');
    
    let url;
    
    // 1. Prioriza a pesquisa por Filtros Avançados
    if (isAdvancedFilterActive()) {
        const filterValue = categoryFilter.value || glassFilter.value || ingredientFilter.value;
        let filterType = '';
        
        // A TheCocktailDB só permite 1 filtro por vez neste endpoint. 
        if (categoryFilter.value) filterType = 'c';
        else if (glassFilter.value) filterType = 'g';
        else if (ingredientFilter.value) filterType = 'i';

        // URL para filtrar por Categoria (c), Copo (g) ou Ingrediente (i)
        url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?${filterType}=${encodeURIComponent(filterValue)}`;
        
        // Limpa a caixa de pesquisa por nome se o filtro avançado estiver ativo
        searchInput.value = '';

    } else {
        // 2. Se nenhum filtro avançado estiver ativo, usa a pesquisa por Nome
        if (searchTerm.length > 1) {
            url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`;
        } else {
            url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${encodeURIComponent(searchTerm.charAt(0))}`;
        }
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro de rede: ${response.statusText}`);
        
        const data = await response.json();
        
        // O endpoint de filtro (filter.php) retorna resultados incompletos.
        // Se estivermos a usar o filtro, precisamos obter os detalhes de cada um.
        if (isAdvancedFilterActive() && data.drinks) {
            // Se for filtro, usamos a função para buscar os detalhes
            allCocktails = await fetchFullDetailsForFilteredResults(data.drinks);
        } else {
            allCocktails = data.drinks || [];
        }

        currentPage = 1; 
        renderResults();

    } catch (error) {
        console.error("Falha ao buscar cocktails:", error);
        resultsContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <tbody>
                        <tr><td colspan="5" class="text-center text-danger p-5">Não foi possível carregar os dados. Verifique a consola para detalhes.</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        paginationContainer.innerHTML = '';
    } finally {
        loadingIndicator.classList.add('d-none');
    }
}

/**
 * Função auxiliar para obter os detalhes completos (ingredientes, instruções) 
 * de cada cocktail retornado pelo endpoint de filtro, que é incompleto.
 * @param {Array<Object>} filteredDrinks - Lista de resultados parciais.
 * @returns {Promise<Array<Object>>} Lista de resultados completos.
 */
async function fetchFullDetailsForFilteredResults(filteredDrinks) {
    if (filteredDrinks.length === 0) return [];
    
    const detailedPromises = filteredDrinks.map(async (partialDrink) => {
        const detailUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${partialDrink.idDrink}`;
        try {
            const response = await fetch(detailUrl);
            const data = await response.json();
            return data.drinks ? data.drinks[0] : null;
        } catch (e) {
            console.warn(`Falha ao buscar detalhes para ID: ${partialDrink.idDrink}`);
            return null; 
        }
    });

    const detailedCocktails = (await Promise.all(detailedPromises)).filter(c => c !== null);
    return detailedCocktails;
}

// ----------------------------------------------------
// Lógica de Renderização e Paginação (Mantida)
// ----------------------------------------------------

/**
 * Renderiza a paginação. 
 */
function renderPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(allCocktails.length / itemsPerPage);
    if (totalPages <= 1) return;

    let paginationHTML = '<ul class="pagination">';
    
    // Botão "Anterior"
    paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a></li>`;

    // Botões de página (limitar a 5 botões visíveis)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }

    // Botão "Próximo"
    paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage + 1}">Próximo</a></li>`;

    paginationHTML += '</ul>';
    paginationContainer.innerHTML = paginationHTML;
}


/**
 * Renderiza os cocktails da página atual na tabela.
 */
function renderResults() {
    if (allCocktails.length === 0) {
        resultsContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col" style="width: 10%;">Imagem</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Categoria</th>
                            <th scope="col">Copo</th>
                            <th scope="col" style="width: 15%;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="5" class="text-center text-muted p-5">Nenhum cocktail encontrado. Tente pesquisar por um nome diferente ou comece com uma letra.</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        renderPagination();
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = allCocktails.slice(startIndex, endIndex);

    const rowsHTML = paginatedItems.map(createCocktailRow).join('');

    // Estrutura completa da tabela
    resultsContainer.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        <th scope="col" style="width: 10%;">Imagem</th>
                        <th scope="col">Nome</th>
                        <th scope="col">Categoria</th>
                        <th scope="col">Copo</th>
                        <th scope="col" style="width: 15%;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>
        </div>
    `;
    renderPagination();
}

/**
 * Cria o HTML para uma única linha da tabela. 
 */
function createCocktailRow(cocktail) {
    const fallbackImg = 'https://placehold.co/50x50/232a34/ffffff?text=N/A';

    return `
        <tr>
            <td>
                <img src="${cocktail.strDrinkThumb || fallbackImg}" 
                     onerror="this.onerror=null;this.src='${fallbackImg}';"
                     class="img-fluid rounded-circle" 
                     alt="Imagem do Cocktail ${cocktail.strDrink}" 
                     style="width: 50px; height: 50px; object-fit: cover;">
            </td>
            <td class="fw-bold">${cocktail.strDrink || 'N/A'}</td>
            <td>${cocktail.strCategory || 'N/A'}</td>
            <td>${cocktail.strGlass || 'N/A'}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm view-details-btn" data-cocktail-id="${cocktail.idDrink}">
                    <i class="bi bi-eye"></i> Detalhes
                </button>
            </td>
        </tr>
    `;
}

// ----------------------------------------------------
// Lógica da Modal de Detalhes (Mantida)
// ----------------------------------------------------

function createModalStructure() {
    const modalHTML = `
        <div class="modal fade" id="cocktailModal" tabindex="-1" aria-labelledby="cocktailModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cocktailModalLabel">Detalhes do Cocktail</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <img id="modal-cocktail-image" src="" class="img-fluid rounded mb-3" alt="Imagem do Cocktail" style="max-height: 300px;">
                            </div>
                            <div class="col-md-8">
                                <h3 id="modal-cocktail-name"></h3>
                                <div id="modal-cocktail-details"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    if (!document.getElementById('cocktailModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

function showCocktailDetails(cocktailId) {
    const cocktail = allCocktails.find(c => c.idDrink === cocktailId);
    if (!cocktail || !cocktailModalInstance) return;

    document.getElementById('modal-cocktail-name').textContent = cocktail.strDrink;
    
    const modalImage = document.getElementById('modal-cocktail-image');
    modalImage.src = cocktail.strDrinkThumb;
    modalImage.onerror = () => {
        modalImage.onerror = null; 
        modalImage.src = 'https://placehold.co/400x300/232a34/ffffff?text=Imagem+Indispon%C3%ADvel';
    };
    
    const ingredientsHTML = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`strIngredient${i}`];
        const measure = cocktail[`strMeasure${i}`];
        if (ingredient) {
            ingredientsHTML.push(`<li>${measure ? `<strong>${measure.trim()}</strong> ` : ''}${ingredient}</li>`);
        }
    }

    const detailsContainer = document.getElementById('modal-cocktail-details');
    detailsContainer.innerHTML = `
        <p><strong>Categoria:</strong> ${cocktail.strCategory || 'N/A'}</p>
        <p><strong>Tipo de Copo:</strong> ${cocktail.strGlass || 'N/A'}</p>
        <p><strong>Alcoólico:</strong> ${cocktail.strAlcoholic || 'N/A'}</p>
        
        <h6 class="fw-bold mt-3">Ingredientes:</h6>
        <ul class="list-unstyled small mb-3">
            ${ingredientsHTML.join('') || 'Nenhum'}
        </ul>
        
        <h6 class="fw-bold mt-3">Instruções:</h6>
        <p>${cocktail.strInstructions || 'N/A'}</p>
    `;
    
    cocktailModalInstance.show();
}


// ----------------------------------------------------
// Event Listeners e Inicialização
// ----------------------------------------------------

/**
 * Lida com a entrada de pesquisa usando debouncing.
 */
function handleSearchInput() {
    // Se um filtro avançado estiver ativo, ignora a pesquisa por nome para evitar conflito.
    if (isAdvancedFilterActive()) return; 

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.trim();
        fetchAndSetupCocktails(searchTerm || 'a'); 
    }, SEARCH_DEBOUNCE_DELAY);
}

/**
 * Lida com a mudança de qualquer filtro avançado.
 * Reinicia a pesquisa.
 */
function handleAdvancedFilterChange() {
    // Quando um filtro muda, garante que os outros filtros avançados sejam limpos
    // (a API só suporta 1 filtro por vez no endpoint /filter.php?)
    if (categoryFilter.value) {
        glassFilter.value = '';
        ingredientFilter.value = '';
    } else if (glassFilter.value) {
        categoryFilter.value = '';
        ingredientFilter.value = '';
    } else if (ingredientFilter.value) {
        categoryFilter.value = '';
        glassFilter.value = '';
    }
    
    // Se o filtro principal estiver vazio, restaura a busca por nome ('a')
    fetchAndSetupCocktails(isAdvancedFilterActive() ? '' : 'a');
}

/**
 * Limpa todos os filtros avançados e reinicia a busca.
 */
function clearAdvancedFilters() {
    categoryFilter.value = '';
    glassFilter.value = '';
    ingredientFilter.value = '';
    searchInput.value = '';
    fetchAndSetupCocktails('a');
}

// Event Listeners de Filtro Avançado
categoryFilter.addEventListener('change', handleAdvancedFilterChange);
glassFilter.addEventListener('change', handleAdvancedFilterChange);
ingredientFilter.addEventListener('change', handleAdvancedFilterChange);
clearFiltersBtn.addEventListener('click', clearAdvancedFilters);

// Event Listener de Pesquisa Simples (por nome)
searchInput.addEventListener('input', handleSearchInput);

// Cliques nos botões da tabela (delegação de evento)
resultsContainer.addEventListener('click', (event) => {
    const detailsButton = event.target.closest('.view-details-btn');
    if (detailsButton) {
        const cocktailId = detailsButton.dataset.cocktailId;
        showCocktailDetails(cocktailId);
    }
});

// Cliques nos botões da paginação (delegação de evento)
document.addEventListener('click', (event) => {
    const paginationLink = event.target.closest('#pagination-container .page-link');
    if (paginationLink && !paginationLink.parentElement.classList.contains('disabled')) {
        event.preventDefault();
        const newPage = parseInt(paginationLink.dataset.page, 10);
        if (newPage !== currentPage) {
            currentPage = newPage;
            renderResults();
        }
    }
});

// Inicialização: Busca listas de filtros e dados iniciais.
document.addEventListener('DOMContentLoaded', () => {
    createModalStructure();
    cocktailModalInstance = new bootstrap.Modal(document.getElementById('cocktailModal'));
    
    // Inicializa a lista de filtros (assíncrona)
    initializeFilters();

    // Busca a lista inicial de cocktails (cocktails que começam por 'a')
    fetchAndSetupCocktails('a'); 
});
