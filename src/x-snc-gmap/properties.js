import {DEFAULT_VALUES} from './defaultValues';

export default {
    mapMarkers: {
        required: true,
        schema: {type: 'array'},
        default: DEFAULT_VALUES,
        onChange(currentValue, previousValue, dispatch) {
            dispatch(customActions.INITIALIZE_MAP);
        }
    },
    center: {
        default: { lat: 39.8097343, long: -98.5556199 }, /* USA Center */
    },
    initialZoom: {
        default: 6,
    },
}