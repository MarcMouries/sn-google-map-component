import { Fragment } from "@seismic/snabbdom-renderer";
import { stateConstants } from "./constants";
import { customActions } from "./constants"
import {translate} from './translate';

export default (state, { updateState, dispatch }) => {
  console.log("Map Component: state ", state);
  const { mapElementRef, autoCompleteRef } = state;
  const { properties } = state;
  const minHeight = "100%";
  const height = "100%";

    if (state.hasError) {
        return (
            <Fragment>
                <div>
                    <div className="map-container"> Error: {state.error}</div>
                </div>
            </Fragment>
        );
    }
    else {

  return (
    <Fragment>
      <div className="map-container">
        <button type="button" on-click={(event) => dispatch(customActions.ACTION_ON_CLICK, { table: "example" })}>
          CLICK
        </button>
        <div className="input-container">
          <label>Address</label>
          <input type="text" id="address-input" className="address-input" placeholder={translate("Enter an address")} ref={autoCompleteRef} />
        </div>
        <div id="map">
          <div style={{ height: height, "min-height": minHeight }} ref={mapElementRef}></div>
        </div>
      </div>
    </Fragment>
  );
  }
};
