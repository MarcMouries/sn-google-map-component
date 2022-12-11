import loadGoogleMapsApi from 'load-google-maps-api';
import * as google from './googleMapsApiHelperFunctions';

import {t} from 'sn-translate';

const GOOGLE_API_LOAD_ERROR = {
	name: t('Error loading Google Maps API'),
	message: t('Please ensure you have a valid API key in sys_properties')
};

const actionTypes = {
	GOOGLE_API_LOAD_REQUESTED: 'GOOGLE_API_LOAD_REQUESTED',
	GOOGLE_API_LOAD_STARTED: 'GOOGLE_API_LOAD_STARTED',
	GOOGLE_API_LOAD_SUCCEEDED: 'GOOGLE_API_LOAD_SUCCEEDED',
	GOOGLE_API_LOAD_FAILED: 'GOOGLE_API_LOAD_FAILED'
};

const actions = {
	[actionTypes.GOOGLE_API_LOAD_REQUESTED]: {},
	[actionTypes.GOOGLE_API_LOAD_STARTED]: {	},
	[actionTypes.GOOGLE_API_LOAD_SUCCEEDED]: {	},
	[actionTypes.GOOGLE_API_LOAD_FAILED]: {	}
};

const loadGoogleApi = ({ action, state, dispatch }) => {
	let GOOGLE_MAPS_API_OPTIONS = {
		key: action.payload.googleApiKey,
		libraries: ['places']
	};
	loadGoogleMapsApi(GOOGLE_MAPS_API_OPTIONS)
	.then((googleMaps) => {
		dispatch('GOOGLE_API_LOAD_SUCCEEDED', { googleMapsApi: googleMaps });
	})
	.catch((error) => {
		console.error(error);
		console.log('Cant store google maps instance');
		dispatch('GOOGLE_API_LOAD_FAILED', {error});
	})
};

const startGoogleApiLoad = ({ action, state, dispatch }) => {
	console.log('Loading Google API ...');
};

const finishGoogleApiLoadSuccess = ({ action, state, dispatch }) => {
	const { fromBootstrap } = action.payload;
	let googleMapsApi = action.payload.googleMapsApi;
	if (!fromBootstrap) {
		dispatch('PROPERTIES_SET', { googleMapsApi });
	}
	google.loadGoogleMapWithListener(dispatch, state, googleMapsApi);
};

const finishGoogleApiLoadFailure = ({ action, state, dispatch }) => {
	console.log(action.payload.error.message);
	dispatch('PROPERTIES_SET', {error: GOOGLE_API_LOAD_ERROR});
};

const actionHandlers = {
	[actionTypes.GOOGLE_API_LOAD_REQUESTED]: loadGoogleApi,
	[actionTypes.GOOGLE_API_LOAD_STARTED]: startGoogleApiLoad,
	[actionTypes.GOOGLE_API_LOAD_SUCCEEDED]: finishGoogleApiLoadSuccess,
	[actionTypes.GOOGLE_API_LOAD_FAILED]: finishGoogleApiLoadFailure
};

export {
	actions,
	actionHandlers
};