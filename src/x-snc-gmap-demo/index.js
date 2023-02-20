import { createCustomElement } from "@servicenow/ui-core";
import snabbdom, { createRef } from "@seismic/snabbdom-renderer";
import styles from './style.scss';

import "../x-snc-gmap";

/**
 * Used to test the component with properties as it's not possible to do in the element.js file
 */

const initialZoom = 10;
const markerFields = ["name", "city", "state"];

const view = () => {
  return (
    <div id="example-container" className="example-container">
      <x-snc-gmap
        centerOn="PLACE" 
        initialZoom={initialZoom} 
        language="en"
        place="ServiceNow, Leesburg Pike, Vienna, VA"
        map-markers-fields={markerFields}
>         </x-snc-gmap>
    </div>
  );
};
createCustomElement("x-snc-gmap-demo", {
  renderer: { type: snabbdom },
  view,
  styles,
});
