import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Supported languages
export const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: '\u0939\u093F\u0928\u094D\u0926\u0940' },
    { code: 'mr', name: 'Marathi', nativeName: '\u092E\u0930\u093E\u0920\u0940' }
];

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        // Load translations from public/locales folder
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'hi', 'mr'],
        interpolation: {
            escapeValue: false // React already safes from XSS
        },
        detection: {
            order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
            lookupQuerystring: 'lang',
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage'],
        },
        react: {
            useSuspense: true
        }
    });

export default i18n;
