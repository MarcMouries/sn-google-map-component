import { customActions } from "../constants";

export const openInfoWindowHelper = (marker, googleMap, infowindow, dispatch) => {
	let content;
	let items = marker.items;
	if (items && items.length > 0) {
		content = `<div class="info-window-content">`;
		let cssId = '';
		if (items.length > 1) {
			items.forEach((item) => {
				if (item.table == 'sys_user') {
					cssId = "info-window-span-agent";
				} else if (item.table == 'wm_task') {
					cssId = "info-window-span-task";
				} else if (item.table == 'wm_crew') {
					cssId = "info-window-span-crew";
				}
				content += `<span class= "info-window-span" id=` + cssId +
								` onclick="openWorkspaceTab('${item.sys_id}', '${item.table}')">
									<a class ="info-window-link">${item.displayValue}</a>
							</span>`;
			});
			content += `</div>`
			infowindow.setContent(content);
			infowindow.open(googleMap, marker);
		} else if (items.length == 1){
			dispatch(customActions.MARKER_DATA_FETCH, {
				encodedQuery: `sys_id=${items[0].sys_id}`,
				table: items[0].table,
				fields: items[0].fields,
				sysId: items[0].sys_id
			});
		}
	}
	marker.setIcon(marker.highlightedIcon);
}

export const getMarkerImage = (marker, imageMap) => {
	let image = {};
	if (marker.items.length == 1) {
		image.icon = marker["items"][0].image;
		image.highlightedIcon = marker["items"][0].highlightedIcon;

	} else {
		image.icon = imageMap["colocated"],
		image.highlightedIcon = imageMap["colocatedFocus"]
		marker.setLabel(null);
	}
	marker.defaultIcon = { url: image.icon };
	marker.highlightedIcon = { url: image.highlightedIcon };
	marker.setIcon({ url: image.icon });
}

export const clearRoute = (routeMap, agentId) => {
    if (!routeMap[agentId])
        return;
    if (routeMap[agentId].markers) {
        let markers = routeMap[agentId].markers;
        for (let i = 0; i < markers.length; i++) {
            if (i > 0) {
                markers[i].setLabel(null);
            }
            swapIcon(markers[i]);
            markers[i].setIcon(markers[i].defaultIcon);
        }
    }
    if (routeMap[agentId].renderer) {
        routeMap[agentId].renderer.setMap(null);
    }
    delete routeMap[agentId];
}

export const greyOutRoute = (routeMap, agentId, googleMap, icons) => {
    if (!routeMap[agentId])
        return;
    if (routeMap[agentId].markers) {
        let markers = routeMap[agentId].markers;
        for (let i = 0; i < markers.length; i++) {
            if (i > 0) {
                markers[i].setLabel(null);
            }
           // swapIcon(markers[i]);
		   markers[i].defaultIcon = icons.pending;
		   markers[i].highlightedIcon = icons.pendingFocus;
           markers[i].setIcon(icons.pending);
        }
    }
    if (routeMap[agentId].renderer) {
		let lineSymbol = {
			path: google.maps.SymbolPath.CIRCLE,
			fillOpacity: 1,
			scale: 3
		};
		let polylineOptions = {
			strokeColor: '#808080',
			strokeOpacity: 0,
			icons: [{
				icon: lineSymbol,
				offset: '0',
				repeat: '10px'
			}]
		};

        routeMap[agentId].renderer.setOptions({
			polylineOptions: polylineOptions,
			map: googleMap,
			suppressBicyclingLayer: true,
            suppressMarkers: true,
		});
    }
    delete routeMap[agentId];
}


export const swapIcon = (marker, color, markerMap) => {
	if (color && markerMap) {
		const tempIcon = marker.defaultIcon;
		const tempHighlightedIcon = marker.highlightedIcon;
		marker.defaultIcon = markerMap[color] ? { url: markerMap[color][marker.items[0]['table']]} : { url: markerMap['onFocus'][marker.items[0]['table']]};
		marker.highlightedIcon = { url: markerMap['onFocus'][marker.items[0]['table']] };
		marker.otherIcon = tempIcon;
		marker.otherHighlightedIcon = tempHighlightedIcon;
	} else {
		marker.defaultIcon = (!marker.otherIcon || marker.otherIcon === '') ? marker.defaultIcon : marker.otherIcon;
		marker.highlightedIcon = (!marker.otherHighlightedIcon || marker.otherHighlightedIcon === '') ? marker.highlightedIcon : marker.otherHighlightedIcon;
		marker.otherIcon = '';
		marker.otherHighlightedIcon = '';
	}
}

export const getRouteColor = (routeColors) => {
    // default color to blue if no routeColors
    if (routeColors == null || Object.keys(routeColors).length == 0) {
        return '#D20039';
    }
	let nextColor;
    for (let color in routeColors) {
        if (color && routeColors[color] == true) {
            nextColor = color;
            routeColors[color] = false;
            return color;
        }
    }
    for (let color in routeColors) {
        routeColors[color] = true;
    }
    return getRouteColor(routeColors);
}

