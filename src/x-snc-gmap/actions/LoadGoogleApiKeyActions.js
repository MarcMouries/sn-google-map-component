import { createGraphQLEffect } from '@seismic/effect-graphql';
import { glideRecordQuery } from "../query"
import { customActions } from '../constants';
import {t} from 'sn-translate';

const FETCH_ERROR = {
	name: t('Error fetching Google Maps API Key'),
	message: t('Please ensure you have configured your API key in sys_properties')
};

const NO_API_KEY_ERROR = {
	name: t('No Google Maps API Key Found'),
	message: t('Please configure your API key in your sys_properties (google.maps.key)')
};

const requestGoogleMapsApiKey = createGraphQLEffect(
	glideRecordQuery,
	{
		variableList: ["encodedQuery"],
		templateVarList: ['table', 'fields'],
		startActionType: customActions.GOOGLE_MAPS_API_KEY_FETCH_STARTED,
		successActionType: customActions.GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED,
		errorActionType: customActions.GOOGLE_MAPS_API_KEY_FETCH_FAILED,
	});


const startGoogleMapsApiKeyFetch = ({ action, state, dispatch }) => {
	console.log("📗 Map Component: Fetching Google Maps API key...");
	console.log("📗 Map Component: Fetching Google Maps API key...", state);
	console.log("📗 Map Component: Fetching Google Maps API key...", action);
	console.log("📗 Map Component: Fetching Google Maps API key...", action.payload);
};

const finishGoogleMapsApiKeyFetchSuccess = ({ action, state, dispatch, updateState }) => {
	const { payload, meta } = action;
	console.log("📗 Map Component: Google Maps API Key Fetch Success", payload);
	if (payload.errors.length) {
		console.error(action);
		console.error(payload);
		console.error(payload.data);
		console.error(meta);
		dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
		return;
	}
	const table = (meta["options"]["templateVars"]["table"]||"");
	const result = (payload["data"]["GlideRecord_Query"][table]["_results"][0]||{});
	let googleMapApiKey = payload.data.GlideRecord_Query.sys_properties._results[0].value.value;

	console.log("    - google.maps.key = ", googleMapApiKey);

	if (!googleMapApiKey) {
		console.error('No Google API Key found.');
		updateState({ hasError: true, error: "No Google API Key found." });
		dispatch('PROPERTIES_SET', { error: NO_API_KEY_ERROR });
		return;
	}
	dispatch(customActions.GOOGLE_API_LOAD_REQUESTED,
	{
		googleApiKey: googleMapApiKey 
	});
};

const finishGoogleMapsApiKeyFetchFailure = ({ action, state, dispatch }) => {
	console.log("❌ Error Loading GoogleMapsApiKey: ", action);
	console.log("❌ Error: ", action.payload.response);
	console.log("❌ Error: ", action.payload.response.status);
	console.log("❌ Error: ", action.payload.response.statusText);
	dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
};

export const googleApiKeyActionHandlers = {
	[customActions.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED]: requestGoogleMapsApiKey,
	[customActions.GOOGLE_MAPS_API_KEY_FETCH_STARTED]: startGoogleMapsApiKeyFetch,
	[customActions.GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED]: finishGoogleMapsApiKeyFetchSuccess,
	[customActions.GOOGLE_MAPS_API_KEY_FETCH_FAILED]: finishGoogleMapsApiKeyFetchFailure
};