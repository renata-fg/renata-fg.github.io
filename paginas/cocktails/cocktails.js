/**
 * @file cocktails.js
 * @description Classe principal que lida com a busca de receitas de cocktails,
 * renderização, paginação e filtros.
 */
class CocktailsApp {
    constructor() {
        // Estado da Aplicação
        this.allCocktails = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.searchTimeout = null;
        this.SEARCH_DEBOUNCE_DELAY = 500;
        this.cocktailModalInstance = null;
        
        // Referências aos Elementos do DOM
        this.searchInput = document.getElementById('search-input');
        this.resultsContainer = document.getElementById('cocktails-results-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.paginationContainer = document.getElementById('pagination-container');
        this.categoryFilter = document.getElementById('category-filter');
        this.glassFilter = document.getElementById('glass-filter');
        this.ingredientFilter = document.getElementById('ingredient-filter');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');
        this.mixpanel = new Mixpanel();
        this.mixpanel.init();
    }

    // ----------------------------------------------------
    // Métodos de Filtro e Busca de Dados
    // ----------------------------------------------------

    /**
     * Busca uma lista de valores (categorias, copos, ingredientes) e popula um dropdown.
     */
    async fetchAndPopulateFilter(listType, selectElement, placeholder) {
        if (!selectElement) return;
        const url = `https://www.thecocktaildb.com/api/json/v1/1/list.php?${listType}=list`;

        selectElement.innerHTML = `<option value="">${placeholder}</option>`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro ao buscar lista de filtros: ${url}`);
            const data = await response.json();
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
    initializeFilters() {
        this.fetchAndPopulateFilter('c', this.categoryFilter, 'Filtrar por Categoria...');
        this.fetchAndPopulateFilter('g', this.glassFilter, 'Filtrar por Copo...');
        this.fetchAndPopulateFilter('i', this.ingredientFilter, 'Filtrar por Ingrediente...');
    }

    /**
     * Determina se algum filtro avançado está ativo.
     */
    isAdvancedFilterActive() {
        return this.categoryFilter?.value || this.glassFilter?.value || this.ingredientFilter?.value;
    }

    /**
     * Busca cocktails na TheCocktailDB API. Usa Pesquisa por Nome OU Filtros Avançados.
     */
    async fetchAndSetupCocktails(searchTerm = 'a') {
        if (this.loadingIndicator) this.loadingIndicator.classList.remove('d-none');
        
        let url;
        
        if (this.isAdvancedFilterActive()) {
            const filterValue = this.categoryFilter.value || this.glassFilter.value || this.ingredientFilter.value;
            let filterType = '';
            
            if (this.categoryFilter.value) filterType = 'c';
            else if (this.glassFilter.value) filterType = 'g';
            else if (this.ingredientFilter.value) filterType = 'i';

            url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?${filterType}=${encodeURIComponent(filterValue)}`;
            
            if (this.searchInput) this.searchInput.value = '';

        } else {
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
            
            if (this.isAdvancedFilterActive() && data.drinks) {
                this.allCocktails = await this.fetchFullDetailsForFilteredResults(data.drinks);
            } else {
                this.allCocktails = data.drinks || [];
            }
            this.mixpanel.track("lista_busca_termo", { "termo buscado": searchTerm, "resultados encontrados": this.allCocktails.length});
            this.currentPage = 1; 
            this.renderResults();


        } catch (error) {
            console.error("Falha ao buscar cocktails:", error);
            if (this.resultsContainer) {
                 this.resultsContainer.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-striped table-hover align-middle">
                            <tbody>
                                <tr><td colspan="5" class="text-center text-danger p-5">Não foi possível carregar os dados. Verifique a consola para detalhes.</td></tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }
            if (this.paginationContainer) this.paginationContainer.innerHTML = '';
        } finally {
            if (this.loadingIndicator) this.loadingIndicator.classList.add('d-none');
        }
    }

