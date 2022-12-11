import { createCustomElement, actionTypes } from "@servicenow/ui-core";
const { COMPONENT_CONNECTED } = actionTypes;

import snabbdom, { Fragment, createRef } from '@servicenow/ui-renderer-snabbdom';


import styles from './styles.scss';


import { actions as googleApiKeyActions, actionHandlers as googleApiKeyActionHandlers } from './actions/GoogleApiKeyActions';
import { actions as googleApiLoadActions, actionHandlers as googleApiLoadActionHandlers } from './actions/GoogleApiLoadActions';
import { actions as googleMapActions, actionHandlers as googleMapActionHandlers } from './actions/GoogleMapActions';


const view = (state, { updateState }) => {
	const { mapElementRef }  = state.properties;

	return (
		<div 
		className="google-map-element"
		ref={mapElementRef}>
		</div>
	);
};



createCustomElement('x-snc-google-map', {
	renderer: { type: snabbdom },
	view,
	styles,

	properties: {
		center: {
			default: { lat: 39.8097343, lng: -98.5556199 }, /* Geographic center of the contiguous United States */
		},
		zoom: {
			default: 5,
		},
		mapElementRef: {
			default: createRef()
		},
		googleMapsApi:  {
			default: null
		},
		googleMapElement: {
			default: null
		},
		googleMapMarkers: {
			default: []
		},
		googleInfoWindow: {
			default: null
		},
		mapMarkers: {
			default: [
				{
					latitude: 32.7916,
					longitude: -117.1677
				},
				{
					latitude: 32.7910,
					longitude: -117.3
				}
			],
			onChange(currentValue, previousValue, dispatch) {
				console.log('changed');
				dispatch('MAP_LOCATIONS_CHANGED');
			}
		},
	},
	actions: {
		...googleApiKeyActions,
		...googleApiLoadActions,
		...googleMapActions
	},
	actionHandlers: {

		[actionTypes.COMPONENT_BOOTSTRAPPED]: {
			effect({ properties, action: { payload: { host } }, dispatch }) {			// Fetch for the Google-Maps-Javascript-API-key in sys_properties table.
				dispatch('GOOGLE_MAPS_API_KEY_FETCH_REQUESTED', {
					sys_property_name: "google.maps.client.key"
				});
			}
		},
		...googleApiKeyActionHandlers,
		...googleApiLoadActionHandlers,
		...googleMapActionHandlers,
		['MAP_LOCATIONS_CHANGED']: ({action, state, dispatch}) => {
			const {
				googleMapsApi,
				googleMapElement,
				mapMarkers,
				googleMapMarkers,
				allowMultipleMarkers,
				googleInfoWindow
			} = state.properties;

			hideGoogleMapMarkers(googleMapMarkers);

			let newGoogleMapMarkers = createGoogleMapMarkers(
				googleMapsApi,
				googleMapElement,
				mapMarkers,
				allowMultipleMarkers,
				googleInfoWindow
			);

			let mapCenter = setCenterOfGoogleMap(mapMarkers, allowMultipleMarkers);
			mapCenter = new googleMapsApi.LatLng(mapCenter.latitude, mapCenter.longitude);
			googleMapElement.panTo(mapCenter);
			dispatch('PROPERTIES_SET', {googleMapMarkers: newGoogleMapMarkers});
		}
	},
});
