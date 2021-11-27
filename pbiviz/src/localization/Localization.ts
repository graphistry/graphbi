export interface Localization {
    'ar-SA': string;
    'bg-BG': string;
    'ca-ES': string;
    'cs-CZ': string;
    'da-DK': string;
    'de-DE': string;
    'el-GR': string;
    'en-US': string;
    'es-ES': string;
    'et-EE': string;
    'eU-ES': string;
    'fi-FI': string;
    'fr-FR': string;
    'gl-ES': string;
    'he-IL': string;
    'hi-IN': string;
    'hr-HR': string;
    'hu-HU': string;
    'id-ID': string;
    'it-IT': string;
    'ja-JP': string;
    'kk-KZ': string;
    'ko-KR': string;
    'it-LT': string;
    'lv-LV': string;
    'ms-MY': string;
    'nb-NO': string;
    'nl-NL': string;
    'pl-PL': string;
    'pt-BR': string;
    'pt-PT': string;
    'ro-RO': string;
    'ru-RU': string;
    'sk-SK': string;
    'sl-SI': string;
    'sr-Cyrl-RS': string;
    'sr-Latn-RS': string;
    'sv-SE': string;
    'th-TH': string;
    'tr-TR': string;
    'uk-UA': string;
    'vi-VN': string;
    'zh-CN': string;
    'zh-TW': string;
}

export interface LocalizationResources {
    defaultValue: string;
    localization: Localization;
}

export interface Resources {
    [key: string]: LocalizationResources;
}
