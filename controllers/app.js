// Main Application Controller
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Detect language and update document
        const lang = LanguageDetector.detect();
        LanguageDetector.updateDocumentLanguage(lang);

        // Load localization data
        const localization = await DataManager.loadLocalization();
        const texts = localization[lang];

        // Update UI with localization
        UIManager.updateNavigation(texts);
        UIManager.updateHero(texts);
        UIManager.updateSections(texts);

        // Load and validate profile data
        const profileData = await DataManager.loadProfile(lang);
        DataManager.validateData(profileData);

        // Populate all sections
        UIManager.populateHero(profileData);
        UIManager.populateAbout(profileData);
        UIManager.populateEducation(profileData);
        UIManager.populateProjects(profileData);
        UIManager.populateCourses(profileData);
        UIManager.populateTestimonials(profileData);
        UIManager.populateFooter(profileData, lang);

        // Initialize interactive features
        UIManager.initStickyNavbar();
        UIManager.initBackToTop();

    } catch (error) {
        console.error('Application initialization failed:', error);
        // Fallback: mostrar mensagem de erro na tela
        const heroTitle = document.querySelector(CONFIG.SELECTORS.HERO_TITLE);
        if (heroTitle) {
            heroTitle.textContent = 'Erro ao carregar aplicação';
            heroTitle.style.color = 'red';
        }
    }
});