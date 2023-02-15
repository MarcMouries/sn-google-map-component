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

const requestGoogleMapsMethod = createGraphQLEffect(
	glideRecordQuery,
	{
		variableList: ["encodedQuery"],
		templateVarList: ['table', 'fields'],
		startActionType: customActions.GMAP_API_METHOD_FETCH_STARTED,
		successActionType: customActions.GMAP_API_METHOD_FETCH_SUCCEEDED,
		errorActionType: customActions.GMAP_API_METHOD_FETCH_FAILED,
	});


const startGoogleMapsMethodFetch = ({ action, state, dispatch }) => {
	console.log("📗 Map Component: Fetching Google Maps Method...");
};

const finishGoogleMapsMethodFetchSuccess = ({ action, state, dispatch, updateState }) => {
	const { payload, meta } = action;
	console.log("📗 Map Component: Google Maps Method Fetch Success", payload);
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
	let googleMapMethod = payload.data.GlideRecord_Query.sys_properties._results[0].value.value;

	console.log("    - google.maps.method = ", googleMapMethod);

	if (!googleMapMethod) {
		console.error('No Google Maps Method found.');
		updateState({ hasError: true, error: "No Google API Key found." });
		dispatch('PROPERTIES_SET', { error: NO_API_KEY_ERROR });
		return;
	}
	updateState({ googleMapMethod: googleMapMethod });
	
	const googleAPIKeyProperty = googleMapMethod == "client-id" ? "google.maps.client" : "google.maps.key";
	console.log("    - googleAPIKeyProperty= ", googleAPIKeyProperty);

	dispatch(customActions.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED,
		{
			 encodedQuery: `name=${googleAPIKeyProperty}`,
			 table: "sys_properties",
			 fields: "value { label value displayValue }",
		});
};

const finishGoogleMapsMethodFetchFailure = ({ action, state, dispatch }) => {
	console.log(`❌ Error: ${action.payload}`);
	dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
};

export const googleMapMethodActionHandlers = {
	[customActions.GMAP_API_METHOD_FETCH_REQUESTED]: requestGoogleMapsMethod,
	[customActions.GMAP_API_METHOD_FETCH_STARTED]: startGoogleMapsMethodFetch,
	[customActions.GMAP_API_METHOD_FETCH_SUCCEEDED]: finishGoogleMapsMethodFetchSuccess,
	[customActions.GMAP_API_METHOD_FETCH_FAILED]: finishGoogleMapsMethodFetchFailure
};