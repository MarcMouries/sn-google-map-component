import { AIRPORTS, DEFAULT_VALUES } from "./defaultValues";
import { CENTER_ON } from "./constants";
import { customActions } from "./constants";
import { Logger } from './logger';


export default {
  center: {
    default: { lat: 39.8097343, long: -98.5556199 } /* Center of continental USA */,
    schema: { type: "object" },
  },
  centerOn: {
    default: CENTER_ON.ADDRESS,
    schema: { type: "string" },
    onChange(currentValue, previousValue, dispatch) {
      dispatch(customActions.INITIALIZE_MAP);
    },
  },
  circleRadius: {
    // Value in the unit specified by distanceUnit (miles or kilometers)
    default: 10,
    schema: { type: "number" },
  },
  distanceUnit: {
    default: "miles",
    schema: { type: "string" },
    onChange(currentValue, previousValue, dispatch) {
      dispatch(customActions.UPDATE_CIRCLE_LABEL);
    },
  },
  initialZoom: {
    default: 9,
    schema: { type: "number" },
  },
  language: {
    default: "en",
    schema: { type: "string" },
    onChange(currentValue, previousValue, dispatch) {
      dispatch(customActions.INITIALIZE_MAP);
    },
  },
  mapMarkers: {
    default: [],
    schema: { type: "array" },
    onChange(currentValue, previousValue, dispatch) {
      // Use UPDATE_MARKERS to preserve circle overlay and other map state
      dispatch(customActions.UPDATE_MARKERS);
      Logger.debug("📍 mapMarkers onChange()");
    },
  },
  mapMarkersFields: {
    default: [],
    schema: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  place: {
    schema: { type: "string" },
    onChange(currentValue, previousValue, dispatch) {
      dispatch(customActions.SET_PLACE);
    },
  },
  showCircle: {
    default: true,
    schema: { type: "boolean" },
    onChange(currentValue, previousValue, dispatch) {
      dispatch(customActions.TOGGLE_CIRCLE, { visible: currentValue });
    },
  },
};
