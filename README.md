# leaflet-api
Abstraction layer for leaflet maps


## HTML Includes
<head>
	<!-- JAVASCRIPT -->

	<!-- leaflet -->
	<script type="text/javascript" src="/leaflet/js/leaflet.js"></script>

	<!-- leaflet clusters -->
	<script type="text/javascript" src="/leaflet/js/leaflet.markercluster.js"></script>

	<!-- leaflet custom api -->
	<script type="text/javascript" src="/leaflet/js/map-api.js"></script>


	<!-- CSS -->

	<!-- leaflet -->
	<link rel="stylesheet" type="text/css" href="/leaflet/css/leaflet.css" media="all" />

	<!-- leaflet clusters -->
	<link rel="stylesheet" type="text/css" href="/leaflet/css/MarkerCluster.css" media="all" />
	<link rel="stylesheet" type="text/css" href="/leaflet/css/MarkerCluster.Default.css" media="all" />

	<!-- leaflet custom css -->
	<link rel="stylesheet" type="text/css" href="/leaflet/css/custom-leaflet.css" media="all" />
</head>


## Marker Example Structure:
```javascript
markers.push({
	id: 127,
	title: 'Mini Tour',
	pinImg: '/images/map/pin_blue.png',
	photo: '/images/map/photo.png',
	lat: 32.642656,
	lng: -16.829063,
	link: 'http://www.example.com/mini-tour.html'
});
```



## Leaflet Api Constructor Options
```javascript
if (typeof LeafMapApi != 'undefined') {
	var myLeafMap = new LeafMapApi({

		markersData: markers,
		mapIdSelector: mapContainer,
		initDelay: 0,
		maxBounds: [
			[37.374592, -8.236099],
			[36.980350, -7.913515]
		],
		leafMapOptions: {
			center: [37.136878, -8.019950],
			minZoom: 10,
			zoom: 10,
			// maxZoom: 15,
			scrollWheelZoom: false,
			maxBoundsViscosity: 0.75
		},
		leafMapFlyOptions: {
			padding: [30, 30],
			maxZoom: 15,
			duration: 1,
			easeLinearity: 0.25,
			animate: true,
		},
		leafMarkerIcon: {
			// className: 'marker',
			// iconSize: [26, 35],
			// iconAnchor: [15, 35],
			// popupAnchor: [0, -35]
		},
		showMyMarker: true,
		// leafMyMarkerIcon: {
			// className: 'mymarker',
			// iconSize: [26, 26],
			// iconAnchor: [15, 35],
			// popupAnchor: [0, -35]
		// },
		clickDirections: false,
		popupLinkDirections: false,
		usePopup: true,
		popupOptions: {
			maxWidth: 300,
			minWidth: 50,
			autoPan: true,
			keepInView: false,
		},
		myMarkerPopupTmpl: function () {
			return `<div class="marker-title">${$t('You are Here!')}</div>`;
		},
		markerPopupTmpl: function (markerData) {
			return (
				`<div class="popup-inner">
					<div class="marker-photo">
						<img src="${markerData.photo}" width="77" height="77" />
					</div>
					<div class="marker-title">
						<a href="${markerData.link}" class="">${markerData.title}</a>
					</div>
					<div class="marker-collection">
						<a href="${markerData.collectionLink}" class="">${$t('View Products')}</a>
					</div>
				</div>`
			);
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
}
```


# Methods

### Fly to a specific marker given an ID
```javascript
myLeafMap.gotoMarker(id);
```

### Filters initial markers by "valueToCompare".
#### Filter function can be set with "setFilterFn" or given in the inital config object
```javascript
myLeafMap.filterMarkers(valueToCompare);
```

### Set the filter function to compare the markers
```javascript
myLeafMap.setFilterFn(function(filter, marker) {
	var catId = marker.options.markerData.catId;

	if (filter == catId)
		return true;
	else
		return false;
});
```

### Update Markers
```javascript
myLeafMap.updateMarkers(markers);
```

### Shows all markers
```javascript
myLeafMap.showAllMarkers();
```

### Closes all or specific popup
```javascript
myLeafMap.closePopup(popup);
```

### Fly to bounds previously set
```javascript
myLeafMap.flyToBounds();
```


# Events

### Called on marker click
```javascript
myLeafMap.on('markerClick', function(event, markerEvent) {
	console.log(markerEvent);
});
```

### Called on marker popup close
```javascript
myLeafMap.on('markerPopupClose', function(event, markerEvent) {
	console.log(markerEvent);
});
```
