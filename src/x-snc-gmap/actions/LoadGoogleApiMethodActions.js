import { createGraphQLEffect } from '@seismic/effect-graphql';
import { glideRecordQuery } from "../query"
import { customActions } from '../constants';
import {t} from 'sn-translate';
import { Logger } from '../logger';

const FETCH_ERROR = {
	name: t('Error fetching Google Maps API Key'),
	message: t('Please ensure you have configured your API key in sys_properties')
};

const NO_API_KEY_ERROR = {
	name: t('No Google Maps API Key Found'),
	message: t('Please configure your API key in your sys_properties (google.maps.key)')
};

const requestGoogleMapsCredentialType = createGraphQLEffect(
	glideRecordQuery,
	{
		variableList: ["encodedQuery"],
		templateVarList: ['table', 'fields'],
		startActionType: customActions.GMAP_API_METHOD_FETCH_STARTED,
		successActionType: customActions.GMAP_API_METHOD_FETCH_SUCCEEDED,
		errorActionType: customActions.GMAP_API_METHOD_FETCH_FAILED,
	});


const startCredentialTypeFetch = ({ action, state, dispatch }) => {
	Logger.info("🚀 Fetching Google Maps credential type from ServiceNow...");
};

const finishCredentialTypeFetchSuccess = ({ action, state, dispatch, updateState }) => {
	const { payload, meta } = action;
	Logger.info("🚀 Google Maps Credential Type Fetch Success");
	Logger.debug("  payload:", payload);
	if (payload.errors.length) {
		Logger.error("Method fetch error - action:", action);
		Logger.error("  payload:", payload);
		Logger.error("  payload.data:", payload.data);
		Logger.error("  meta:", meta);
		dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
		return;
	}
	const table = (meta["options"]["templateVars"]["table"]||"");
	const result = (payload["data"]["GlideRecord_Query"][table]["_results"][0]||{});
	let googleMapMethod = payload.data.GlideRecord_Query.sys_properties._results[0].value.value;

	Logger.debug("    - google.maps.method = ", googleMapMethod);

	if (!googleMapMethod) {
		Logger.error('🗺️ No Google Maps Method found.');
		updateState({ hasError: true, error: "No Google API Key found." });
		dispatch('PROPERTIES_SET', { error: NO_API_KEY_ERROR });
		return;
	}
	updateState({ googleMapMethod: googleMapMethod });

	const googleAPIKeyProperty = googleMapMethod == "client-id" ? "google.maps.client" : "google.maps.key";
	Logger.debug("    - googleAPIKeyProperty= ", googleAPIKeyProperty);

	dispatch(customActions.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED,
		{
			 encodedQuery: `name=${googleAPIKeyProperty}`,
			 table: "sys_properties",
			 fields: "value { label value displayValue }",
		});
};

const finishCredentialTypeFetchFailure = ({ action, state, dispatch }) => {
	Logger.error("❌ Error Loading Google Maps Credential Type: ", action.payload.response);
	Logger.error("❌ Error: ", action.payload.response.statusText);
	dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
};

export const googleMapCredentialTypeActionHandlers = {
	[customActions.GMAP_API_METHOD_FETCH_REQUESTED]: requestGoogleMapsCredentialType,
	[customActions.GMAP_API_METHOD_FETCH_STARTED]: startCredentialTypeFetch,
	[customActions.GMAP_API_METHOD_FETCH_SUCCEEDED]: finishCredentialTypeFetchSuccess,
	[customActions.GMAP_API_METHOD_FETCH_FAILED]: finishCredentialTypeFetchFailure
};