import loadGoogleMapsApi from "load-google-maps-api";
import MarkerClusterer from "@google/markerclustererplus";
import { customActions, tables, svg_you_are_here } from "./constants";
import { CENTER_ON } from "./constants";
import { you_are_here } from "./assets/you-are-here.svg";
import { triangle } from "./assets/triangle.svg";
import { svg_icon } from "./assets/svg-icon.svg";
import { translate } from "./translate";

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

  GOOGLE_MAPS_API_OPTIONS.libraries = ["places,drawing"];

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
  const { googleMapsApi, mapElementRef, autoCompleteRef, properties } = state;
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
  // Set the value of the input field to a specific address
  autoCompleteRef.current.value = properties.place;

  const addressSearch = new google.maps.places.Autocomplete(autoCompleteRef.current, autoCompleteOptions);

  // programmatically set the Place object for the Autocomplete field
  // retrieve a list of suggested places based on the input value
  // and set the selected Place object as the value of the Autocomplete field.
  const autocompleteService = new google.maps.places.AutocompleteService();
  let request = { input: properties.place };
  autocompleteService.getPlacePredictions(request, (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const placeId = predictions[0].place_id;
      const placesService = new google.maps.places.PlacesService(googleMap);
      placesService.getDetails({ placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          addressSearch.set("place", place);
        }
      });
    }
  });

  addressSearch.addListener("place_changed", () => {
    const place = addressSearch.getPlace();
    handlePlaceChanged(place, googleMap);
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("user's location: " + "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};

export const handlePlaceChanged = (place, googleMap) => {
  console.log("🌎 updateNewPlace", place);

  let marker = new google.maps.Marker({
    map: googleMap,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: place.geometry.location,
  });
  marker.setVisible(true);

  marker.addListener("click", () => {
    //infoWindow.close();
    //infoWindow.setContent(marker.getTitle());
    //infoWindow.open(marker.getMap(), marker);
  });


  const infowindow = createInfoWindow(place);
  infowindow.open(googleMap, marker);

  googleMap.setCenter(marker.getPosition());

  const placeCircle = new google.maps.Circle({
    strokeColor: "#FF0000",
    strokeOpacity: 0.7,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.2,
    map: googleMap,
    center: place.geometry.location, // radius of the circle, in meters
    radius: 10000,
    draggable: true,
    editable: true,
  });

  placeCircle.setRadius(32000);
  google.maps.event.addListener(placeCircle, "radius_changed", function (event) {
    console.log("Circle radius_changed: " + placeCircle.getRadius());
    var radiusInMeters = placeCircle.getRadius();
    var radiusInMiles = radiusInMeters * 0.000621371;
    // document.getElementById('radius').innerHTML = radiusInMiles.toFixed(2) + ' miles';
    // displayInfo(circle);
  });
  google.maps.event.addListener(placeCircle, 'mousemove', function (event) {
    console.log("Circle radius_changed: " + placeCircle.getRadius());
    var radiusInMeters = placeCircle.getRadius();
  });

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
    const marker = new googleMapsApi.Marker({
      position: { lat: item.lat, lng: item.long },
      map: googleMap,
      table: item.table,
      sys_id: item.sys_id,
      icon: item.image,
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
        text: "??", // codepoint from https://fonts.google.com/icons
        fontFamily: "Material Icons",
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

 
};
