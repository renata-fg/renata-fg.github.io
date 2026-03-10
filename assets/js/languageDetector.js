// assets/js/languageDetector.js
class LanguageDetector {
    static detect() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');

        // Suporte a caminhos antigos para compatibilidade
        const currentPath = window.location.pathname;
        const isEnglish = langParam === 'en' || currentPath.includes('/en/');

        return isEnglish ? 'en' : 'pt';
    }

    static getProfileFile(lang) {
        return lang === 'en' ? 'models/profile_en.json' : 'models/profile.json';
    }

    static updateDocumentLanguage(lang) {
        document.documentElement.lang = lang === 'en' ? 'en' : 'pt-br';
        document.title = lang === 'en' ? 'Renata Faria - Portfolio' : 'Renata Faria - Portfólio';
    }
}