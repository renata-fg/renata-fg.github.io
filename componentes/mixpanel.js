class MixpanelTracker { // Recomendo um nome de classe diferente como 'MixpanelTracker' para evitar conflito com a variável global 'mixpanel'

    // O método de inicialização da classe deve ser 'constructor'
    constructor() {
        this.setupMixpanel();
    }

     /**
     * Inicializa a integração com a biblioteca de rastreamento de dados Mixpanel.
     */
    setupMixpanel() {
        // Verifica se a variável global 'mixpanel' (o stub do SDK) foi definida.
       if (typeof mixpanel !== 'undefined') {
            mixpanel.init("6cc20ed9d484aca9bf0901c00ac27498", {
                debug: true,
                track_pageview: true,
                persistence: "localStorage",
                record_sessions_percent: 1,
                record_heatmap_data: true,
            });
        } else {
            console.warn("Mixpanel não foi inicializado: O script da biblioteca não foi carregado.");
        }
    }

    track(eventName, properties = {}) {
        // Adiciona uma verificação defensiva para evitar ReferenceError caso Mixpanel não tenha sido carregado
        if (typeof mixpanel !== 'undefined' && typeof mixpanel.track === 'function') {
            mixpanel.track(eventName, properties);
        } else {
             console.warn(`Tentativa de rastrear o evento "${eventName}", mas Mixpanel não está pronto.`);
        }
    }
}