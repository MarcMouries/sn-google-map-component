# Google Map Component

## Set up

### Google Map API Key
- Obtain a Google Maps JavaScript API Key from Google.
- In the **System Properties > Google Maps** property form, enter the API key into the **google.maps.key** field

## Versions

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
| Property                | Description                                    | Type      | Usage     |
| ----------------------- | ---------------------------------------------- | --------- | --------- |
| `place`                 |                                                | string    |           |


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


Table UX Event (`sys_ux_event`) is where all events are defined
- label
- event_name

```js


// CREATE EVENT
// var gr = new GlideRecord('sys_ux_event');
// gr.initialize();
// gr.label = "MYCOMPONENT#BUTTON_CLICKED";
// gr.event_name = "MYCOMPONENT#BUTTON_CLICKED";
// gr.description = "Fired when user clicks on the map"
// gr.insert();

function getRecord(table, name) {
  var record = new GlideRecord(table);
  if (record.get('name', name)) {
    return record;
  }
}

// ADD EVENT TO THE LIST OF DISPATCHED EVENTS IN THE COMPONENT
var component_name = "AES Google Map";
var record = getRecord('sys_ux_macroponent', component_name);
gs.info('Created by: ' + record.sys_created_by);

var event_sys_id = 'e685946e47f065103d2cb28a436d4350';

//creates an array of current List field values
var listArr = record.dispatched_events.toString().split(',');
//add the new value to the List field values
listArr.push(event_sys_id);
record.dispatched_events = listArr.join(',');

record.update();
```
1. https://developer.servicenow.com/blog.do?p=/post/quebec-ui-builder-custom-component-events/
2. https://github.com/ServiceNowNextExperience/uic-event-fixer
