/**
 * Util functions for Google Map
 *
 * Requires the use of the geometry library
 */

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

