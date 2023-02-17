/**
 * Util functions for Google Map
 *
 * Requires the use of the geometry library
 */

 const defaultCircleOptions = {
  strokeColor: "#FF0000",
  strokeOpacity: 0.7,
  strokeWeight: 2,
  fillColor: "#FF0000",
  fillOpacity: 0.2,
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
    var content = document.createElement('div');

    // Create a header with the value of the title parameter
    var header = document.createElement('h3');
    header.textContent = title;
    content.appendChild(header);

    // Iterate over each property of the object and add it to the content
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && prop !== 'name') {
        var element = document.createElement('p');
        element.innerHTML = '<strong>' + prop + ': </strong>' + obj[prop];
        content.appendChild(element);
      }
    }

    // Create a string with the HTML content for the InfoWindow
    var contentString = content.outerHTML;

    // Create a new InfoWindow with the content string
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    
    return infowindow;
  }
  


