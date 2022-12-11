
const validateGeocoordinatePair = (latitude, longitude) => {
    let latitudeIsValid = (latitude < 80 && latitude > -80);
    let longitudeIsValid = (longitude < 180 && longitude > -180);
    return (latitudeIsValid && longitudeIsValid);
};

const getCentroid = (geoCoordinateSet) => {
    let numberOfVertices = geoCoordinateSet.length;
    let latitudeSum = 0;
    let longitudeSum = 0;
    for (let i = 0; i < numberOfVertices; i++) {
        const vertex = geoCoordinateSet[i];
        latitudeSum += vertex.latitude;
        longitudeSum += vertex.longitude;
    }
    let centroid = {
        latitude: latitudeSum/numberOfVertices,
        longitude: longitudeSum/numberOfVertices
    };
    return centroid;
};

const createNewGoogleMapMarker = (googleMapsApi, googleMapElement, latitude, longitude, googleInfoWindow) => {
    let markerLocation = new googleMapsApi.LatLng(latitude,longitude);
    // console.log(markerLocation.lat());

    let newMapMarker = new googleMapsApi.Marker({
        position: markerLocation,
        map: googleMapElement
    });
    newMapMarker.addListener('click', function() {
        googleInfoWindow.open(googleMapElement, newMapMarker);
    });
    return newMapMarker
};

const hideGoogleMapMarkers = (googleMapMarkers) => {
	for (let i = 0; i < googleMapMarkers.length; i++) {
		googleMapMarkers[i].setMap(null);
	}
};

const createGoogleMapMarkers = (googleMapsApi, googleMapElement, mapMarkers, allowMultipleMarkers, googleInfoWindow) => {
	let newGoogleMapMarkers = [];
	for (let i = 0; i < mapMarkers.length; i++) {
		if (!allowMultipleMarkers && i!==0) {
            break;
        }
		let newGoogleMarker = createNewGoogleMapMarker(
			googleMapsApi,
            googleMapElement,
			mapMarkers[i].latitude,
            mapMarkers[i].longitude,
            googleInfoWindow
		);
		newGoogleMapMarkers.push(newGoogleMarker);
	}
	return newGoogleMapMarkers;
};

const setCenterOfGoogleMap = (mapMarkers, allowMultipleMarkers) => {
    let mapCenter;
    if (mapMarkers.length) {
        if (allowMultipleMarkers) {
            mapCenter = getCentroid(mapMarkers);
        } else {
            mapCenter = mapMarkers[0];
        }
    }
    return mapCenter;
};

const loadGoogleMapWithListener = (dispatch, state, googleMapsApi) => {
    let {
        readOnly,
        zoomLevel,
        disableDefaultUi,
        showFullscreenControl,
		allowMultipleMarkers,
        defaultGeolocation,
        mapElementRef,
        mapMarkers,
        showPointsOfInterest
    } = state.properties;

    let mapCenter = setCenterOfGoogleMap(mapMarkers);

    // MAke this dynamic with ternarys indicating on/off
    // This allows this styling to always be applied, and properties ot feed directly into indivudual POI types
    let POI_HIDDEN_VISIBILITY_STYLING = [
        {
            featureType: 'poi.business',
            stylers: [{visibility: 'off'}]
        },
        {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{visibility: 'off'}]
        }
    ];
    console.log('showPointsOfInterest');
    console.log(showPointsOfInterest);

	let GOOGLE_MAPS_UI_OPTIONS = {
		center: {
			lat: mapCenter.latitude || defaultGeolocation.latitude,
			lng: mapCenter.longitude || defaultGeolocation.longitude
		},
		zoom: zoomLevel,
		disableDefaultUI: disableDefaultUi,
        fullscreenControl: showFullscreenControl,
        styles: !showPointsOfInterest ? POI_HIDDEN_VISIBILITY_STYLING : null
    };
    // Instantiate the Google Map Element Object
	let googleMapElement = new googleMapsApi.Map(
		mapElementRef.current,
		GOOGLE_MAPS_UI_OPTIONS
    );

    var contentString = '<p>Attribution: Uluru</p>';

    var googleInfoWindow = new google.maps.InfoWindow({
        content: contentString
    });

    // Set initially provided map markers
    let googleMapMarkers = createGoogleMapMarkers(googleMapsApi, googleMapElement, mapMarkers, allowMultipleMarkers, googleInfoWindow);
    // Store the Google Map Element Object for interactions across the component.
    // (ex. synchronization witht the Google Map Autocomplete Element)
	dispatch('PROPERTIES_SET', {
        googleMapElement,
        googleMapMarkers,
        googleInfoWindow
    });
    // Attach click listener node to the google Map Element, to allow for selection of new location.
	googleMapElement.addListener('click', (event) => {
        if (readOnly) {
            return;
        }
        let latitude = event.latLng.lat();
        let longitude = event.latLng.lng();
        if (allowMultipleMarkers) {
            mapMarkers = [...mapMarkers, {latitude, longitude}];
        } else {
            mapMarkers = [{latitude, longitude}];
        }
        dispatch('NEW_MAP_LOCATION_CHOSEN', { mapMarkers });
	});
};

export {
    loadGoogleMapWithListener,
    createNewGoogleMapMarker,
    createGoogleMapMarkers,
    hideGoogleMapMarkers,
    setCenterOfGoogleMap
}


// TODO: validate geocoordinates fed in. Ensure a terminating error is thrown when an incorrect geocoordinate is passed in.
// TODO: ensure sys-property coordinates are valid, if it gets there.
// TODO: figure out order between markers, sys_properties, and self-invoking.