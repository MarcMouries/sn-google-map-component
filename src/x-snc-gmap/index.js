import { createCustomElement, actionTypes } from "@servicenow/ui-core";
import snabbdom, { createRef } from '@seismic/snabbdom-renderer';
import { loadGoogleApi, initializeMap } from './loadGoogleMapsApi';
import { googleApiKeyActionHandlers } from './actions/GoogleApiKeyActions';
import { createHttpEffect } from '@servicenow/ui-effect-http';

import styles from "./styles.scss";
import view from './view';
import {
	fetchAgentDataEffect,
	fetchTaskDataEffect
} from "./dataProvider";

import { stateConstants, customActions, URL_CURRENT_USER } from "./constants";
import properties from './properties'

const { COMPONENT_BOOTSTRAPPED } = actionTypes;
const { STATES } = stateConstants;

const createInfoWindow = (object) => {
	const contentString =
		'<div id="content">' +
		'<div id="siteNotice"> siteNotice' + "</div>" +
		'<h1 id="firstHeading" class="firstHeading">Case-22-0001</h1>' +
		'<div id="bodyContent">' +
		"<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
		"sandstone rock formation in the southern part of the " +
		"Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
		"south west of the nearest large town, Alice Springs; 450&#160;km " +
		"(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
		"features of the Uluru - Kata Tjuta National Park. Uluru is " +
		"sacred to the Pitjantjatjara and Yankunytjatjara, the " +
		"Aboriginal people of the area. It has many springs, waterholes, " +
		"rock caves and ancient paintings. Uluru is listed as a World " +
		"Heritage Site.</p>" +
		'<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
		"https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
		"(last visited June 22, 2009).</p>" +
		"</div>" +
		"</div>";
	return contentString;
}

createCustomElement("x-snc-gmap", {
	renderer: { type: snabbdom },
	view,
	styles,
	initialState: {
		mapElementRef: createRef(),
		googleMapsApi: null,
		googleMapsRef: null,
		markers: [],
		markerCluster: null,
		marker: null,
		selectedTaskFilter: []
	},
	properties,

	/*
	1. COMPONENT_BOOTSTRAPPED
	2. GOOGLE_MAPS_API_KEY_FETCH_REQUESTED
	3. CURRENT_USER_FETCH_REQUESTED
		- get location
	4. ADDRESS_GEO_CODING_REQUESTED
	5. INITIALIZE_MAP
	*/
	actionHandlers: {

		[actionTypes.COMPONENT_BOOTSTRAPPED]: (coeffects) => {
			const { dispatch } = coeffects;
			dispatch(customActions.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED, {
				sys_property_name: "google.maps.key"
			});
		},

		...googleApiKeyActionHandlers,

		[customActions.GOOGLE_API_LOAD_REQUESTED]: loadGoogleApi,


		[customActions.CURRENT_USER_FETCH_REQUESTED]: createHttpEffect(
			URL_CURRENT_USER, {
			method: 'GET',
			startActionType: customActions.CURRENT_USER_FETCH_STARTED,
			successActionType: customActions.CURRENT_USER_FETCH_SUCCEEDED,
			//errorActionType: customActions.CURRENT_USER_FETCH_FAILED,
		}),
		[customActions.CURRENT_USER_FETCH_STARTED]: ({ updateState }) => {
			console.log("CURRENT_USER_FETCH_STARTED");
			updateState({ isLoading: true });
		},
		[customActions.CURRENT_USER_FETCH_SUCCEEDED]: (
			{
				action: { payload: { result = {} } },
				dispatch, updateState }) => {
			const { user_sys_id: userSysId } = result;
			console.log("CURRENT_USER_FETCH_SUCCEEDED");
			//console.log("payload: ", payload);
			console.log("result", result);

			dispatch(customActions.INITIALIZE_MAP);

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

		[customActions.INITIALIZE_MAP]: initializeMap,
		[customActions.FETCH_AGENT_DATA]: fetchAgentDataEffect,
		[customActions.FETCH_AGENT_DATA_SUCCESS]: {
			effect: (coeffects) => {
				const { action: { payload, meta }, state, dispatch, updateState, updateProperties } = coeffects;
				const {
					data: {
						GlideRecord_Query: {
							sys_user: { _rowCounts: _rowCounts, _results: _results },
						},
					},
				} = payload;
				const user = payload.data.GlideRecord_Query.sys_user._results[0];
				console.log("payload USER");
				console.log(payload);
				console.log(user);

				// Marker with Link
				/*const infowindow = new google.maps.InfoWindow({
					content: `<a style='color:blue' href>${_results[0].name.displayValue}</a>
					<div>Location: ${_results[0].location._reference.name.value}</div>`
				});
*/
				const name = _results[0].name.displayValue;
				const location = _results[0].location._reference.name.value;
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
		},
		[customActions.FETCH_TASK_DATA]: fetchTaskDataEffect,
		[customActions.FETCH_TASK_DATA_SUCCESS]: {
			effect: (coeffects) => {
				const {
					action: { payload, meta },
					state,
					dispatch,
					updateState,
					updateProperties,
				} = coeffects;
				const {
					data: {
						GlideRecord_Query: {
							task: { _rowCounts: _rowCounts, _results: _results },
						},
					},
				} = payload;
				console.log("payload TASK");
				console.log(payload);
				const task = payload.data.GlideRecord_Query.task._results[0];
				const infowindow = new google.maps.InfoWindow({
					content: `<div [COLOR="#FF0000"]background-color: #ebf3fb;[/COLOR]>
					<a style='color:blue' href>${task.number.displayValue}</a>
					<div>State: ${task.state.displayValue}</div>
					<div>Location: ${task.location._reference.name.value}</div>
					</div>`,
				});
				// const infowindow = new google.maps.InfoWindow(
				// 	{
				// 		content: "createInfoWindow({})",
				// 		closeBoxMargin: "20px 20px 20px 20px",

				// 	});
				infowindow.open(window.googleMap, state.marker);
			}
		},
	},
});
