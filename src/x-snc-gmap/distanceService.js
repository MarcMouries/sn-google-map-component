import { Logger } from './logger';

/**
 * Distance Service Module
 * Handles distance calculations using Google Maps Distance Matrix Service
 */

/**
 * Calculate distances from a place to all markers using Google Distance Matrix Service
 * @param {Object} place - Google Place object with formatted_address
 * @param {Object} state - Component state containing markers and map reference
 */
export const searchDistance = (place, state) => {
  Logger.log('SEARCH DISTANCE:');
  Logger.log("  - formatted_address: ", place.formatted_address);
  Logger.log("  - state            : ", state);

  const { googleMap, gmMarkers, properties: { mapMarkers, mapMarkersFields } } = state;
  Logger.log("  - mapMarkers       : ", mapMarkers);

  // Guard: Skip distance calculation if no markers exist
  if (!mapMarkers || mapMarkers.length === 0) {
    Logger.log("  - No markers to calculate distance to, skipping");
    return;
  }

  let origins = [place.formatted_address];
  let destinations = [];
  mapMarkers.forEach((marker) => {
    destinations.push(marker.position);
  });
  Logger.log("  - destinations       : ", destinations);

  let distanceMatrixService = new google.maps.DistanceMatrixService();
  distanceMatrixService.getDistanceMatrix(
    {
      origins: origins,
      destinations: destinations,
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function (response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        Logger.error("Distance Matrix Service error with origins:", origins);
      } else {
        displayMarkersWithDrivingTime(response, googleMap, gmMarkers);
      }
    });
};

/**
 * Display driving time and distance info on markers
 * @param {Object} response - Response from Distance Matrix Service
 * @param {Object} googleMap - Google Maps instance
 * @param {Array} gmMarkers - Array of Google Maps markers
 */
const displayMarkersWithDrivingTime = (response, googleMap, gmMarkers) => {
  Logger.log('SHOW DISTANCE:');
  Logger.log("  - response       : ", response);

  var origins = response.originAddresses;
  var destinations = response.destinationAddresses;
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements; // each row corresponds to an origin
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      if (element.status === "OK") {
        let element = results[j];
        let distance = element.distance.text;
        let duration = element.duration.text;
        let origin = origins[i];
        let destination = destinations[j];

        Logger.log(`#${j} ${duration} away ${distance}`);
        Logger.log("  - origin       : ", origin);
        Logger.log("  - destination  : ", destination);

        let marker = gmMarkers[j];
        let content = duration + ' away, ' + distance;
        var infowindow = new google.maps.InfoWindow({
          content: '<div class="info-distance" id="infowindowContent">' + content + '</div>',
          pixelOffset: new google.maps.Size(0, 90) // pixel down the marker
        });
        infowindow.open(googleMap, marker);
      }
    }
  }
};
