import { createCustomElement } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from './style.scss';
import "../x-snc-gmap";
import { CENTER_ON } from "../x-snc-gmap/constants";
import { AIRPORTS } from './sample-data/AIRPORTS'
import { MONEY_ORDERS } from './sample-data/MONEY_ORDERS'

const MARKER_TYPE_CHANGED = 'MARKER_TYPE_CHANGED';

/**
 * Used to test the component with properties as it's not possible to do in the element.js file
 */

const initialZoom = 2;

const markerMap = {
  'AIRPORTS': {
    markers: AIRPORTS,
    fields: ["name", "city", "state",  "country_2.code"]
  },
  'MONEY_ORDERS': {
    markers: MONEY_ORDERS,
    fields: ["_date_time", "_amount", "_postOffice", "_location",  "_sender", "_recipient"]
  },
};

// "_date_time as Date & Time"

const view = (state, { dispatch }) => {
  const { markerType } = state;
  const markers = markerMap[markerType].markers;
  const markerFields = markerMap[markerType].fields;


  console.log("markerType", markerType);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.selectedOptions[0].value;
    console.log("Selected value: " + selectedValue);
    dispatch(MARKER_TYPE_CHANGED, { selectedValue });
  }

  return (
    <div id="example-container" className="example-container">
      <h1>Google Map Component</h1>
      <div>
        <label for="select-markers">Select the Markers:</label>
        <select id="select-markers" onchange={handleSelectChange}>
        {
          Object.keys(markerMap).map(type => <option value={type}>{type}</option>)
        }
        </select>
      </div>

      <x-snc-gmap
        centerOn={CENTER_ON.MAP_MARKERS}
        initialZoom={initialZoom}
        language="en"
        place="ServiceNow, Leesburg Pike, Vienna, VA"
        mapMarkers={markers}
        mapMarkersFields={markerFields}>
      </x-snc-gmap>
      <p>Current Marker Type: {markerType}</p>
    </div>
  );
};
createCustomElement("x-snc-gmap-demo", {
  renderer: { type: snabbdom },
  initialState: {
    markerType: 'MONEY_ORDERS', //MONEY_ORDERS, AIRPORTS
  },
  view,
  styles,
  actionHandlers: {
    [MARKER_TYPE_CHANGED]: (coeffects, newValue) => {
      const { action: { payload, meta }, state, dispatch, updateState } = coeffects;

      console.log("in dispath: (payload)", payload);
      updateState({ markerType: payload.selectedValue });
    },
    ["NOW_SELECT#SELECTED_ITEM_SET"]: (coeffects, newValue) => {
      console.log("in NOW_SELECT#SELECTED_ITEM_SET: ", newValue);
      coeffects.updateState({ markerType: newValue });
    },
  }
});
