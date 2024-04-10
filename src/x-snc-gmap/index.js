import { createCustomElement, actionTypes } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from "./styles.scss";
import view from "./view";
import properties from "./properties";
import { DEFAULT_VALUES } from "./defaultValues";
import { actionHandlers } from "./actionHandlers";
import { customActions } from "./constants";
import { name, version, author } from '../../package.json';

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
    const logStyle = 'background: #333; color: #FFF; border-radius: 4px; font-size: 14px; padding: 5px; ';
    console.log(
      `%c🌎 Map Component                       \nName    : ${name}                   \nVersion : ${version}                        \nAuthor  : ${author.email}  `,
      logStyle
    );
    updateState({ versionShowed: true });
  }
}
