// Seletores
const modalOverlay = document.getElementById('modal-overlay');
const btnOpen = document.getElementById('open-research-btn');
const btnClose = document.getElementById('btn-close');
const form = document.getElementById('pesquisa-form');
const message = document.getElementById('form-msg');

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBzmKTD0HgVWphtSZD-bNkETg9tJz1W8sxz9l3NGgHe4UelbQyYyBYMemUzK2j_h7IbA/exec';

// Funções de Controle da Modal
const openModal = () => {
    modalOverlay.style.display = 'flex';
    // Força o reflow para a animação de opacidade funcionar
    setTimeout(() => {
        modalOverlay.classList.add('is-visible');
    }, 10);
    document.body.style.overflow = 'hidden';
    document.getElementById('nome')?.focus();
};

const closeModal = () => {
    modalOverlay.classList.remove('is-visible');
    // Espera a animação terminar (300ms) antes de esconder o display
    setTimeout(() => {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
};

// Event Listeners para a Modal
btnOpen.addEventListener('click', openModal);
btnClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Lógica de Envio (Mantida a original com correções)
function resolveGoogleScriptUrl(rawValue) {
    const value = (rawValue || '').trim();
    return value.startsWith('http') ? value.replace(/\/dev(\?.*)?$/, '/exec$1') : `https://script.google.com/macros/s/${value}/exec`;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    message.textContent = 'Enviando...';

    try {
        const endpoint = resolveGoogleScriptUrl(GOOGLE_SCRIPT_URL);
        await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                resposta: document.getElementById('resposta').value,
                pagina: window.location.href
            })
        });

        message.textContent = `Agradecemos sua contribuição! Dados registrados.`;
        form.reset();
        setTimeout(closeModal, 2500); // Fecha a modal após o sucesso
    } catch (error) {
        message.textContent = 'Erro ao enviar. Tente novamente.';
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});
