# Location Intelligence Component for ServiceNow

A Google Maps component for ServiceNow Next Experience that provides location visualization with markers, clustering, and radius-based filtering.

## Key Capabilities

### Location Intelligence                 

1. Define a reference point (address/place)    
2. Set a radius of interest                    
3. Find items within that radius               
4. Calculate travel distances/times            
5. Visualize sequential routes with direction  
6. Detect suspicious/impossible transitions    
7. Support decision-making                     


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
| `centerOn`         | How to center the map                            | string   | `"MAP_MARKERS"`, `"ADDRESS"`, `"CURRENT_USER"` |
| `circleRadius`     | Radius of the circle (in distanceUnit)           | number   | `10`                     |
| `distanceUnit`     | Unit for distances (miles or kilometers)         | string   | `"miles"`, `"kilometers"`|
| `infoTemplate`     | Custom HTML template for info popups             | string   | [See Custom Info Templates](#custom-info-templates) |
| `initialZoom`      | Initial zoom level (1-20)                        | number   | `10`                     |
| `language`         | Map language (BCP 47 code)                       | string   | `"en"`, `"fr"`, `"de"`   |
| `mapMarkers`       | Array of marker objects with position data       | array    | [See Marker Format](#marker-format) |
| `mapMarkersFields` | Fields to display in marker info popup           | array    | `["name", "description"]`|
| `place`            | Initial place to center the map                  | string   | `"Washington, DC"`       |
| `showCircle`       | Show/hide the radius circle overlay              | boolean  | `true`                   |
| `showDistanceLines`| Draw lines from place to all markers with distance/time | boolean | `false`           |
| `showRoutes`       | Draw sequential route lines between markers      | boolean  | `false`                  |
| `timestampField`   | Field name for timestamp data (for route sorting)| string   | `"timestamp"`            |

### Marker Format

```javascript
{
  "name": "Marker Name",
  "description": "Optional description",
  "markerLabel": "✈",        // Optional: icon/emoji displayed on marker
  "markerColor": "#E53935",  // Optional: custom marker color (hex)
  "sys_id": "abc123...",     // Optional: ServiceNow record sys_id
  "table": "cmn_location",   // Optional: ServiceNow table name
  "timestamp": "2025-01-15T10:30:00Z", // Optional: ISO 8601 timestamp for route sorting
  "position": {
    "lat": 38.9072,
    "lng": -77.0369
  }
}
```

**Field Reference:**
| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name shown in info popup header |
| `position` | Yes | Object with `lat` and `lng` coordinates |
| `description` | No | Additional text shown in info popup |
| `markerLabel` | No | Single character or emoji displayed on marker |
| `markerColor` | No | Hex color code for marker background |
| `sys_id` | No | ServiceNow record sys_id for dynamic data loading |
| `table` | No | ServiceNow table name (used with sys_id) |
| `timestamp` | No | ISO 8601 timestamp for sequential route ordering (required when using `showRoutes`) |

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

### Custom Info Templates

Use the `infoTemplate` property to define custom HTML for marker info popups. Use `{{field}}` placeholders that will be replaced with marker data.

```html
<div class="my-popup">
  <h3>{{name}}</h3>
  <p>{{description}}</p>
  <div class="stats">
    Cases: {{cases:number}} | Deaths: {{deaths:number}}
  </div>
  <small>Reported: {{date_reported:date}}</small>
</div>
```

**Available Formatters:**
| Formatter | Description | Example |
|-----------|-------------|---------|
| `{{field}}` | Raw value | `{{name}}` → "Outbreak A" |
| `{{field:number}}` | Formatted with commas | `{{cases:number}}` → "39,000" |
| `{{field:date}}` | Formatted date | `{{date:date}}` → "Jul 9, 2025" |
| `{{field:currency}}` | Dollar format | `{{amount:currency}}` → "$1,500" |
| `{{field:uppercase}}` | Uppercase text | `{{status:uppercase}}` → "ACTIVE" |
| `{{field:lowercase}}` | Lowercase text | `{{status:lowercase}}` → "active" |

If no `infoTemplate` is provided, the component uses the default styled info box.

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
- **Sequential Routes**: Visualize travel paths with direction arrows and sequence numbers
- **Suspicious Detection**: Automatically flag impossible transitions (travel faster than driving time allows)
- **Distance Lines**: Show driving distance/time from a location to all markers
- **Localization**: Support for multiple languages via BCP 47 codes
- **User Location**: Option to center on user's location from ServiceNow or browser geolocation
- **Info Windows**: Customizable popup information for each marker with HTML templates

## Version History

### 0.7

**Sequential Routes & Distance Visualization**
- **Sequential Routes**: New `showRoutes` property draws route lines between markers sorted by timestamp
- **Direction Indicators**: Route lines display arrows showing direction of travel and numbered sequence markers
- **Suspicious Detection**: Automatically flags impossible transitions where actual time < driving time (highlighted in red)
- **Distance Lines**: New `showDistanceLines` property draws lines from searched place to all markers with driving distance/time
- **Marker Positioning**: Fixed distance lines to correctly end at marker centers (anchor point fix)
- **Draggable Place Marker**: Location marker can be dragged to update address via reverse geocoding

**Info Window Customization**
- **Custom HTML Templates**: New `infoTemplate` property allows defining custom HTML for marker info popups using `{{field}}` placeholders
- **Template Formatters**: Support for value formatting with `{{field:number}}`, `{{field:date}}`, `{{field:currency}}`, `{{field:uppercase}}`, `{{field:lowercase}}`
- Falls back to default styled info box when no template is provided

### 0.6

**Component Improvements**
- **Styled Info Windows**: Redesigned marker info popups with styled header, formatted statistics (cases/deaths), status badges, and date formatting
- **Custom Marker Colors**: Markers now support per-marker colors via the `markerColor` property for category-based visualization
- **Distance Unit**: New `distanceUnit` property allows choosing between miles or kilometers for distance displays
- **Dynamic Address Updates**: Programmatically update the map location by setting the `place` property or dispatching SET_PLACE action
- **Circle Visibility**: New `showCircle` property to toggle circle overlay visibility

**Demo & Documentation**
- WHO Disease Outbreaks sample dataset from WHO Disease Outbreak News
- Address input field to change map location dynamically
- Distance Unit radio buttons (Miles/Kilometers)
- Show Circle Overlay checkbox
- USE_CASES.md with fraud detection, audit planning, and disease outbreak tracking examples

### 0.5 - Zurich Migration
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
- Multi-stop turn-by-turn directions
- Optimize route order for shortest total distance/time

### Advanced Filtering
- Filter markers by attributes (type, status, date)
- Category legend with counts (e.g., "Respiratory: 5, Skin/Rash: 10")
- Search/filter within visible markers

### Data Integration
- Real-time data updates from ServiceNow tables
- Integration with ServiceNow workflows
- Export selected markers to reports

### Visualization
- Custom marker icons per category ✅ 
- Sequential route visualization with timestamps ✅ 
- Direction arrows and sequence numbers on routes ✅
- Suspicious transition detection ✅ 
- Heat maps for data density
- Time-based animations (playback of sequential routes)

## Resources

- [ServiceNow UI Components Documentation](https://developer.servicenow.com/dev.do#!/reference/next-experience/latest/ui-framework/main-concepts/introduction)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [UIC Event Fixer Tool](https://github.com/ServiceNowNextExperience/uic-event-fixer)
