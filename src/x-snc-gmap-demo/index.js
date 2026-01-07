import { createCustomElement } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from './style.scss';
import "../x-snc-gmap";
import { CENTER_ON, customActions } from "../x-snc-gmap/constants";
import { AIRPORTS } from './sample-data/AIRPORTS'
import { MONEY_ORDERS } from './sample-data/MONEY_ORDERS'
import { DC_BOUNDARY_STONES } from './sample-data/DC_BOUNDARY_STONES'

const MARKER_TYPE_CHANGED = 'MARKER_TYPE_CHANGED';

/**
 * Used to test the component with properties as it's not possible to do in the element.js file
 */

const initialZoom = 2;

const markerMap = {
  '': {
    label: '-- Select markers --',
    markers: [],
    fields: []
  },
  'DC_BOUNDARY_STONES': {
    label: 'DC Boundary Stones',
    markers: DC_BOUNDARY_STONES,
    fields: ["name", "description"]
  },
  'AIRPORTS': {
    label: 'Washington DC Airports',
    markers: AIRPORTS,
    fields: ["name", "city", "state", "country_2.code"]
  },
  'MONEY_ORDERS': {
    label: 'Money Orders',
    markers: MONEY_ORDERS,
    fields: ["_date_time", "_amount", "_postOffice", "_location", "_sender", "_recipient"]
  },
};

// "_date_time as Date & Time"

const view = (state, { dispatch }) => {
  const { markerType, circleEvent } = state;
  const currentData = markerMap[markerType] || markerMap[''];
  const markers = currentData.markers;
  const markerFields = currentData.fields;

  const handleSelectChange = (e) => {
    const selectedValue = e.target.selectedOptions[0].value;
    dispatch(MARKER_TYPE_CHANGED, { selectedValue });
  }

  return (
    <div id="example-container" className="example-container">
      <header>
        <div className="title-section">
          <h1><span className="accent">Location Intelligence</span> Component</h1>
          <p className="subtitle">for ServiceNow Next Experience • Marc Mouries</p>
        </div>
        <div className="controls">
          <label for="select-markers">Markers:</label>
          <select id="select-markers" onchange={handleSelectChange}>
          {
            Object.keys(markerMap).map(type => (
              <option value={type} selected={type === markerType}>
                {markerMap[type].label}
              </option>
            ))
          }
          </select>
        </div>
      </header>

      <div className="main-content">
        <div className="map-container">
          <x-snc-gmap
            centerOn={CENTER_ON.MAP_MARKERS}
            initialZoom={initialZoom}
            language="en"
            place="Washington, DC"
            mapMarkers={markers}
            mapMarkersFields={markerFields}>
          </x-snc-gmap>
        </div>

        <div className="event-log">
          <h3>Event Log</h3>
          <p><strong>Dataset:</strong> {currentData.label}</p>
          <p><strong>Marker Count:</strong> {markers.length}</p>
          {circleEvent && circleEvent.length > 0 && (
            <div className="circle-event">
              <p><strong>Markers inside circle:</strong> {circleEvent.length}</p>
              <ul>
                {circleEvent.map((marker, index) => (
                  <li key={index}>
                    <strong>{marker.name}</strong>
                    {marker.distanceFromCenter && ` - ${(marker.distanceFromCenter / 1000).toFixed(2)} km`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {circleEvent && circleEvent.length === 0 && (
            <div className="circle-event empty">
              <p>No markers inside circle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
createCustomElement("x-snc-gmap-demo", {
  renderer: { type: snabbdom },
  initialState: {
    markerType: '', // Start with no markers selected
    circleEvent: null,
  },
  view,
  styles,
  actionHandlers: {
    [MARKER_TYPE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      console.log("MARKER_TYPE_CHANGED: ", payload);
      updateState({ markerType: payload.selectedValue });
    },
    [customActions.MAP_CIRCLE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      console.log("MAP_CIRCLE_CHANGED event received:", payload);
      updateState({ circleEvent: payload });
    },
    ["NOW_SELECT#SELECTED_ITEM_SET"]: (coeffects, newValue) => {
      console.log("in NOW_SELECT#SELECTED_ITEM_SET: ", newValue);
      coeffects.updateState({ markerType: newValue });
    },
  }
});
