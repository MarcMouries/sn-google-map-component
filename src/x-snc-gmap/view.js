import { Fragment } from '@seismic/snabbdom-renderer';
import { stateConstants } from "./constants";

export default (state) => {
    const { mapElementRef } = state;
    const { STATES } = stateConstants;
    console.log("Map Component: state", state);

    const { properties } = state;
	console.log("properties =", properties);

    const minHeight = "100%";
    const height = "100%";

    /* 
    if (state.isLoading) {
        return (
            <Fragment>
                <div>
                    <div className="map-container"> Loading...</div>
                </div>
            </Fragment>
        );
    }
    else {
        */
    return (
        <Fragment>
            <div id="map">
                <div style={{ height: height, "min-height": minHeight }} ref={mapElementRef}>
                </div>
            </div>
        </Fragment>
    );
    // }
};
