/**
 * String Utils
 *
 */

/**
 *  console.log(convertSnakeCaseToTitleCase("last_inspection")); // Output: "Last Inspection"

 * @param {*} str 
 * @returns 
 */
export function convertSnakeCaseToTitleCase(str) {
  let words = str.split("_");
  let capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  let result = capitalizedWords.join(" ");
  return result;
}

/**
 * takes a string date in the format "YYYY-MM-DD" and returns the date in the US format "MM/DD/YYYY"
 * Note: for performance purpose, the function avoids the overhead of instantiating a new a Date object to convert the date
 * and instead uses string manipulation.
 *
 * @param {*} dateString
 * @returns
 */
export function convertISO8601toUS(dateString) {
  const parts = dateString.split("-");
  const usDate = `${parts[1]}/${parts[2]}/${parts[0]}`;
  return usDate;
}
