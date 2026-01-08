import { createCustomElement } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from './style.scss';
import "../x-snc-gmap";
import { CENTER_ON, customActions } from "../x-snc-gmap/constants";
import { AIRPORTS } from './sample-data/AIRPORTS'
import { MONEY_ORDERS } from './sample-data/MONEY_ORDERS'
import { DC_BOUNDARY_STONES } from './sample-data/DC_BOUNDARY_STONES'

const MARKER_TYPE_CHANGED = 'MARKER_TYPE_CHANGED';
const SHOW_CIRCLE_CHANGED = 'SHOW_CIRCLE_CHANGED';

/**
 * Used to test the component with properties as it's not possible to do in the element.js file
 */

const initialZoom = 2;

const markerMap = {
  '': {
    label: '-- Select markers --',
    markers: [],
    fields: [],
    markerLabel: ''
  },
  'DC_BOUNDARY_STONES': {
    label: 'DC Boundary Stones',
    markers: DC_BOUNDARY_STONES,
    fields: ["name", "description"],
    markerLabel: '◆' // Diamond for boundary stones
  },
  'AIRPORTS': {
    label: 'Washington DC Airports',
    markers: AIRPORTS,
    fields: ["name", "city", "state", "country_2.code"],
    markerLabel: '✈' // Airplane symbol
  },
  'MONEY_ORDERS': {
    label: 'Money Orders',
    markers: MONEY_ORDERS,
    fields: ["_date_time", "_amount", "_postOffice", "_location", "_sender", "_recipient"],
    markerLabel: '$' // Dollar sign for money orders
  },
};

// "_date_time as Date & Time"

// Pre-process markers with labels for each dataset (done once at load time)
const processedMarkerMap = Object.fromEntries(
  Object.entries(markerMap).map(([key, data]) => [
    key,
    {
      ...data,
      processedMarkers: data.markers.map(m => ({ ...m, markerLabel: data.markerLabel }))
    }
  ])
);

const view = (state, { dispatch }) => {
  const { markerType, circleEvent, showCircle } = state;
  const currentData = processedMarkerMap[markerType] || processedMarkerMap[''];
  const markers = currentData.processedMarkers;
  const markerFields = currentData.fields;

  const handleSelectChange = (e) => {
    const selectedValue = e.target.selectedOptions[0].value;
    dispatch(MARKER_TYPE_CHANGED, { selectedValue });
  }

  const handleCircleToggle = (e) => {
    dispatch(SHOW_CIRCLE_CHANGED, { showCircle: e.target.checked });
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
            mapMarkersFields={markerFields}
            showCircle={showCircle}>
          </x-snc-gmap>
        </div>

        <div className="sidebar-panel">
          <div className="properties-section">
            <h3>Properties</h3>
            <p><strong>Dataset:</strong> {currentData.label}</p>
            <p><strong>Marker Count:</strong> {markers.length}</p>
            <div className="checkbox-control">
              <label>
                <input
                  type="checkbox"
                  checked={showCircle}
                  onchange={handleCircleToggle}
                />
                <span>Show Circle Overlay</span>
              </label>
            </div>
          </div>

          <div className="event-log-section">
            <h3>Event Log</h3>
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
            {!circleEvent && (
              <p className="no-events">No circle events yet</p>
            )}
          </div>
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
    showCircle: true, // Circle overlay visible by default
  },
  view,
  styles,
  actionHandlers: {
    [MARKER_TYPE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      console.log("MARKER_TYPE_CHANGED: ", payload);
      updateState({ markerType: payload.selectedValue });
    },
    [SHOW_CIRCLE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      console.log("SHOW_CIRCLE_CHANGED: ", payload);
      // Clear circle event data when hiding the circle
      if (!payload.showCircle) {
        updateState({ showCircle: payload.showCircle, circleEvent: null });
      } else {
        updateState({ showCircle: payload.showCircle });
      }
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
