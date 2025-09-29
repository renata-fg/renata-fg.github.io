/**
 * @file personagens.js
 * @description Lida com a busca de dados da API, renderização em tabela, filtro e paginação.
 */

// Elementos do DOM
const tableBody = document.getElementById('characters-table-body');
const loadingIndicator = document.getElementById('loading-indicator');
const searchInput = document.getElementById('search-input');
const paginationContainer = document.getElementById('pagination-container');
// Novo elemento de filtro avançado
const filmFilterSelect = document.getElementById('film-filter-select'); 

// Estado da Aplicação
let allCharacters = [];
let filteredCharacters = [];
let currentPage = 1;
// Aumentei o número de itens por página de 10 para 20
const itemsPerPage = 20; 
let characterModalInstance = null;

/**
 * Preenche o dropdown de filmes com valores únicos dos personagens.
 * A listagem inicial é feita no front-end, mas a filtragem agora é mais robusta.
 */
function populateFilmFilter() {
    // 1. Coleta todos os filmes únicos
    const allFilms = new Set();
    allCharacters.forEach(character => {
        character.films.forEach(film => allFilms.add(film));
    });

    const filmArray = Array.from(allFilms).sort();
    
    // 2. Constrói o HTML das opções
    let optionsHTML = '<option value="">Filtrar por Filme (Todos)</option>';
    filmArray.forEach(film => {
        // Usa o nome do filme como valor para a API (codificado para URL)
        optionsHTML += `<option value="${encodeURIComponent(film)}">${film}</option>`;
    });

    // 3. Insere no DOM
    if (filmFilterSelect) {
        filmFilterSelect.innerHTML = optionsHTML;
    }
}

/**
 * Renderiza a paginação na página.
 */
function renderPagination() {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);
    if (totalPages <= 1) return;

    let paginationHTML = '<ul class="pagination">';
    
    // Botão "Anterior"
    paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a></li>`;

    // Botões de página
    // Lógica para mostrar um número limitado de botões de página para evitar sobrecarga visual
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
    } else if (currentPage > totalPages - 3) {
        startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
        paginationHTML += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
        if (startPage > 2) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }

    // Botão "Próximo"
    paginationHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${currentPage + 1}">Próximo</a></li>`;

    paginationHTML += '</ul>';
    paginationContainer.innerHTML = paginationHTML;
}

/**
 * Renderiza os dados da página atual na tabela.
 */
