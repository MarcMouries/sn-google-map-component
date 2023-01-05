
export const tables = {
	USER_TABLE: 'sys_user',
	TASK_TABLE: 'task',
};

export const URL_CURRENT_USER = 'api/now/ui/user/current_user';
//export const URL_CURRENT_USER = 'api/now/table/sys_user?sysparm_query=sys_id=javascript:gs.getUserID()&sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Clocation.longitude%2Clocation.latitude%2Clocation'
//export const URL_CURRENT_USER = 'api/now/table/sys_user?sysparm_query=sys_id=javascript%3Ags.getUserID%28%29&sysparm_display_value=true&sysparm_fields=sys_id%2Cname%2Clocation.longitude%2Clocation.latitude%2Clocation'



export const customActions = {

	GOOGLE_API_LOAD_REQUESTED: 'GOOGLE_API_LOAD_REQUESTED',

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

	FETCH_AGENT_DATA: 'AES_GMAP#AGENT_DATA_FETCH_REQUESTED',
	FETCH_TASK_DATA: 'AES_GMAP#TASK_DATA_FETCH_REQUESTED',
	FETCH_AGENT_DATA_SUCCESS: 'AES_GMAP#AGENT_DATA_FETCH_SUCCEEDED',
	FETCH_TASK_DATA_SUCCESS: 'AES_GMAP#TASK_DATA_FETCH_SUCCEEDED'
};