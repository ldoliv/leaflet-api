var LeafMapApi;

(function($) {

	LeafMapApi: function(customOptions) {

		var map;
		var streetview_layer;
		var satelliteview_layer;
		var cluster;
		var allMarkers = [];
		var boundsCenter = [];
		var myPosition;
		var trackLocID;
		var myMarker = null;
		var $eventHandler = $('<div></div>');
		var Tools = {
			object: {
				extend: function(options, customOptions) {

					// More elaborate for when options has and inner object
					if (typeof customOptions != 'undefined') {
						for (property in customOptions) {
							if (typeof customOptions[property] == 'object') {
								$.extend(options[property], customOptions[property]);
								delete customOptions[property];
							}
						}
						$.extend(options, customOptions);
					}
					return options;
				}
			},
		};

		var options = {
			mapIdSelector: 'categmap',
			mapOptions: {
				center: [38.7436883, -9.1952226],
				minZoom: 2,
				maxZoom: 18,
				zoom: 18,
				scrollWheelZoom: true,
			},
			mapFlyOptions: {
				padding: [30, 30],
				// maxZoom: 12,
				duration: 1,
				easeLinearity: 1,
				animate: true,
			},
			markersData: [],
			markerIcon: {
				//className: 'normalMarker-marker',
				//iconUrl: "../Content/Images/ie7/pin-shadow.png",
				//iconUrl: "pin-shadow.png",
				// html: "<img src='../images/map/pin.png'/>",
				iconSize: [30, 35],
				iconAnchor: [15, 35],
				popupAnchor: [0, -35]
			},
			showMyMarker: true,
			myMarkerIcon: {
				//className: 'normalMarker-marker',
				//iconUrl: "../Content/Images/ie7/pin-shadow.png",
				//iconUrl: "pin-shadow.png",
				// html: "<img src='../images/map/pin.png'/>",
				iconSize: [30, 35],
				iconAnchor: [15, 35],
				popupAnchor: [0, -35]
			},
			clickDirections: false,
			usePopup: false,
			markerPopupTmpl: function(markerData) {return '';},
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
			filterFn: function() {}
		};


		function _closePopup(popup) {
			if (typeof popup != 'undefined') {
			}
			map.closePopup(popup);
		}

		function _setFilterFn(filterFn) {
			if (typeof filterFn != 'undefined') {
				options.filterFn = filterFn;
			}
		}

		function _flyToBounds(bounds) {
			bounds = bounds || boundsCenter;
			map.flyToBounds(bounds, options.mapFlyOptions);
		}

		function _gotoMarker(id) {
			var marker;
			for (var i = 0; i < allMarkers.length; i++) {
				// console.log(allMarkers[i].options.id);
				if (allMarkers[i].options.id == id) {
					// console.log('found marker');
					marker = allMarkers[i];
					break;
				}
			}

			if (marker != null) {
				// console.log(marker);
				//map.panTo(marker._latlng, 19);
				map.flyTo(marker._latlng, 18, {
					duration: 0.4,
					animate: true,
					// easeLinearity: 0.1
					// easeLinearity: 1
				});
				//map.setView(marker._latlng);
				//map.setZoom(19);

				map.once('moveend', function () {
					//map.setMaxBounds(bounds);
					marker.openPopup();
				});

				//setPopupInfo(marker);

				return true;
			}
			return false;
		}



		function _showMarkers(markers) {

			if (markers.length) {
				_removeAllMarkers();

				var filteredBounds = [];

				if (myMarker != null) {
					filteredBounds.push(myMarker._latlng);
				}

				for (var i = 0; i < markers.length; i++) {
					var marker = markers[i];

					if (options.useClusters) {
						cluster.addLayer(marker);
					}
					else {
						marker.addTo(map);
					}
					filteredBounds.push(marker._latlng);
				}

				if (options.useClusters) {
					map.addLayer(cluster);
				}

				map.flyToBounds(filteredBounds, options.mapFlyOptions);
			}
		}

		function _removeAllMarkers() {
			if (options.useClusters) {
				map.removeLayer(cluster);
				cluster = new L.MarkerClusterGroup(options.clusterOptions); //disableClusteringAtZoom: 19
			} else {
				for (var i = 0; i < allMarkers.length; i++) {
					map.removeLayer(allMarkers[i]);
				}
			}
		}

		function _showAllMarkers() {

			_showMarkers(allMarkers);
		}

		function _updateMarkers(newMarkers) {

			_removeAllMarkers();
			_createMarkers(newMarkers);
			// _showMarkers(allMarkers);
		}

		function _filterMarkers(filter) {

			var filtered = allMarkers.filter(function(marker) {
				return options.filterFn(filter, marker);
			});

			// console.log(filtered);
			_showMarkers(filtered);
		}

		function _createMarkers(markers) {

			allMarkers = [];
			boundsCenter = [];

			for (var i = 0; i < markers.length; i++) {

				var markerData = markers[i];
				// console.log(markerData);

				if (!((markerData.lat <= 90 && markerData.lat >= -90) && (markerData.lng <= 180 && markerData.lng >= -180))) {
					continue;
				}
				if (markerData.lat == 0 && markerData.lng == 0) continue;


				var marker = createMarker(markerData);

				$(marker._icon).addClass('pointer');

				marker.on('click', function(event) {
					// console.log('clicked');

					var thisContext = this;

					$eventHandler.trigger('markerClick', [thisContext]);

					if (options.clickDirections) {
						var url = '';
						if (typeof myPosition != 'undefined') {
							url = 'https://www.google.pt/maps/dir/' + myPosition.lat + ',' + myPosition.lng + '/' + marker._latlng.lat + ',' + marker._latlng.lng;
						} else {
							url = 'https://maps.google.com/?q=' + thisContext.options.markerData.lat + ',' + thisContext.options.markerData.lng;
						}
						var win = window.open(url, '_blank');
						win.focus();
					}
				});

				marker.on('popupclose', function(event) {
					var thisContext = this;
					$eventHandler.trigger('markerPopupClose', [thisContext]);
				});


				if (options.usePopup) {
					marker.bindPopup(
						'<div class="marker-content">'+
							options.markerPopupTmpl(markerData)+
							// '<div class="link">'+
								// '<a class="btn btn-secondary btn-reduced" href="' + link +'" target="_blank">Abrir Localização</a>'+
							// '</div>'+
						'</div>');
				}

				if (options.useClusters) {
					cluster.addLayer(marker);
				} else {
					marker.addTo(map);
					// map.addLayer(marker);
				}

				allMarkers.push(marker);
				boundsCenter.push(marker._latlng);

			}

			// ADD CLUSTER LAYER TO MAP
			if (options.useClusters) {
				map.addLayer(cluster);
			}

			if (boundsCenter.length) {
				map.flyToBounds(boundsCenter, options.mapFlyOptions);
			}
		}

		function createMarker(markerData) {

			return L.marker(new L.LatLng(markerData.lat, markerData.lng), {
				id: markerData.id,
				icon: L.divIcon($.extend(options.markerIcon, {
					html: "<img src='" + markerData.pinImg + "'/>",
				})),
				title: markerData.title,
				alt: markerData.alt,
				markerData: markerData,
				riseOnHover: true,
				// lngLat: [latlng.lng, latlng.lat]
			});
		}

		function createMyMarker(markerData) {
			return L.marker(new L.LatLng(markerData.lat, markerData.lng), {
				icon: L.divIcon($.extend(options.myMarkerIcon, {
					html: '<div class="mymarker"><div class="pin"></div><div class="pin-effect"></div></div>',
					// iconSize: [30, 35],
					// iconAnchor: [15, 35],
				})),
				riseOnHover: true,
				// lngLat: [latlng.lng, latlng.lat]
			});
		}


		function getGeolocation(callback) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					if (typeof callback != 'undefined') {
						callback({
							lat: position.coords.latitude,
							lng: position.coords.longitude
						});
					}
				}, function () {
					console.log('geolocation error');
				});

				trackLocID = navigator.geolocation.watchPosition(function (position) {
					if (typeof callback != 'undefined') {
						callback({
							lat: position.coords.latitude,
							lng: position.coords.longitude
						});
					}
				});
			}
		}

		function _init(customOptions) {

			options = Tools.object.extend(options, customOptions);

			// console.log(options);

			// SETUP LEAFLET MAP
			// L.mapbox.accessToken = 'pk.eyJ1IjoiZGF2aWRzZXJvZGlvIiwiYSI6ImNqYnFwNjRrZTBpdjUycXBjOG0wMXR5ZmkifQ._Nu3hFZccYO_g9ug81MfSQ';

			// options.mapOptions.renderer = L.canvas();
			if (document.getElementById(options.mapIdSelector)) {

				map = L.map(options.mapIdSelector, options.mapOptions);

				// MAP VIEW
				streetview_layer = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { noWrap: true });
				//streetview_layer = L.tileLayer('mapbox.streets', { noWrap: true });
				//satelliteview_layer = L.tileLayer('mapbox.satellite', { noWrap: true });
				map.addLayer(streetview_layer);


				// ADD MY MARKER
				if (options.showMyMarker) {

					getGeolocation(function(latLng) {

						myPosition = latLng;
						// console.log(myPosition);

						// CREATE MY MARKER
						if (myMarker == null) {

							// console.log(latLng);

							myMarker = createMyMarker(latLng);
							map.addLayer(myMarker);
							boundsCenter.push(myMarker._latlng);

							if (map) {
								// map.flyToBounds(boundsCenter, options.mapFlyOptions);
							}

						// UPDATE MY MARKER
						} else {
							myMarker.setLatLng(latLng);
						}
					});
				}

				// INSERT MARKERS ----------------------------------------------------------------------------------------

				// CLUSTER
				if (options.useClusters) {
					cluster = new L.MarkerClusterGroup(options.clusterOptions); //disableClusteringAtZoom: 19
				}


				// BUILD LEAFLET MARKERS
				_createMarkers(options.markersData);
			}

		}

		_init(customOptions);

		this.gotoMarker = _gotoMarker;
		this.filterMarkers = _filterMarkers;
		this.showAllMarkers = _showAllMarkers;
		this.updateMarkers = _updateMarkers;
		this.setFilterFn = _setFilterFn;
		this.closePopup = _closePopup;
		this.flyToBounds = _flyToBounds;
		this.on = function(eventTrigger, callback) {
			// console.log(arguments);
			$eventHandler.on(eventTrigger, callback);
			// $eventHandler.on(arguments);
			// $eventHandler.on.apply(null, arguments);
			// return this;
		};
	};
})(jQuery);