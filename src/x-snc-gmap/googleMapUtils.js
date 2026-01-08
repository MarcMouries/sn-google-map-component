/**
 * Util functions for Google Map
 *
 * Requires the use of the geometry library
 */
import { convertSnakeCaseToTitleCase } from "./stringUtils";
import { COLOR } from "./constants";

const defaultCircleOptions = {
  strokeColor: COLOR.CIRCLE,
  strokeOpacity: 0.6,
  strokeWeight: 1,
  fillColor: COLOR.CIRCLE,
  fillOpacity: 0.1,
  draggable: true,
  editable: true,
};

/**
 * Create a Circle
 */
export function createCircle(map, center, radius, options) {
  const circle = new google.maps.Circle({
    ...defaultCircleOptions,
    ...options,
  });
  circle.setMap(map);
  circle.setCenter(center);
  circle.setRadius(radius);
  return circle;
}

/* Compute the position of the marker at the top of the circle */
export function computeMarkerPosition(circle, position) {
  let radius = circle.getRadius();
  let center = circle.getCenter();

  let heading;
  switch (position) {
    case "top":
      heading = 0;
      break;
    case "bottom":
      heading = 180;
      break;
    case "left":
      heading = 270;
      break;
    case "right":
      heading = 90;
      break;
    default:
      return null;
  }

  return google.maps.geometry.spherical.computeOffset(center, radius, heading);
}

/**
 * Convert radius from miles or kilometers to meters
 * @param {number} radius - Radius value
 * @param {string} unit - "miles" or "kilometers"
 * @returns {number} - Radius in meters
 */
export function convertRadiusToMeters(radius, unit) {
  if (unit === "kilometers") {
    return radius * 1000;
  }
  // Default to miles: 1 mile = 1609.34 meters
  return radius * 1609.34;
}

/**
 * This function takes in a circle object and calculates the radius in miles and/or kilometers,
 * and returns a string that represents the radius based on the specified unit.
 * @param {*} circle - Google Maps Circle object
 * @param {string} unit - Display unit: "miles", "kilometers", or undefined for both
 * @returns string - Formatted radius description
 */
export function getCircleRadiusDescription(circle, unit) {
  let radiusInMeters = circle.getRadius();
  let radiusInMiles = (radiusInMeters * 0.000621371).toFixed(2);
  let radiusInKm = (radiusInMeters / 1000).toFixed(2);

  if (unit === "miles") {
    return `${radiusInMiles} Miles`;
  } else if (unit === "kilometers") {
    return `${radiusInKm} Km`;
  }
  // Default: show both (backward compatible)
  return `${radiusInMiles} Mi / ${radiusInKm} Km`;
}

/**
   * Retrieve place details based on the place description ("ServiceNow, leesburg pike")
   It returns a Promise that resolves with the place details if the request is successful,
   or rejects with an error status if the request fails.
   - retrieve a list of suggested places based on the input value
    - and set the selected Place object as the value of the Autocomplete field.
 */
export function getPlaceDetails(placeDescription, googleMap) {
  const autocompleteService = new google.maps.places.AutocompleteService();
  let request = { input: placeDescription };
  return new Promise((resolve, reject) => {
    autocompleteService.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const placeId = predictions[0].place_id;
        const placesService = new google.maps.places.PlacesService(googleMap);
        placesService.getDetails({ placeId }, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(place);
          } else {
            reject(status);
          }
        });
      } else {
        reject(status);
      }
    });
  });
}



/**
 * Construct an address based on the google address_components that
 * follows this format: 8045 Leesburg Pike STE 300, Vienna, VA 22182, USA
 * @param {*} address_components 
 * @returns well formatted address
 */
function formatAddress(address_components) {
  let addressLine1 = "";
  let cityStateZip = "";
  let subpremise = "";

  for (let component of address_components) {
    if (component.types.includes("street_number")) {
      addressLine1 += component.long_name + " ";
    }
    if (component.types.includes("route")) {
      addressLine1 += component.long_name + " ";
    }
    if (component.types.includes("subpremise")) {
      subpremise = component.long_name;
    }
    if (component.types.includes("locality")) {
      cityStateZip += component.long_name + ", ";
    }
    if (component.types.includes("administrative_area_level_1")) {
      cityStateZip += component.short_name + " ";
    }
    if (component.types.includes("postal_code")) {
      cityStateZip += component.long_name + ", ";
    }
  }

  // Remove trailing comma and space from cityStateZip
  //cityStateZip = cityStateZip.slice(0, -2);

  // Combine address lines and return
  return addressLine1 + subpremise + ", " + cityStateZip;
}

export function createInfoWindow(place) {
  console.log("🌎 createInfoWindow", place);

  const content = document.createElement("div");
  const header = document.createElement("div");
  const addressDiv = document.createElement("div");
  // name.textContent = place.name;
  header.innerHTML = `<b>${place.name}</b>`;

  // Create a formatted address string using the address_components variable
  // using the format: 8045 Leesburg Pike STE 300, Vienna, VA 22182, USA
  const address = formatAddress(place.address_components);
  //address.textContent = place.formatted_address;
  //addressDiv.innerHTML = place.adr_address;
  addressDiv.innerHTML = address;

  content.appendChild(header);
  content.appendChild(addressDiv);
  const infowindow = new google.maps.InfoWindow({ content: content });
  return infowindow;
}

