# Google Map Component

## Set up

### Google Map API Key
- Obtain a Google Maps JavaScript API Key from Google.
- In the **System Properties > Google Maps** property form, enter the API key into the **google.maps.key** field

## Versions

- 0.4 
    - Center the map based on the current user location
- 0.3
    - GraphQL query generic to be able to set map markers on any table

- 0.2
    - Fixed Google Map Marker Info close icon visibility
    - Removed link from Map Marker Info Popup
- 0.1
    - initial version

## TODO

- GraphQL query generic to be able to set map markers on any table


1. Dispatch event when user clicks on a map marker or a link inside the map marker
2. Add easier way to add Markers on the map
    - simply ask for the name of table that contains lat and long coordinates or a location

4. Add ability to set the Initial Zoom property

# Done
3. Center the map based on the current user location
    - query the current user
    - geocode the user's address