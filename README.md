# Location Intelligence Component for ServiceNow

A Google Maps component for ServiceNow Next Experience that provides location visualization with markers, clustering, and radius-based filtering.

## Key Capabilities

```
┌─────────────────────────────────────────────────┐
│           Location Intelligence                 │
├─────────────────────────────────────────────────┤
│  1. Define a reference point (address/place)    │
│  2. Set a radius of interest                    │
│  3. Find items within that radius               │
│  4. Calculate travel distances/times            │
│  5. Support decision-making                     │
└─────────────────────────────────────────────────┘
```

See [USE_CASES.md](USE_CASES.md) for detailed real-world examples including fraud detection, audit planning, and disease outbreak tracking.

## Prerequisites

### Google Maps API Key
1. Obtain a Google Maps JavaScript API Key from the [Google Cloud Console](https://console.cloud.google.com/)
2. In ServiceNow, navigate to **System Properties > Google Maps**
3. Enter the API key into the **google.maps.key** field

### Node.js
- Node.js >= 18.0.0
- npm >= 9.0.0

## Development

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd sn-google-map-component

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server (opens browser automatically)
npm start

# Or without auto-open
npm run dev
```

The development server will start with hot reload enabled. The URL will be displayed in the terminal.

### Building

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Deployment to ServiceNow

### Configure Instance Connection

Set your ServiceNow instance credentials:

```bash
snc configure profile set
```

You'll be prompted for:
- Instance URL (e.g., `https://your-instance.service-now.com`)
- Username
- Password

### Deploy the Component

```bash
npm run deploy
```

Or directly:

```bash
snc ui-component deploy
```

The component will be deployed to your ServiceNow instance and available in UI Builder.

## Properties

| Property           | Description                                      | Type     | Example                  |
| ------------------ | ------------------------------------------------ | -------- | ------------------------ |
| `place`            | Initial place to center the map                  | string   | `"Washington, DC"`       |
| `mapMarkers`       | Array of marker objects with position data       | array    | See below                |
| `mapMarkersFields` | Fields to display in marker info popup           | array    | `["name", "description"]`|
| `language`         | Map language (BCP 47 code)                       | string   | `"en"`, `"fr"`, `"de"`   |
| `initialZoom`      | Initial zoom level (1-20)                        | number   | `10`                     |
| `centerOn`         | How to center the map                            | string   | `"MAP_MARKERS"`, `"ADDRESS"`, `"CURRENT_USER"` |
| `showCircle`       | Show/hide the radius circle overlay              | boolean  | `true`                   |
| `circleRadius`     | Radius of the circle (in distanceUnit)           | number   | `10`                     |
| `distanceUnit`     | Unit for distances (miles or kilometers)         | string   | `"miles"`, `"kilometers"`|

### Marker Format

```javascript
{
  "name": "Marker Name",
  "description": "Optional description",
  "markerLabel": "✈",        // Optional: icon/emoji displayed on marker
  "markerColor": "#E53935",  // Optional: custom marker color (hex)
  "sys_id": "abc123...",     // Optional: ServiceNow record sys_id
  "table": "cmn_location",   // Optional: ServiceNow table name
  "position": {
    "lat": 38.9072,
    "lng": -77.0369
  }
}
```

### ServiceNow Record Integration

When markers include both `sys_id` and `table` properties, clicking a marker will fetch additional record data from ServiceNow via GraphQL. This enables:
- Dynamic data loading for markers linked to ServiceNow records
- Displaying live record details in the info popup
- Integration with records from any ServiceNow table (e.g., `cmn_location`, `cmdb_ci`, custom tables)

### Important: Configuring `mapMarkersFields`

The `mapMarkersFields` property controls which fields appear in the info popup when clicking a marker. **If not set, only the marker name will display.**

Example configuration in UI Builder:
- `mapMarkers`: Your array of marker objects
- `mapMarkersFields`: `["city", "state", "country"]`

Only fields listed in `mapMarkersFields` will appear in the info window. The `name` field is always used as the header.

## Events

| Event Name           | Description                                    | Payload                     |
| -------------------- | ---------------------------------------------- | --------------------------- |
| `PLACE_CHANGED`      | Fired when the place changes                   | Place details               |
| `MAP_CIRCLE_CHANGED` | Fired when the radius circle is moved/resized | Array of markers in circle  |

### Registering Events in ServiceNow

```javascript
// Create the sys_ux_event
var event_name = "AES_GMAP#MAP_CIRCLE_CHANGED";
var gr = new GlideRecord('sys_ux_event');
gr.initialize();
gr.event_name = event_name;
gr.label = "Map Circle Changed";
gr.description = "Fired when the user changes the circle on the map";
gr.insert();
```

## Features

- **Marker Clustering**: Automatic grouping of nearby markers at lower zoom levels
- **Radius Circle**: Draggable/resizable circle to filter markers within a radius
- **Localization**: Support for multiple languages via BCP 47 codes
- **User Location**: Option to center on user's location from ServiceNow or browser geolocation
- **Info Windows**: Customizable popup information for each marker

## Version History

### 0.0.6

**Performance & Memory Management**
- **Fixed Memory Leaks**: Moved `gmMarkers`, `radiusOverlay`, and `placeCircleRef` from module-level variables to component state. Previously, these variables persisted across component mount/unmount cycles, causing memory accumulation. Now they are properly cleaned up when the component unmounts.

**Developer Experience**
- **Logger Utility**: New centralized logging with log levels (DEBUG, INFO, WARN, ERROR). Auto-detects development mode (localhost) to show debug output. Use `Logger.debug()`, `Logger.info()`, `Logger.warn()`, `Logger.error()`, and `Logger.action()` for tracking dispatched actions.
- **Renamed API Methods**: Renamed `googleMapMethodActionHandlers` to `googleMapCredentialTypeActionHandlers` for clarity

**Component Improvements**
- **Styled Info Windows**: Redesigned marker info popups with styled header, formatted statistics (cases/deaths), status badges, and date formatting
- **Custom Marker Colors**: Markers now support per-marker colors via the `markerColor` property for category-based visualization
- **Distance Unit**: New `distanceUnit` property allows choosing between miles or kilometers for distance displays
- **SET_PLACE Action**: Programmatically update the map location by dispatching SET_PLACE with a new address
- **Distance Matrix Fix**: Resolved error that occurred when calculating driving distances with an empty marker set
- **Circle Visibility**: New `showCircle` property to toggle circle overlay visibility

**Demo & Documentation**
- WHO Disease Outbreaks sample dataset from WHO Disease Outbreak News
- Address input field to change map location dynamically
- Distance Unit radio buttons (Miles/Kilometers)
- Show Circle Overlay checkbox
- USE_CASES.md with fraud detection, audit planning, and disease outbreak tracking examples

### 0.0.5 - Zurich Migration
- Migrated to ServiceNow Zurich release compatibility
- Updated Node.js requirement to >= 18.0.0
- Improved demo page with dark theme styling
- Added DC Boundary Stones sample dataset
- Fixed radius overlay label positioning
- Fixed map layout sizing issues

### 0.0.4
- **Localization**: Map language via BCP 47 codes (en, fr, de, es, etc.)
- **User's Location**: Center on user location from ServiceNow or browser
- **Circle Overlay**: Draggable/resizable circle for radius-based filtering
- **Events**: MAP_CIRCLE_CHANGED event dispatched with markers inside circle
- **Properties**: Added `place` property
- Retrieves Google Maps API Key from platform properties

### 0.0.3
- Center map based on user location or marker bounds
- Add markers from any table with location field

### 0.0.2
- Fixed Google Map Marker Info close icon visibility
- Removed link from Map Marker Info Popup

### 0.0.1
- Initial version

## Potential Enhancements

Future features under consideration:

### Route Optimization
- Suggest best order to visit multiple locations
- Multi-stop directions ("visit A, then B, then C")
- Optimize for shortest distance or time

### Advanced Filtering
- Filter markers by attributes (type, status, date)
- Category legend with counts (e.g., "Respiratory: 5, Skin/Rash: 10")
- Search/filter within visible markers

### Data Integration
- Real-time data updates from ServiceNow tables
- Integration with ServiceNow workflows
- Export selected markers to reports

### Visualization
- Heat maps for data density
- Time-based animations
- Custom marker icons per category

## Resources

- [ServiceNow UI Components Documentation](https://developer.servicenow.com/dev.do#!/reference/next-experience/latest/ui-framework/main-concepts/introduction)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [UIC Event Fixer Tool](https://github.com/ServiceNowNextExperience/uic-event-fixer)
