/**
 * @file arte.js
 * @description Lógica para buscar e exibir obras de arte da API do The Met, com tabela, modal e paginação.
 */

// Endpoints da API
const API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';
const SEARCH_ENDPOINT = '/search?q=';
const OBJECT_ENDPOINT = '/objects/';

// Elementos do DOM
const tableBody = document.getElementById('art-table-body');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const paginationControls = document.getElementById('pagination-controls');

// Estado da Aplicação
let allArtObjectIDs = [];
let currentArtObjects = [];
let currentPage = 1;
const itemsPerPage = 10;
let detailModal = null;


/**
 * Exibe uma mensagem de status na tabela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} isError - Se a mensagem é um erro.
 */
function displayStatus(message, isError = false) {
    const colSpan = 4;
    const colorClass = isError ? 'text-danger' : 'text-muted';
    tableBody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center ${colorClass}">${message}</td></tr>`;
    paginationControls.innerHTML = ''; // Limpa a paginação
}

/**
 * Renderiza a tabela com os itens da página atual.
 */
function renderTable() {
    tableBody.innerHTML = ''; // Limpa a tabela
    
    // Calcula os itens para a página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = currentArtObjects.slice(startIndex, endIndex);

    if (pageItems.length === 0) {
        displayStatus('Nenhum resultado para exibir.', true);
        return;
    }

    pageItems.forEach(art => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${art.title || 'Título desconhecido'}</td>
            <td>${art.artistDisplayName || 'Artista desconhecido'}</td>
            <td>${art.objectDate || 'Data desconhecida'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" data-id="${art.objectID}">
                    <i class="bi bi-eye"></i> Ver Detalhes
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Renderiza os controlos de paginação.
 */
function renderPagination() {
    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(currentArtObjects.length / itemsPerPage);

    if (totalPages <= 1) return; // Não mostra paginação se houver apenas uma página

    const createButton = (text, page, isDisabled = false, isActive = false) => {
        const li = document.createElement('li');
        li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.innerHTML = text;
        a.dataset.page = page;
        li.appendChild(a);
        return li;
    };

    const ul = document.createElement('ul');
    ul.className = 'pagination';

    // Botão "Anterior"
    ul.appendChild(createButton('Anterior', currentPage - 1, currentPage === 1));

    // Botões de página
    for (let i = 1; i <= totalPages; i++) {
        ul.appendChild(createButton(i, i, false, i === currentPage));
    }

    // Botão "Próximo"
    ul.appendChild(createButton('Próximo', currentPage + 1, currentPage === totalPages));
    
    paginationControls.appendChild(ul);
}


/**
 * Busca os detalhes de um subconjunto de obras.
 * @param {number[]} ids - Lista de IDs de obras para buscar.
 * @returns {Promise<object[]>}
 */
async function fetchArtObjectDetails(ids) {
    const artPromises = ids.map(id =>
        fetch(`${API_BASE_URL}${OBJECT_ENDPOINT}${id}`).then(res => {
            if (!res.ok) return null; // Retorna nulo se o objeto não puder ser obtido
            return res.json();
        })
    );
    const results = await Promise.all(artPromises);
    return results.filter(Boolean); // Filtra quaisquer resultados nulos
}

/**
 * Busca a lista inicial de IDs de obras.
 * @param {string} query - O termo de pesquisa.
 */
async function fetchArt(query) {
    displayStatus('A carregar obras de arte...');
    try {
        const searchUrl = query 
            ? `${API_BASE_URL}${SEARCH_ENDPOINT}${encodeURIComponent(query)}&hasImages=true`
            : `${API_BASE_URL}/objects?departmentIds=11`; // Pinturas Europeias por defeito

        const response = await fetch(searchUrl);
        if (!response.ok) throw new Error('A pesquisa não retornou resultados.');

        const data = await response.json();
        if (!data.objectIDs || data.objectIDs.length === 0) {
            displayStatus(`Nenhuma obra encontrada para "${query || 'destaques'}". Tente outro termo.`, true);
            return;
        }

        allArtObjectIDs = data.objectIDs;
        // Busca os detalhes apenas da primeira página para otimizar o carregamento
        const initialIDs = allArtObjectIDs.slice(0, 100); // Busca um lote maior para ter dados para algumas páginas
        currentArtObjects = await fetchArtObjectDetails(initialIDs);
        
        currentPage = 1;
        renderTable();
        renderPagination();

    } catch (error) {
        console.error("Falha ao buscar obras:", error);
        displayStatus('Ocorreu um erro ao buscar os dados. Tente novamente.', true);
    }
}

/**
 * Preenche e exibe a modal com os detalhes da obra.
 * @param {object} artObject - O objeto de dados da obra.
 */
function showArtModal(artObject) {
    document.getElementById('modal-art-image').src = artObject.primaryImage || 'https://via.placeholder.com/400x300/dee2e6/6c757d.text=Imagem+Indispon%C3%ADvel';
    document.getElementById('modal-art-title').textContent = artObject.title || 'Título desconhecido';
    document.getElementById('modal-art-artist').textContent = artObject.artistDisplayName || 'Artista desconhecido';
    document.getElementById('modal-art-date').textContent = artObject.objectDate || 'Não disponível';
    document.getElementById('modal-art-department').textContent = artObject.department || 'Não disponível';
    document.getElementById('modal-art-dimensions').textContent = artObject.dimensions || 'Não disponível';
    
    detailModal.show();
}

// --- Event Listeners ---

// Busca inicial
document.addEventListener('DOMContentLoaded', () => {
    detailModal = new bootstrap.Modal(document.getElementById('art-detail-modal'));
    fetchArt('');
});

// Ações de busca
searchButton.addEventListener('click', () => fetchArt(searchInput.value.trim()));
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchArt(searchInput.value.trim());
    }
});

// Ações de paginação
paginationControls.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        event.preventDefault();
        const page = parseInt(event.target.dataset.page);
        if (page && page !== currentPage) {
            currentPage = page;
            renderTable();
            renderPagination();
        }
    }
});

// Ação para abrir a modal
tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]');
    if (button) {
        const objectId = parseInt(button.dataset.id);
        const artObject = currentArtObjects.find(art => art.objectID === objectId);
        if (artObject) {
            showArtModal(artObject);
        }
    }
});

