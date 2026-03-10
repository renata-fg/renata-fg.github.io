// assets/js/utils.js
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    static isMobile() {
        return window.innerWidth < CONFIG.BREAKPOINTS.MOBILE;
    }

    static isTablet() {
        return window.innerWidth >= CONFIG.BREAKPOINTS.MOBILE && window.innerWidth < CONFIG.BREAKPOINTS.TABLET;
    }

    static isDesktop() {
        return window.innerWidth >= CONFIG.BREAKPOINTS.DESKTOP;
    }

    static formatDate(date, locale = 'pt-BR') {
        return new Intl.DateTimeFormat(locale).format(new Date(date));
    }

    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    static loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
}