import loadGoogleMapsApi from "load-google-maps-api";
import MarkerClusterer from "@google/markerclustererplus";
import { customActions, COLOR, MARKER_STYLE, CIRCLE_DEFAULTS } from "./constants";
import { CENTER_ON } from "./constants";
import { translate } from "./translate";
import { createCircle, computeMarkerPosition, convertRadiusToMeters } from "./googleMapUtils";
import { extractFields, getCircleRadiusDescription, getPlaceDetails } from "./googleMapUtils";
import { createCustomInfoBox } from "./customInfoBox";
import { SVG_SQUARE } from "./constants";
import { MapQuest } from "./googleMapStyle";
import svg_icon from "./assets/svg-icon.svg";
import { createRadiusOverlay } from './radiusOverlay'
import { Logger } from './logger';
import { searchDistance, drawRoutes, clearRoutes, drawRoutesFromPlace, clearPlaceRoutes } from './distanceService';


// Note: gmMarkers, radiusOverlay, placeCircleRef are now stored in component state
// to prevent memory leaks across component lifecycles. See initialState in index.js.
let googleMapRef; // Reference to the map for toggling (kept module-level for event listeners)
let currentInfoTemplate = ''; // Current info template (module-level so click handlers use latest value)
let currentGmMarkers = []; // Current markers for circle detection
let currentPlace = null; // Last searched place for distance line drawing
let currentPlaceMarker = null; // Current place marker (to clean up when address changes)
let currentCircleListeners = []; // Circle event listeners (to clean up when address changes)
let currentAutoCompleteRef = null; // Reference to autocomplete input for updating address on marker drag

/**
 * Debounce utility - delays function execution until after wait ms have elapsed
 * since the last time it was invoked. Useful for circle drag/resize events.
 * @param {Function} func - The function to debounce
 * @param {number} wait - Milliseconds to wait before executing
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const loadGoogleApi = ({ action, state, dispatch, updateState }) => {
  Logger.info("Loading Google Maps API...");
  Logger.debug("googleMapMethod:", state.googleMapMethod);

  const { properties } = state;

  // Google Map Libraries
  // - places  : Place Autocomplete, Place Details
  // - geometry: Spherical geometry utilities (distance calculations)
  // - drawing : Drawing tools on the map
  // - marker  : AdvancedMarkerElement (new marker API, requires v3.53.2+)

  let GOOGLE_MAPS_API_OPTIONS = {};
  if (state.googleMapMethod == "key") {
    GOOGLE_MAPS_API_OPTIONS.key = action.payload.googleApiKey;
  } else {
    GOOGLE_MAPS_API_OPTIONS.client = action.payload.googleApiKey;
  }

  GOOGLE_MAPS_API_OPTIONS.libraries = ["places,drawing,geometry,marker"];

  GOOGLE_MAPS_API_OPTIONS.language = properties.language;

  loadGoogleMapsApi(GOOGLE_MAPS_API_OPTIONS)
    .then((googleMapsApi) => {
      Logger.info("Google Maps API loaded");
      updateState({ googleMapsApi });
      dispatch(customActions.CURRENT_USER_FETCH_REQUESTED);
    })
    .catch((error) => {
      Logger.error("Cannot load Google Maps API:", error);
    });
};

export const initializeMap = ({ state, updateState, dispatch }) => {
  const { googleMapsApi, mapElementRef, autoCompleteRef, radiusInputRef, properties } = state;
  Logger.info("Initializing map");
  updateState({ isLoading: false });

  // let mapOptions = {
  // 	zoom: properties.initialZoom,
  // 	center: new googleMapsApi.LatLng(properties.center.lat, properties.center.long)
  // }

  /* CENTER ON USER's LOCATION BY DEFAULT */
  let mapOptions = {
    zoom: properties.initialZoom,
    //mapTypeId: 'mystyle',
    center: new googleMapsApi.LatLng(state.currentUser.location.latitude, state.currentUser.location.longitude),
  };

  // the Map / Stellite option buttons
  mapOptions["mapTypeControlOptions"] = {
    position: google.maps.ControlPosition.LEFT_BOTTOM,
  };

  let googleMap = new googleMapsApi.Map(mapElementRef.current, mapOptions);
  googleMap.mapTypes.set("mystyle", new google.maps.StyledMapType(MapQuest, { name: "My Style" }));

  if ((googleMapsApi, mapElementRef)) {
    async function init() {
      updateState({ googleMapsRef: googleMap });
    }
    init().then(() => {
      initializeCircle(state, updateState, dispatch, googleMap);

      setMarkers(state, updateState, dispatch, googleMap);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          Logger.debug("User location - Lat:", position.coords.latitude, "Lng:", position.coords.longitude);
        });
      } else {
        Logger.warn("Geolocation is not supported by this browser");
      }
    });
  } else {
    Logger.error("Cannot initialize Google Map - missing googleMapsApi or mapElementRef");
  }

 // updateState({ googleMap: googleMap });

  const autoCompleteOptions = {
    fields: ["address_components", "geometry", "icon", "name"], // Set the fields to include in the prediction results
  };
  // Set the value of the input field to the place passed as property
  autoCompleteRef.current.value = properties.place;
  // Store reference for updating when marker is dragged
  currentAutoCompleteRef = autoCompleteRef.current;

  const addressSearch = new google.maps.places.Autocomplete(autoCompleteRef.current, autoCompleteOptions);

  /**  programmatically set the Place object for the Autocomplete field
   the addressSearch.set("place", place) method expects a google place object (not just an address string)*/
  getPlaceDetails(properties.place, googleMap)
    .then((place) => {
      addressSearch.set("place", place);
    })
    .catch((error) => {
      Logger.error("Error retrieving place data:", error);
    });

  addressSearch.addListener("place_changed", () => {
    const place = addressSearch.getPlace();
    handlePlaceChanged(place, googleMap, state, dispatch, updateState);
  });
};

