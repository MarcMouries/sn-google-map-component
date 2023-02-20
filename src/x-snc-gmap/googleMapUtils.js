/**
 * Util functions for Google Map
 *
 * Requires the use of the geometry library
 */

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
 * This function takes in a circle object and calculates the radius in miles and kilometers,
 * and returns a string that represents the radius in miles and kilometers with the following format:
 * radius in miles> Mi / <radius in kilometers> Km.
 * @param {*} circle
 * @returns string
 */
export function getCircleRadiusDescription(circle) {
  let radiusInMeters = circle.getRadius();
  let radiusInMiles = radiusInMeters * 0.000621371;
  let radiusInKm = radiusInMeters / 1000;
  radiusInMiles = radiusInMiles.toFixed(2);
  radiusInKm = radiusInKm.toFixed(2);
  let circleRadiusDesc = `${radiusInMiles} Mi / ${radiusInKm} Km`;
  return circleRadiusDesc;
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

export function createInfoWindowFromObject(title, obj) {
  console.log("🌎 createInfoWindowFromObject createInfoWindow createInfoWindow", place);

  var content = document.createElement("div");

  // Create a header with the value of the title parameter
  var header = document.createElement("h3");
  header.textContent = title;
  content.appendChild(header);

  // Iterate over each property of the object and add it to the content
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && prop !== "name") {
      var element = document.createElement("p");
      element.innerHTML = "<strong>" + prop + ": </strong>" + obj[prop];
      content.appendChild(element);
    }
  }

  // Create a string with the HTML content for the InfoWindow
  var contentString = content.outerHTML;

  // Create a new InfoWindow with the content string
  var infowindow = new google.maps.InfoWindow({
    content: contentString,
  });

  return infowindow;
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
  console.log("🌎 createInfoWindow createInfoWindow createInfoWindow", place);

  const content = document.createElement("div");
  const name = document.createElement("div");
  const addressDiv = document.createElement("div");
  // name.textContent = place.name;
  name.innerHTML = `<b>${place.name}</b>`;

  const { address_components } = place;
  // Create a formatted address string using the address_components variable
  // using the format: 8045 Leesburg Pike STE 300, Vienna, VA 22182, USA
  //const address = `${address_components[0].long_name} ${address_components[1].long_name}, ${address_components[2].long_name}, ${address_components[4].short_name} ${address_components[6].long_name}, ${address_components[5].long_name}`;
  const address = formatAddress(place.address_components);
  //address.textContent = place.formatted_address;
  //addressDiv.innerHTML = place.adr_address;
  addressDiv.innerHTML = address;

  content.appendChild(name);
  content.appendChild(addressDiv);
  const infowindow = new google.maps.InfoWindow({ content: content });
  return infowindow;
}
