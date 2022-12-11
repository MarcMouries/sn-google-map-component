import { createCustomElement, actionTypes } from "@servicenow/ui-core";
import snabbdom, { createRef } from '@seismic/snabbdom-renderer';
import { loadGoogleApi, initializeMap } from './googleLoadMap';
import styles from "./styles.scss";
import view from './view';
import {
	fetchAgentDataEffect,
	fetchTaskDataEffect
} from "./dataProvider";
import { stateConstants, customActions } from "./constants";
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

createCustomElement("x-snc-googlemap", {
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

	properties: {
		center: {
			default: { lat: 39.8097343, lng: -98.5556199 },
		},
		zoom: {
			default: 5,
		},
		apikey: {
			default: {
				type: "client",
				key: "gme-servicenow",
			},
		},
		table: {
			default: "sys_user",
		},
		data: {
			default: [
				/* 8045 Leesburg Pike, Vienna, VA 22182, United States of America */
				{
					table: "task",
					sys_id: "ac26c34c1be37010b93654a2604bcbd5",
					lat: 38.913014,
					long: -77.224186,
					image: 'https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/64x64/24b02bdf69dd777df55b306db3c5e214',
					state: STATES.WIP
				}
				,
				/* New York, New York, United States of America */
				{
					table: "sys_user",
					sys_id: "5137153cc611227c000bbd1bd8cd2005",
					lat: 40.7896239,
					long: -73.9598939,
					image: 'https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/64x64/24b02bdf69dd777df55b306db3c5e214'
				}
			],
			onChange(currentValue, previousValue, dispatch) {
				dispatch(customActions.INITIALIZE_MAP);
			}
		},

	},

	actionHandlers: {
		[actionTypes.COMPONENT_BOOTSTRAPPED]: loadGoogleApi,
		[customActions.INITIALIZE_MAP]: initializeMap,
		[customActions.FETCH_AGENT_DATA]: fetchAgentDataEffect,
		[customActions.FETCH_AGENT_DATA_SUCCESS]: {
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
							sys_user: { _rowCounts: _rowCounts, _results: _results },
						},
					},
				} = payload;
				const user  = payload.data.GlideRecord_Query.sys_user._results[0];
				console.log("payload USER");
				console.log(payload);
				console.log(user);
				const infowindow = new google.maps.InfoWindow({
					content: `<a style='color:blue' href>${_results[0].name.displayValue}</a>
					<div>Location: ${_results[0].location._reference.name.value}</div>`
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
