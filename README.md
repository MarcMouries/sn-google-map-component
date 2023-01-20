# Google Map Component

## Set up

### Google Map API Key
- Obtain a Google Maps JavaScript API Key from Google.
- In the **System Properties > Google Maps** property form, enter the API key into the **google.maps.key** field

## Versions

- 0.4
    - Map can be localized by setting the language property using the [BCP 47 code](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry) of the target language. Example: Chinese (zh), English (en), French (fr), German (de),  Italian (it), Japanese (ja), Portuguese (pt), Spanish (es)

    - **Option to use the user's location from ServiceNow or from the browser's geolocation**

    - **Circle**
        - 1. Find locations in a given radius


- 0.3
    - Center the map based on the current user's location or or the bounds of the markerss
    - Add markers on any table with a location field
- 0.2
    - Fixed Google Map Marker Info close icon visibility
    - Removed link from Map Marker Info Popup
- 0.1
    - initial version

## TODO

1. Allow to specifiy the list of fields to show in the pop info
    -  add a property "Display Fields"
        -  { "table" : "sys_user" , "displayFields" : "name, location"}
        -  { "table" : "task"     , "displayFields" : "name, location, priority, short_description"}
2. Dispatch event when user clicks on a map marker or a link inside the map marker
3. Add easier way to add Markers on the map
    - simply ask for the name of table that contains lat and long coordinates or a location


# Done
1. 
3. Center the map based on the current user location
    - query the current user & get the coordinate
4. Add ability to set the Initial Zoom property
