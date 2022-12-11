const actionTypes = {
	NEW_MAP_LOCATION_CHOSEN: 'NEW_MAP_LOCATION_CHOSEN',
};

const actions = {
	[actionTypes.NEW_MAP_LOCATION_CHOSEN]: {}
};

const setNewLocation = ({action, dispatch, state}) => {
    const { mapMarkers } =  action.payload;
    dispatch('PROPERTIES_SET', { mapMarkers });
};

const actionHandlers = {
	[actionTypes.NEW_MAP_LOCATION_CHOSEN]: setNewLocation
};

export {
	actions,
	actionHandlers
};