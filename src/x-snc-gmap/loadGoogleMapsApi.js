import loadGoogleMapsApi from "load-google-maps-api";
import MarkerClusterer from "@google/markerclustererplus";
import { customActions, tables, svg_you_are_here } from "./constants";
import { CENTER_ON } from "./constants";
import { you_are_here } from "./assets/you-are-here.svg";
import { triangle } from "./assets/triangle.svg";
import { svg_icon } from "./assets/svg-icon.svg";
import { translate } from "./translate";
import { createCircle, computeMarkerPosition, getCircleRadiusDescription, getPlaceDetails } from "./googleMapUtils";

const circleOptions = {};
let radiusOverlay;

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
  console.log("📗 Map Component: initializeMap", state);
  updateState({ isLoading: false });

  // let mapOptions = {
  // 	zoom: properties.initialZoom,
  // 	center: new googleMapsApi.LatLng(properties.center.lat, properties.center.long)
  // }

  /* CENTER ON USER's LOCATION BY DEFAULT */
  let mapOptions = {
    zoom: properties.initialZoom,
    center: new googleMapsApi.LatLng(state.currentUser.location.latitude, state.currentUser.location.longitude),
  };

  // the Map / Stellite option buttons
  mapOptions["mapTypeControlOptions"] = {
    position: google.maps.ControlPosition.LEFT_BOTTOM,
  };

  let googleMap = new googleMapsApi.Map(mapElementRef.current, mapOptions);

  if ((googleMapsApi, mapElementRef)) {
    async function init() {
      updateState({
        googleMapsRef: googleMap,
      });
    }
    init().then(() => {
      setMarkers(state, updateState, dispatch, googleMap);
      // call second function here
    });
  } else {
    console.log("Cannot initialize google map");
  }

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
    handlePlaceChanged(place, googleMap, updateState);
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("user's location: " + "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};

export const handlePlaceChanged = (place, googleMap, updateState) => {
  console.log("🌎 updateNewPlace", place);

  let marker = new google.maps.Marker({
    map: googleMap,
    draggable: true,
    animation: google.maps.Animation.BOUNCE,
    position: place.geometry.location,
  });
  marker.setVisible(true);
  googleMap.setCenter(marker.getPosition());

  //TODO show the marker
  marker.addListener("click", () => {
    //infoWindow.close();
    //infoWindow.setContent(marker.getTitle());
    //infoWindow.open(marker.getMap(), marker);
  });

  const infowindow = createInfoWindow(place);
  infowindow.open(googleMap, marker);

  const circleCenter = place.geometry.location;
  const circleRadius = 16093.4; // 16093.4 = 10 miles in meters
  const placeCircle = createCircle(googleMap, circleCenter, circleRadius, circleOptions);

  let elm = document.createElement("div");
  elm.classList.add("overlay-content");
  radiusOverlay = new OverlayView(computeMarkerPosition(placeCircle, "bottom"), elm);
  radiusOverlay.setMap(googleMap);
  handleCircleChanged(placeCircle);

  // LISTENERS
  google.maps.event.addListener(placeCircle, "radius_changed", function (event) {
    console.log("Circle radius_changed: " + placeCircle.getRadius());
    //updateState({ circleRadius: circleRadiusDesc });
    handleCircleChanged(placeCircle);
  });

  google.maps.event.addListener(placeCircle, "center_changed", function (event) {
    console.log("Circle center_changed: " + placeCircle.getRadius());
    // overlay.setContentText(getCircleRadiusDescription(placeCircle));
    // overlay.setPosition(computeMarkerPosition(placeCircle, "bottom"));
    handleCircleChanged(placeCircle);
  });
};

export const handleCircleChanged = (placeCircle, googleMap, updateState) => {
  getRadiusOverlay().setContentText(getCircleRadiusDescription(placeCircle));
  getRadiusOverlay().setPosition(computeMarkerPosition(placeCircle, "bottom"));
};

function createtInfoWindowContent() {
  return (
    <div id="infowindow-content">
      <span id="place-name" className="title"></span>
      <br />
      <span id="place-address"></span>
    </div>
  );
}
function createInfoWindow(place) {
  const content = document.createElement("div");
  const name = document.createElement("div");
  const address = document.createElement("div");
  // name.textContent = place.name;
  name.innerHTML = `<b>${place.name}</b>`;
  address.textContent = place.formatted_address;
  content.appendChild(name);
  content.appendChild(address);
  const infowindow = new google.maps.InfoWindow({
    content: content,
  });
  return infowindow;
}

function getRadiusOverlay() {
  if (radiusOverlay) return radiusOverlay;

  let elm = document.createElement("div");
  elm.classList.add("overlay-content");
  radiusOverlay = new OverlayView(computeMarkerPosition(placeCircle, position), elm);
  radiusOverlay.setMap(googleMap);

  //radiusOverlay = createOverlay(placeCircle, googleMap, "bottom")
  return radiusOverlay;
}

export const setMarkers = (state, updateState, dispatch, googleMap) => {
  const { googleMapsApi } = state;
  const { properties } = state;
  const { mapMarkers } = properties;

  if (state.markerCluster) state.markerCluster.setMap(null);
  state.markers.forEach((marker) => {
    marker.setMap(null);
  });
  let bounds = new googleMapsApi.LatLngBounds();
  let markers = mapMarkers.map((item) => {
    //@TODO check item has lat & lng

    var svg =
      '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M23.36,342.13a3.3,3.3,0,0,1-2.78-1.64l-.25-.46-.27-.44a3.37,3.37,0,0,1,.14-2.91L202,21.48a4.79,4.79,0,0,1,3.54-2.38A4.08,4.08,0,0,1,208.65,21l182,315a4,4,0,0,1,.31,3.54l-.27.43-.23.44a3.34,3.34,0,0,1-2.8,1.66Z" style="fill:#fff"/>' +
      '<path d="M344.78,313.39l-139.26-241L66.27,313.39ZM23.36,342.13a3.3,3.3,0,0,1-2.78-1.64l-.25-.46-.27-.44a3.37,3.37,0,0,1,.14-2.91L202,21.48a4.79,4.79,0,0,1,3.54-2.38A4.08,4.08,0,0,1,208.65,21l182,315a4,4,0,0,1,.31,3.54l-.27.43-.23.44a3.34,3.34,0,0,1-2.8,1.66Z" style="fill:#666"/>' +
      '<path d="M166,216.36l-8.44-6.14a13.08,13.08,0,0,1-.93,1.4c-2.22,2.57-5.25,2.94-7.68,1a5.56,5.56,0,0,1-.83-8.05c4.06-5.19,8.19-10.32,12.3-15.47,1.94-2.44,4-4.82,5.81-7.35a8.52,8.52,0,0,1,7.33-3.64c10.22,0,20.44-.12,30.65,0,8.81.13,16,7.72,16,16.56q0,26.06,0,52.1a3.1,3.1,0,0,0,1.4,2.9c9.21,6.61,18.35,13.29,27.51,20,.23.17.47.3.81.52l3.31-4.8c1.51-2.18,2.91-2.44,5-.91L275,276.62c.3.23.62.43,1.06.72a42.66,42.66,0,0,0,3.43-4.58,5.07,5.07,0,0,0,.27-3.08c-.55-3.42,1-5.16,3.85-7.05,5.31-3.49,10.72-5.25,17.08-4.62a10.23,10.23,0,0,1,5.77,2c4,3.13,8.17,6,12.25,9.06a5,5,0,0,1,1.36,1.42q12.24,21.15,24.42,42.32a4.9,4.9,0,0,1,.26.61h-112a67.9,67.9,0,0,0,5-7.07c2.05-3.81,4.93-5.45,9.17-4.6,2.86.57,4.68-.63,6.06-3.1a53.06,53.06,0,0,1,3.49-4.89l-8-5.6c-1.69-1.18-3.4-2.34-5.07-3.56s-2-2.82-.73-4.59,2.36-3.23,3.61-4.93L218,254.15c-.41.19-.85.41-1.3.59-3.74,1.53-7.59-.79-7.56-4.83a4.58,4.58,0,0,0-2.41-4.27c-4.57-3.1-9-6.37-13.52-9.58a3.9,3.9,0,0,0-1.51-.7c1.26,1.94,2.5,3.9,3.78,5.83,4.41,6.71,8.81,13.43,13.28,20.11a11.32,11.32,0,0,1,2,6.45c0,12.23,0,24.46,0,36.69,0,4.35-2.36,7.64-5.92,8.55a8.11,8.11,0,0,1-9.77-7,22.43,22.43,0,0,1-.16-2.84c0-10,0-20,0-30a5.57,5.57,0,0,0-.83-2.77c-5-7.83-10.16-15.62-15.25-23.42-.27-.41-.57-.81-1-1.48-.05.75-.1,1.21-.1,1.67,0,7.43,0,14.85,0,22.28a11.47,11.47,0,0,1-1.59,6.05q-9.69,16.51-19.34,33.07a8.16,8.16,0,0,1-8.2,4.43,7.56,7.56,0,0,1-6.58-5.22c-1-2.6-.39-5,1-7.35q8.12-14,16.14-28a6.15,6.15,0,0,0,.79-3c.06-13.13.11-26.25,0-39.37a15.88,15.88,0,0,1,3.33-9.93C164.07,218.93,165,217.69,166,216.36Zm43-5c-5,6.36-9.62,12.33-14.33,18.35L209,240Zm-47.43-5.92,8.25,6L185.2,191.9a2.85,2.85,0,0,0-.6-.25c-3.79-.12-7.58-.26-11.37-.31a1.78,1.78,0,0,0-1.18.73C168.59,196.45,165.17,200.86,161.57,205.47Z"/>' +
      '<path d="M205.43,161.57a15.86,15.86,0,0,1,15.81-15.9c8.52,0,15.72,7.43,15.69,16.12A16.11,16.11,0,0,1,221,177.51,15.83,15.83,0,0,1,205.43,161.57Z"/></svg>';

    var svg2 =
      '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 27 43">' +
      '<style type="text/css">.st0{fill:#555A5D;} .st1{fill:#555A5D;stroke:#9CA5AC;stroke-width:3;}</style>' +
      '<path class="st0" d="M13.5 0c-7.5 0-13.5 6-13.5 13.4 0 13.5 13.5 29.6 13.5 29.6s13.5-16.1 13.5-29.6c0-7.4-6-13.4-13.5-13.4z" />' +
      '<path class="st1" d="M13.5 5c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5-8.5-3.8-8.5-8.5 3.8-8.5 8.5-8.5z" /></svg>';

    var svg3 =
      '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"/><path d="M19 9A7 7 0 1 0 5 9c0 1.387.41 2.677 1.105 3.765h-.008C8.457 16.46 12 22 12 22l5.903-9.235h-.007A6.98 6.98 0 0 0 19 9zm-7 3a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>';

    //
    var svgSquare =
    '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" > \
      <path fill="{{background}}" d="M3.5 3.5h25v25h-25z" ></path> \
    </svg>';

    let color = "#0f4d92";
    svgSquare = svgSquare.replace("{{background}}", color);
    svgSquare = encodeURIComponent( svgSquare); 

    const marker = new google.maps.Marker({
      position: { lat: item.lat, lng: item.lng },
      map: googleMap,
      table: item.table,
      sys_id: item.sys_id,
      icon: {
        url: "data:image/svg+xml;utf-8, " + svgSquare,
      },
      title: item.name,
      label: {
        text: "✈",
        color: "#ffffff",
        fontSize: "28px",
      },
    });
    bounds.extend(marker.position);
    marker.addListener("click", function () {
      updateState({
        marker: marker,
      });
      let encodedQuery = "sys_id=" + marker.sys_id;
      dispatch(customActions.FETCH_MARKER_DATA, {
        table: marker.table,
        encodedQuery: encodedQuery,
      });
    });
    return marker;
  });

  const svgMarker = {
    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    fillColor: "blue",
    fillOpacity: 0.6,
    strokeWeight: 0,
    rotation: 0,
    scale: 2,
    anchor: new google.maps.Point(0, 20),
  };

  console.log("state.properties.centerOn = ", state.properties.centerOn);

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
        text: "✈", // airplane
        //fontFamily: "Material Icons",
        color: "#ffffff",
        fontSize: "18px",
      },
      icon: svg_icon,
    });

    /**
     *  You are Here Marker
     */
    // The short answer is Genzaichi (現在地). This is the way Japanese maps say ‘You are here’. It is closer in meaning to ‘current location’, or can be translated literally as ‘the ground on which you are presently standing’.
    console.log(" - en_Messages - ");
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
  }

  let markerCluster = new MarkerClusterer(googleMap, markers, { imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m" });
  updateState({
    markers: markers,
    markerCluster: markerCluster,
  });

  class OverlayView extends google.maps.OverlayView {
    position = null;
    content = null;

    constructor(position, content) {
      super(position, content);
      position && (this.position = position);
      content && (this.content = content);
    }

    onAdd = () => {
      this.getPanes().floatPane.appendChild(this.content);
    };
    onRemove = () => {
      if (this.content.parentElement) {
        this.content.parentElement.removeChild(this.content);
      }
    };
    draw = () => {
      const projection = this.getProjection();
      const point = projection.fromLatLngToDivPixel(this.position);
      const { offsetWidth, offsetHeight } = this.content;
      // center the content on the specified position
      const x = point.x - offsetWidth / 2;
      const y = point.y - offsetHeight / 2;
      this.content.style.transform = `translate(${x}px, ${y}px)`;
    };

    // changes the node element
    setContent = (newContent) => {
      if (this.content.parentElement) {
        this.content.parentElement.removeChild(this.content);
      }
      this.content = newContent;
      this.onAdd();
    };
    // only changes the text
    setContentText = (newContentText) => {
      if (this.content) {
        this.content.textContent = newContentText;
        this.draw();
      }
    };
    setPosition(newPosition) {
      this.position = newPosition;
      this.draw();
    }
  }

  function createOverlay(placeCircle, googleMap, position = "top") {
    let elm = document.createElement("div");
    elm.classList.add("overlay-content");
    let overlay = new OverlayView(computeMarkerPosition(placeCircle, position), elm);
    overlay.setMap(googleMap);
    return overlay;
  }

  window.OverlayView = OverlayView;
};
