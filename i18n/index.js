import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ICU from 'i18next-icu';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './resources/en/common.json';
import lv from './resources/lv/common.json';
import {LOCALES} from "../constants/Locales";

const resources = {
    [LOCALES.EN]: { common: en },
    [LOCALES.LV]: { common: lv },
};

export async function detectInitialLanguage() {
    const savedLocale = await AsyncStorage.getItem('language');

    if (savedLocale && [LOCALES.EN, LOCALES.LV].includes(savedLocale)) {
        return savedLocale;
    }

    const device = Localization.getLocales?.()[0];
    const tag = (device?.languageTag || '').toLowerCase();

    if (tag.startsWith(LOCALES.LV)) {
        return LOCALES.LV;
    }

    return LOCALES.EN;
}

i18n
    .use(ICU)
    .use(initReactI18next)
    .init({
        resources,
        lng: LOCALES.EN,
        fallbackLng: LOCALES.EN,
        defaultNS: 'common',
        interpolation: { escapeValue: false },
        compatibilityJSON: 'v4',
        returnNull: false,
    });

detectInitialLanguage()
    .then(async (lng) => {
        await i18n.changeLanguage(lng);
        await AsyncStorage.setItem("language", lng);
    })
    .catch(() => {});

export const setLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('language', lng);
};

export default i18n;
