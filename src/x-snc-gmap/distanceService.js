import { Logger } from './logger';

/**
 * Distance Service Module
 * Handles distance calculations using Google Maps Distance Matrix Service
 */

/**
 * Get the Google Maps unit system based on the distanceUnit property
 * @param {string} distanceUnit - "miles" or "kilometers"
 * @returns {google.maps.UnitSystem} - IMPERIAL for miles, METRIC for kilometers
 */
const getUnitSystem = (distanceUnit) => {
  return distanceUnit === 'kilometers'
    ? google.maps.UnitSystem.METRIC
    : google.maps.UnitSystem.IMPERIAL;
};

/**
 * Calculate distances from a place to all markers using Google Distance Matrix Service
 * @param {Object} place - Google Place object with formatted_address
 * @param {Object} state - Component state containing markers and map reference
 */
export const searchDistance = (place, state) => {
  Logger.log('SEARCH DISTANCE:');
  Logger.log("  - formatted_address: ", place.formatted_address);
  Logger.log("  - state            : ", state);

  const { googleMap, gmMarkers, properties: { mapMarkers, distanceUnit } } = state;
  Logger.log("  - mapMarkers       : ", mapMarkers);
  Logger.log("  - distanceUnit     : ", distanceUnit);

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
      unitSystem: getUnitSystem(distanceUnit),
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

// Store route lines for cleanup
let routePolylines = [];
let routeInfoWindows = [];
let routeSequenceMarkers = [];

/**
 * Create a sequence number marker to display on a route line
 * @param {Object} googleMap - Google Maps instance
 * @param {Object} position - {lat, lng} position for the marker
 * @param {number} sequenceNumber - The sequence number to display
 * @param {boolean} isSuspicious - Whether this route segment is suspicious
 * @returns {google.maps.Marker} - The created marker
 */
const createSequenceMarker = (googleMap, position, sequenceNumber, isSuspicious = false) => {
  const bgColor = isSuspicious ? '#FF0000' : '#4285F4';

  // Create SVG circle with number
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="${bgColor}" stroke="white" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial">${sequenceNumber}</text>
    </svg>
  `;

  const marker = new google.maps.Marker({
    position: position,
    map: googleMap,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12),
    },
    zIndex: 1000 + sequenceNumber, // Ensure sequence markers are above route lines
  });

  return marker;
};

// Store place-to-marker route lines separately
let placeRoutePolylines = [];
let placeRouteInfoWindows = [];

/**
 * Extract and normalize position from marker data
 * Handles all marker data formats:
 * - marker.position = { lat, lng }
 * - marker.position = { lat, long }
 * - marker.lat and marker.lng as separate properties
 * - marker.lat and marker.long as separate properties
 * @param {Object} marker - Marker data object
 * @returns {Object} - Normalized {lat, lng} object or null if invalid
 */
const extractMarkerPosition = (marker) => {
  if (!marker) return null;

  // Handle position object
  if (marker.position) {
    const pos = marker.position;
    return {
      lat: pos.lat,
      lng: pos.lng !== undefined ? pos.lng : pos.long
    };
  }

  // Handle top-level lat/lng properties
  if (marker.lat !== undefined && marker.lng !== undefined) {
    return { lat: marker.lat, lng: marker.lng };
  }

  // Handle top-level lat/long properties
  if (marker.lat !== undefined && marker.long !== undefined) {
    return { lat: marker.lat, lng: marker.long };
  }

  return null;
};

/**
 * Draw route lines from a place (origin) to all markers
 * Shows driving distance and time for each route
 * @param {Object} place - Google Place object with geometry.location
 * @param {Object} googleMap - Google Maps instance
 * @param {Array} markers - Array of marker data with position
 * @param {string} distanceUnit - "miles" or "kilometers"
 */
export const drawRoutesFromPlace = (place, googleMap, markers, distanceUnit = 'miles') => {
  Logger.log('DRAW ROUTES FROM PLACE:');
  Logger.log("  - place:", place.name || place.formatted_address);
  Logger.log("  - distanceUnit:", distanceUnit);

  // Clear previous place routes
  clearPlaceRoutes();

  if (!markers || markers.length === 0) {
    Logger.log("  - No markers to draw routes to");
    return;
  }

  const origin = place.geometry.location;
  // Extract and normalize marker positions to ensure consistent format
  const normalizedMarkers = markers.map(m => ({
    ...m,
    position: extractMarkerPosition(m)
  })).filter(m => m.position !== null);
  const destinations = normalizedMarkers.map(m => m.position);

  // Get driving distances/times from place to all markers
  const distanceMatrixService = new google.maps.DistanceMatrixService();
  distanceMatrixService.getDistanceMatrix(
    {
      origins: [origin],
      destinations: destinations,
      travelMode: 'DRIVING',
      unitSystem: getUnitSystem(distanceUnit),
    },
    (response, status) => {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        Logger.error("Distance Matrix Service error:", status);
        // Fall back to drawing lines without distance info
        drawPlaceRouteLinesWithoutDistance(googleMap, origin, normalizedMarkers, distanceUnit);
        return;
      }

      drawPlaceRouteLinesWithDistance(googleMap, origin, normalizedMarkers, response, distanceUnit);
    }
  );
};

/**
 * Draw route lines from place to markers with distance/time info
 * @param {Object} googleMap - Google Maps instance
 * @param {Object} origin - Origin LatLng from place.geometry.location
 * @param {Array} markers - Array of marker data with normalized position
 * @param {Object} distanceResponse - Response from Distance Matrix API
 * @param {string} distanceUnit - "miles" or "kilometers"
 */
const drawPlaceRouteLinesWithDistance = (googleMap, origin, markers, distanceResponse, distanceUnit) => {
  const results = distanceResponse.rows[0]?.elements || [];
  Logger.log(`  Drawing ${markers.length} route lines (unit: ${distanceUnit})`);

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const element = results[i];
    const markerPos = marker.position;

    let drivingDistance = '';
    let drivingDuration = '';

    if (element && element.status === 'OK') {
      drivingDistance = element.distance.text;
      drivingDuration = element.duration.text;
    }

    const markerLabel = marker.name || `Marker ${i + 1}`;
    Logger.log(`  Route to ${markerLabel}: ${drivingDistance} (${drivingDuration})`);

    // Create LatLng for marker position to ensure proper coordinate handling
    const markerLatLng = new google.maps.LatLng(markerPos.lat, markerPos.lng);

    // Draw polyline from origin to marker - thicker line for easier clicking
    const polyline = new google.maps.Polyline({
      path: [origin, markerLatLng],
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: googleMap,
    });

    placeRoutePolylines.push(polyline);

    // Calculate midpoint for info window
    const midLat = (origin.lat() + markerPos.lat) / 2;
    const midLng = (origin.lng() + markerPos.lng) / 2;

    const infoContent = `
      <div class="route-info" style="padding: 8px; min-width: 150px;">
        <div style="font-weight: bold; margin-bottom: 4px;">${markerLabel}</div>
        <div>📏 ${drivingDistance}</div>
        <div>🚗 ${drivingDuration}</div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
      position: { lat: midLat, lng: midLng },
    });

    // Show info on polyline click
    polyline.addListener('click', () => {
      infoWindow.open(googleMap);
    });

    placeRouteInfoWindows.push(infoWindow);
  }
};

