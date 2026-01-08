# Google Maps Component - Improvement Plan

## Current Status
- **Version**: 0.0.6
- **Target Platform**: ServiceNow Zurich
- **CLI Version**: 29.0.2

---

## Pending Tasks

### Performance Improvements

- [ ] **Fix module-level variables** - `radiusOverlay`, `gmMarkers`, `infowindow` in loadGoogleMapsApi.js can cause memory leaks. Move to component state.

- [ ] **Add debounce to circle events** - Circle drag/resize events fire rapidly, causing excessive processing.

- [ ] **Memoize marker icon generation** - Cache SVG icons by color to avoid repeated string operations.

- [ ] **Lazy load MarkerClusterer** - Only import when markers are present

### Code Architecture

`loadGoogleMapsApi.js` should be split into:

| New File | Responsibility |
|----------|----------------|
| `mapInitialization.js` | Map setup and configuration |
| `markerManager.js` | Marker CRUD operations |
| `circleManager.js` | Circle overlay logic |
| `distanceService.js` | Distance calculations |

### New Features

**High Priority**
- [ ] Marker info customization - HTML templates for info windows
- [ ] Directions integration - Route from user to marker
- [ ] Marker filtering - Filter by property values

**Medium Priority**
- [ ] Heatmap mode - Density visualization
- [ ] Draw lines between markers

**Nice to Have**
- [ ] Street View integration
- [ ] KML/GeoJSON import
- [ ] Dark mode support (Coral theme)

### Testing

- [ ] Add unit tests for utility functions (stringUtils, googleMapUtils)
- [ ] Add integration tests for map initialization
- [ ] Add tests for circle calculations
- [ ] Add tests for marker management

---

## Done ✅

### Version 0.0.6

**Logger Enhancement & Debug Statement Management**
- [x] Enhanced Logger with log levels (DEBUG, INFO, WARN, ERROR)
- [x] Added auto-detection for development mode (localhost detection)
- [x] Added `Logger.action()` method for tracking dispatched actions
- [x] Added `Logger.group()` and `Logger.groupEnd()` for grouped logging
- [x] Replaced console.log calls with Logger methods in all files:
  - `loadGoogleMapsApi.js`
  - `actionHandlers.js`
  - `actions/LoadGoogleApiKeyActions.js`
  - `actions/LoadGoogleApiMethodActions.js`
  - `googleMapUtils.js`
  - `view.js`
  - `translate.js`
  - `properties.js`
  - `index.js`
  - `x-snc-gmap-demo/index.js`

**Circle Overlay Features**
- [x] Added `showCircle` property to toggle circle visibility
- [x] Added `distanceUnit` property (renamed from `circleRadiusUnit`) with Miles/Kilometers options
- [x] Circle radius now accepts user-friendly values (e.g., 10 miles) - component handles conversion to meters
- [x] Circle label updates dynamically when distance unit changes
- [x] Fixed overlay label disappearing when markers load (UPDATE_MARKERS action)

**Demo Page**
- [x] Added Distance Unit radio buttons (Miles/Kilometers)
- [x] Added Address input field to change map location
- [x] Added Show Circle Overlay checkbox
- [x] Reorganized right panel - properties at top, event log at bottom

**Marker Features**
- [x] Custom marker colors via `markerColor` property
- [x] Marker labels via `markerLabel` property
- [x] Styled info windows with formatted statistics and status badges

**Documentation**
- [x] Updated README with new properties documentation
- [x] Added USE_CASES.md with fraud detection, audit planning examples
- [x] Added WHO Disease Outbreaks sample dataset

### Version 0.0.5

- [x] Updated package.json to use `latest` tags
- [x] Updated Node.js engine requirement to >=18.0.0
- [x] Fixed node-sass compatibility issue (added npm override for sass)
- [x] Fixed `gmMmarkers` typo → `gmMarkers`
- [x] Added npm scripts (start, dev, build, deploy, test)
- [x] Added DC Boundary Stones sample dataset
- [x] Improved demo page with dark theme styling
- [x] Fixed radius overlay label positioning
- [x] Fixed map layout sizing issues

---

## Code Cleanup Needed

- [ ] Review `updateState({ circleRadius: 80000 });` in setMarkers (hardcoded override, now commented)
- [ ] Remove unused `markerCopy` variable in setMarkers
- [ ] Remove unused `circleOptions` variable
- [ ] Remove unused `infowindow` module variable
- [ ] Remove unused `createInfoWindow` import