export const handlePlaceChanged = (place, googleMap, state, dispatch, updateState) => {
  Logger.debug("Place changed:", place.name);
  const { properties } = state;

  // Store place for later use when distance lines are toggled
  currentPlace = place;

  // Clean up existing place marker before creating a new one
  if (currentPlaceMarker) {
    currentPlaceMarker.setMap(null);
    currentPlaceMarker = null;
  }

  // Clean up existing circle and overlay before creating new ones
  if (state.placeCircleRef) {
    // Remove event listeners from old circle
    currentCircleListeners.forEach(listener => {
      google.maps.event.removeListener(listener);
    });
    currentCircleListeners = [];
    // Remove old circle from map
    state.placeCircleRef.setMap(null);
  }
  if (state.radiusOverlay) {
    state.radiusOverlay.setMap(null);
  }

  // Create new place marker
  currentPlaceMarker = new google.maps.Marker({
    map: googleMap,
    draggable: true,
    animation: google.maps.Animation.BOUNCE,
    position: place.geometry.location,
  });
  currentPlaceMarker.setVisible(true);
  googleMap.setCenter(currentPlaceMarker.getPosition());

  const circleCenter = place.geometry.location;
  const radiusInMeters = convertRadiusToMeters(state.properties.circleRadius, state.properties.distanceUnit);
  const placeCircle = createCircle(googleMap, circleCenter, radiusInMeters, {});

  // Store references for toggling visibility (in state to prevent memory leaks)
  googleMapRef = googleMap;

  // Create new overlay (don't reuse old one since circle changed)
  let elm = document.createElement("div");
  elm.classList.add("overlay-content");
  const newRadiusOverlay = createRadiusOverlay(computeMarkerPosition(placeCircle, "bottom"), elm);
  newRadiusOverlay.setMap(googleMap);

  updateState({ placeCircleRef: placeCircle, radiusOverlay: newRadiusOverlay });

  // Check if circle should be visible based on showCircle property
  const showCircle = state.properties.showCircle !== false; // Default to true
  if (!showCircle) {
    placeCircle.setMap(null);
    newRadiusOverlay.setMap(null);
  }

  handleCircleChanged(googleMap, placeCircle, newRadiusOverlay, state, dispatch);

  // IMPORTANT: Pass newRadiusOverlay directly to all handlers below.
  // DO NOT call getRadiusOverlay() inside these handlers or use state.radiusOverlay.
  // The state captured in these closures becomes stale, causing ghost/duplicate labels.
  const debouncedCircleChanged = debounce(() => {
    handleCircleChanged(googleMap, placeCircle, newRadiusOverlay, state, dispatch);
  }, 150);

  // LISTENERS - store references for cleanup
  currentCircleListeners.push(
    google.maps.event.addListener(placeCircle, "radius_changed", function () {
      debouncedCircleChanged();
    })
  );

  // Update overlay position while dragging (real-time, no debounce needed)
  currentCircleListeners.push(
    google.maps.event.addListener(placeCircle, "center_changed", function () {
      updateOverlayPosition(placeCircle, newRadiusOverlay);
    })
  );

  currentCircleListeners.push(
    google.maps.event.addListener(placeCircle, "dragend", function () {
      debouncedCircleChanged();
    })
  );

  // Add dragend listener to place marker - update address when marker is dropped
  currentPlaceMarker.addListener('dragend', () => {
    const newPosition = currentPlaceMarker.getPosition();
    Logger.debug("Place marker dragged to:", newPosition.lat(), newPosition.lng());

    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: newPosition }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const newAddress = results[0].formatted_address;
        Logger.debug("Reverse geocoded address:", newAddress);

        // Update the autocomplete input field
        if (currentAutoCompleteRef) {
          currentAutoCompleteRef.value = newAddress;
        }

        // Create a place-like object for consistency
        const newPlace = {
          name: newAddress,
          formatted_address: newAddress,
          geometry: {
            location: newPosition
          }
        };

        // Update module-level currentPlace for distance lines
        currentPlace = newPlace;

        // Move the circle to the new position
        placeCircle.setCenter(newPosition);

        // Recalculate distance lines if enabled
        const { showDistanceLines, mapMarkers, distanceUnit } = state.properties;
        if (showDistanceLines && mapMarkers && mapMarkers.length > 0) {
          drawRoutesFromPlace(newPlace, googleMap, mapMarkers, distanceUnit);
        }

        // Recalculate markers inside circle (use local variables, not stale state)
        handleCircleChanged(googleMap, placeCircle, newRadiusOverlay, state, dispatch);
      } else {
        Logger.error("Geocoder failed:", status);
      }
    });
  });

  Logger.log("  - googleMap            : ", googleMap);

  searchDistance(place, state);

  // Draw route lines from place to markers if enabled
  const { showDistanceLines, mapMarkers, distanceUnit } = state.properties;
  if (showDistanceLines && mapMarkers && mapMarkers.length > 0) {
    drawRoutesFromPlace(place, googleMap, mapMarkers, distanceUnit);
  }
};