/**
 * Format a date string to a more readable format
 * Input: "2025-07-09" -> Output: "Jul 9, 2025"
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateString;
  }
}

/**
 * Format number with commas for thousands
 * Input: 39000 -> Output: "39,000"
 */
function formatNumber(num) {
  if (num === undefined || num === null) return '';
  return num.toLocaleString();
}

export function createInfoWindowFromObject(title, obj) {
  console.log("🌎 createInfoWindowFromObject ", title, obj);

  // Styles for the info window - compact design
  const styles = {
    container: `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 200px;
      max-width: 300px;
      margin: -12px -12px -12px -12px;
    `,
    header: `
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      color: white;
      padding: 10px 40px 10px 12px;
      font-size: 13px;
      font-weight: 600;
    `,
    body: `
      padding: 10px 12px;
    `,
    headline: `
      font-size: 12px;
      color: #c53030;
      margin: 0 0 8px 0;
      padding: 0 24px 8px 0;
      border-bottom: 1px solid #e2e8f0;
      line-height: 1.4;
    `,
    statsRow: `
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    `,
    stat: `
      text-align: center;
      flex: 1;
    `,
    statValue: `
      font-size: 16px;
      font-weight: 700;
      color: #2d3748;
    `,
    statLabel: `
      font-size: 9px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `,
    field: `
      font-size: 11px;
      color: #4a5568;
      margin: 3px 0;
      line-height: 1.3;
    `,
    fieldLabel: `
      color: #718096;
      font-weight: 500;
    `,
    status: `
      display: inline-block;
      padding: 1px 6px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 500;
    `,
    statusActive: `
      background: #fed7d7;
      color: #c53030;
    `,
    statusEnded: `
      background: #c6f6d5;
      color: #276749;
    `,
    date: `
      font-size: 10px;
      color: #a0aec0;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
    `
  };

  // Build HTML content
  let html = `<div style="${styles.container}">`;

  // Header with title
  html += `<div style="${styles.header}">${title}</div>`;

  // Body
  html += `<div style="${styles.body}">`;

  // Headline (if exists) - show prominently at top
  if (obj.headline) {
    html += `<div style="${styles.headline}">${obj.headline}</div>`;
  }

  // Stats row for cases/deaths (if exists)
  if (obj.cases !== undefined || obj.deaths !== undefined) {
    html += `<div style="${styles.statsRow}">`;
    if (obj.cases !== undefined) {
      html += `<div style="${styles.stat}">
        <div style="${styles.statValue}">${formatNumber(obj.cases)}</div>
        <div style="${styles.statLabel}">Cases</div>
      </div>`;
    }
    if (obj.deaths !== undefined) {
      html += `<div style="${styles.stat}">
        <div style="${styles.statValue}">${formatNumber(obj.deaths)}</div>
        <div style="${styles.statLabel}">Deaths</div>
      </div>`;
    }
    html += `</div>`;
  }

  // Other fields
  const skipFields = ['name', 'headline', 'cases', 'deaths', 'date_reported', 'date_ended', 'markerColor', 'position'];

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop) && !skipFields.includes(prop)) {
      const propertyTitle = convertSnakeCaseToTitleCase(prop);
      let propertyValue = obj[prop];

      // Special handling for status field
      if (prop === 'status') {
        const statusStyle = propertyValue === 'Active'
          ? styles.status + styles.statusActive
          : styles.status + styles.statusEnded;
        propertyValue = `<span style="${statusStyle}">${propertyValue}</span>`;
      }

      html += `<div style="${styles.field}">
        <span style="${styles.fieldLabel}">${propertyTitle}:</span> ${propertyValue}
      </div>`;
    }
  }

  // Date at bottom
  if (obj.date_reported) {
    html += `<div style="${styles.date}">Reported: ${formatDate(obj.date_reported)}`;
    if (obj.date_ended) {
      html += ` • Ended: ${formatDate(obj.date_ended)}`;
    }
    html += `</div>`;
  }

  html += `</div></div>`;

  const infowindow = new google.maps.InfoWindow({ content: html });
  return infowindow;
}

/**
 * Extract specific fields from an object based on a list of field names.
 * Example:
    const markerFields = ["name", "city", "state"];
    const airport = {
      iata_code: "DCA",
      name: "Ronald Reagan Washington National Airport",
      city: "Arlington",
      state: "Virginia",
      country: "United States",
      lat: 38.852083,
      lng: -77.037722,
    };
    const airportMarkerFields = extractFields(markerFields, airport);
    console.log(airportMarkerFields);
    // { name: "Ronald Reagan Washington National Airport", city: "Arlington", state: "Virginia" }
 *
 * @param {*} mapMarkersFields
 * @param {*} object
 * @returns object
 */
export function extractFields(mapMarkersFields, dataObject) {
  const result = {};
  mapMarkersFields.forEach(field => {
    if (dataObject.hasOwnProperty(field)) {
      result[field] = dataObject[field];
    }
  });
  return result;
}

