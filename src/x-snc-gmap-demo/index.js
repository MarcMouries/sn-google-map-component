import { createCustomElement } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from './style.scss';
import "../x-snc-gmap";
import { CENTER_ON, customActions } from "../x-snc-gmap/constants";
import { Logger } from "../x-snc-gmap/logger";
import { AIRPORTS } from './sample-data/AIRPORTS'
import { MONEY_ORDERS } from './sample-data/MONEY_ORDERS'
import { DC_BOUNDARY_STONES } from './sample-data/DC_BOUNDARY_STONES'
import { WHO_DISEASE_OUTBREAKS, WHO_OUTBREAK_FIELDS } from './sample-data/WHO_DISEASE_OUTBREAKS'

const MARKER_TYPE_CHANGED = 'MARKER_TYPE_CHANGED';
const SHOW_CIRCLE_CHANGED = 'SHOW_CIRCLE_CHANGED';
const SHOW_ROUTES_CHANGED = 'SHOW_ROUTES_CHANGED';
const SHOW_DISTANCE_LINES_CHANGED = 'SHOW_DISTANCE_LINES_CHANGED';
const ADDRESS_CHANGED = 'ADDRESS_CHANGED';
const DISTANCE_UNIT_CHANGED = 'DISTANCE_UNIT_CHANGED';
const TEMPLATE_TOGGLE_CHANGED = 'TEMPLATE_TOGGLE_CHANGED';

