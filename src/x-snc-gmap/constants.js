export const URL_CURRENT_USER = 'api/now/ui/user/current_user';
// 
//export const URL_CURRENT_USER = 'api/now/table/sys_user?sysparm_query=sys_id=javascript:gs.getUserID()&sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Clocation.longitude%2Clocation.latitude%2Clocation'
//export const URL_CURRENT_USER = 'api/now/table/sys_user?sysparm_query=sys_id=javascript%3Ags.getUserID%28%29&sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Clocation.longitude%2Clocation.latitude%2Clocation'

export const CENTER_ON = {
	CURRENT_USER: 'CURRENT_USER',
	MAP_MARKERS: 'MAP_MARKERS',
	ADDRESS: 'ADDRESS'
};

export const COLOR = {
	INITIAL_MARKER: "#0f4d92",
	MARKER_INSIDE_CIRCLE: "green",
	CIRCLE: "#0f4d92"
};

/**
 * Default circle configuration
 * Used when centering on user location
 */
export const CIRCLE_DEFAULTS = {
	RADIUS_METERS: 80000,  // 80km / ~50 miles
	UNIT: "kilometers"
};

/**
 * Marker style configuration
 * Centralized for easy migration to AdvancedMarkerElement
 */
export const MARKER_STYLE = {
	size: 32,
	labelColor: "#ffffff",
	labelFontSize: "16px",
	borderColor: "#ffffff",
	borderWidth: 2,
	shadowColor: "rgba(0,0,0,0.3)"
};

export const SVG_SQUARE =
  '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" > \
    <path fill="{{background}}" d="M3.5 3.5h25v25h-25z" ></path> \
   </svg>';

export const customActions = {

	MAP_CIRCLE_CHANGED : "AES_GMAP#MAP_CIRCLE_CHANGED",
	MAP_PLACE_CHANGED :  "AES_GMAP#MAP_PLACE_CHANGED",

	GOOGLE_API_LOAD_REQUESTED: 'GOOGLE_API_LOAD_REQUESTED',


	GMAP_API_METHOD_FETCH_REQUESTED: 'GMAP_API_METHOD_FETCH_REQUESTED',
	GMAP_API_METHOD_FETCH_STARTED  : 'GMAP_API_METHOD_FETCH_STARTED',
	GMAP_API_METHOD_FETCH_SUCCEEDED: 'GMAP_API_METHOD_FETCH_SUCCEEDED',
	GMAP_API_METHOD_FETCH_FAILED   : 'GMAP_API_METHOD_FETCH_FAILED',



	GOOGLE_MAPS_API_KEY_FETCH_REQUESTED: 'GOOGLE_MAPS_API_KEY_FETCH_REQUESTED',
	GOOGLE_MAPS_API_KEY_FETCH_STARTED  : 'GOOGLE_MAPS_API_KEY_FETCH_STARTED',
	GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED: 'GOOGLE_MAPS_API_KEY_FETCH_SUCCEEDED',
	GOOGLE_MAPS_API_KEY_FETCH_FAILED   : 'GOOGLE_MAPS_API_KEY_FETCH_FAILED',


	CURRENT_USER_FETCH_REQUESTED : 'CURRENT_USER_FETCH_REQUESTED',
	CURRENT_USER_FETCH_STARTED   : 'CURRENT_USER_FETCH_STARTED',
	CURRENT_USER_FETCH_SUCCEEDED : 'CURRENT_USER_FETCH_SUCCEEDED',

	USER_LOCATION_FETCH_REQUESTED : 'USER_LOCATION_FETCH_REQUESTED',
	USER_LOCATION_FETCH_STARTED   : 'USER_LOCATION_FETCH_STARTED',
	USER_LOCATION_FETCH_SUCCEEDED : 'USER_LOCATION_FETCH_SUCCEEDED',


	ADDRESS_GEO_CODING_REQUESTED : 'ADDRESS_GEO_CODING_REQUESTED',
	ADDRESS_GEO_CODING_STARTED   : 'ADDRESS_GEO_CODING_STARTED',
	ADDRESS_GEO_CODING_SUCCEEDED : 'ADDRESS_GEO_CODING_SUCCEEDED',

	INITIALIZE_MAP: 'AES_GMAP#INITIALIZE_MAP',
	UPDATE_MARKERS: 'AES_GMAP#UPDATE_MARKERS',
	UPDATE_CIRCLE_LABEL: 'AES_GMAP#UPDATE_CIRCLE_LABEL',
	UPDATE_INFO_TEMPLATE: 'AES_GMAP#UPDATE_INFO_TEMPLATE',
	MARKER_CLICKED: 'AES_GMAP#MARKER_CLICKED',
	SET_PLACE: 'AES_GMAP#SET_PLACE',
	TOGGLE_CIRCLE: 'AES_GMAP#TOGGLE_CIRCLE',
	DRAW_ROUTES: 'AES_GMAP#DRAW_ROUTES',
	TOGGLE_DISTANCE_LINES: 'AES_GMAP#TOGGLE_DISTANCE_LINES',

	FETCH_MARKER_DATA: 'AES_GMAP#AGENT_DATA_FETCH_REQUESTED',
	FETCH_MARKER_DATA_SUCCESS: 'AES_GMAP#AGENT_DATA_FETCH_SUCCEEDED',

};

export const svg_you_are_here = `<meta http-equiv="content-type" content="application/xhtml+xml; charset=utf-8"/>
<svg width="200" height="100" viewBox="0 0 100 110" >
  <rect id="rectangle" x="1" y="1" rx="10" ry="10" width="110" height="50"
        style="fill:#baf9ab; stroke:#71D358; stroke-width:2;"/>
  <text x="60" y="20" font-size="16" dy=".3em" text-anchor="middle">You are here</text>
  <text x="60" y="35" font-size="16" dy=".3em"  lengthAdjust="spacing" text-anchor="middle">Vous êtes ici</text>
  <path id="triangle" d="M 60 61 L 50 51 L 70 51 Z" fill="#baf9ab" stroke="#71D358" stroke-width="2"/>
</svg>`