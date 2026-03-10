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
        const aboutTitle = document.getElementById('about-title');
        const educationTitle = document.getElementById('education-title');
        const projectsTitle = document.getElementById('projects-title');
        const coursesTitle = document.getElementById('courses-title');
        const testimonialsTitle = document.getElementById('testimonials-title');

        if (aboutTitle) aboutTitle.textContent = texts.sections.about;
        if (educationTitle) educationTitle.textContent = texts.sections.education;
        if (projectsTitle) projectsTitle.textContent = texts.sections.projects;
        if (coursesTitle) coursesTitle.textContent = texts.sections.courses;
        if (testimonialsTitle) testimonialsTitle.textContent = texts.sections.testimonials;
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

    static createCard(item, type = 'default') {
        let imageHeight = '160px';
        if (type === 'projects') {
            imageHeight = '200px';
        } else if (type === 'education') {
            imageHeight = '120px';
        }
        return `
            <div class="card-item">
                <div class="card">
                    <div class="card-image" style="height: ${imageHeight};">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="card-overlay"></div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-description">${item.description}</p>
                    </div>
                </div>
            </div>
        `;
    }

    static getCategoryFromIcon(icon) {
        const categories = {
            'bi-mortarboard': 'Educação',
            'bi-apple': 'Formação',
            'bi-book': 'Especialização',
            'bi-people': 'Comunidade',
            'bi-trophy': 'Prêmios',
            'bi-lightbulb': 'Certificação',
            'bi-shield-check': 'Qualificação'
        };
        return categories[icon] || 'Projeto';
    }

    static populateEducation(data) {
        const container = document.querySelector(CONFIG.SELECTORS.EDUCATION_CONTAINER);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'card-grid education-grid';
        data.education.forEach(item => {
            container.insertAdjacentHTML('beforeend', this.createCard(item, 'education'));
        });
    }

    static populateProjects(data) {
        const container = document.querySelector(CONFIG.SELECTORS.PROJECTS_CONTAINER);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'card-grid projects-grid';
        data.projects.forEach(item => {
            container.insertAdjacentHTML('beforeend', this.createCard(item, 'projects'));
        });
    }

    static populateCourses(data) {
        const container = document.querySelector(CONFIG.SELECTORS.COURSES_CONTAINER);
        if (!container) return;

        container.innerHTML = '';
        container.className = 'card-grid courses-grid';
        data.courses.forEach(item => {
            container.insertAdjacentHTML('beforeend', this.createCard(item, 'courses'));
        });
    }

    static populateTestimonials(data) {
        const container = document.querySelector(CONFIG.SELECTORS.TESTIMONIALS_CONTAINER);
        if (!container) return;

        container.innerHTML = '';
        data.testimonials.forEach(item => {
            const quote = `
                <blockquote class="blockquote">
                    <p>"${item.text}"</p>
                    <footer class="blockquote-footer">${item.author} <cite title="Source Title">${item.source}</cite></footer>
                </blockquote>
            `;
            container.insertAdjacentHTML('beforeend', quote);
        });
    }

    static populateFooter(data, lang) {
        const footer = document.querySelector(CONFIG.SELECTORS.FOOTER);
        if (!footer) return;

        const emailPrefix = lang === 'en' ? 'Send me an email:' : 'Me mande um email:';
        footer.innerHTML = `
            <div class="footer-content">
                <div class="footer-section">
                    <p class="footer-email">${emailPrefix} <a href="mailto:${data.contact.email}" class="footer-link email-link">${data.contact.email}</a></p>
                </div>
                <div class="footer-section">
                    <div class="footer-links">
                        <a href="${data.contact.linkedin}" class="footer-link social-link"><i class="bi bi-linkedin"></i> LinkedIn</a>
                        <a href="${data.contact.medium}" class="footer-link social-link"><i class="bi bi-medium"></i> Medium</a>
                    </div>
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
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    static initBackToTop() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
        backToTopBtn.className = CONFIG.CLASSES.BACK_TO_TOP;
        backToTopBtn.setAttribute('aria-label', 'Voltar ao topo');
        document.body.appendChild(backToTopBtn);

        const handleClick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const handleScroll = Utils.throttle(() => {
            if (window.scrollY > CONFIG.THRESHOLDS.BACK_TO_TOP_SCROLL) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        }, 16);

        backToTopBtn.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}