
import translations from './translations';

//let translations = {};

console.log (" == loading the translate.js ==");
console.log ("  - translations = ", translations);

const newLocale = "en";

export  function translate (message_key, language) {

    console.log ("  - translate : translations = " +  JSON.stringify(translations));

    const message_translations  = translations[message_key];
    if (! message_translations)  return `translation for ${message_key} is undefined`;
    const message = translations[message_key][language];
    console.log ("  - retrieved message: " +  message);
    const result = message ? message : translations[message_key]["en"];
    console.log(`translated: ${message_key} to ${result}`);
    return result;
}