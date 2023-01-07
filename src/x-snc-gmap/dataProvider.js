import { createGraphQLEffect } from '@servicenow/ui-effect-graphql';
import { customActions } from "./constants";

const queryMarkerDataString =
  `query ($encodedQuery: String!) {
   GlideRecord_Query {
    {{table}}(queryConditions: $encodedQuery) {
      _rowCount
        _results {
          name {
            value
            displayValue
          }
          location {
            _reference {
              name {
                value
              }
              latitude {
                value
              }
              longitude {
                value
              }
            }
          }
        }
      }
    }
  }`;

export const queryMarkerData = createGraphQLEffect(
  queryMarkerDataString, {
  variableList: ["encodedQuery"],
  templateVarList: ['table'],
  successActionType: customActions.FETCH_MARKER_DATA_SUCCESS,
});




export const queryCurrentUserLocation = createGraphQLEffect(
  `query($sys_id: String) {
      GlideRecord_Query {
        sys_user(sys_id: $sys_id) {
          _results {
            name                { displayValue  }
            preferred_language  { value displayValue }
            location {
              _reference {
                name            { value }
                latitude        { value }
                longitude       { value }
              }
            }
          }
        }
      }
  }`
  ,
  {
    variableList: ["sys_id"],
    successActionType: [customActions.USER_LOCATION_FETCH_SUCCEEDED]
  }
);


