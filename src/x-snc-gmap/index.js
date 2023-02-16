import { createCustomElement, actionTypes } from "@servicenow/ui-core";
import snabbdom, { createRef } from '@seismic/snabbdom-renderer';
import styles from "./styles.scss";
import view from './view';

import properties from './properties'
import { DEFAULT_VALUES } from './defaultValues';
import { actionHandlers } from './actionHandlers';

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

//console.log = function() {}


createCustomElement("x-snc-gmap", {
	renderer: { type: snabbdom },
	view,
	styles,
	properties,
	initialState: {
		mapElementRef: createRef(),
		autoCompleteRef: createRef(),
		googleMapsApi: null,
		googleMapsRef: null,
		isLoading : true,
		mapMarkers: DEFAULT_VALUES,
		markers: [],
		markerCluster: null,
		marker: null
	},

	actionHandlers: {
		...actionHandlers
	},
	actions: {
        ACTION_NAME: {
            // Define config properties here
        }
    }

});