export const handleMarkerAction = (dispatch) => {
	window.openWorkspaceTab = openWorkspaceTab;
    function openWorkspaceTab(sysId, table) {
        dispatch(customActions.FSM_MAP_NEW_TAB, { payload: { sysId: sysId, table: table }});
    }
}

export const renderHideAllRoutesButton = (buttonRef, activeRoutes, dispatch) => {
	for (let key in activeRoutes) {
		if ((activeRoutes[key] == true) && buttonRef.current.style.display === 'block') return;
		if (activeRoutes[key] == true) {
			buttonRef.current.style.display = 'block';
			return;
		}
	}
	buttonRef.current.style.display = 'none';
  }

export const getDarkModeStyle = () => {
	return [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] },
	{ elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
	{ elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
	{
		featureType: "administrative.locality",
		elementType: "labels.text.fill",
		stylers: [{ color: "#d59563" }],
	},
	{
		featureType: "poi",
		elementType: "labels.text.fill",
		stylers: [{ color: "#d59563" }],
	},
	{
		featureType: "poi.park",
		elementType: "geometry",
		stylers: [{ color: "#263c3f" }],
	},
	{
		featureType: "poi.park",
		elementType: "labels.text.fill",
		stylers: [{ color: "#6b9a76" }],
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#38414e" }],
	},
	{
		featureType: "road",
		elementType: "geometry.stroke",
		stylers: [{ color: "#212a37" }],
	},
	{
		featureType: "road",
		elementType: "labels.text.fill",
		stylers: [{ color: "#9ca5b3" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry",
		stylers: [{ color: "#746855" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry.stroke",
		stylers: [{ color: "#1f2835" }],
	},
	{
		featureType: "road.highway",
		elementType: "labels.text.fill",
		stylers: [{ color: "#f3d19c" }],
	},
	{
		featureType: "transit",
		elementType: "geometry",
		stylers: [{ color: "#2f3948" }],
	},
	{
		featureType: "transit.station",
		elementType: "labels.text.fill",
		stylers: [{ color: "#d59563" }],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#17263c" }],
	},
	{
		featureType: "water",
		elementType: "labels.text.fill",
		stylers: [{ color: "#515c6d" }],
	},
	{
		featureType: "water",
		elementType: "labels.text.stroke",
		stylers: [{ color: "#17263c" }],
	},
  ];
}

export const prepareInfoWindowContent = (mapDir, table, sysId, result) => {
	const keys = Object.keys(result);
	let content;
	if (keys && keys.length > 0) {
		//the first field will be the info window title
		var recordButtonHTML = mapDir == 'ltr'?
			`<button class="open-record-button" style="float: right; right: 16px; margin-right: 4px" onClick="openWorkspaceTab('${sysId}', '${table}')"></button>`:
			`<button class="open-record-button" style="float: left; left: 16px; margin-left: 4px" onclick="openWorkspaceTab('${sysId}', '${table}')"></button>`;
		content = `<div class="info-window-content">
						<h3 class="info-window-header">${result[keys[0]].displayValue}</h3>` + recordButtonHTML +
			`<dl class="info-window-label-values">`;
		for (let i = 1; i < keys.length; i++) {
			let field = result[keys[i]];
			if (field['_reference']) {
				let fieldKeys = Object.keys(field['_reference']);
				for (let j = 0; j< fieldKeys.length; j++) {
					field = field['_reference'][fieldKeys[j]];
					content +=  mapDir == 'ltr' ?
						`<dt style="float: left; clear: left; margin-left: 4px">${field.label.charAt(0).toUpperCase() +field.label.slice(1)}</dt>` :
						`<dt style="float: right; clear: right; margin-right: 4px">${field.label.charAt(0).toUpperCase() +field.label.slice(1)}</dt>`
					if (field.displayValue)
						content += mapDir == 'ltr' ?
							`<dd style="float: left; margin-left: 24px">${field.displayValue}</dd>` :
							`<dd style="float: right; margin-right: 24px">${field.displayValue}</dd>`;
				}
			} else {
				content +=  mapDir == 'ltr' ?
					`<dt style="float: left; clear: left; margin-left: 4px">${field.label.charAt(0).toUpperCase() + field.label.slice(1)}</dt>` :
					`<dt style="float: right; clear: right; margin-right: 4px">${field.label.charAt(0).toUpperCase() + field.label.slice(1)}</dt>`
				if (field.displayValue)
					content += mapDir == 'ltr' ?
						`<dd style="float: left; margin-left: 24px">${field.displayValue}</dd>` :
						`<dd style="float: right; margin-right: 24px">${field.displayValue}</dd>`;
			}
		}
		content += `</dl> </div>`;
		return content;
	}
}
