import { Fragment } from "@seismic/snabbdom-renderer";
import { stateConstants } from "./constants";
import { customActions } from "./constants";
import { translate } from "./translate";
import { Logger } from './logger';

const handleInputChange = (e, dispatch) => {
  const fieldValue = e.target.value;
  const data = e.data;
  Logger.debug("handleInput: fieldValue ", fieldValue);
  //debounceDispatch(() => {
  dispatch(({ properties: { name } }) => {
    return { type: "NOW_INPUT#INPUT", payload: { name, data, fieldValue } };
  });
  //	});
};

export default (state, { updateState, dispatch }) => {
  Logger.debug("🗺️ Map Component: state ", state);
  const { mapElementRef, autoCompleteRef } = state;
  const { properties } = state;
  const minHeight = "100%";
  const height = "100%";


  if (state.hasError) {
    return (
      <Fragment>
        <div className="error-box">
          <header></header>
          <main className="message">
            <h1 className="alert">Error!</h1>
            <p>{state.error}</p>
          </main>
          <footer></footer>
        </div>
      </Fragment>
    );
  } else {
    /*
    else  if (state.isLoading){
      return <now-loader></now-loader>;
    }
     */
    return (
      <Fragment>
        <div className="map-container">
          <div className="input-container">
            <label>Address</label>
            <input type="text" id="address-input" className="address-input" placeholder={translate("Enter an address")} ref={autoCompleteRef} on-change={(e) => handleInputChange(e, dispatch)} />
          </div>
          <div id="map">
            <div style={{ height: height, "min-height": minHeight }} ref={mapElementRef}></div>
          </div>
        </div>
      </Fragment>
    );
  }
};
