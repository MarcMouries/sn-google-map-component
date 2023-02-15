export const URL_CURRENT_USER = 'api/now/ui/user/current_user';
// 
//export const URL_CURRENT_USER = 'api/now/table/sys_user?sysparm_query=sys_id=javascript:gs.getUserID()&sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Clocation.longitude%2Clocation.latitude%2Clocation'
//export const URL_CURRENT_USER = 'api/now/table/sys_user?sysparm_query=sys_id=javascript%3Ags.getUserID%28%29&sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Clocation.longitude%2Clocation.latitude%2Clocation'

export const CENTER_ON = {
	CURRENT_USER: 'CURRENT_USER',
	MAP_MARKERS: 'MAP_MARKERS',
	ADDRESS: 'ADDRESS'
};

export const customActions = {

	ACTION_ON_CLICK : "ACTION_ON_CLICK",
	SET_PLACE : "SET_PLACE",

	GOOGLE_API_LOAD_REQUESTED: 'GOOGLE_API_LOAD_REQUESTED',

	//@TODO read google.maps.method
	// googleKeyMethod 
	// const key = method == "key" ? state.properties.googleKey["key"] : state.properties.googleKey["client"];

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
	MARKER_CLICKED: 'AES_GMAP#MARKER_CLICKED',

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