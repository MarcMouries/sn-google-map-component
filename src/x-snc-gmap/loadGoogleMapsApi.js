import loadGoogleMapsApi from "load-google-maps-api";
import MarkerClusterer from "@google/markerclustererplus";
import { customActions, COLOR } from "./constants";
import { CENTER_ON } from "./constants";
import { translate } from "./translate";
import { createCircle, computeMarkerPosition, createInfoWindow, createInfoWindowFromObject } from "./googleMapUtils";
import { extractFields, getCircleRadiusDescription, getPlaceDetails } from "./googleMapUtils";
import { SVG_SQUARE } from "./constants";
import { MapQuest } from "./googleMapStyle";
import { svg_icon } from "./assets/svg-icon.svg";
import { createRadiusOverlay } from './radiusOverlay'
import { Logger } from './logger';


const circleOptions = {};
let radiusOverlay;
let gmMmarkers = [];
let infowindow;

export const loadGoogleApi = ({ action, state, dispatch, updateState }) => {
  console.log("📗 Map Component: Loading GoogleApi...");
  console.log(" - Map Component: googleMapMethod = ", state.googleMapMethod);

  const { properties } = state;

  // Google Map Libraries
  // - places  :
  // - geometry:
  // - drawing :

  let GOOGLE_MAPS_API_OPTIONS = {};
  if (state.googleMapMethod == "key") {
    GOOGLE_MAPS_API_OPTIONS.key = action.payload.googleApiKey;
  } else {
    GOOGLE_MAPS_API_OPTIONS.client = action.payload.googleApiKey;
  }

  GOOGLE_MAPS_API_OPTIONS.libraries = ["places,drawing,geometry"];

  GOOGLE_MAPS_API_OPTIONS.language = properties.language;

  loadGoogleMapsApi(GOOGLE_MAPS_API_OPTIONS)
    .then((googleMapsApi) => {
      console.log("    - Map API loaded");
      updateState({ googleMapsApi });
      //		dispatch(customActions.INITIALIZE_MAP);  // BEFORE
      dispatch(customActions.CURRENT_USER_FETCH_REQUESTED); // NOW
    })
    .catch((error) => {
      console.error(error);
      console.log("Map Component: Cannot load google maps API");
    });
};

export const initializeMap = ({ state, updateState, dispatch }) => {
  const { googleMapsApi, mapElementRef, autoCompleteRef, radiusInputRef, properties } = state;
  console.log(" 🌎 Map Component: initializeMap", state);
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
      //TODO 
      console.log(`%c[TODO] Add property to enable circle or not`, 'background: orange; color: #444; padding: 3px; border-radius: 5px;');

      initializeCircle(state, updateState, dispatch, googleMap);

      setMarkers(state, updateState, dispatch, googleMap);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          console.log("user's location: " + "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
        });
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    });
  } else {
    console.log("Cannot initialize google map");
  }

 // updateState({ googleMap: googleMap });

  const autoCompleteOptions = {
    fields: ["address_components", "geometry", "icon", "name"], // Set the fields to include in the prediction results
  };
  // Set the value of the input field to the place passed as property
  autoCompleteRef.current.value = properties.place;

  const addressSearch = new google.maps.places.Autocomplete(autoCompleteRef.current, autoCompleteOptions);

  /**  programmatically set the Place object for the Autocomplete field
   the addressSearch.set("place", place) method expects a google place object (not just an address string)*/
  getPlaceDetails(properties.place, googleMap)
    .then((place) => {
      addressSearch.set("place", place);
    })
    .catch((error) => {
      console.error(`Error retrieving place data: ${error}`);
    });

  addressSearch.addListener("place_changed", () => {
    const place = addressSearch.getPlace();
    handlePlaceChanged(place, googleMap, state, dispatch, updateState);
  });
};

export const handlePlaceChanged = (place, googleMap, state, dispatch, updateState) => {
  console.log("🌎 updateNewPlace", place);
  const { properties } = state;

  let placeMarker = new google.maps.Marker({
    map: googleMap,
    draggable: true,
    animation: google.maps.Animation.BOUNCE,
    position: place.geometry.location,
  });
  placeMarker.setVisible(true);
  googleMap.setCenter(placeMarker.getPosition());

  //TODO - enable placeMarker or not
  //const infowindow = createInfoWindow(place);
  //infowindow.open(googleMap, placeMarker);

  const circleCenter = place.geometry.location;
  const placeCircle = createCircle(googleMap, circleCenter, state.properties.circleRadius, {});


  radiusOverlay = getRadiusOverlay(placeCircle, googleMap);

  handleCircleChanged(googleMap, placeCircle, state, dispatch);



  // LISTENERS
  google.maps.event.addListener(placeCircle, "radius_changed", function (event) {
    //console.log("Circle radius_changed: " + placeCircle.getRadius());
    //updateState({ circleRadius: circleRadiusDesc });
    handleCircleChanged(googleMap, placeCircle, state, dispatch, updateState);
  });

  google.maps.event.addListener(placeCircle, "dragend", function (event) {
    //console.log("Circle dragend: " + placeCircle.getRadius());
    handleCircleChanged(googleMap, placeCircle, state, dispatch, updateState);
  });

  Logger.log("  - googleMap            : ", googleMap);

  searchDistance(place, state);
};


const searchDistance = (place, state) => {
  Logger.log('SEARCH DISTANCE:');
  Logger.log("  - formatted_address: ", place.formatted_address);
  Logger.log("  - state            : ", state);

  const { googleMap, properties: { mapMarkers, mapMarkersFields } } = state;
  Logger.log("  - mapMarkers       : ", mapMarkers);

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
        console.log("ERROR distanceMatrixService with origins", origins); //TODO check if orginis are set
      } else {
       displayMarkersWithDrivingTime(response, googleMap);
      }
    });
}

