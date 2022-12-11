import { Fragment } from '@seismic/snabbdom-renderer';
import { stateConstants} from "./constants";
export default (state) => {
    const { mapElementRef } = state;
    const { STATES } = stateConstants;
    console.log("Map State", state);
    return (
        <Fragment>
            <div>
                <div
                    className="map-container" ref={mapElementRef}>
                </div>
                
            </div>
        </Fragment>
    );
};