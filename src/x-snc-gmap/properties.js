import {DEFAULT_VALUES} from './defaultValues';

export default {

    center: {
        default: { lat: 39.8097343, long: -98.5556199 }, /* USA Center */
    },
    initialZoom: {
        default: 6,
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