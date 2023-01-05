import {DEFAULT_VALUES} from './defaultValues';
import {CENTER_ON} from './constants';

export default {

    center: {
        default: { lat: 39.8097343, long: -98.5556199 }, /* USA Center */
    },
    centerOn : {
        default: CENTER_ON.CURRENT_USER,
        onChange(currentValue, previousValue, dispatch) {
            dispatch(customActions.INITIALIZE_MAP);
        }
    },
    initialZoom: {
        default: 6,
        type: 'number'
    },
    newPropSimple : {
        default : ["a", "b", "c"]
    },
    newPropDefaultValues : {
        default: DEFAULT_VALUES
    },
    mapItemMarkers: {
        default: DEFAULT_VALUES,
        onChange(currentValue, previousValue, dispatch) {
            dispatch(customActions.INITIALIZE_MAP);
        }
    }
}