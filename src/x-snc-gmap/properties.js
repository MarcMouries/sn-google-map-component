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
    current: {
        required: true,
        schema: {type: 'string'},
        default: "Triage"
    },
    center: {
        default: { lat: 39.8097343, lng: -98.5556199 },
    },
    zoom: {
        default: 5,
    },
}