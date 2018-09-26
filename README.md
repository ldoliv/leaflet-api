# leaflet-api
Abstraction layer for leaflet maps


# Marker Example Structure:
markers.push({
	id: 127,
	title: 'Mini Tour',
	pinImg: 'http://www.madeira-pass.com/magento/skin/frontend/rwd/madeirapass/images/map/pin_blue.png',
	lat: 32.642656,
	lng: -16.829063,
	link: 'http://www.madeira-pass.com/magento/index.php/experiencias/mini-tour.html'
});



# Leaflet Api Constructor Options
var myLeafMap = new LeafMapApi({
	mapIdSelector: mapContainer,
	mapOptions: {
		center: [37.117435, -8.645256],
		minZoom: 2,
		maxZoom: 20,
		zoom: 20,
		scrollWheelZoom: false,
	},
	mapFlyOptions: {
		// duration: 3,
	},
	markersData: markers,
	markerIcon: {
		className: 'pointer',
		//iconUrl: "../Content/Images/ie7/pin-shadow.png",
		//iconUrl: "pin-shadow.png",
		// html: "<img src='../images/map/pin.png'/>",
		iconSize: [26, 35],
		iconAnchor: [15, 35],
		popupAnchor: [0, -35]
	},
	showMyMarker: false,
	myMarkerIcon: {
		//className: 'normalMarker-marker',
		//iconUrl: "../Content/Images/ie7/pin-shadow.png",
		//iconUrl: "pin-shadow.png",
		// html: "<img src='../images/map/pin.png'/>",
		iconSize: [26, 26],
		iconAnchor: [15, 35],
		popupAnchor: [0, -35]
	},
	clickDirections: false,
	usePopup: true,
	markerPopupTmpl: function(markerData) {
		return 	'<div class="content_map">' +
					'<div class="content-pin">' +
						'<figure>' +
							'<img src="' + markerData.photo + '" width="296" height="221" />' +
						'</figure>' +
						'<h4>' + markerData.title + '</h4>'+
						'<div class="description">' + markerData.descp + '</div>'+
						'<a href="' + markerData.link + '" class="readmore_whatdo">Ver mais...</a>' +
					'</div>'+
				'</div>';
	},
	useClusters: false,
	clusterOptions: {
		showCoverageOnHover: false,
		spiderfyDistanceMultiplier: 1.2,
		disableClusteringAtZoom: 18,
		spiderLegPolylineOptions: {
			weight: 0,
			opacity: 1
		}
	},
	filterFn: function(filter, marker) {
		var catId = marker.options.markerData.catId;

		if (filter == catId)
			return true;
		else
			return false;
	}
});


# Methods

	// FLY TO SPECIFIC MARKER GIVEN AN ID
	myLeafMap.gotoMarker(id);

	// FILTERS INITIAL MARKERS BY VALUE TO COMPARE. FILTER FUNCTION CAN BE SET OR GIVEN IN THE INITIAL CONFIG OBJECT
	myLeafMap.filterMarkers(valueToCompare);

	// SET THE FILTER FUNCTION TO COMPARE THE MARKERS
	myLeafMap.setFilterFn(function(filter, marker) {
		var catId = marker.options.markerData.catId;

		if (filter == catId)
			return true;
		else
			return false;
	});

	// SHOWS ALL MARKERS
	myLeafMap.showAllMarkers();

	// CLOSES ALL OR SPECIFIC POPUP
	myLeafMap.closePopup(popup);

	// FLY TO BOUNDS PREVIOUSLY SET
	myLeafMap.flyToBounds();


/**
	EVENTS
*/

	// CALLED ON MARKER CLICK
	myLeafMap.on('markerClick', function(event, markerEvent) {
		console.log(markerEvent);
	});

	// CALLED ON MARKER POPUP CLOSE
	myLeafMap.on('markerPopupClose', function(event, markerEvent) {
		console.log(markerEvent);
	});