/**
 * Fallback: Draw lines from place to markers without distance info
 * @param {Object} googleMap - Google Maps instance
 * @param {Object} origin - Origin LatLng from place.geometry.location
 * @param {Array} markers - Array of marker data with normalized position
 * @param {string} distanceUnit - "miles" or "kilometers" (unused but kept for consistency)
 */
const drawPlaceRouteLinesWithoutDistance = (googleMap, origin, markers, distanceUnit) => {
  Logger.log(`  Drawing ${markers.length} route lines without distance info`);

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const markerPos = marker.position;

    // Create LatLng for marker position to ensure proper coordinate handling
    const markerLatLng = new google.maps.LatLng(markerPos.lat, markerPos.lng);

    const polyline = new google.maps.Polyline({
      path: [origin, markerLatLng],
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: googleMap,
    });

    placeRoutePolylines.push(polyline);
  }
};

/**
 * Clear all place-to-marker route lines and info windows
 */
export const clearPlaceRoutes = () => {
  placeRoutePolylines.forEach(line => line.setMap(null));
  placeRoutePolylines = [];

  placeRouteInfoWindows.forEach(info => info.close());
  placeRouteInfoWindows = [];
};

/**
 * Get timestamp from a marker using the specified field name
 * @param {Object} marker - Marker data object
 * @param {string} timestampField - Field name containing ISO 8601 timestamp
 * @returns {Date} - Parsed date object
 */