export const handleCircleChanged = (googleMap, placeCircle, overlay, state, dispatch) => {
  Logger.debug("Circle changed");

  const radiusUnit = state.properties?.distanceUnit;
  if (overlay) {
    overlay.setContentText(getCircleRadiusDescription(placeCircle, radiusUnit));
    overlay.setPosition(computeMarkerPosition(placeCircle, "bottom"));
  }

  let radius = placeCircle.getRadius();
  let center = placeCircle.getCenter();
  let markersInsideCircle = [];
  let addedMarkerIds = new Set();

  // Use module-level currentGmMarkers instead of state.gmMarkers to avoid stale closure issue.
  // The state captured in debounced handlers becomes stale; module-level variable always has fresh data.
  const gmMarkers = currentGmMarkers;
  gmMarkers.forEach(function (marker) {
    let position = marker.getPosition();
    let distanceFromCenter = google.maps.geometry.spherical.computeDistanceBetween(center, position);
    let insideCircle = distanceFromCenter <= radius;
    // Use highlight color for markers inside circle, restore original color for those outside
    const markerColor = insideCircle ? COLOR.MARKER_INSIDE_CIRCLE : (marker.originalColor || COLOR.INITIAL_MARKER);
    if (insideCircle) {
      let markerObject = marker.data;
      markerObject.distanceFromCenter = distanceFromCenter;
      if (!addedMarkerIds.has(markerObject.name)) {
        addedMarkerIds.add(markerObject.name);
        markersInsideCircle.push(markerObject);
      }
    }
    marker.setIcon(getMarkerIcon(markerColor));
  });

  const sortedMarkersInsideCircle = sortObjects(markersInsideCircle, "distanceFromCenter");
  Logger.debug("Markers inside circle:", sortedMarkersInsideCircle.length);


  dispatch(customActions.MAP_CIRCLE_CHANGED, markersInsideCircle);
};

const initializeCircle = (state, updateState, dispatch, googleMap) => {
  Logger.debug("Initializing circle");
};

/**
 * Sort function that takes an array of objects and the name of the field to sort by,
 * and it will sort the objects based on the field.
 * @param {*} arr
 * @param {*} field
 * @returns
 */
function sortObjects(arr, field) {
  arr.sort((a, b) => {
    if (typeof a[field] === "string") {
      return a[field].localeCompare(b[field]);
    } else {
      return a[field] - b[field];
    }
  });
  return arr;
}