// Sample custom template for testing infoTemplate feature
const CUSTOM_INFO_TEMPLATE = `
<div class="info-box-header">{{name}}</div>
<div class="info-box-body">
  <div class="info-box-headline">{{headline}}</div>
  <div class="info-box-stats">
    <div class="info-box-stat">
      <div class="stat-value">{{cases:number}}</div>
      <div class="stat-label">Cases</div>
    </div>
    <div class="info-box-stat">
      <div class="stat-value">{{deaths:number}}</div>
      <div class="stat-label">Deaths</div>
    </div>
  </div>
  <div class="info-box-field">
    <span class="field-label">Category:</span> {{category}}
  </div>
  <div class="info-box-field">
    <span class="field-label">Status:</span>
    <span class="info-box-status {{status:lowercase}}">{{status:uppercase}}</span>
  </div>
  <div class="info-box-date">Reported: {{date_reported:date}}</div>
</div>
`;

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
  'WHO_OUTBREAKS': {
    label: 'WHO Disease Outbreaks (2024-2025)',
    markers: WHO_DISEASE_OUTBREAKS,
    fields: WHO_OUTBREAK_FIELDS,
    markerLabel: '⚠' // Warning symbol for disease outbreaks
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
  const { markerType, circleEvent, showCircle, showRoutes, showDistanceLines, address, distanceUnit, useCustomTemplate } = state;
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

  const handleAddressChange = (e) => {
    dispatch(ADDRESS_CHANGED, { address: e.target.value });
  }

  const handleUnitChange = (e) => {
    dispatch(DISTANCE_UNIT_CHANGED, { distanceUnit: e.target.value });
  }

  const handleTemplateToggle = (e) => {
    dispatch(TEMPLATE_TOGGLE_CHANGED, { useCustomTemplate: e.target.checked });
  }

  const handleRoutesToggle = (e) => {
    dispatch(SHOW_ROUTES_CHANGED, { showRoutes: e.target.checked });
  }

  const handleDistanceLinesToggle = (e) => {
    dispatch(SHOW_DISTANCE_LINES_CHANGED, { showDistanceLines: e.target.checked });
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
            place={address}
            mapMarkers={markers}
            mapMarkersFields={markerFields}
            showCircle={showCircle}
            showRoutes={showRoutes}
            showDistanceLines={showDistanceLines}
            distanceUnit={distanceUnit}
            infoTemplate={useCustomTemplate ? CUSTOM_INFO_TEMPLATE : ''}>
          </x-snc-gmap>
        </div>

        <div className="sidebar-panel">
          <div className="properties-section">
            <h3>Properties</h3>
            <div className="input-control">
              <label for="address-input">Address:</label>
              <input
                id="address-input"
                type="text"
                value={address}
                onchange={handleAddressChange}
                placeholder="Enter an address or place"
              />
            </div>
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
            <div className="checkbox-control">
              <label>
                <input
                  type="checkbox"
                  checked={showDistanceLines}
                  onchange={handleDistanceLinesToggle}
                  disabled={!markerType}
                />
                <span>Show Distance Lines</span>
                {!markerType && (
                  <span className="hint"> (select markers first)</span>
                )}
              </label>
            </div>
            <div className="checkbox-control">
              <label>
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onchange={handleRoutesToggle}
                  disabled={markerType !== 'MONEY_ORDERS'}
                />
                <span>Show Sequential Routes</span>
                {markerType !== 'MONEY_ORDERS' && (
                  <span className="hint"> (requires timestamp field)</span>
                )}
              </label>
            </div>
            <div className="checkbox-control">
              <label>
                <input
                  type="checkbox"
                  checked={useCustomTemplate}
                  onchange={handleTemplateToggle}
                />
                <span>Use Custom Info Template</span>
              </label>
            </div>
            {useCustomTemplate && (
              <div className="template-preview">
                <label>Template:</label>
                <textarea
                  readonly
                  rows="8"
                  value={CUSTOM_INFO_TEMPLATE.trim()}
                />
              </div>
            )}
            <div className="radio-control">
              <span className="radio-label">Distance Unit:</span>
              <label>
                <input
                  type="radio"
                  name="distance-unit"
                  value="miles"
                  checked={distanceUnit === 'miles'}
                  onchange={handleUnitChange}
                />
                Miles
              </label>
              <label>
                <input
                  type="radio"
                  name="distance-unit"
                  value="kilometers"
                  checked={distanceUnit === 'kilometers'}
                  onchange={handleUnitChange}
                />
                Kilometers
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
    showRoutes: false, // Sequential routes hidden by default
    showDistanceLines: false, // Distance lines from place hidden by default
    address: 'Washington, DC', // Default address
    distanceUnit: 'miles', // Default unit for distances
    useCustomTemplate: false, // Custom info template disabled by default
  },
  view,
  styles,
  actionHandlers: {
    [MARKER_TYPE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("🎯 MARKER_TYPE_CHANGED", payload);
      updateState({ markerType: payload.selectedValue });
    },
    [SHOW_CIRCLE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("⭕ SHOW_CIRCLE_CHANGED", payload);
      // Clear circle event data when hiding the circle
      if (!payload.showCircle) {
        updateState({ showCircle: payload.showCircle, circleEvent: null });
      } else {
        updateState({ showCircle: payload.showCircle });
      }
    },
    [SHOW_ROUTES_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("🛤️ SHOW_ROUTES_CHANGED", payload);
      updateState({ showRoutes: payload.showRoutes });
    },
    [SHOW_DISTANCE_LINES_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("📏 SHOW_DISTANCE_LINES_CHANGED", payload);
      updateState({ showDistanceLines: payload.showDistanceLines });
    },
    [ADDRESS_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("📍 ADDRESS_CHANGED", payload);
      updateState({ address: payload.address });
    },
    [DISTANCE_UNIT_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("📏 DISTANCE_UNIT_CHANGED", payload);
      updateState({ distanceUnit: payload.distanceUnit });
    },
    [TEMPLATE_TOGGLE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("📝 TEMPLATE_TOGGLE_CHANGED", payload);
      updateState({ useCustomTemplate: payload.useCustomTemplate });
    },
    [customActions.MAP_CIRCLE_CHANGED]: (coeffects) => {
      const { action: { payload }, updateState } = coeffects;
      Logger.action("⭕ MAP_CIRCLE_CHANGED", payload);
      updateState({ circleEvent: payload });
    },
    ["NOW_SELECT#SELECTED_ITEM_SET"]: (coeffects, newValue) => {
      Logger.action("🔽 NOW_SELECT#SELECTED_ITEM_SET", newValue);
      coeffects.updateState({ markerType: newValue });
    },
  }
});