const getMarkerTimestamp = (marker, timestampField) => {
  const timestamp = marker[timestampField];
  if (!timestamp) {
    Logger.warn(`Marker missing timestamp field "${timestampField}":`, marker.name || marker);
    return new Date(0); // Return epoch for missing timestamps
  }
  return new Date(timestamp);
};

/**
 * Calculate minutes between two dates
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number} - Minutes between dates (absolute value)
 */
const minutesBetween = (date1, date2) => {
  return Math.abs(date2 - date1) / (1000 * 60);
};

/**
 * Draw route lines between consecutive markers and detect suspicious transitions.
 * A transition is suspicious if the actual time between markers is less than
 * the driving time required to travel between locations.
 *
 * @param {Object} googleMap - Google Maps instance
 * @param {Array} markers - Array of markers with position and timestamp data
 * @param {string} distanceUnit - "miles" or "kilometers"
 * @param {string} timestampField - Field name containing ISO 8601 timestamp (default: "timestamp")
 */
export const drawRoutes = (googleMap, markers, distanceUnit = 'miles', timestampField = 'timestamp') => {
  Logger.log('DRAW ROUTES:');
  Logger.log("  - timestampField:", timestampField);

  // Clear previous routes
  clearRoutes();

  if (!markers || markers.length < 2) {
    Logger.log("  - Need at least 2 markers to draw routes");
    return;
  }

  // Normalize marker positions and sort by timestamp
  const normalizedMarkers = markers.map(m => ({
    ...m,
    position: extractMarkerPosition(m)
  })).filter(m => m.position !== null);

  const sortedMarkers = [...normalizedMarkers].sort((a, b) => {
    const dateA = getMarkerTimestamp(a, timestampField);
    const dateB = getMarkerTimestamp(b, timestampField);
    return dateA - dateB;
  });

  Logger.log("  - Sorted markers:", sortedMarkers.length);

  // Build origins and destinations for Distance Matrix API
  const origins = [];
  const destinations = [];

  for (let i = 0; i < sortedMarkers.length - 1; i++) {
    origins.push(sortedMarkers[i].position);
    destinations.push(sortedMarkers[i + 1].position);
  }

  // Get driving times between consecutive markers
  const distanceMatrixService = new google.maps.DistanceMatrixService();
  distanceMatrixService.getDistanceMatrix(
    {
      origins: origins,
      destinations: destinations,
      travelMode: 'DRIVING',
      unitSystem: getUnitSystem(distanceUnit),
    },
    (response, status) => {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        Logger.error("Distance Matrix Service error:", status);
        // Fall back to drawing lines without distance info
        drawRouteLinesWithoutDistance(googleMap, sortedMarkers);
        return;
      }

      drawRouteLinesWithDistance(googleMap, sortedMarkers, response, timestampField);
    }
  );
};

/**
 * Draw route lines with distance/time info and suspicious detection
 * @param {Object} googleMap - Google Maps instance
 * @param {Array} sortedMarkers - Array of markers sorted by timestamp
 * @param {Object} distanceResponse - Response from Distance Matrix Service
 * @param {string} timestampField - Field name containing ISO 8601 timestamp
 */
