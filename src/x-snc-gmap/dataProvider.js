import { createGraphQLEffect } from '@servicenow/ui-effect-graphql';

import { stateConstants, customActions } from "./constants";

const fetchAgentDataQueryString =
  `query ($encodedQuery: String!) {
   GlideRecord_Query {
      sys_user(queryConditions: $encodedQuery) {
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



const fetchTaskDataQueryString = `query ($encodedQuery: String!) {
    GlideRecord_Query {
       task(queryConditions: $encodedQuery) {
         _rowCount
         _results {
           number {
             value
             displayValue
           }
           state {
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

export const fetchAgentDataEffect = createGraphQLEffect(
  fetchAgentDataQueryString, {
  variableList: ["encodedQuery"],
  successActionType: customActions.FETCH_AGENT_DATA_SUCCESS,
});

export const fetchTaskDataEffect = createGraphQLEffect(
  fetchTaskDataQueryString, {
  variableList: ["encodedQuery"],
  successActionType: customActions.FETCH_TASK_DATA_SUCCESS,
});






export const queryCurrentUserLocation = createGraphQLEffect(
  `query($sys_id: String) {
      GlideRecord_Query {
        sys_user(sys_id: $sys_id) {
          _results {
            name {
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
  }`
  ,
  {
    variableList: ["sys_id"],
    successActionType: [customActions.USER_LOCATION_FETCH_SUCCEEDED]
  }
);