const displayMarkersWithDrivingTime = (response, googleMap) => {
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

        let marker = gmMmarkers[j];
        let content = duration + ' away, ' + distance;
        var infowindow = new google.maps.InfoWindow({
          /*content: duration + ' away, ' + distance,*/
          content: '<div class="info-distance" id="infowindowContent">' + content + '</div>',
          pixelOffset: new google.maps.Size(0, 90) // pixel down the marker

        });
        infowindow.open(googleMap, marker);     
        
        marker.infowindow.open({ anchor: marker, googleMap });

        //Logger.log("  - gmMmarkers  : ", gmMmarkers);
        //Logger.log("  - MARKER  : " + marker.title);

      }
    }
  }
}




export const handleCircleChanged = (googleMap, placeCircle, state, dispatch, updateState) => {
  console.log("🌎 handleCircleChanged: placeCircle= ", placeCircle);
  const overlayPosition = computeMarkerPosition(placeCircle, "bottom");
  console.log("   - handleCircleChanged: overlayPosition= ", overlayPosition);

  getRadiusOverlay().setContentText(getCircleRadiusDescription(placeCircle));
  getRadiusOverlay().setPosition(computeMarkerPosition(placeCircle, "bottom"));

  let radius = placeCircle.getRadius();
  let center = placeCircle.getCenter();
  let markersInsideCircle = [];
  let addedMarkerIds = new Set();

  gmMmarkers.forEach(function (marker) {
    let position = marker.getPosition();
    let distanceFromCenter = google.maps.geometry.spherical.computeDistanceBetween(center, position);
    let insideCircle = distanceFromCenter <= radius;
    const markerColor = insideCircle ? "green" : COLOR.INITIAL_MARKER;
    if (insideCircle) {
      console.log("   - marker insideCircle ", marker.data);
      let markerObject = marker.data;
      markerObject.distanceFromCenter = distanceFromCenter;
      if (!addedMarkerIds.has(markerObject.name)) {
        addedMarkerIds.add(markerObject.name);
        markersInsideCircle.push(markerObject);
      }
    }
    marker.setIcon(getMarkerIcon(markerColor));
  });

  console.log("   - handleCircleChanged markersInsideCircle", markersInsideCircle);
  const sortedMarkersInsideCircle = sortObjects(markersInsideCircle, "distanceFromCenter");
  console.log("   - handleCircleChanged sortedMarkersInsideCircle", sortedMarkersInsideCircle);


  dispatch(customActions.MAP_CIRCLE_CHANGED, markersInsideCircle);
};

const initializeCircle = (state, updateState, dispatch, googleMap) => {
  console.log("initializeCircle");
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

function getRadiusOverlay(placeCircle, googleMap) {
  console.log(" 🌎 getRadiusOverlay");

  if (radiusOverlay) return radiusOverlay;
  console.log(" 🌎 getRadiusOverlay - create it");

  // otherwise create it
  let elm = document.createElement("div");
  elm.classList.add("overlay-content");
  radiusOverlay = createRadiusOverlay(computeMarkerPosition(placeCircle, "bottom"), elm);
  radiusOverlay.setMap(googleMap);
  return radiusOverlay;
}


function getMarkerIcon(color) {
  const svgSquare = encodeURIComponent(SVG_SQUARE.replace("{{background}}", color));
  return {
    url: "data:image/svg+xml;utf-8, " + svgSquare,
  };
}

const setMarkers = (state, updateState, dispatch, googleMap) => {
  console.log(" 🌎 setMarkers");

  const { googleMapsApi, properties: { mapMarkers, mapMarkersFields } } = state;

  if (state.markerCluster) state.markerCluster.setMap(null);
  state.markers.forEach((marker) => {
    marker.setMap(null);
  });
  let bounds = new googleMapsApi.LatLngBounds();
  let markers = mapMarkers.map((item) => {
    //@TODO add error check if item does not have lat & lng

    const markerFields = extractFields(mapMarkersFields, item);
    const markerCopy = Object.assign({}, item);

    console.log("🌎 markerFields: ", markerFields);
    console.log("🌎 markerCopy  : ", markerCopy);

    const googleMarker = new google.maps.Marker({
      position: item.position,
      map: googleMap,
      data: markerFields, //markerCopy,
      icon: getMarkerIcon(COLOR.INITIAL_MARKER),
      title: item.name,
      label: {
        text: "$",  // ✈  // aircraft icon
        color: "#ffffff",
        fontSize: "22px",
      },
    });
    gmMmarkers.push(googleMarker);
    bounds.extend(googleMarker.position);

    googleMarker.infowindow = createInfoWindowFromObject(item.name, markerFields);


    googleMarker.addListener("click", function () {
      console.log("🌎 CLICK on maker", this);

      if (this.infowindow.getMap()) {
        this.infowindow.close();
      }
      else {
        this.infowindow.open({ anchor: googleMarker, googleMap });
        updateState({ currentMarker: googleMarker });
      }
      // NOT FETCHING DATA FROM THE BACK-END
      let encodedQuery = "sys_id=" + googleMarker.sys_id;
      dispatch(customActions.FETCH_MARKER_DATA, {
        table: googleMarker.table,
        encodedQuery: encodedQuery,
      });
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

    updateState({ circleRadius: 80000 });
    console.log("setMarkers END", state);
  }

  let markerCluster = new MarkerClusterer(googleMap, markers, { imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m" });
  
  updateState({
    markers: markers,
    markerCluster: markerCluster,
  });

};