const drawRouteLinesWithDistance = (googleMap, sortedMarkers, distanceResponse, timestampField) => {
  for (let i = 0; i < sortedMarkers.length - 1; i++) {
    const fromMarker = sortedMarkers[i];
    const toMarker = sortedMarkers[i + 1];

    const fromDateTime = getMarkerTimestamp(fromMarker, timestampField);
    const toDateTime = getMarkerTimestamp(toMarker, timestampField);
    const actualMinutes = minutesBetween(fromDateTime, toDateTime);

    // Get driving info from Distance Matrix response
    const element = distanceResponse.rows[i]?.elements[0];
    let drivingMinutes = 0;
    let drivingDistance = '';
    let drivingDuration = '';

    if (element && element.status === 'OK') {
      drivingMinutes = element.duration.value / 60; // Convert seconds to minutes
      drivingDistance = element.distance.text;
      drivingDuration = element.duration.text;
    }

    // Detect suspicious: actual time < driving time (impossible without teleportation)
    const isSuspicious = actualMinutes < drivingMinutes;

    // Use name field for logging, fallback to index
    const fromLabel = fromMarker.name || `Marker ${i}`;
    const toLabel = toMarker.name || `Marker ${i + 1}`;

    Logger.log(`  Route ${i + 1}: ${fromLabel} → ${toLabel}`);
    Logger.log(`    - Actual time gap: ${actualMinutes.toFixed(0)} min`);
    Logger.log(`    - Driving time: ${drivingDuration} (${drivingMinutes.toFixed(0)} min)`);
    Logger.log(`    - Suspicious: ${isSuspicious ? 'YES ⚠️' : 'No'}`);

    // Draw polyline - red if suspicious, blue if normal
    const lineColor = isSuspicious ? '#FF0000' : '#4285F4';
    const lineWeight = isSuspicious ? 4 : 2;

    // Arrow symbol to show direction of travel
    const arrowSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 3,
      strokeColor: lineColor,
      strokeWeight: 2,
      fillColor: lineColor,
      fillOpacity: 1,
    };

    const polyline = new google.maps.Polyline({
      path: [fromMarker.position, toMarker.position],
      geodesic: true,
      strokeColor: lineColor,
      strokeOpacity: 0.8,
      strokeWeight: lineWeight,
      icons: [
        { icon: arrowSymbol, offset: '25%' },
        { icon: arrowSymbol, offset: '75%' },
      ],
      map: googleMap,
    });

    routePolylines.push(polyline);

    // Add info window at midpoint showing the route details
    const midLat = (fromMarker.position.lat + toMarker.position.lat) / 2;
    const midLng = (fromMarker.position.lng + toMarker.position.lng) / 2;

    // Add sequence number marker at midpoint of the line
    const sequenceMarker = createSequenceMarker(
      googleMap,
      { lat: midLat, lng: midLng },
      i + 1, // 1-based sequence number
      isSuspicious
    );
    routeSequenceMarkers.push(sequenceMarker);

    const suspiciousLabel = isSuspicious
      ? '<div style="color: red; font-weight: bold;">⚠️ SUSPICIOUS: Impossible transition!</div>'
      : '';

    const infoContent = `
      <div class="route-info" style="padding: 8px; min-width: 200px;">
        <div style="font-weight: bold; margin-bottom: 4px;">
          ${fromLabel} → ${toLabel}
        </div>
        <div>📏 Driving: ${drivingDistance} (${drivingDuration})</div>
        <div>⏱️ Actual gap: ${actualMinutes.toFixed(0)} min</div>
        ${suspiciousLabel}
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
      position: { lat: midLat, lng: midLng },
    });

    // Show info on polyline click
    polyline.addListener('click', () => {
      infoWindow.open(googleMap);
    });

    // Auto-open suspicious route info windows
    if (isSuspicious) {
      infoWindow.open(googleMap);
    }

    routeInfoWindows.push(infoWindow);
  }
};

/**
 * Fallback: Draw lines without distance info (if API fails)
 * @param {Object} googleMap - Google Maps instance
 * @param {Array} sortedMarkers - Array of markers sorted by timestamp
 */
const drawRouteLinesWithoutDistance = (googleMap, sortedMarkers) => {
  for (let i = 0; i < sortedMarkers.length - 1; i++) {
    const fromMarker = sortedMarkers[i];
    const toMarker = sortedMarkers[i + 1];

    // Arrow symbol to show direction of travel
    const arrowSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 3,
      strokeColor: '#4285F4',
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 1,
    };

    const polyline = new google.maps.Polyline({
      path: [fromMarker.position, toMarker.position],
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      icons: [
        { icon: arrowSymbol, offset: '25%' },
        { icon: arrowSymbol, offset: '75%' },
      ],
      map: googleMap,
    });

    routePolylines.push(polyline);

    // Add sequence number marker at midpoint of the line
    const midLat = (fromMarker.position.lat + toMarker.position.lat) / 2;
    const midLng = (fromMarker.position.lng + toMarker.position.lng) / 2;
    const sequenceMarker = createSequenceMarker(
      googleMap,
      { lat: midLat, lng: midLng },
      i + 1, // 1-based sequence number
      false
    );
    routeSequenceMarkers.push(sequenceMarker);
  }
};

/**
 * Clear all route lines, info windows, and sequence markers
 */
export const clearRoutes = () => {
  routePolylines.forEach(line => line.setMap(null));
  routePolylines = [];

  routeInfoWindows.forEach(info => info.close());
  routeInfoWindows = [];

  routeSequenceMarkers.forEach(marker => marker.setMap(null));
  routeSequenceMarkers = [];
};
