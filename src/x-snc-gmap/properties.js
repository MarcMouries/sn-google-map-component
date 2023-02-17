import { AIRPORTS, DEFAULT_VALUES } from './defaultValues';
import { CENTER_ON } from './constants';

export default {

    center: {
        default: { lat: 39.8097343, long: -98.5556199 }, /* Center of continental USA */
    },
    centerOn: {
        default: CENTER_ON.ADDRESS,
        onChange(currentValue, previousValue, dispatch) {
            dispatch(customActions.INITIALIZE_MAP);
        }
    },
    circleRadius: {
        /* 16093.4 = 10 miles in meters */
        /* 19312.1 = 12 miles in meters */
        default: 19312.1,
        schema: {type: 'number'}
    },
    displayFields :{
        default: []
    },
    initialZoom: {
        default: 10,
        schema: {type: 'number'}
    },
    language: {
        default: "en",
        onChange(currentValue, previousValue, dispatch) {
            dispatch(customActions.INITIALIZE_MAP);
        }
    },
    mapMarkers: {
        default: AIRPORTS,
        onChange(currentValue, previousValue, dispatch) {
            dispatch(customActions.INITIALIZE_MAP);
        }
    },
    place: {
        onChange(currentValue, previousValue, dispatch) {
            dispatch(customActions.SET_PLACE);
        }
    }
}