function renderTable() {
    tableBody.innerHTML = '';
    if (filteredCharacters.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum personagem encontrado.</td></tr>';
        renderPagination();
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredCharacters.slice(startIndex, endIndex);

    const charactersHTML = paginatedItems.map(createCharacterRow).join('');
    tableBody.innerHTML = charactersHTML;
    renderPagination();
}

/**
 * Cria o HTML para uma única linha da tabela.
 */
function createCharacterRow(character) {
    // Exibe apenas os dois primeiros filmes/programas de TV
    const films = character.films.length > 0 ? character.films.slice(0, 2).join(', ') + (character.films.length > 2 ? '...' : '') : 'N/A';
    const tvShows = character.tvShows.length > 0 ? character.tvShows.slice(0, 2).join(', ') + (character.tvShows.length > 2 ? '...' : '') : 'N/A';
    const placeholderImg = 'https://placehold.co/50x50/232a34/ffffff?text=N/A';

    return `
        <tr>
            <td>
                <img src="${character.imageUrl}" 
                     onerror="this.onerror=null;this.src='${placeholderImg}';"
                     class="img-fluid rounded-circle" 
                     alt="Imagem de ${character.name}" 
                     style="width: 50px; height: 50px; object-fit: cover;">
            </td>
            <td class="fw-bold">${character.name}</td>
            <td>${films}</td>
            <td>${tvShows}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm view-details-btn" data-character-id="${character._id}">
                    <i class="bi bi-eye"></i> Ver Detalhes
                </button>
            </td>
        </tr>
    `;
}

/**
 * Lida com a busca/filtro de personagens, agora chamando a API de forma inteligente.
 */
async function handleFilterChange() {
    // Obtém o termo de pesquisa e o filtro de filme
    const searchTerm = searchInput.value.toLowerCase();
    const filmFilter = filmFilterSelect.value;
    
    // Mostra o indicador de carregamento
    loadingIndicator.style.display = 'block';
    
    try {
        let url = 'https://api.disneyapi.dev/character';
        let isApiFilterApplied = false;

        // Se houver um filtro de filme selecionado, usamos a pesquisa avançada da API
        if (filmFilter) {
            // A API de pesquisa avançada usa o parâmetro 'films' e o termo de pesquisa (se existir)
            url = `${url}?films=${filmFilter}`;
            isApiFilterApplied = true;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
        const data = await response.json();
        
        // A API de pesquisa avançada retorna 'data' diretamente (não um objeto com 'data' dentro)
        // Para simplificar, assumimos que 'data' é o array de personagens se o filtro for aplicado
        let characters = data.data || data; 

        // Se for feita uma pesquisa por nome (local ou com filtro da API)
        if (searchTerm) {
             characters = characters.filter(character => 
                character.name.toLowerCase().includes(searchTerm)
            );
        }

        // Armazena os resultados filtrados
        allCharacters = characters; 
        filteredCharacters = [...allCharacters];
        currentPage = 1; 
        renderTable();

    } catch (error) {
        console.error("Falha ao buscar personagens com filtro:", error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Não foi possível carregar os personagens.</td></tr>';
        filteredCharacters = [];
        renderTable();
    } finally {
        loadingIndicator.style.display = 'none';
    }
}


/**
 * Exibe os detalhes de um personagem na modal.
 */
function showCharacterDetails(characterId) {
    // Nota: Como o allCharacters agora é atualizado por handleFilterChange, 
    // ele só conterá os personagens atualmente visíveis, o que é suficiente para esta funcionalidade.
    const character = filteredCharacters.find(c => c._id === characterId);
    if (!character || !characterModalInstance) return;

    document.getElementById('modal-character-name').textContent = character.name;
    
    const modalImage = document.getElementById('modal-character-image');
    modalImage.src = character.imageUrl;
    // Adiciona um tratamento de erro para a imagem da modal
    modalImage.onerror = () => {
        modalImage.onerror = null; // Previne loops infinitos se a imagem de fallback também falhar
        modalImage.src = 'https://placehold.co/400x300/232a34/ffffff?text=Imagem+Indispon%C3%ADvel';
    };
    
    const detailsContainer = document.getElementById('modal-character-details');
    detailsContainer.innerHTML = `
        <p><strong>Filmes:</strong> ${character.films.join(', ') || 'Nenhum'}</p>
        <p><strong>Programas de TV:</strong> ${character.tvShows.join(', ') || 'Nenhum'}</p>
        <p><strong>Jogos:</strong> ${character.videoGames.join(', ') || 'Nenhum'}</p>
        <p><strong>Aliados:</strong> ${character.allies.join(', ') || 'Nenhum'}</p>
        <p><strong>Inimigos:</strong> ${character.enemies.join(', ') || 'Nenhum'}</p>
    `;
    
    characterModalInstance.show();
}

/**
 * Busca os dados iniciais, preenche o filtro e inicializa a aplicação.
 */
async function fetchAndSetup() {
    try {
        const response = await fetch('https://api.disneyapi.dev/character');
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
        const data = await response.json();
        
        // No setup inicial, usamos todos os dados para popular o filtro
        allCharacters = data.data;
        populateFilmFilter();
        
        // Em seguida, inicializamos a tabela com todos os personagens (sem filtro aplicado)
        filteredCharacters = [...allCharacters]; 
        renderTable();
    } catch (error) {
        console.error("Falha ao buscar personagens:", error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Não foi possível carregar os personagens.</td></tr>';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// --- Event Listeners ---

// Busca no campo de texto e no filtro de filme agora chamam a mesma função de filtragem da API
searchInput.addEventListener('input', handleFilterChange);
filmFilterSelect.addEventListener('change', handleFilterChange);


// Cliques nos botões da tabela (delegação de evento)
tableBody.addEventListener('click', (event) => {
    const detailsButton = event.target.closest('.view-details-btn');
    if (detailsButton) {
        const characterId = parseInt(detailsButton.dataset.characterId, 10);
        showCharacterDetails(characterId);
    }
});

// Cliques nos botões da paginação (delegação de evento)
paginationContainer.addEventListener('click', (event) => {
    event.preventDefault();
    const link = event.target.closest('.page-link');
    if (link && !link.parentElement.classList.contains('disabled')) {
        const newPage = parseInt(link.dataset.page, 10);
        if (newPage !== currentPage) {
            currentPage = newPage;
            renderTable();
        }
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    characterModalInstance = new bootstrap.Modal(document.getElementById('characterModal'));
    fetchAndSetup();
});
