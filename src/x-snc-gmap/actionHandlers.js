import { createHttpEffect } from '@servicenow/ui-effect-http';
import { createGraphQLEffect } from "@servicenow/ui-effect-graphql";
import { glideRecordQuery } from "./query"
import { customActions } from "./constants"


export const requestGoogleMapAPIKey = (coeffects) => {
	const { action, state, updateState, dispatch } = coeffects;
	console.log("in actionHandler ", action.payload);
     dispatch(customActions.GOOGLE_MAPS_API_KEY_FETCH_REQUESTED,
          {
               encodedQuery: `name=google.maps.key`,
               table: "sys_properties",
               fields: "value { label value displayValue }",
          });
}