/**
 * @file personagens.js
 * @description Lida com a busca de dados da API, renderização em tabela, filtro e paginação.
 */

// Elementos do DOM
const tableBody = document.getElementById('characters-table-body');
const loadingIndicator = document.getElementById('loading-indicator');
const searchInput = document.getElementById('search-input');
const paginationContainer = document.getElementById('pagination-container');

// Estado da Aplicação
let allCharacters = [];
let filteredCharacters = [];
let currentPage = 1;
const itemsPerPage = 10;
let characterModalInstance = null;

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
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
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
 * Lida com a busca/filtro de personagens.
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredCharacters = allCharacters.filter(character => 
        character.name.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // Reseta para a primeira página ao pesquisar
    renderTable();
}

/**
 * Exibe os detalhes de um personagem na modal.
 */
function showCharacterDetails(characterId) {
    const character = allCharacters.find(c => c._id === characterId);
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
        <p><strong>Videojogos:</strong> ${character.videoGames.join(', ') || 'Nenhum'}</p>
        <p><strong>Aliados:</strong> ${character.allies.join(', ') || 'Nenhum'}</p>
        <p><strong>Inimigos:</strong> ${character.enemies.join(', ') || 'Nenhum'}</p>
    `;
    
    characterModalInstance.show();
}

/**
 * Busca os dados na API e inicializa a aplicação.
 */
async function fetchAndSetup() {
    try {
        const response = await fetch('https://api.disneyapi.dev/character');
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
        const data = await response.json();
        allCharacters = data.data;
        filteredCharacters = [...allCharacters]; // Inicialmente, a lista filtrada é a lista completa
        renderTable();
    } catch (error) {
        console.error("Falha ao buscar personagens:", error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Não foi possível carregar os personagens.</td></tr>';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// --- Event Listeners ---

// Busca
searchInput.addEventListener('input', handleSearch);

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