    /**
     * Função auxiliar para obter os detalhes completos (ingredientes, instruções) 
     * de cada cocktail retornado pelo endpoint de filtro.
     */
    async fetchFullDetailsForFilteredResults(filteredDrinks) {
        if (filteredDrinks.length === 0) return [];
        
        const detailedPromises = filteredDrinks.map(async (partialDrink) => {
            const detailUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${partialDrink.idDrink}`;
            try {
                const response = await fetch(detailUrl);
                const data = await response.json();
                // filtro avançado
                // console.log(data.drinks.length);

                this.mixpanel.track("lista_busca_filtro", { 
                    "filtro aplicado": this.categoryFilter.value,
                    "filtros já aplicados": 'só filtro um por vez :D',
                    "resultados encontrados": data.drinks.length
                });
                return data.drinks ? data.drinks[0] : null;
            } catch (e) {
                console.warn(`Falha ao buscar detalhes para ID: ${partialDrink.idDrink}`);
                return null; 
            }
        });

        return (await Promise.all(detailedPromises)).filter(c => c !== null);
    }

    // ----------------------------------------------------
    // Métodos de Renderização e Paginação
    // ----------------------------------------------------

    /**
     * Renderiza a paginação. 
     */
    renderPagination() {
        if (!this.paginationContainer) return;

        this.paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(this.allCocktails.length / this.itemsPerPage);
        if (totalPages <= 1) return;

        let paginationHTML = '<ul class="pagination">';
        
        paginationHTML += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${this.currentPage - 1}">Anterior</a></li>`;

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<li class="page-item ${i === this.currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }

        paginationHTML += `<li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${this.currentPage + 1}">Próximo</a></li>`;

        paginationHTML += '</ul>';
        this.paginationContainer.innerHTML = paginationHTML;
    }


    /**
     * Renderiza os cocktails da página atual na tabela.
     */
    renderResults() {
        if (!this.resultsContainer) return;

        if (this.allCocktails.length === 0) {
            this.resultsContainer.innerHTML = `
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
            this.renderPagination();
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedItems = this.allCocktails.slice(startIndex, endIndex);

        const rowsHTML = paginatedItems.map(this.createCocktailRow).join('');

        this.resultsContainer.innerHTML = `
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
        this.renderPagination();
    }

    /**
     * Cria o HTML para uma única linha da tabela. 
     */
    createCocktailRow(cocktail) {
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
    // Métodos da Modal de Detalhes
    // ----------------------------------------------------

    createModalStructure() {
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

    showCocktailDetails(cocktailId) {
        const cocktail = this.allCocktails.find(c => c.idDrink === cocktailId);
        if (!cocktail || !this.cocktailModalInstance) return;

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
        
        this.cocktailModalInstance.show();
    }

    // ----------------------------------------------------
    // Métodos de Event Listeners
    // ----------------------------------------------------
    
    handleSearchInput() {
        if (this.isAdvancedFilterActive()) return; 
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            const searchTerm = this.searchInput.value.trim();
            this.fetchAndSetupCocktails(searchTerm || 'a'); 
            // this.mixpanel.track("Search", { "Term": searchTerm });
        }, this.SEARCH_DEBOUNCE_DELAY);
    }

    handleAdvancedFilterChange() {
        if (this.categoryFilter.value) {
            this.glassFilter.value = '';
            this.ingredientFilter.value = '';
        } else if (this.glassFilter.value) {
            this.categoryFilter.value = '';
            this.ingredientFilter.value = '';
        } else if (this.ingredientFilter.value) {
            this.categoryFilter.value = '';
            this.glassFilter.value = '';
        }
        
        const searchTerm = this.isAdvancedFilterActive() ? '' : 'a';
        this.fetchAndSetupCocktails(searchTerm);
    }

    clearAdvancedFilters() {
        if (this.categoryFilter) this.categoryFilter.value = '';
        if (this.glassFilter) this.glassFilter.value = '';
        if (this.ingredientFilter) this.ingredientFilter.value = '';
        if (this.searchInput) this.searchInput.value = '';
        this.fetchAndSetupCocktails('a');
        
        // this.mixpanel.track("Clear Filters");
        
    }

    setupEventListeners() {
        if (this.categoryFilter) this.categoryFilter.addEventListener('change', () => this.handleAdvancedFilterChange());
        if (this.glassFilter) this.glassFilter.addEventListener('change', () => this.handleAdvancedFilterChange());
        if (this.ingredientFilter) this.ingredientFilter.addEventListener('change', () => this.handleAdvancedFilterChange());
        if (this.clearFiltersBtn) this.clearFiltersBtn.addEventListener('click', () => this.clearAdvancedFilters());
        if (this.searchInput) this.searchInput.addEventListener('input', () => this.handleSearchInput());

        if (this.resultsContainer) {
            this.resultsContainer.addEventListener('click', (event) => {
                const detailsButton = event.target.closest('.view-details-btn');
                if (detailsButton) {
                    const cocktailId = detailsButton.dataset.cocktailId;
                    this.showCocktailDetails(cocktailId);
                    // this.mixpanel.track("View Details", { "Cocktail ID": cocktailId });
                }
            });
        }

        if (this.paginationContainer) {
            this.paginationContainer.addEventListener('click', (event) => {
                const paginationLink = event.target.closest('#pagination-container .page-link');
                if (paginationLink && !paginationLink.parentElement.classList.contains('disabled')) {
                    event.preventDefault();
                    const newPage = parseInt(paginationLink.dataset.page, 10);
                    if (newPage !== this.currentPage) {
                        this.currentPage = newPage;
                        this.renderResults();
                        // this.mixpanel.track("Change Page", { "Page Number": newPage });
                    }
                }
            });
        }
    }

    /**
     * Ponto de entrada da aplicação.
     */
    init() {
        this.createModalStructure();
        const modalElement = document.getElementById('cocktailModal');
        if (modalElement) {
            this.cocktailModalInstance = new bootstrap.Modal(modalElement);
        }
        
        this.initializeFilters();
        this.fetchAndSetupCocktails('a');
        this.setupEventListeners();
    }
}

// ---
// USO
// ---

document.addEventListener('DOMContentLoaded', () => {
    const cocktailsApp = new CocktailsApp();
    cocktailsApp.init();
});