/**
 * Update the overlay position to follow the circle during drag
 */
function updateOverlayPosition(placeCircle, radiusOverlay) {
  if (radiusOverlay) {
    radiusOverlay.setPosition(computeMarkerPosition(placeCircle, "bottom"));
  }
}

/**
 * Toggle the visibility of the circle overlay
 * @param {boolean} visible - Whether the circle should be visible
 * @param {object} state - Component state containing placeCircleRef and radiusOverlay
 */
export const toggleCircleVisibility = (visible, state) => {
  const { placeCircleRef, radiusOverlay } = state;
  if (placeCircleRef) {
    placeCircleRef.setMap(visible ? googleMapRef : null);
  }
  if (radiusOverlay) {
    radiusOverlay.setMap(visible ? googleMapRef : null);
  }
};

/**
 * Update the circle overlay label when the unit changes
 */
export const updateCircleLabel = ({ state }) => {
  const radiusUnit = state.properties?.distanceUnit;
  Logger.action("UPDATE_CIRCLE_LABEL", { unit: radiusUnit });

  const { radiusOverlay, placeCircleRef } = state;
  if (radiusOverlay && placeCircleRef) {
    radiusOverlay.setContentText(getCircleRadiusDescription(placeCircleRef, radiusUnit));
  }
};

/**
 * Handler for UPDATE_INFO_TEMPLATE action
 * Updates the module-level template variable without recreating markers
 * This prevents marker flickering when toggling the template
 */
export const updateInfoTemplate = ({ state }) => {
  const template = state.properties?.infoTemplate || '';
  Logger.action("UPDATE_INFO_TEMPLATE", { hasTemplate: !!template });
  currentInfoTemplate = template;
};

/**
 * Handler for DRAW_ROUTES action
 * Draws route lines between consecutive markers and calculates driving distances/times.
 * If markers have timestamps, sorts by time and can detect suspicious transitions
 * where the actual time gap is less than the required driving time (impossible travel).
 */
export const handleDrawRoutes = ({ action, state }) => {
  const { enabled } = action.payload;
  const { googleMapsRef, properties } = state;
  const { mapMarkers, distanceUnit, timestampField } = properties;

  Logger.action("DRAW_ROUTES", { enabled, timestampField });

  if (!googleMapsRef) {
    Logger.warn("DRAW_ROUTES: No map reference found");
    return;
  }

  if (enabled) {
    // Check if markers have the configured timestamp field
    const hasTimestampData = mapMarkers?.some(m => m[timestampField]);
    if (!hasTimestampData) {
      Logger.warn(`DRAW_ROUTES: Markers don't have timestamp field "${timestampField}"`);
      return;
    }
    drawRoutes(googleMapsRef, mapMarkers, distanceUnit, timestampField);
  } else {
    clearRoutes();
  }
};

/**
 * Handler for TOGGLE_DISTANCE_LINES action
 * Draws or clears route lines from the searched place to all markers
 */
export const handleToggleDistanceLines = ({ action, state }) => {
  const { enabled } = action.payload;
  const { googleMapsRef, properties } = state;
  const { mapMarkers, distanceUnit } = properties;

  Logger.action("TOGGLE_DISTANCE_LINES", { enabled });

  if (!googleMapsRef) {
    Logger.warn("TOGGLE_DISTANCE_LINES: No map reference found");
    return;
  }

  if (enabled) {
    if (!currentPlace) {
      Logger.warn("TOGGLE_DISTANCE_LINES: No place has been searched yet");
      return;
    }
    if (!mapMarkers || mapMarkers.length === 0) {
      Logger.warn("TOGGLE_DISTANCE_LINES: No markers to draw routes to");
      return;
    }
    drawRoutesFromPlace(currentPlace, googleMapsRef, mapMarkers, distanceUnit);
  } else {
    clearPlaceRoutes();
  }
};

/**
 * Handler for SET_PLACE action - updates the map to a new place/address
 * Called when the place property changes
 */
export const setPlace = ({ state, dispatch, updateState }) => {
  const { googleMapsRef, properties } = state;
  const placeString = properties.place;

  Logger.action("SET_PLACE", { address: placeString });

  if (!placeString || !googleMapsRef) {
    Logger.warn("SET_PLACE: Missing place or googleMapsRef");
    return;
  }

  getPlaceDetails(placeString, googleMapsRef)
    .then((place) => {
      Logger.debug("Place details retrieved:", place.name);
      handlePlaceChanged(place, googleMapsRef, state, dispatch, updateState);
    })
    .catch((error) => {
      Logger.error("SET_PLACE: Error retrieving place data:", error);
    });
};

