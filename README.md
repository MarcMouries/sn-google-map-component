# Google Map Component

## Set up

### Google Map API Key
- Obtain a Google Maps JavaScript API Key from Google.
- In the **System Properties > Google Maps** property form, enter the API key into the **google.maps.key** field

## Versions

- 0.5
  1. Tested on ServiceNow Vancouver release
  2. Prints the component's version to the console for ensuring that the correct version of the component is being used.
  3. [TODO] Add property to enable circle or not


- 0.4
    - **Localization:** Map can be localized by setting the language property using the [BCP 47 code](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry) of the target language. Example: Chinese (zh), English (en), French (fr), German (de),  Italian (it), Japanese (ja), Portuguese (pt), Spanish (es)

    - **user's location** Option to use the user's location from ServiceNow or from the browser's geolocation

    - **Circle**
        1. Enable drawing
        2. Find locations in a given radius

    - **Dispatch event**

    - **Properties**
        - new property: place

    - Retrieves the Google Maps API Key from the platform Google Maps properties

## Properties
| Property                | Description                                    | Type      | Example     |
| ----------------------- | ---------------------------------------------- | --------- | --------- |
| `place`                 |                                                | string    |           |
| `mapMarkers`            |                                                | string    |           |


lat lng

## Versions

- 0.3
    - Center the map based on the current user's location or or the bounds of the markerss
    - Add markers on any table with a location field
- 0.2
    - Fixed Google Map Marker Info close icon visibility
    - Removed link from Map Marker Info Popup
- 0.1
    - initial version

## Enhancement Ideas

1. Allow to specifiy the list of fields to show in the pop info
    -  add a property "Display Fields"
        -  { "table" : "sys_user" , "displayFields" : "name, location"}
        -  { "table" : "task"     , "displayFields" : "name, location, priority, short_description"}
2. Dispatch event when user clicks on a map marker or a link inside the map marker
3. Add easier way to add Markers on the map
    - simply ask for the name of table that contains lat and long coordinates or a location
4. add an option to draw a line between markers
    - add markers to show the train stations that a train goes through

## Done
1. 
3. Center the map based on the current user location
    - query the current user & get the coordinate
4. Add ability to set the Initial Zoom property

## Events

- PLACE_CHANGED
- MAP_CIRCLE_CHANGED


Table UX Event (`sys_ux_event`) is where all events are defined
- label
- event_name

```js
// Create the sys_ux_event
var event_name = "AES_GMAP#MAP_CIRCLE_CHANGED";
var event_desc = "Map Circle Changed"
var gr = new GlideRecord('sys_ux_event');
gr.initialize();
gr.event_name = event_name;
gr.label = event_desc;
gr.description = "Fired when the user changes the circle on the map"
gr.insert();


function getRecord(table, name) {
  var record = new GlideRecord(table);
  if (record.get('name', name)) {
    return record;
  } else {
    gs.info('Record not found');
    return null;
  }
}

// ADD EVENT TO THE LIST OF DISPATCHED EVENTS IN THE COMPONENT
var component_name = "AES Google Map";
var component = getRecord('sys_ux_macroponent', component_name);
if (component) {
  gs.info('Created by: ' + component.sys_created_by);
  gs.info('Updated on: ' + component.sys_updated_on.getDisplayValue());
} else {
  gs.info('Component not found');
}

var event_list = ["AES_GMAP#MAP_CIRCLE_CHANGED"];
component.dispatched_events = event_list.join(',');
component.update();
```
1. https://developer.servicenow.com/blog.do?p=/post/quebec-ui-builder-custom-component-events/
2. https://github.com/ServiceNowNextExperience/uic-event-fixer
