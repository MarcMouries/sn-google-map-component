import { createCustomElement, actionTypes } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from "./styles.scss";
import view from "./view";
import properties from "./properties";
import { DEFAULT_VALUES } from "./defaultValues";
import { actionHandlers } from "./actionHandlers";
import { customActions } from "./constants";
import { name, version, author } from '../../package.json';
import { Logger } from './logger';

//console.log = function() {}


createCustomElement("x-snc-gmap", {
  renderer: { type: snabbdom },
  view,
  styles,
  properties,
  initialState: {
    mapElementRef: createRef(),
    autoCompleteRef: createRef(),
    googleMapsApi: null,
    googleMapsRef: null,
    isLoading: true,
    mapMarkers: DEFAULT_VALUES,
    markers: [],
    markerCluster: null,
    marker: null,
    // Google Maps marker references (moved from module-level to prevent memory leaks)
    gmMarkers: [],
    radiusOverlay: null,
    placeCircleRef: null,
  },

  actionHandlers: {
    [actionTypes.COMPONENT_RENDER_REQUESTED]: ({ state, updateState }) => {
      printComponentInfo(state, updateState);
    },
    ...actionHandlers
  },
  actions: {
    [customActions.MAP_CIRCLE_CHANGED]: {
      schema: {
        type: "array",
      },
    },
  },
});

function printComponentInfo(state, updateState) {
  if (!state.versionShowed) {
    Logger.info(`🌎 Map Component - ${name} v${version} by ${author.email}`);
    updateState({ versionShowed: true });
  }
}
