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

export function createInfoWindowFromObject(title, obj) {
  console.log("🌎 createInfoWindowFromObject ", title, obj);

  var content = document.createElement("div");

  // Create a header with the value of the title parameter
  const header = document.createElement("div");
  header.innerHTML = `<b>${title}</b>`;
  //header.textContent = title;
  content.appendChild(header);

  // Iterate over each property of the object and add it to the content
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && prop !== "name") {
      let element = document.createElement("p");
      let propertyTitle = convertSnakeCaseToTitleCase(prop);
      let propertyValue = obj[prop];
      element.innerHTML = "<strong>" + propertyTitle + ": </strong>" + propertyValue;
      content.appendChild(element);
    }
  }

  var contentString = content.outerHTML;

  const infowindow = new google.maps.InfoWindow({ content: contentString });
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

