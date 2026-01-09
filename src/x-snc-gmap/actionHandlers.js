import { createHttpEffect } from '@servicenow/ui-effect-http';

import { customActions } from "./constants"
import { Logger } from './logger';
import { googleApiKeyActionHandlers } from './actions/LoadGoogleApiKeyActions';
import { googleMapCredentialTypeActionHandlers } from './actions/LoadGoogleApiMethodActions';

import { actionTypes } from "@servicenow/ui-core";
const { COMPONENT_BOOTSTRAPPED } = actionTypes;
import { loadGoogleApi, initializeMap, updateMarkers, updateCircleLabel, updateInfoTemplate, toggleCircleVisibility, setPlace } from './loadGoogleMapsApi';
import { URL_CURRENT_USER } from "./constants";
import { queryMarkerData, fetchTaskDataEffect, queryCurrentUserLocation } from "./dataProvider";
import { createGraphQLEffect } from "@servicenow/ui-effect-graphql";
import { glideRecordQuery } from "./query"


const requestGoogleMapCredentialType = (coeffects) => {
     const { action, state, updateState, dispatch } = coeffects;
     Logger.action("🚀 requestGoogleMapCredentialType", action.payload);
     dispatch(customActions.GMAP_API_METHOD_FETCH_REQUESTED,
          {
               encodedQuery: `name=google.maps.method`,
               table: "sys_properties",
               fields: "value { label value displayValue }",
          });
}

const requestGoogleMapAPIKey = (coeffects) => {
     const { action, state, updateState, dispatch } = coeffects;
     Logger.action("🚀 requestGoogleMapAPIKey", action.payload);
     dispatch(customActions.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED,
          {
               encodedQuery: `name=google.maps.key`,
               table: "sys_properties",
               fields: "value { label value displayValue }",
          });
}

/** Handlers **/
	/*
	1. COMPONENT_BOOTSTRAPPED
	2. GOOGLE_MAPS_API_KEY_FETCH_REQUESTED
	3. CURRENT_USER_FETCH_REQUESTED
		- get location
	4. ADDRESS_GEO_CODING_REQUESTED
	5. INITIALIZE_MAP
	*/
