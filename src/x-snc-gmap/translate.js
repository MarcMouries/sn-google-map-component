/**
 * Simple translation class that allows to bundle the translations with the component
 */
import translations from './translations';

console.log (" == loading the translate.js ==");
console.log ("  - translations = ", translations);

export  function translate (message_key, language) {
    const message_translations  = translations[message_key];
    if (! message_translations)  return `translation for ${message_key} is undefined`;
    const message = translations[message_key][language];
    console.log ("  - retrieved message: " +  message);
    const result = message ? message : translations[message_key]["en"];
    console.log(`translated: ${message_key} ⮕ ${result}`);
    return result;
}