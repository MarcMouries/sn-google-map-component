import { createGraphQLEffect } from '@seismic/effect-graphql';
import googleMapsApiKeyQuery from '../graphql/GoogleMapsApiKeyQuery';
import {t} from 'sn-translate';

const FETCH_ERROR = {
	name: t('Error fetching Google Maps API Key'),
	message: t('Please ensure you have configured your API key in sys_properties')
};

const NO_API_KEY_ERROR = {
	name: t('No Google Maps API Key Found'),
	message: t('Please configure your API key in your sys_properties (google.maps.key)')
};

const actionTypes = {
	GOOGLE_MAPS_API_KEY_FETCH_REQUESTED: 'GOOGLE_MAPS_API_KEY_FETCH_REQUESTED',
	GOOGLE_MAPS_API_KEY_FETCH_STARTED: 'GOOGLE_MAPS_API_KEY_FETCH_STARTED',
	GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED: 'GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED',
	GOOGLE_MAPS_API_KEY_FETCH_FAILED: 'GOOGLE_MAPS_API_KEY_FETCH_FAILED'
};

const actions = {
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED]: {},
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_STARTED]: {},
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED]: {},
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_FAILED]: {}
};

const requestGoogleMapsApiKey = createGraphQLEffect(googleMapsApiKeyQuery, {
	templateVarList: ['sys_property_name'], 
	startActionType: actionTypes.GOOGLE_MAPS_API_KEY_FETCH_STARTED,
	successActionType: actionTypes.GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED,
	errorActionType: actionTypes.GOOGLE_MAPS_API_KEY_FETCH_FAILED,
});

const startGoogleMapsApiKeyFetch = ({ action, state, dispatch }) => {
	console.log('Fetching Google Maps API key...');
};

const finishGoogleMapsApiKeyFetchSuccess = ({ action, state, dispatch }) => {
	const { payload } = action;
	console.log("finishGoogleMapsApiKeyFetchSuccess");
	if (payload.errors.length) {
		console.log(payload.errors);
		dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
		return;
	}
	let googleApiKey = payload.data.GlideRecord_Query.sys_properties._results[0].value.value;
	console.log("googleApiKey = " + googleApiKey);
	if (!googleApiKey) {
		console.error('No Google API Key found.');
		dispatch('PROPERTIES_SET', { error: NO_API_KEY_ERROR });
		return;
	}
	dispatch('GOOGLE_API_LOAD_REQUESTED', { googleApiKey });
};

const finishGoogleMapsApiKeyFetchFailure = ({ action, state, dispatch }) => {
	console.log(`Error: ${action.payload.response.statusText}`);
	dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
};

const actionHandlers = {
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED]: requestGoogleMapsApiKey,
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_STARTED]: startGoogleMapsApiKeyFetch,
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED]: finishGoogleMapsApiKeyFetchSuccess,
	[actionTypes.GOOGLE_MAPS_API_KEY_FETCH_FAILED]: finishGoogleMapsApiKeyFetchFailure
};

export {
	actions,
	actionHandlers
};