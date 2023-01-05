import loadGoogleMapsApi from 'load-google-maps-api';
import MarkerClusterer from '@google/markerclustererplus';
import { customActions, tables, svg_you_are_here } from './constants';
import {CENTER_ON} from './constants';

export const loadGoogleApi = ({ action, state, dispatch, updateState }) => {
	console.log("📗 Map Component: Loading GoogleApi...");

	let GOOGLE_MAPS_API_OPTIONS = {
		key: action.payload.googleApiKey,
		libraries: ['places']
	};
	loadGoogleMapsApi(GOOGLE_MAPS_API_OPTIONS)
		.then((googleMapsApi) => {
			console.log("    - Map API loaded");
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
	const { googleMapsApi, mapElementRef, properties } = state;
	console.log("📗 Map Component: initializeMap", state);

	/* 
	let mapOptions = {
		zoom: properties.initialZoom,
		center: new googleMapsApi.LatLng(properties.center.lat, properties.center.long)
	}
*/
	/* CENTER ON USER's LOCATION BY DEFAULT */
	let mapOptions = {
		zoom: properties.initialZoom,
		center: new googleMapsApi.LatLng(
			state.currentUser.location.latitude,
			state.currentUser.location.longitude)
	}

	let googleMap = new googleMapsApi.Map(mapElementRef.current, mapOptions);
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
	const marker_data = state.properties.mapItemMarkers;
	let bounds = new googleMapsApi.LatLngBounds();
	let markers = marker_data.map((item) => {

		const marker = new googleMapsApi.Marker({
			position: { lat: item.lat, lng: item.long },
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

	console.log("state.properties.centerOn = ", state.properties.centerOn);

	if (state.properties.centerOn == CENTER_ON.MAP_MARKERS) {
		googleMap.fitBounds(bounds);
	}
	else if (state.currentUser.location) {
		let location = state.currentUser.location;
		const userMarker = new googleMapsApi.Marker({
			position: { lat: location.latitude, lng: location.longitude },
			map: googleMap,
			table: "sys_user",
			sys_id: state.currentUser.sys_id,
			path: svg_you_are_here
		});
	}
 

	let markerCluster = new MarkerClusterer(googleMap, markers,
		{ imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
	updateState({
		markers: markers,
		markerCluster: markerCluster,
	});
};
