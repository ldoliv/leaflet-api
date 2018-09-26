# leaflet-api
Abstraction layer for leaflet maps


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
var myLeafMap = new LeafMapApi({

	mapIdSelector: mapContainer,
	markersData: markers,
	mapOptions: {
		center: [37.117435, -8.645256],
		minZoom: 2,
		maxZoom: 20,
		zoom: 20,
		scrollWheelZoom: false,
	},
	mapFlyOptions: {
		padding: [30, 30],
		duration: 1,
		easeLinearity: 1,
		animate: true,
	},
	markerIcon: {
		className: 'pointer',
		iconSize: [26, 35],
		iconAnchor: [15, 35],
		popupAnchor: [0, -35]
	},
	showMyMarker: false,
	myMarkerIcon: {
		className: '',
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
```


# Methods

### Fly to a specific marker given an ID
```javascript
myLeafMap.gotoMarker(id);
```

### Filters initial markers by "valueToCompare". Filter function can be set with "setFilterFn" or given in the inital config object
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