export const actionHandlers = {
//     [actionTypes.COMPONENT_BOOTSTRAPPED]: requestGoogleMapAPIKey,
//     ...googleApiKeyActionHandlers,

     [actionTypes.COMPONENT_BOOTSTRAPPED]: requestGoogleMapCredentialType,
     ...googleMapCredentialTypeActionHandlers,
     ...googleApiKeyActionHandlers,

     [customActions.GOOGLE_API_LOAD_REQUESTED]: loadGoogleApi,

     [customActions.INITIALIZE_MAP]: initializeMap,

     [customActions.UPDATE_MARKERS]: updateMarkers,

     [customActions.UPDATE_CIRCLE_LABEL]: updateCircleLabel,

     [customActions.UPDATE_INFO_TEMPLATE]: updateInfoTemplate,

     [customActions.TOGGLE_CIRCLE]: ({ action, state }) => {
          const { visible } = action.payload;
          Logger.action('📗 TOGGLE_CIRCLE', { visible });
          toggleCircleVisibility(visible, state);
     },

     [customActions.SET_PLACE]: setPlace,

     [customActions.CURRENT_USER_FETCH_REQUESTED]: createHttpEffect(
          URL_CURRENT_USER,
          {
               method: 'GET',
               startActionType: customActions.CURRENT_USER_FETCH_STARTED,
               successActionType: customActions.CURRENT_USER_FETCH_SUCCEEDED,
               //errorActionType: customActions.CURRENT_USER_FETCH_FAILED,
          }
     ),

     [customActions.CURRENT_USER_FETCH_STARTED]: ({ updateState }) => {
          Logger.action('📗 CURRENT_USER_FETCH_STARTED');
          updateState({ isLoading: true });
     },

     [customActions.CURRENT_USER_FETCH_SUCCEEDED]: ({ action, dispatch, updateState }) => {
          Logger.action('📗 CURRENT_USER_FETCH_SUCCEEDED');
          const { user_sys_id: userSysId } = action.payload.result;
          Logger.debug("  result = ", action.payload.result);

          let currentUser = { "SysId" : userSysId}
          Logger.debug("  currentUser = ", currentUser);
          updateState({ "currentUser" : currentUser });

          dispatch(customActions.USER_LOCATION_FETCH_REQUESTED, {
               sys_id: userSysId
          });

          /*
          if (userSysId) {
               updateState({ userSysId });
               dispatch(FETCH_ITEM_REQUESTED, {
                    sysparm_fields: 'sys_id,short_description,active,assigned_to',
                    sysparm_query: `assigned_to=${userSysId}^ORDERBYDESCsys_created_on`
               });
          } else {
               updateState({ isLoading: false });
          }
          */
     },

     [customActions.USER_LOCATION_FETCH_REQUESTED]: queryCurrentUserLocation,
     /*
     [customActions.USER_LOCATION_FETCH_REQUESTED]:  ({dispatch, state, updateState}) => {
          ccAction: USER_LOCATION_FETCH_REQUESTED');
          queryCurrentUserLocation;
     },
     */
     [customActions.USER_LOCATION_FETCH_STARTED]: () => {
          Logger.action('📗 USER_LOCATION_FETCH_STARTED');
     },

     [customActions.USER_LOCATION_FETCH_SUCCEEDED]: ({ action, dispatch, updateState, state }) => {
          Logger.action('📗 USER_LOCATION_FETCH_SUCCEEDED');
          const { payload, meta } = action;

          if (payload.errors.length) {
               Logger.error(payload.errors[0]);
               Logger.error(payload.data);
               dispatch('PROPERTIES_SET', { error: FETCH_ERROR });
               return;
          }

          const result = payload.data.GlideRecord_Query.sys_user._results[0];
          Logger.debug("    result = ", result);

          let currentUser = state.currentUser;
          currentUser.name = result.name.displayValue;

          Logger.debug("  currentUser = ", currentUser);
          updateState({ "currentUser" : currentUser });

          if (result.location) {
               let location = {
                    name: result.location._reference.name.value,
                    latitude: result.location._reference.latitude.value,
                    longitude: result.location._reference.longitude.value,
               };
               currentUser.location = location;
               updateState({ "currentUser" : currentUser });
          }
          dispatch(customActions.INITIALIZE_MAP);
     },



		[customActions.FETCH_MARKER_DATA]: queryMarkerData,
		[customActions.FETCH_MARKER_DATA_SUCCESS]: {
			effect: (coeffects) => {
				const { action: { payload, meta }, state, dispatch, updateState, updateProperties } = coeffects;
				const {
					data: {
						GlideRecord_Query: {
							sys_user: { _rowCounts: _rowCounts, _results: _results },
						},
					},
				} = payload;

                    Logger.action('📗 FETCH_MARKER_DATA_SUCCESS');
				const result = payload.data.GlideRecord_Query.sys_user._results[0];
				Logger.debug("    - result = ", result);
				Logger.debug("    - payload = ", payload);

				// Marker with Link
				/*const infowindow = new google.maps.InfoWindow({
					content: `<a style='color:blue' href>${_results[0].name.displayValue}</a>
					<div>Location: ${_results[0].location._reference.name.value}</div>`
				});
*/
				const name = result.name.displayValue;
				const location = result.location._reference.name.value;
				const contentString =
					'<div id="content">' +
					'<div id="siteNotice">' + "</div>" +
					'<h2 id="firstHeading" class="firstHeading">' + name + '</h2>' +
					'<div id="bodyContent">' +
					"<p>" + location + "</p>" +
					"</div>" +
					"</div>";

				const infowindow = new google.maps.InfoWindow({
					content: contentString
				});

				infowindow.open(window.googleMap, state.marker);
			}
		}
}
