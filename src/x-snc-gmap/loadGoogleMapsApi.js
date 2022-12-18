import loadGoogleMapsApi from 'load-google-maps-api';
import MarkerClusterer from '@google/markerclustererplus';
import { customActions, tables } from './constants';

export const loadGoogleApi = ({ action, state, dispatch, updateState }) => {
console.log("in loadGoogleApi : payload=", action.payload);

//	key: action.payload.googleApiKey,

	let GOOGLE_MAPS_API_OPTIONS = {
		key: action.payload.googleApiKey,
		libraries: ['places']
	};
	loadGoogleMapsApi(GOOGLE_MAPS_API_OPTIONS)
		.then((googleMapsApi) => {
			console.log("Map Component: API loaded");
			updateState({ googleMapsApi });
	//		dispatch(customActions.INITIALIZE_MAP);  // BEFORE
	dispatch(customActions.CURRENT_USER_FETCH_REQUESTED);  // NOW
		})
		.catch((error) => {
			console.error(error);
			console.log('Map Component: Cannot load google maps API');
		})
};

export const initializeMap = ({ state, updateState, dispatch }) => {
	const { googleMapsApi, mapElementRef } = state;
	console.log("Map Component: initializeMap", state);

	let mapOptions = {
		zoom: 4,
		center: new googleMapsApi.LatLng(-25.363882, 131.044922)
	}
	let googleMap = new googleMapsApi.Map( mapElementRef.current,mapOptions	);
	if (googleMapsApi, mapElementRef) {
		new async function () {
			updateState({
				googleMapsRef: googleMap
			});
		}().then(setMarkers(state, updateState, dispatch, googleMap));
	} else
		console.log('Cannot initilalize google map');
};

export const setMarkers = (state, updateState, dispatch, googleMap) => {
	const { googleMapsApi } = state;
	if (state.markerCluster) state.markerCluster.setMap(null);
	state.markers.forEach((marker) => {
		marker.setMap(null);
	});
	const marker_data = state.properties.mapMarkers;
	let bounds = new googleMapsApi.LatLngBounds();
	let markers = marker_data.map((item) => {
		const locationObj = {
			lat: item.lat,
			lng: item.long,
		};

		const marker = new googleMapsApi.Marker({
			position: locationObj,
			map: googleMap,
			table: item.table,
			sys_id: item.sys_id,
			icon: item.image
		});
		bounds.extend(marker.position);
		marker.addListener("click", function () {
			updateState({
				marker: marker
			});
			let encodedQuery = "sys_id=" + marker.sys_id;
			switch (marker.table) {
				case tables.USER_TABLE:
					dispatch(customActions.FETCH_AGENT_DATA, {
						encodedQuery: encodedQuery,
					});
					break;
				case tables.TASK_TABLE:
					dispatch(customActions.FETCH_TASK_DATA, {
						encodedQuery: encodedQuery,
					});
					break;
			}
		});
		return marker;
	});
	googleMap.fitBounds(bounds);
	let markerCluster = new MarkerClusterer(googleMap, markers,
		{ imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
	updateState({
		markers: markers,
		markerCluster: markerCluster,
	});
};
