# Location Intelligence Component for ServiceNow

A Google Maps component for ServiceNow Next Experience that provides location visualization with markers, clustering, and radius-based filtering.

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
| `centerOn`         | How to center the map                            | string   | `"MAP_MARKERS"`, `"PLACE"` |

### Marker Format

```javascript
{
  name: "Marker Name",
  description: "Optional description",
  position: {
    lat: 38.9072,
    lng: -77.0369
  }
}
```

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

### 0.0.5
- Updated for ServiceNow Zurich compatibility
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

## Resources

- [ServiceNow UI Components Documentation](https://developer.servicenow.com/dev.do#!/reference/next-experience/latest/ui-framework/main-concepts/introduction)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [UIC Event Fixer Tool](https://github.com/ServiceNowNextExperience/uic-event-fixer)
