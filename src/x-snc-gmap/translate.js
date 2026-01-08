/**
 * Simple translation class that allows to bundle the translations with the component
 */
import translations from './translations';
import { Logger } from './logger';

Logger.debug("🌐 Loading translate.js");
Logger.debug("  - translations = ", translations);

export  function translate (message_key, language) {
    const message_translations  = translations[message_key];
    if (! message_translations)  return `translation for ${message_key} is undefined`;
    const message = translations[message_key][language];
    Logger.debug("  - retrieved message: " +  message);
    const result = message ? message : translations[message_key]["en"];
    Logger.debug(`🌐 translated: ${message_key} ⮕ ${result}`);
    return result;
}