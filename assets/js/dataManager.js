// assets/js/dataManager.js
class DataManager {
    static async loadLocalization() {
        try {
            const response = await fetch('assets/js/localization.js');
            if (!response.ok) throw new Error('Failed to load localization');
            return await response.json();
        } catch (error) {
            console.error('Error loading localization:', error);
            throw error;
        }
    }

    static async loadProfile(lang) {
        try {
            const profileFile = LanguageDetector.getProfileFile(lang);
            const response = await fetch(profileFile);
            if (!response.ok) throw new Error('Failed to load profile data');
            return await response.json();
        } catch (error) {
            console.error('Error loading profile:', error);
            throw error;
        }
    }

    static validateData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }

        const requiredFields = ['name', 'title', 'about', 'education', 'projects', 'courses', 'testimonials', 'contact'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        return true;
    }
}