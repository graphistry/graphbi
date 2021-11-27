import { localizedResources as myResources } from './localizedResources';

export { Localization, LocalizationResources, Resources } from './Localization';

/**
 * Returns the localized string in the locale transfared using the key that was given to serch the resources
 *
 * @param {string} locale - the locale in which PowerBI is currently running
 * @param {object} key - specify a key for the string you want localized in your visual
 */
export function getLocalizedString(locale: string, key: string): string {
    return (
        myResources &&
        key &&
        myResources[key] &&
        (myResources[key].localization[locale] || myResources[key].defaultValue)
    );
}