function getMarkerIcon(color) {
  const svgSquare = encodeURIComponent(SVG_SQUARE.replace("{{background}}", color));
  return {
    url: "data:image/svg+xml;utf-8, " + svgSquare,
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16), // Center anchor so lines end at marker center
    labelOrigin: new google.maps.Point(16, 16), // Center of 32x32 icon
  };
}

/**
 * Creates a DOM element for marker content.
 * This is a preparatory function for migrating to AdvancedMarkerElement.
 * Currently used for reference; will replace icon-based markers in future.
 * @param {string} label - The text/emoji to display on the marker
 * @param {string} backgroundColor - Background color of the marker
 * @returns {HTMLElement} - DOM element for marker content
 */
function createMarkerContent(label, backgroundColor = COLOR.INITIAL_MARKER) {
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  markerElement.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${MARKER_STYLE.size}px;
    height: ${MARKER_STYLE.size}px;
    background-color: ${backgroundColor};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: ${MARKER_STYLE.borderWidth}px solid ${MARKER_STYLE.borderColor};
    box-shadow: 0 2px 6px ${MARKER_STYLE.shadowColor};
  `;

  const labelElement = document.createElement('span');
  labelElement.style.cssText = `
    transform: rotate(45deg);
    color: ${MARKER_STYLE.labelColor};
    font-size: ${MARKER_STYLE.labelFontSize};
    font-weight: bold;
  `;
  labelElement.textContent = label || '';

  markerElement.appendChild(labelElement);
  return markerElement;
}

const setMarkers = (state, updateState, dispatch, googleMap) => {
  Logger.debug("Setting markers");

  const { googleMapsApi, properties: { mapMarkers, mapMarkersFields, infoTemplate } } = state;

  // Update module-level template so click handlers always use the latest value
  currentInfoTemplate = infoTemplate || '';

  // Clear existing markers from the map
  if (state.markerCluster) state.markerCluster.setMap(null);
  state.markers.forEach((marker) => {
    marker.setMap(null);
  });

  // Clear the gmMarkers array from state
  const existingGmMarkers = state.gmMarkers || [];
  existingGmMarkers.forEach((marker) => {
    marker.setMap(null);
  });
  const newGmMarkers = [];

  let bounds = new googleMapsApi.LatLngBounds();
  let markers = mapMarkers.map((item) => {
    // Handle different marker data formats:
    // - item.position = { lat, lng }
    // - or item.lat and item.lng as separate properties
    // - or item.lat and item.long as separate properties
    let markerPosition;
    if (item.position) {
      markerPosition = item.position;
    } else if (item.lat !== undefined && item.lng !== undefined) {
      markerPosition = { lat: item.lat, lng: item.lng };
    } else if (item.lat !== undefined && item.long !== undefined) {
      markerPosition = { lat: item.lat, lng: item.long };
    } else {
      Logger.warn("Marker missing position data:", item);
      return null;
    }

    const markerFields = extractFields(mapMarkersFields, item);

    // Use per-marker color if provided, otherwise use default
    const markerColor = item.markerColor || COLOR.INITIAL_MARKER;

    const markerOptions = {
      position: markerPosition,
      map: googleMap,
      data: markerFields,
      icon: getMarkerIcon(markerColor),
      title: item.name,
    };

    // Add label if provided in the marker data
    if (item.markerLabel) {
      markerOptions.label = {
        text: item.markerLabel,
        color: MARKER_STYLE.labelColor,
        fontSize: MARKER_STYLE.labelFontSize,
      };
    }

    const googleMarker = new google.maps.Marker(markerOptions);
    googleMarker.originalColor = markerColor; // Store original color for circle toggle
    newGmMarkers.push(googleMarker);
    bounds.extend(googleMarker.position);

    // Store data for custom info box
    googleMarker.markerData = { title: item.name, fields: markerFields };

    googleMarker.addListener("click", function () {
      Logger.debug("Marker clicked:", this.markerData?.title);

      // Create custom info box at marker position
      // Use module-level currentInfoTemplate so changes apply without recreating markers
      createCustomInfoBox(
        this.markerData.title,
        this.markerData.fields,
        this.getPosition(),
        googleMap,
        currentInfoTemplate
      );
      updateState({ currentMarker: googleMarker });

      // Only fetch additional data if marker has sys_id (ServiceNow record)
      if (googleMarker.sys_id && googleMarker.table) {
        let encodedQuery = "sys_id=" + googleMarker.sys_id;
        dispatch(customActions.FETCH_MARKER_DATA, {
          table: googleMarker.table,
          encodedQuery: encodedQuery,
        });
      }
    });
    return googleMarker;
  });
  /* 
    const svgMarker = {
      path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
      fillColor: "blue",
      fillOpacity: 0.6,
      strokeWeight: 0,
      rotation: 0,
      scale: 2,
      anchor: new google.maps.Point(0, 20),
    };
  */
  if (state.properties.centerOn == CENTER_ON.MAP_MARKERS) {
    googleMap.fitBounds(bounds);
  } else if (state.currentUser.location) {
    const location = state.currentUser.location;
    var currentUserLatlng = new google.maps.LatLng(location.latitude, location.longitude);

    const userMarker = new googleMapsApi.Marker({
      position: currentUserLatlng, //{ lat: location.latitude, lng: location.longitude },
      map: googleMap,
      table: "sys_user",
      sys_id: state.currentUser.sys_id,
      label: {
        //text: "\ue539", // codepoint from https://fonts.google.com/icons
        text: "U",
        //fontFamily: "Material Icons",
        color: "#ffffff",
        fontSize: "18px",
      },
      icon: svg_icon,
    });

    /**
     *  You are Here Marker
     */
    //var youAreHereMsg = t("you-are-here");
    var youAreHereMsg = translate("You are here", properties.language);
    var infowindow = new google.maps.InfoWindow({
      content: youAreHereMsg,
      maxWidth: 200,
    });

    var marker = new google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: googleMap,
      title: "title",
      icon: {
        //size: new google.maps.Size(27, 50),
        //origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(+10, 15),
        url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 43" enable-background="new 0 0 27 43"><style type="text/css">.st0{fill:#555A5D;} .st1{fill:#555A5D;stroke:#9CA5AC;stroke-width:3;}</style><path class="st0" d="M13.5 0c-7.5 0-13.5 6-13.5 13.4 0 13.5 13.5 29.6 13.5 29.6s13.5-16.1 13.5-29.6c0-7.4-6-13.4-13.5-13.4z"/><path class="st1" d="M13.5 5c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5-8.5-3.8-8.5-8.5 3.8-8.5 8.5-8.5z"/></svg>`,
      },
    });
    //		marker.addListener('click', function () {
    //			infowindow.open(googleMap, marker);
    //		});
    //map.mapTypes.set('styled_map', styledMapType);
    //map.setMapTypeId('styled_map');
    infowindow.open(googleMap, marker);

    // Set default circle radius when centering on user location
    updateState({ circleRadius: CIRCLE_DEFAULTS.RADIUS_METERS });
  }

  let markerCluster = new MarkerClusterer(googleMap, markers, { imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m" });

  // Update module-level reference for circle detection (avoids stale closure in debounced handlers)
  currentGmMarkers = newGmMarkers;

  updateState({
    markers: markers,
    markerCluster: markerCluster,
    gmMarkers: newGmMarkers,
  });

};

/**
 * Updates markers on the existing map without reinitializing
 * This preserves the circle overlay and other map state
 */
export const updateMarkers = ({ state, updateState, dispatch }) => {
  Logger.debug("Updating markers on existing map");
  const { googleMapsRef, googleMapsApi, properties } = state;

  if (!googleMapsRef) {
    Logger.warn("updateMarkers: No map reference found");
    return;
  }

  // Clear routes when markers change (routes are marker-specific)
  clearRoutes();
  clearPlaceRoutes();

  setMarkers(state, updateState, dispatch, googleMapsRef);

  // Only fit bounds to markers when centerOn is set to MAP_MARKERS
  const { mapMarkers, centerOn } = properties;
  if (centerOn === CENTER_ON.MAP_MARKERS && mapMarkers && mapMarkers.length > 0) {
    const bounds = new googleMapsApi.LatLngBounds();
    mapMarkers.forEach((item) => {
      let pos = item.position || (item.lat !== undefined ? { lat: item.lat, lng: item.lng || item.long } : null);
      if (pos) {
        bounds.extend(pos);
      }
    });
    googleMapsRef.fitBounds(bounds);
  }
};