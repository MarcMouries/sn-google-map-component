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
  infoTemplate: {
    // Custom HTML template for info windows with {{field}} placeholders
    // Example: "<div><h3>{{name}}</h3><p>{{description}}</p></div>"
    default: "",
    schema: { type: "string" },
    onChange(currentValue, previousValue, dispatch) {
      // Update module-level template variable (no marker recreation needed)
      dispatch(customActions.UPDATE_INFO_TEMPLATE);
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
  showRoutes: {
    // When enabled, draws route lines between consecutive markers (sorted by timestamp if available)
    // and calculates driving distances/times. Can detect suspicious transitions where actual time < driving time.
    // For timestamp-based sequencing, provide marker data with a timestamp field (configurable via timestampField).
    default: false,
    schema: { type: "boolean" },
    onChange(currentValue, previousValue, dispatch) {
      dispatch(customActions.DRAW_ROUTES, { enabled: currentValue });
    },
  },
  timestampField: {
    // Field name in marker data containing ISO 8601 timestamp (e.g., "2020-01-12T09:30:00")
    // Used by showRoutes to sort markers chronologically and detect suspicious transitions.
    // Default: "timestamp"
    default: "timestamp",
    schema: { type: "string" },
  },
  showDistanceLines: {
    // When enabled, draws route lines from the searched place to all markers
    // showing driving distance and time. Click on a line to see details.
    default: false,
    schema: { type: "boolean" },
    onChange(currentValue, previousValue, dispatch) {
      dispatch(customActions.TOGGLE_DISTANCE_LINES, { enabled: currentValue });
    },
  },
};
