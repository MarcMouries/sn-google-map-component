import { Fragment } from '@seismic/snabbdom-renderer';
import { stateConstants } from "./constants";
import {t} from 'sn-translate';

export default (state) => {
    console.log("Map Component: state ", state);
    const { mapElementRef, autoCompleteRef } = state;
    const { properties } = state;
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
            <div className="map-container">
                <div className="input-container">
                    <label>Address</label>
                    <input type="text" id="address-input" className="address-input" placeholder={t("Enter an address")} ref={autoCompleteRef}/>
                </div>
                <div id="map">
                    <div style={{ height: height, "min-height": minHeight }} ref={mapElementRef}>
                    </div>
                </div>
            </div>
        </Fragment>
    );
    // }
};
