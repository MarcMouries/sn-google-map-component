import { createCustomElement, actionTypes } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from "./styles.scss";
import view from "./view";
import properties from "./properties";
import { DEFAULT_VALUES } from "./defaultValues";
import { actionHandlers } from "./actionHandlers";
import { customActions } from "./constants";

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
  },

  actionHandlers: {
    ...actionHandlers,
  },
  actions: {
    [customActions.MAP_CIRCLE_CHANGED]: {
      schema: {
        type: "array",
      },
    },
  },
});
