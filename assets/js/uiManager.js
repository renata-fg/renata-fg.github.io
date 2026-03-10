// assets/js/uiManager.js
class UIManager {
    static updateNavigation(texts) {
        const brand = document.querySelector(CONFIG.SELECTORS.NAVBAR_BRAND);
        const langLink = document.querySelector(CONFIG.SELECTORS.NAVBAR_LINK);

        if (brand) brand.textContent = texts.nav.brand;
        if (langLink) {
            langLink.textContent = texts.nav.language;
            langLink.href = texts.nav.languageUrl;
        }
    }

    static updateHero(texts) {
        const heroButton = document.querySelector(CONFIG.SELECTORS.HERO_BUTTON);
        if (heroButton) heroButton.textContent = texts.hero.exploreBtn;
    }

    static updateSections(texts) {
        const titles = {
            'about-title': texts.sections.about,
            'education-title': texts.sections.education,
            'projects-title': texts.sections.projects,
            'courses-title': texts.sections.courses,
            'testimonials-title': texts.sections.testimonials
        };

        for (const [id, text] of Object.entries(titles)) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        }
    }

    static populateHero(data) {
        const title = document.querySelector(CONFIG.SELECTORS.HERO_TITLE);
        const subtitle = document.querySelector(CONFIG.SELECTORS.HERO_SUBTITLE);

        if (title) title.textContent = data.name;
        if (subtitle) subtitle.textContent = data.title;
    }

    static populateAbout(data) {
        const aboutSection = document.querySelector(CONFIG.SELECTORS.ABOUT_SECTION);
        if (aboutSection) aboutSection.textContent = data.about;
    }

    /* * Construtor de Cartões Higienizado 
     * Removido: inline styles, card-overlay, e tags desnecessárias.
     * Adicionado: loading="lazy" para performance acadêmica.
     */
    static createCard(item) {
        return `
            <article class="card">
                <div class="card-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="card-body">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-text">${item.description}</p>
                </div>
            </article>
        `;
    }

    /* O método getCategoryFromIcon foi suprimido (Código Morto) */

    static populateGrid(containerSelector, dataArray) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = '';
        /* Substituição da classe '.row' pela classe unificada de CSS Grid */
        container.className = 'grid-container'; 
        
        dataArray.forEach(item => {
            container.insertAdjacentHTML('beforeend', this.createCard(item));
        });
    }

    static populateEducation(data) {
        this.populateGrid(CONFIG.SELECTORS.EDUCATION_CONTAINER, data.education);
    }

    static populateProjects(data) {
        this.populateGrid(CONFIG.SELECTORS.PROJECTS_CONTAINER, data.projects);
    }

    static populateCourses(data) {
        this.populateGrid(CONFIG.SELECTORS.COURSES_CONTAINER, data.courses);
    }

    static populateTestimonials(data) {
        const container = document.querySelector(CONFIG.SELECTORS.TESTIMONIALS_CONTAINER);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'testimonials-container';
        
        data.testimonials.forEach(item => {
            /* Remoção das classes do Bootstrap. Uso de tags semânticas puras. */
            const quote = `
                <blockquote class="testimonial-quote">
                    <p>"${item.text}"</p>
                    <footer>&mdash; ${item.author}, <cite>${item.source}</cite></footer>
                </blockquote>
            `;
            container.insertAdjacentHTML('beforeend', quote);
        });
    }

    static populateFooter(data, lang) {
        const footer = document.querySelector(CONFIG.SELECTORS.FOOTER);
        if (!footer) return;

        const emailPrefix = lang === 'en' ? 'Contact:' : 'Contato:';
        footer.innerHTML = `
            <div class="footer-content">
                <p>${emailPrefix} <a href="mailto:${data.contact.email}">${data.contact.email}</a></p>
                <div class="footer-links">
                    <a href="${data.contact.linkedin}" target="_blank" rel="noopener">
                        <i class="bi bi-linkedin"></i> LinkedIn
                    </a>
                    <a href="${data.contact.medium}" target="_blank" rel="noopener">
                        <i class="bi bi-medium"></i> Medium
                    </a>
                </div>
            </div>
        `;
    }

    static initStickyNavbar() {
        const navbar = document.querySelector(CONFIG.SELECTORS.NAVBAR);
        if (!navbar) return;

        const handleScroll = Utils.throttle(() => {
            if (window.scrollY > CONFIG.THRESHOLDS.STICKY_SCROLL) {
                navbar.classList.add(CONFIG.CLASSES.STICKY);
            } else {
                navbar.classList.remove(CONFIG.CLASSES.STICKY);
            }
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    static initBackToTop() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.innerHTML = '↑'; /* Substituição de dependência externa de ícone (Bootstrap Icons) por caractere tipográfico */
        backToTopBtn.className = CONFIG.CLASSES.BACK_TO_TOP;
        backToTopBtn.setAttribute('aria-label', 'Voltar ao topo');
        document.body.appendChild(backToTopBtn);

        const handleClick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const handleScroll = Utils.throttle(() => {
            backToTopBtn.style.display = window.scrollY > CONFIG.THRESHOLDS.BACK_TO_TOP_SCROLL ? 'flex' : 'none';
        }, 16);

        backToTopBtn.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    static initStickyNavbar() {
        const navbar = document.querySelector(CONFIG.SELECTORS.NAVBAR);
        const body = document.body;
        if (!navbar) return;

        const handleScroll = Utils.throttle(() => {
            // Gatilho em 100px para garantir que a transição seja clara
            if (window.scrollY > 100) { 
                navbar.classList.add('sticky');
                body.classList.add('navbar-is-sticky');
            } else {
                navbar.classList.remove('sticky');
                body.classList.remove('navbar-is-sticky');
            }
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}