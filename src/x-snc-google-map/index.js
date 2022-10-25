import { createCustomElement } from '@servicenow/ui-core';
//import { createCustomElement, actionTypes } from "@servicenow/ui-core";

import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';


import { actions as googleApiKeyActions, actionHandlers as googleApiKeyActionHandlers } from './actions/GoogleApiKeyActions';


const view = (state, { updateState }) => {
	const { mapElementRef } = state;

	return (
		<div className="map-container" ref={mapElementRef}>
		</div>
	);
};



createCustomElement('x-snc-google-map', {
	renderer: {
		type: snabbdom
	},
	view,
	styles,

	onBootstrap(host, dispatch) {
		console.log("onBootstrap");
		console.log(host);
		console.log(dispatch);
		//onBootstrap(host, dispatch);
		// Fetch for the Google-Maps-Javascript-API-key in sys_properties table.
		dispatch('GOOGLE_MAPS_API_KEY_FETCH_REQUESTED', {
			sys_property_name: "google.maps.client.key"
		});
	},

	properties: {
		center: {
			default: { lat: 39.8097343, lng: -98.5556199 }, /* USA Geographic center of the contiguous United States */
		},
		zoom: {
			default: 5,
		}
	},
	actions: {
		...googleApiKeyActions
		//...googleApiLoadActions,
		//...googleMapActions
	},
	actionHandlers: {
		...googleApiKeyActionHandlers

	}
});
