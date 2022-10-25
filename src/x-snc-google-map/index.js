import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

const view = (state, { updateState }) => {
	const { mapElementRef } = state;

	return (
		<div className="map-container" ref={mapElementRef}>
        </div>
	);
};



createCustomElement('x-snc-google-map', {
	renderer: {
		type: snabbdom
	},
	view,
	styles,

	onBootstrap (host, dispatch) {
		console.log("onBootstrap");
		console.log(host);
		console.log(dispatch);
		//onBootstrap(host, dispatch);
	},
});
